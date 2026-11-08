
import { useEffect, useState } from "react";
import { Search, RefreshCw, Boxes, AlertTriangle, Package, XCircle } from "lucide-react";
import api from "../services/api";

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(null);
    const [stocks, setStocks] = useState({});
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarProductos = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await api.get("/productos");
            const lista = respuesta.data.data;

            setProductos(lista);

            const valoresIniciales = {};
            lista.forEach((producto) => {
                valoresIniciales[producto.id_producto] = producto.stock;
            });

            setStocks(valoresIniciales);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el inventario. Verifica el backend.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const cambiarStock = (id, valor) => {
        setStocks((anterior) => ({
            ...anterior,
            [id]: valor
        }));
    };

    const actualizarStock = async (producto) => {
        const nuevoStock = Number(stocks[producto.id_producto]);

        if (
            stocks[producto.id_producto] === "" ||
            !Number.isInteger(nuevoStock) ||
            nuevoStock < 0
        ) {
            setError("El stock debe ser un número entero igual o mayor a cero.");
            return;
        }

        try {
            setActualizando(producto.id_producto);
            setError("");
            setMensaje("");

            await api.put(`/productos/${producto.id_producto}`, {
                nombre: producto.nombre,
                descripcion: producto.descripcion || "",
                precio: Number(producto.precio),
                stock: nuevoStock,
                id_categoria: Number(producto.id_categoria)
            });

            setMensaje(`Stock de "${producto.nombre}" actualizado correctamente.`);
            await cargarProductos();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "No se pudo actualizar el stock."
            );
        } finally {
            setActualizando(null);
        }
    };

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalUnidades = productos.reduce(
        (total, producto) => total + Number(producto.stock || 0),
        0
    );

    const productosBajos = productos.filter(
        (producto) => Number(producto.stock) > 0 && Number(producto.stock) <= 5
    ).length;

    const productosAgotados = productos.filter(
        (producto) => Number(producto.stock) === 0
    ).length;

    const obtenerEstado = (stock) => {
        if (Number(stock) === 0) return "Agotado";
        if (Number(stock) <= 5) return "Stock bajo";
        return "Disponible";
    };

    return (
        <div className="page-content">
            <div className="page-heading">
                <div>
                    <h1>Inventario</h1>
                    <p>Controla las existencias de los productos de Nova Salud.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={cargarProductos}
                    type="button"
                    disabled={cargando}
                >
                    <RefreshCw size={17} />
                    Actualizar
                </button>
            </div>

            <div className="inventory-stats">
                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon purple">
                        <Package size={23} />
                    </div>
                    <div>
                        <span>Productos registrados</span>
                        <strong>{productos.length}</strong>
                    </div>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon blue">
                        <Boxes size={23} />
                    </div>
                    <div>
                        <span>Unidades disponibles</span>
                        <strong>{totalUnidades}</strong>
                    </div>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon orange">
                        <AlertTriangle size={23} />
                    </div>
                    <div>
                        <span>Stock bajo</span>
                        <strong>{productosBajos}</strong>
                    </div>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon red">
                        <XCircle size={23} />
                    </div>
                    <div>
                        <span>Agotados</span>
                        <strong>{productosAgotados}</strong>
                    </div>
                </div>
            </div>

            <section className="dashboard-panel inventory-panel">
                <div className="inventory-heading">
                    <div>
                        <h2>Control de existencias</h2>
                        <p>Consulta y actualiza las unidades de cada producto.</p>
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

                <div className="inventory-legend">
                    <span><i className="legend-dot available"></i> Disponible</span>
                    <span><i className="legend-dot low"></i> Stock bajo (5 o menos)</span>
                    <span><i className="legend-dot empty"></i> Agotado</span>
                </div>

                {error && (
                    <div className="products-message error-message">{error}</div>
                )}

                {mensaje && (
                    <div className="products-message success-message">{mensaje}</div>
                )}

                {cargando ? (
                    <div className="products-empty">Cargando inventario...</div>
                ) : productosFiltrados.length === 0 ? (
                    <div className="products-empty">
                        No se encontraron productos.
                    </div>
                ) : (
                    <div className="products-table-wrapper">
                        <table className="products-table inventory-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Stock actual</th>
                                    <th>Estado</th>
                                    <th>Actualizar stock</th>
                                </tr>
                            </thead>

                            <tbody>
                                {productosFiltrados.map((producto) => {
                                    const estado = obtenerEstado(producto.stock);

                                    return (
                                        <tr key={producto.id_producto}>
                                            <td>
                                                <strong>{producto.nombre}</strong>
                                                <span className="product-description">
                                                    {producto.descripcion || "Sin descripción"}
                                                </span>
                                            </td>

                                            <td>{producto.categoria || "Sin categoría"}</td>

                                            <td>
                                                <strong>{producto.stock}</strong>
                                            </td>

                                            <td>
                                                <span className={`inventory-status ${
                                                    estado === "Disponible"
                                                        ? "status-available"
                                                        : estado === "Stock bajo"
                                                        ? "status-low"
                                                        : "status-empty"
                                                }`}>
                                                    {estado}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="stock-update-control">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={stocks[producto.id_producto] ?? ""}
                                                        onChange={(e) =>
                                                            cambiarStock(
                                                                producto.id_producto,
                                                                e.target.value
                                                            )
                                                        }
                                                        aria-label={`Nuevo stock de ${producto.nombre}`}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => actualizarStock(producto)}
                                                        disabled={
                                                            actualizando === producto.id_producto ||
                                                            Number(stocks[producto.id_producto]) === Number(producto.stock)
                                                        }
                                                    >
                                                        {actualizando === producto.id_producto
                                                            ? "..."
                                                            : "Guardar"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Inventario;
