
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            const guardado = localStorage.getItem("usuario");
            return guardado ? JSON.parse(guardado) : null;
        } catch {
            localStorage.removeItem("usuario");
            return null;
        }
    });

    const login = async (correo, password) => {
        const respuesta = await api.post("/auth/login", {
            correo,
            password
        });

        const { token, usuario } = respuesta.data;

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        setUsuario(usuario);

        return usuario;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
