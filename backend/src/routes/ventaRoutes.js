
import { Router } from "express";
import db from "../config/database.js";

const router = Router();

// Obtener todas las ventas registradas
router.get("/", async (req, res) => {
    try {
        const [ventas] = await db.query(`
            SELECT
                v.id_venta,
                v.id_usuario,
                u.nombre AS nombre_usuario,
                v.fecha_venta,
                v.total
            FROM ventas v
            INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
            ORDER BY v.id_venta DESC
        `);

        return res.json({
            success: true,
            data: ventas
        });

    } catch (error) {
        console.error("Error al obtener ventas:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudo obtener el historial de ventas."
        });
    }
});


// Obtener los detalles de una venta específica
router.get("/:id", async (req, res) => {
    try {
        const idVenta = Number(req.params.id);

        if (!Number.isInteger(idVenta) || idVenta <= 0) {
            return res.status(400).json({
                success: false,
                message: "El ID de la venta no es válido."
            });
        }

        const [ventas] = await db.query(`
            SELECT
                v.id_venta,
                v.id_usuario,
                u.nombre AS nombre_usuario,
                v.fecha_venta,
                v.total
            FROM ventas v
            INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
            WHERE v.id_venta = ?
        `, [idVenta]);

        if (ventas.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontró la venta."
            });
        }

        const [detalles] = await db.query(`
            SELECT
                dv.id_producto,
                p.nombre AS nombre_producto,
                dv.cantidad,
                dv.precio_unitario,
                dv.subtotal
            FROM detalle_ventas dv
            INNER JOIN productos p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = ?
        `, [idVenta]);

        return res.json({
            success: true,
            venta: ventas[0],
            detalles
        });

    } catch (error) {
        console.error("Error al obtener detalle de venta:", error);

        return res.status(500).json({
            success: false,
            message: "No se pudo obtener el detalle de la venta."
        });
    }
});




// Registrar una venta y descontar el inventario
router.post("/", async (req, res) => {
    const { id_usuario, productos } = req.body;

    // Validaciones iniciales
    if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
        return res.status(400).json({
            success: false,
            message: "El ID del usuario no es válido."
        });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            success: false,
            message: "La venta debe contener al menos un producto."
        });
    }

    const ids = productos.map((item) => Number(item.id_producto));

    if (
        productos.some((item) =>
            !Number.isInteger(Number(item.id_producto)) ||
            Number(item.id_producto) <= 0 ||
            !Number.isInteger(Number(item.cantidad)) ||
            Number(item.cantidad) <= 0
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Verifica los productos y sus cantidades."
        });
    }

    if (new Set(ids).size !== ids.length) {
        return res.status(400).json({
            success: false,
            message: "No repitas un producto en la misma venta."
        });
    }

    let conexion;

    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        // Comprobar que el usuario exista
        const [usuarios] = await conexion.query(
            "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
            [Number(id_usuario)]
        );

        if (usuarios.length === 0) {
            await conexion.rollback();
            return res.status(404).json({
                success: false,
                message: "El usuario indicado no existe."
            });
        }

        const detalles = [];
        let totalCentimos = 0;

        // Bloquear y comprobar cada producto antes de registrar la venta
        for (const item of productos) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);

            const [resultado] = await conexion.query(
                `SELECT id_producto, nombre, precio, stock
                 FROM productos
                 WHERE id_producto = ?
                 FOR UPDATE`,
                [idProducto]
            );

            if (resultado.length === 0) {
                throw new Error(`El producto ${idProducto} no existe.`);
            }

            const producto = resultado[0];
            const stockActual = Number(producto.stock);

            if (stockActual < cantidad) {
                throw new Error(
                    `Stock insuficiente para "${producto.nombre}". Disponible: ${stockActual}.`
                );
            }

            const precioCentimos = Math.round(Number(producto.precio) * 100);
            const subtotalCentimos = precioCentimos * cantidad;

            totalCentimos += subtotalCentimos;

            detalles.push({
                id_producto: idProducto,
                cantidad,
                precio_unitario: (precioCentimos / 100).toFixed(2),
                subtotal: (subtotalCentimos / 100).toFixed(2)
            });
        }

        // Registrar la cabecera de la venta
        const total = (totalCentimos / 100).toFixed(2);

        const [venta] = await conexion.query(
            `INSERT INTO ventas (id_usuario, total)
             VALUES (?, ?)`,
            [Number(id_usuario), total]
        );

        const idVenta = venta.insertId;

        // Registrar el detalle y descontar el stock
        for (const detalle of detalles) {
            await conexion.query(
                `INSERT INTO detalle_ventas
                 (id_venta, id_producto, cantidad, precio_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    idVenta,
                    detalle.id_producto,
                    detalle.cantidad,
                    detalle.precio_unitario,
                    detalle.subtotal
                ]
            );

            await conexion.query(
                `UPDATE productos
                 SET stock = stock - ?
                 WHERE id_producto = ?`,
                [detalle.cantidad, detalle.id_producto]
            );
        }

        await conexion.commit();

        return res.status(201).json({
            success: true,
            message: "Venta registrada correctamente.",
            data: {
                id_venta: idVenta,
                id_usuario: Number(id_usuario),
                total,
                productos: detalles
            }
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error("Error al registrar venta:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "No se pudo registrar la venta."
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
});

export default router;
