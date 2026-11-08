
import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Trash2, Search, RefreshCw } from "lucide-react";
import api from "../services/api";

function Ventas() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [idUsuario, setIdUsuario] = useState("");
    const [cantidades, setCantidades] = useState({});
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarProductos = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await api.get("/productos");
            setProductos(respuesta.data.data);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar los productos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const agregarProducto = (producto) => {
        setError("");
        setMensaje("");

        const cantidad = Number(cantidades[producto.id_producto] || 1);

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            setError("Ingresa una cantidad válida.");
            return;
        }

        const existente = carrito.find(
            (item) => item.id_producto === producto.id_producto
        );

        const cantidadFinal = cantidad + (existente?.cantidad || 0);

        if (cantidadFinal > Number(producto.stock)) {
            setError(`Stock insuficiente para ${producto.nombre}.`);
            return;
        }

        if (existente) {
            setCarrito((anterior) =>
                anterior.map((item) =>
                    item.id_producto === producto.id_producto
                        ? { ...item, cantidad: cantidadFinal }
                        : item
                )
            );
        } else {
            setCarrito((anterior) => [
                ...anterior,
                {
                    id_producto: producto.id_producto,
                    nombre: producto.nombre,
                    precio: Number(producto.precio),
                    stock: Number(producto.stock),
                    cantidad
                }
            ]);
        }

        setCantidades((anterior) => ({
            ...anterior,
            [producto.id_producto]: 1
        }));
    };

    const cambiarCantidad = (id, nuevaCantidad) => {
        const cantidad = Number(nuevaCantidad);
        const producto = productos.find((p) => p.id_producto === id);

        if (!producto || nuevaCantidad === "") {
            setCarrito((anterior) =>
                anterior.map((item) =>
                    item.id_producto === id
                        ? { ...item, cantidad: nuevaCantidad }
                        : item
                )
            );
            return;
        }

        if (!Number.isInteger(cantidad) || cantidad < 1) return;

        if (cantidad > Number(producto.stock)) {
            setError(`Stock insuficiente para ${producto.nombre}.`);
            return;
        }

        setError("");
        setCarrito((anterior) =>
            anterior.map((item) =>
                item.id_producto === id
                    ? { ...item, cantidad }
                    : item
            )
        );
    };

    const eliminarProducto = (id) => {
        setCarrito((anterior) =>
            anterior.filter((item) => item.id_producto !== id)
        );
    };

    const total = carrito.reduce(
        (suma, item) =>
            suma + Number(item.precio) * Number(item.cantidad),
        0
    );

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const registrarVenta = async () => {
        setError("");
        setMensaje("");

        if (!Number.isInteger(Number(idUsuario)) || Number(idUsuario) <= 0) {
            setError("Ingresa un ID de usuario válido.");
            return;
        }

        if (carrito.length === 0) {
            setError("Agrega al menos un producto a la venta.");
            return;
        }

        if (carrito.some((item) => !Number.isInteger(Number(item.cantidad)) || Number(item.cantidad) <= 0)) {
            setError("Revisa las cantidades de los productos.");
            return;
        }

        try {
            setProcesando(true);

            const respuesta = await api.post("/ventas", {
                id_usuario: Number(idUsuario),
                productos: carrito.map((item) => ({
                    id_producto: item.id_producto,
                    cantidad: Number(item.cantidad)
                }))
            });

            setMensaje(
                `Venta N.° ${respuesta.data.data.id_venta} registrada correctamente. Total: S/ ${Number(respuesta.data.data.total).toFixed(2)}`
            );

            setCarrito([]);
            await cargarProductos();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "No se pudo registrar la venta."
            );
            await cargarProductos();
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-heading">
                <div>
                    <h1>Ventas</h1>
                    <p>Registra ventas y administra los productos de cada operación.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={cargarProductos}
                    disabled={cargando}
                    type="button"
                >
                    <RefreshCw size={17} />
                    Actualizar
                </button>
            </div>

            {error && (
                <div className="products-message error-message">{error}</div>
            )}

            {mensaje && (
                <div className="products-message success-message">{mensaje}</div>
            )}

            <div className="sales-layout">
                <section className="dashboard-panel sales-products-panel">
                    <div className="sales-panel-heading">
                        <div>
                            <h2>Seleccionar productos</h2>
                            <p>Agrega los productos que deseas vender.</p>
                        </div>
                    </div>

                    <div className="products-search">
                        <Search size={18} />
                        <input
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {cargando ? (
                        <div className="products-empty">Cargando productos...</div>
                    ) : (
                        <div className="sales-product-list">
                            {productosFiltrados.map((producto) => (
                                <div
                                    className="sales-product-item"
                                    key={producto.id_producto}
                                >
                                    <div className="sales-product-info">
                                        <strong>{producto.nombre}</strong>
                                        <span>
                                            S/ {Number(producto.precio).toFixed(2)}
                                        </span>
                                        <small>Stock: {producto.stock}</small>
                                    </div>

                                    <div className="sales-add-control">
                                        <input
                                            type="number"
                                            min="1"
                                            max={producto.stock}
                                            value={cantidades[producto.id_producto] ?? 1}
                                            onChange={(e) =>
                                                setCantidades((anterior) => ({
                                                    ...anterior,
                                                    [producto.id_producto]: e.target.value
                                                }))
                                            }
                                            aria-label={`Cantidad de ${producto.nombre}`}
                                        />

                                        <button
                                            type="button"
                                            disabled={Number(producto.stock) <= 0}
                                            onClick={() => agregarProducto(producto)}
                                        >
                                            <Plus size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {productosFiltrados.length === 0 && (
                                <div className="products-empty">
                                    No hay productos disponibles.
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <section className="dashboard-panel sales-cart-panel">
                    <div className="sales-cart-heading">
                        <div>
                            <ShoppingCart size={21} />
                            <h2>Detalle de venta</h2>
                        </div>
                        <span>{carrito.length} productos</span>
                    </div>

                    <label htmlFor="id_usuario_venta">ID del usuario</label>
                    <input
                        id="id_usuario_venta"
                        className="sales-user-input"
                        type="number"
                        min="1"
                        value={idUsuario}
                        onChange={(e) => setIdUsuario(e.target.value)}
                        placeholder="Ingresa el ID del usuario"
                    />

                    <div className="sales-cart-items">
                        {carrito.length === 0 ? (
                            <div className="products-empty">
                                <ShoppingCart size={28} />
                                <p>Agrega productos para comenzar la venta.</p>
                            </div>
                        ) : (
                            carrito.map((item) => (
                                <div
                                    className="sales-cart-item"
                                    key={item.id_producto}
                                >
                                    <div className="sales-cart-product">
                                        <strong>{item.nombre}</strong>
                                        <span>
                                            S/ {Number(item.precio).toFixed(2)} c/u
                                        </span>
                                    </div>

                                    <input
                                        className="sales-cart-quantity"
                                        type="number"
                                        min="1"
                                        max={item.stock}
                                        value={item.cantidad}
                                        onChange={(e) =>
                                            cambiarCantidad(
                                                item.id_producto,
                                                e.target.value
                                            )
                                        }
                                        aria-label={`Cantidad de ${item.nombre}`}
                                    />

                                    <strong>
                                        S/ {(Number(item.precio) * Number(item.cantidad)).toFixed(2)}
                                    </strong>

                                    <button
                                        className="sales-delete-button"
                                        type="button"
                                        onClick={() => eliminarProducto(item.id_producto)}
                                        aria-label={`Eliminar ${item.nombre}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="sales-total">
                        <span>Total a pagar</span>
                        <strong>S/ {total.toFixed(2)}</strong>
                    </div>

                    <button
                        className="sales-confirm-button"
                        type="button"
                        onClick={registrarVenta}
                        disabled={procesando || carrito.length === 0}
                    >
                        <ShoppingCart size={18} />
                        {procesando ? "Registrando..." : "Confirmar venta"}
                    </button>
                </section>
            </div>
        </div>
    );
}

export default Ventas;
