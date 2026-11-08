
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import ventaRoutes from "./routes/ventaRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middlewares/authMiddleware.js";

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/auth", authRoutes);

app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/usuarios", usuarioRoutes);


// Ruta inicial
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenido al backend de Nova Salud"
    });
});

// Estado del servidor
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Servidor de Nova Salud funcionando correctamente"
    });
});

// Comprobar conexión con MySQL
app.get("/api/database", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS conexion");

        res.json({
            success: true,
            message: "Conexión con MySQL establecida correctamente",
            data: rows
        });

    } catch (error) {
        console.error("Error de conexión:", error.message);

        res.status(500).json({
            success: false,
            message: "Error al conectar con MySQL"
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
