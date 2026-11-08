
import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Obtener todas las categorías
router.get("/", async (req, res) => {
    try {
        const [categorias] = await db.query(
            "SELECT * FROM categorias"
        );

        res.json({
            success: true,
            data: categorias
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al obtener las categorías"
        });
    }
});



// Registrar una categoría
router.post("/", async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: "El nombre es obligatorio"
            });
        }

        const [resultado] = await db.query(
            "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
            [nombre, descripcion || ""]
        );

        res.status(201).json({
            success: true,
            message: "Categoría registrada correctamente",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al registrar la categoría"
        });
    }
});



// Actualizar una categoría
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: "El nombre es obligatorio"
            });
        }

        const [resultado] = await db.query(
            `UPDATE categorias
             SET nombre = ?, descripcion = ?
             WHERE id_categoria = ?`,
            [nombre, descripcion || "", id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Categoría actualizada correctamente"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al actualizar la categoría"
        });
    }
});




// Eliminar una categoría
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "DELETE FROM categorias WHERE id_categoria = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Categoría eliminada correctamente"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "No se pudo eliminar la categoría. Puede tener productos asociados."
        });
    }
});



export default router;
