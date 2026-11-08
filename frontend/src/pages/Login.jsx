
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            await login(correo, password);
            navigate("/", { replace: true });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "No se pudo conectar con el servidor."
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Pill size={30} />
                    </div>
                    <h1>Nova Salud</h1>
                    <p>Sistema de gestión de botica</p>
                </div>

                <div className="login-heading">
                    <h2>Bienvenido</h2>
                    <p>Ingresa tus datos para acceder al sistema.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <label>Correo electrónico</label>
                    <div className="login-input">
                        <Mail size={19} />
                        <input
                            type="email"
                            placeholder="usuario@novasalud.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <label>Contraseña</label>
                    <div className="login-input">
                        <LockKeyhole size={19} />
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={cargando}
                    >
                        {cargando ? "Ingresando, espera" : "Iniciar sesión"}
                    </button>

                </form>

                <p className="login-footer">
                    Nova Salud · Gestión de Sistema
                </p>

            </div>
        </div>
    );
}

export default Login;
