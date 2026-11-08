
import bcrypt from "bcryptjs";
import db from "../config/database.js";

async function migrarPasswords() {
    let connection;

    try {
        connection = await db.getConnection();

        await connection.beginTransaction();

        const [usuarios] = await connection.query(
            "SELECT id_usuario, password FROM usuarios FOR UPDATE"
        );

        let migradas = 0;
        let omitidas = 0;

        for (const usuario of usuarios) {
            const passwordActual = usuario.password;

            // Evitar cifrar nuevamente una contraseña ya protegida.
            if (/^\$2[aby]\$/.test(passwordActual)) {
                omitidas++;
                continue;
            }

            const passwordHash = await bcrypt.hash(passwordActual, 10);

            await connection.query(
                "UPDATE usuarios SET password = ? WHERE id_usuario = ?",
                [passwordHash, usuario.id_usuario]
            );

            migradas++;
        }

        await connection.commit();

        console.log("Migración completada correctamente.");
        console.log("Contraseñas protegidas:", migradas);
        console.log("Ya estaban protegidas:", omitidas);
        console.log("Usuarios revisados:", usuarios.length);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error durante la migración:", error.message);
        process.exitCode = 1;

    } finally {
        if (connection) {
            connection.release();
        }

        await db.end();
    }
}

migrarPasswords();
