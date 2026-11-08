
import { Router } from "express";
import db from "../config/database.js";

const router = Router();

// Obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT id_usuario, nombre, correo, rol, estado, fecha_creacion
            FROM usuarios
            ORDER BY id_usuario DESC
        `);

        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({
            success: false,
            message: "No se pudieron obtener los usuarios."
        });
    }
});

// Registrar un usuario
router.post("/", async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre?.trim() || !correo?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Completa todos los campos obligatorios."
            });
        }

        const [existente] = await db.query(
            "SELECT id_usuario FROM usuarios WHERE correo = ?",
            [correo.trim()]
        );

        if (existente.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Este correo ya está registrado."
            });
        }

        // Si no se envía un rol, se utiliza vendedor.
        const rolUsuario = rol || "vendedor";

        const [resultado] = await db.query(
            `INSERT INTO usuarios (nombre, correo, password, rol)
             VALUES (?, ?, ?, ?)`,
            [nombre.trim(), correo.trim(), password, rolUsuario]
        );

        res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente.",
            id_usuario: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(400).json({
            success: false,
            message: "No se pudo registrar el usuario. Verifica los datos y el rol."
        });
    }
});

// Actualizar un usuario
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, correo, rol, estado } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no válido."
            });
        }

        if (!nombre?.trim() || !correo?.trim() || !rol) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios."
            });
        }

        const [resultado] = await db.query(
            `UPDATE usuarios
             SET nombre = ?, correo = ?, rol = ?, estado = ?
             WHERE id_usuario = ?`,
            [nombre.trim(), correo.trim(), rol, Number(estado), id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado."
            });
        }

        res.json({
            success: true,
            message: "Usuario actualizado correctamente."
        });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(400).json({
            success: false,
            message: "No se pudo actualizar el usuario."
        });
    }
});

// Cambiar estado de un usuario
router.patch("/:id/estado", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { estado } = req.body;

        if (!Number.isInteger(id) || id <= 0 || ![0, 1].includes(Number(estado))) {
            return res.status(400).json({
                success: false,
                message: "Datos no válidos."
            });
        }

        const [resultado] = await db.query(
            "UPDATE usuarios SET estado = ? WHERE id_usuario = ?",
            [Number(estado), id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado."
            });
        }

        res.json({
            success: true,
            message: "Estado actualizado correctamente."
        });

    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({
            success: false,
            message: "No se pudo cambiar el estado."
        });
    }
});

export default router;
