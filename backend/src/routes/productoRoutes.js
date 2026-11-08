
import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const [productos] = await db.query(`
            SELECT 
                p.*,
                c.nombre AS categoria
            FROM productos p
            INNER JOIN categorias c 
            ON p.id_categoria = c.id_categoria
        `);

        res.json({
            success: true,
            data: productos
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al obtener los productos"
        });
    }
});


// Registrar un nuevo producto
router.post("/", async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            stock,
            id_categoria
        } = req.body;

        // Validar los datos recibidos
        if (!nombre || precio === undefined || stock === undefined || !id_categoria) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO productos
            (nombre, descripcion, precio, stock, id_categoria)
            VALUES (?, ?, ?, ?, ?)`,
            [nombre, descripcion || "", precio, stock, id_categoria]
        );

        res.status(201).json({
            success: true,
            message: "Producto registrado correctamente",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al registrar el producto"
        });
    }
});





// Actualizar un producto
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            precio,
            stock,
            id_categoria
        } = req.body;

        if (!nombre || precio === undefined || stock === undefined || !id_categoria) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios"
            });
        }

        const [resultado] = await db.query(
            `UPDATE productos
             SET nombre = ?,
                 descripcion = ?,
                 precio = ?,
                 stock = ?,
                 id_categoria = ?
             WHERE id_producto = ?`,
            [nombre, descripcion || "", precio, stock, id_categoria, id]
        );

        if (resultado.affectedRows === 0) {
            const [producto] = await db.query(
                "SELECT id_producto FROM productos WHERE id_producto = ?",
                [id]
            );

            if (producto.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Producto no encontrado"
                });
            }
        }

        res.json({
            success: true,
            message: "Producto actualizado correctamente"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al actualizar el producto"
        });
    }
});






// Eliminar un producto
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "DELETE FROM productos WHERE id_producto = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Producto eliminado correctamente"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al eliminar el producto"
        });
    }
});



export default router;
