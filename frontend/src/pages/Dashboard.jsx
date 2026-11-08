
import { useEffect, useState } from "react";
import {
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    ArrowUpRight,
    Clock,
    AlertTriangle,
    Tags
} from "lucide-react";
import api from "../services/api";

function Dashboard() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                const [resProductos, resCategorias, resUsuarios, resVentas] =
                    await Promise.all([
                        api.get("/productos"),
                        api.get("/categorias"),
                        api.get("/usuarios"),
                        api.get("/ventas")
                    ]);

                setProductos(resProductos.data.data);
                setCategorias(resCategorias.data.data);
                setUsuarios(resUsuarios.data.data);
                setVentas(resVentas.data.data);
                setError("");

            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los datos del Dashboard.");
            } finally {
                setCargando(false);
            }
        };

        cargarDashboard();
    }, []);

    // Obtener la fecha local
    const obtenerFechaLocal = (fecha) => {
        const date = new Date(fecha);

        if (isNaN(date.getTime())) return "";

        const anio = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const dia = String(date.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    };

    const hoy = obtenerFechaLocal(new Date());

    // Ventas realizadas hoy
    const ventasHoy = ventas.filter(
        (venta) => obtenerFechaLocal(venta.fecha_venta) === hoy
    );

    // Sumar ingresos del día
    const ingresosHoy = ventasHoy.reduce(
        (total, venta) => total + Number(venta.total || 0),
        0
    );

    // Productos con stock bajo (5 o menos)
    const productosStockBajo = productos.filter(
        (producto) => Number(producto.stock) <= 5
    );

    // Últimas ventas
    const ultimasVentas = [...ventas]
        .sort(
            (a, b) =>
                new Date(b.fecha_venta) - new Date(a.fecha_venta)
        )
        .slice(0, 5);

    const formatoSoles = (cantidad) =>
        Number(cantidad).toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN"
        });

    const formatoFecha = (fecha) =>
        new Date(fecha).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    if (cargando) {
        return <div className="dashboard"><p>Cargando información...</p></div>;
    }

    return (
        <div className="dashboard">

            <div className="page-heading">
                <div>
                    <h1>Dashboard</h1>
                    <p>Bienvenido al sistema de gestión de Nova Salud.</p>
                </div>

                <div className="date-label">
                    <Clock size={17} />
                    Panel general
                </div>
            </div>

            {error && (
                <div className="dashboard-error">{error}</div>
            )}

            {/* Indicadores principales */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Package size={23} />
                    </div>
                    <span>Total de productos</span>
                    <h2>{productos.length}</h2>
                    <small>Productos registrados</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <ShoppingCart size={23} />
                    </div>
                    <span>Ingresos del día</span>
                    <h2>{formatoSoles(ingresosHoy)}</h2>
                    <small>Ventas de hoy</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Users size={23} />
                    </div>
                    <span>Total de usuarios</span>
                    <h2>{usuarios.length}</h2>
                    <small>Usuarios registrados</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <TrendingUp size={23} />
                    </div>
                    <span>Ventas del día</span>
                    <h2>{ventasHoy.length}</h2>
                    <small>Operaciones realizadas hoy</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Tags size={23} />
                    </div>
                    <span>Total de categorías</span>
                    <h2>{categorias.length}</h2>
                    <small>Categorías registradas</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <AlertTriangle size={23} />
                    </div>
                    <span>Stock bajo</span>
                    <h2>{productosStockBajo.length}</h2>
                    <small>Productos con 5 unidades o menos</small>
                </div>

            </div>

            {/* Actividad y alertas */}
            <div className="dashboard-grid">

                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Actividad reciente</h3>
                            <p>Últimas ventas registradas</p>
                        </div>
                        <ArrowUpRight size={20} />
                    </div>

                    {ultimasVentas.length === 0 ? (
                        <div className="empty-state">
                            <ShoppingCart size={35} />
                            <strong>No hay ventas todavía</strong>
                            <span>Cuando registres ventas, aparecerán aquí.</span>
                        </div>
                    ) : (
                        <div className="dashboard-list">
                            {ultimasVentas.map((venta) => (
                                <div className="dashboard-list-item" key={venta.id_venta}>
                                    <div className="dashboard-item-icon">
                                        <ShoppingCart size={19} />
                                    </div>

                                    <div className="dashboard-item-info">
                                        <strong>Venta #{venta.id_venta}</strong>
                                        <span>
                                            {venta.nombre_usuario || "Usuario"} · {formatoFecha(venta.fecha_venta)}
                                        </span>
                                    </div>

                                    <strong className="dashboard-item-price">
                                        {formatoSoles(venta.total)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Alertas de inventario</h3>
                            <p>Productos que requieren atención</p>
                        </div>
                        <AlertTriangle size={20} />
                    </div>

                    {productosStockBajo.length === 0 ? (
                        <div className="empty-state">
                            <Package size={35} />
                            <strong>Inventario en buen estado</strong>
                            <span>No hay productos con stock bajo.</span>
                        </div>
                    ) : (
                        <div className="dashboard-list">
                            {productosStockBajo.slice(0, 5).map((producto) => (
                                <div className="dashboard-list-item" key={producto.id_producto}>
                                    <div className="dashboard-item-icon alert-icon">
                                        <AlertTriangle size={19} />
                                    </div>

                                    <div className="dashboard-item-info">
                                        <strong>{producto.nombre}</strong>
                                        <span>Requiere reposición</span>
                                    </div>

                                    <span className="stock-warning">
                                        {producto.stock} unidades
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="dashboard-footer">
                Nova Salud © 2026 · Sistema de gestión de botica
            </div>

        </div>
    );
}

export default Dashboard;
