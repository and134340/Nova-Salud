
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Tags } from "lucide-react";
import api from "../services/api";

function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const respuesta = await api.get("/categorias");
            setCategorias(respuesta.data.data);
            setError("");
        } catch (err) {
            setError("No se pudieron cargar las categorías.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const limpiarFormulario = () => {
        setNombre("");
        setDescripcion("");
        setEditando(null);
    };

    const guardarCategoria = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!nombre.trim()) {
            setError("Ingresa el nombre de la categoría.");
            return;
        }

        try {
            const datos = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim()
            };

            if (editando !== null) {
                await api.put(`/categorias/${editando}`, datos);
                setMensaje("Categoría actualizada correctamente.");
            } else {
                await api.post("/categorias", datos);
                setMensaje("Categoría registrada correctamente.");
            }

            limpiarFormulario();
            await cargarCategorias();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Ocurrió un error al guardar la categoría."
            );
        }
    };

    const editarCategoria = (categoria) => {
        setNombre(categoria.nombre);
        setDescripcion(categoria.descripcion || "");
        setEditando(categoria.id_categoria);
        setMensaje("");
        setError("");
    };

    const eliminarCategoria = async (id) => {
        const confirmar = window.confirm(
            "¿Estás seguro de eliminar esta categoría?"
        );

        if (!confirmar) return;

        setMensaje("");
        setError("");

        try {
            await api.delete(`/categorias/${id}`);
            setMensaje("Categoría eliminada correctamente.");
            await cargarCategorias();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudo eliminar. Comprueba si tiene productos asociados."
            );
        }
    };

    return (
        <div className="categorias-page">

            <div className="page-header">
                <div>
                    <h1>Gestión de Categorías</h1>
                    <p>Administra las categorías de productos de Nova Salud.</p>
                </div>
            </div>

            <div className="categorias-resumen">
                <div className="categoria-stat-icon">
                    <Tags size={25} />
                </div>
                <div>
                    <span>Total de categorías</span>
                    <h2>{categorias.length}</h2>
                </div>
            </div>

            <div className="categorias-layout">

                <div className="categoria-form-card">
                    <h3>
                        {editando !== null
                            ? "Editar categoría"
                            : "Nueva categoría"}
                    </h3>

                    <form onSubmit={guardarCategoria}>
                        <label>Nombre de la categoría</label>
                        <input
                            type="text"
                            placeholder="Ej. Medicamentos"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />

                        <label>Descripción</label>
                        <textarea
                            placeholder="Describe brevemente la categoría"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows="4"
                        />

                        <button type="submit" className="btn-guardar-categoria">
                            <Plus size={18} />
                            {editando !== null ? "Guardar cambios" : "Registrar categoría"}
                        </button>

                        {editando !== null && (
                            <button
                                type="button"
                                className="btn-cancelar-categoria"
                                onClick={limpiarFormulario}
                            >
                                <X size={18} />
                                Cancelar edición
                            </button>
                        )}
                    </form>
                </div>

                <div className="categorias-list-card">
                    <h3>Listado de categorías</h3>

                    {mensaje && (
                        <div className="categoria-mensaje">{mensaje}</div>
                    )}

                    {error && (
                        <div className="categoria-error">{error}</div>
                    )}

                    {cargando ? (
                        <p>Cargando categorías...</p>
                    ) : categorias.length === 0 ? (
                        <p>No hay categorías registradas.</p>
                    ) : (
                        <div className="categorias-table-container">
                            <table className="categorias-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categorias.map((categoria) => (
                                        <tr key={categoria.id_categoria}>
                                            <td>{categoria.id_categoria}</td>
                                            <td>
                                                <strong>{categoria.nombre}</strong>
                                            </td>
                                            <td>
                                                {categoria.descripcion || "Sin descripción"}
                                            </td>
                                            <td>
                                                <div className="categoria-acciones">
                                                    <button
                                                        className="btn-editar-categoria"
                                                        onClick={() => editarCategoria(categoria)}
                                                        title="Editar"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    <button
                                                        className="btn-eliminar-categoria"
                                                        onClick={() => eliminarCategoria(categoria.id_categoria)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Categorias;
