import { useEffect, useState } from "react";
import { Plus, Search, RefreshCw, Package } from "lucide-react";
import api from "../services/api";

function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [formulario, setFormulario] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        id_categoria: ""
    });

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError("");

            const [respuestaProductos, respuestaCategorias] =
                await Promise.all([
                    api.get("/productos"),
                    api.get("/categorias")
                ]);

            setProductos(respuestaProductos.data.data);
            setCategorias(respuestaCategorias.data.data);
        } catch (err) {
            console.error(err);
            setError(
                "No se pudieron cargar los datos. Verifica que el backend esté funcionando."
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const manejarCambio = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    };

    const registrarProducto = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (
            !formulario.nombre.trim() ||
            formulario.precio === "" ||
            formulario.stock === "" ||
            !formulario.id_categoria
        ) {
            setError("Completa el nombre, precio, stock y categoría.");
            return;
        }

        if (
            Number(formulario.precio) < 0 ||
            Number(formulario.stock) < 0
        ) {
            setError("El precio y el stock no pueden ser negativos.");
            return;
        }

        try {
            setGuardando(true);

            const datos = {
                nombre: formulario.nombre.trim(),
                descripcion: formulario.descripcion.trim(),
                precio: Number(formulario.precio),
                stock: Number(formulario.stock),
                id_categoria: Number(formulario.id_categoria)
            };

            const respuesta = await api.post("/productos", datos);

            setMensaje(
                respuesta.data.message || "Producto registrado correctamente."
            );

            setFormulario({
                nombre: "",
                descripcion: "",
                precio: "",
                stock: "",
                id_categoria: ""
            });

            await cargarDatos();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "No se pudo registrar el producto."
            );
        } finally {
            setGuardando(false);
        }
    };

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="page-content">
            <div className="page-heading">
                <div>
                    <h1>Productos</h1>
                    <p>Administra los productos registrados en Nova Salud.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={cargarDatos}
                    type="button"
                >
                    <RefreshCw size={17} />
                    Actualizar
                </button>
            </div>

            <div className="products-summary">
                <div className="products-summary-icon">
                    <Package size={25} />
                </div>
                <div>
                    <span>Total de productos</span>
                    <strong>{productos.length}</strong>
                </div>
            </div>

            <div className="products-grid">
                <section className="dashboard-panel products-table-panel">
                    <div className="products-panel-heading">
                        <div>
                            <h2>Lista de productos</h2>
                            <p>Productos registrados en la base de datos</p>
                        </div>
                    </div>

                    <div className="products-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="products-message error-message">
                            {error}
                        </div>
                    )}

                    {mensaje && (
                        <div className="products-message success-message">
                            {mensaje}
                        </div>
                    )}

                    {cargando ? (
                        <div className="products-empty">
                            Cargando productos...
                        </div>
                    ) : productosFiltrados.length === 0 ? (
                        <div className="products-empty">
                            {productos.length === 0
                                ? "Todavía no hay productos registrados."
                                : "No se encontraron productos."}
                        </div>
                    ) : (
                        <div className="products-table-wrapper">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Categoría</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productosFiltrados.map((producto) => (
                                        <tr key={producto.id_producto}>
                                            <td>
                                                <strong>{producto.nombre}</strong>
                                                <span className="product-description">
                                                    {producto.descripcion || "Sin descripción"}
                                                </span>
                                            </td>
                                            <td>
                                                {producto.categoria || "Sin categoría"}
                                            </td>
                                            <td>
                                                S/ {Number(producto.precio).toFixed(2)}
                                            </td>
                                            <td>
                                                <span className="stock-label">
                                                    {producto.stock}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="dashboard-panel product-form-panel">
                    <h2>Registrar producto</h2>
                    <p>Completa los datos para agregar un producto.</p>

                    <form onSubmit={registrarProducto}>
                        <label htmlFor="nombre">Nombre del producto</label>
                        <input
                            id="nombre"
                            name="nombre"
                            value={formulario.nombre}
                            onChange={manejarCambio}
                            placeholder="Ej. Paracetamol 500 mg"
                        />

                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formulario.descripcion}
                            onChange={manejarCambio}
                            placeholder="Descripción del producto"
                            rows="3"
                        />

                        <div className="product-form-row">
                            <div>
                                <label htmlFor="precio">Precio (S/)</label>
                                <input
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formulario.precio}
                                    onChange={manejarCambio}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="stock">Stock</label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formulario.stock}
                                    onChange={manejarCambio}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <label htmlFor="id_categoria">Categoría</label>
                        <select
                            id="id_categoria"
                            name="id_categoria"
                            value={formulario.id_categoria}
                            onChange={manejarCambio}
                        >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map((categoria) => (
                                <option
                                    key={categoria.id_categoria}
                                    value={categoria.id_categoria}
                                >
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="add-product-button"
                            disabled={guardando}
                        >
                            <Plus size={18} />
                            {guardando ? "Guardando..." : "Registrar producto"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Productos;