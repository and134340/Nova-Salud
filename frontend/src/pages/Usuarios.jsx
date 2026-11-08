
import { useEffect, useState } from "react";
import api from "../services/api";

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        nombre: "",
        correo: "",
        password: ""
    });

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await api.get("/usuarios");
            setUsuarios(respuesta.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudieron cargar los usuarios."
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cambiarCampo = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    };

    const abrirRegistro = () => {
        setUsuarioEditando(null);
        setFormulario({
            nombre: "",
            correo: "",
            password: ""
        });
        setMensaje("");
        setMostrarFormulario(true);
    };

    const abrirEdicion = (usuario) => {
        setUsuarioEditando(usuario);
        setFormulario({
            nombre: usuario.nombre,
            correo: usuario.correo,
            password: ""
        });
        setMensaje("");
        setMostrarFormulario(true);
    };

    const guardarUsuario = async (e) => {
        e.preventDefault();
        setMensaje("");

        try {
            if (usuarioEditando) {
                await api.put(`/usuarios/${usuarioEditando.id_usuario}`, {
                    nombre: formulario.nombre,
                    correo: formulario.correo,
                    rol: usuarioEditando.rol,
                    estado: usuarioEditando.estado
                });

                setMensaje("Usuario actualizado correctamente.");
            } else {
                await api.post("/usuarios", {
                    nombre: formulario.nombre,
                    correo: formulario.correo,
                    password: formulario.password,
                    rol: "vendedor"
                });

                setMensaje("Usuario registrado correctamente.");
            }

            setMostrarFormulario(false);
            setUsuarioEditando(null);
            setFormulario({
                nombre: "",
                correo: "",
                password: ""
            });

            await cargarUsuarios();
        } catch (err) {
            setMensaje(
                err.response?.data?.message ||
                "No se pudo guardar el usuario."
            );
        }
    };

    const cambiarEstado = async (usuario) => {
        const nuevoEstado = Number(usuario.estado) === 1 ? 0 : 1;

        const confirmar = window.confirm(
            `¿Deseas ${nuevoEstado === 1 ? "activar" : "desactivar"} a ${usuario.nombre}?`
        );

        if (!confirmar) return;

        try {
            await api.patch(`/usuarios/${usuario.id_usuario}/estado`, {
                estado: nuevoEstado
            });

            setMensaje("Estado del usuario actualizado.");
            await cargarUsuarios();
        } catch (err) {
            setMensaje(
                err.response?.data?.message ||
                "No se pudo cambiar el estado."
            );
        }
    };

    return (
        <div className="usuarios-container">
            <div className="usuarios-header">
                <div>
                    <h1>Gestión de usuarios</h1>
                    <p>Registra y administra los usuarios del sistema.</p>
                </div>

                <button onClick={abrirRegistro}>
                    + Nuevo usuario
                </button>
            </div>

            <div className="usuarios-resumen">
                <div className="usuarios-card">
                    <span>Total de usuarios</span>
                    <strong>{usuarios.length}</strong>
                </div>

                <div className="usuarios-card">
                    <span>Usuarios activos</span>
                    <strong>
                        {usuarios.filter(
                            (usuario) => Number(usuario.estado) === 1
                        ).length}
                    </strong>
                </div>

                <div className="usuarios-card">
                    <span>Usuarios inactivos</span>
                    <strong>
                        {usuarios.filter(
                            (usuario) => Number(usuario.estado) === 0
                        ).length}
                    </strong>
                </div>
            </div>

            {mensaje && (
                <p className="usuarios-mensaje">{mensaje}</p>
            )}

            {mostrarFormulario && (
                <div className="usuarios-formulario">
                    <h2>
                        {usuarioEditando ? "Editar usuario" : "Registrar usuario"}
                    </h2>

                    <form onSubmit={guardarUsuario}>
                        <label>Nombre completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formulario.nombre}
                            onChange={cambiarCampo}
                            required
                        />

                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formulario.correo}
                            onChange={cambiarCampo}
                            required
                        />

                        {!usuarioEditando && (
                            <>
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formulario.password}
                                    onChange={cambiarCampo}
                                    required
                                    minLength={6}
                                />
                            </>
                        )}

                        <p className="usuarios-nota">
                            Rol asignado: vendedor
                        </p>

                        <div className="usuarios-formulario-acciones">
                            <button type="submit">
                                {usuarioEditando ? "Guardar cambios" : "Registrar"}
                            </button>

                            <button
                                type="button"
                                className="usuarios-btn-cancelar"
                                onClick={() => setMostrarFormulario(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="usuarios-tabla-container">
                <h2>Usuarios registrados</h2>

                {cargando ? (
                    <p>Cargando usuarios...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : usuarios.length === 0 ? (
                    <p>No hay usuarios registrados.</p>
                ) : (
                    <table className="usuarios-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Fecha de creación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id_usuario}>
                                    <td>#{usuario.id_usuario}</td>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.rol}</td>
                                    <td>
                                        <span className={
                                            Number(usuario.estado) === 1
                                                ? "usuario-activo"
                                                : "usuario-inactivo"
                                        }>
                                            {Number(usuario.estado) === 1
                                                ? "Activo"
                                                : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(
                                            usuario.fecha_creacion
                                        ).toLocaleDateString("es-PE")}
                                    </td>
                                    <td>
                                        <div className="usuarios-acciones">
                                            <button
                                                onClick={() => abrirEdicion(usuario)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className="usuarios-btn-estado"
                                                onClick={() => cambiarEstado(usuario)}
                                            >
                                                {Number(usuario.estado) === 1
                                                    ? "Desactivar"
                                                    : "Activar"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Usuarios;
