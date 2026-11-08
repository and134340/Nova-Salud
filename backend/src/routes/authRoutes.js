
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

const router = Router();

// Iniciar sesión
router.post("/login", async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Ingresa tu correo y contraseña."
            });
        }

        const [usuarios] = await db.query(
            `SELECT id_usuario, nombre, correo, password, rol, estado
             FROM usuarios
             WHERE correo = ?
             LIMIT 1`,
            [correo.trim()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos."
            });
        }

        const usuario = usuarios[0];

        if (Number(usuario.estado) !== 1) {
            return res.status(403).json({
                success: false,
                message: "Tu cuenta está desactivada."
            });
        }

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("No se ha configurado JWT_SECRET.");
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            success: true,
            message: "Inicio de sesión correcto.",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);

        res.status(500).json({
            success: false,
            message: "No se pudo iniciar sesión."
        });
    }
});

export default router;
