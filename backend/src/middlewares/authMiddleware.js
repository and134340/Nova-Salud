
import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Debes iniciar sesión para continuar."
            });
        }

        const token = authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Tu sesión ha expirado o el token no es válido."
        });
    }
}

export default authMiddleware;
