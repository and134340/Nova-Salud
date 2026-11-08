import { useEffect, useState } from "react";
import api from "../services/api";

function Historial() {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    const cargarVentas = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await api.get("/ventas");

            setVentas(respuesta.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudo cargar el historial de ventas."
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, []);

    const verDetalles = async (idVenta) => {
        try {
            setCargandoDetalle(true);
            setVentaSeleccionada(null);
            setDetalles([]);

            const respuesta = await api.get(`/ventas/${idVenta}`);

            setVentaSeleccionada(respuesta.data.venta);
            setDetalles(respuesta.data.detalles || []);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "No se pudieron cargar los detalles."
            );
        } finally {
            setCargandoDetalle(false);
        }
    };

    return (
        <div className="historial-container">
            <div className="historial-header">
                <div>
                    <h1>Historial de ventas</h1>
                    <p>Consulta todas las ventas registradas en el sistema.</p>
                </div>

                <button onClick={cargarVentas}>
                    Actualizar
                </button>
            </div>

            <div className="historial-resumen">
                <div className="historial-card">
                    <span>Total de ventas</span>
                    <strong>{ventas.length}</strong>
                </div>

                <div className="historial-card">
                    <span>Ingresos registrados</span>
                    <strong>
                        S/ {ventas.reduce(
                            (total, venta) => total + Number(venta.total),
                            0
                        ).toFixed(2)}
                    </strong>
                </div>
            </div>

            <div className="historial-tabla-container">
                <h2>Ventas registradas</h2>

                {cargando ? (
                    <p>Cargando ventas...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : ventas.length === 0 ? (
                    <p>No hay ventas registradas.</p>
                ) : (
                    <table className="historial-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Acción</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ventas.map((venta) => (
                                <tr key={venta.id_venta}>
                                    <td>#{venta.id_venta}</td>
                                    <td>{venta.nombre_usuario}</td>
                                    <td>
                                        {new Date(
                                            venta.fecha_venta
                                        ).toLocaleString("es-PE")}
                                    </td>
                                    <td>
                                        S/ {Number(venta.total).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                verDetalles(venta.id_venta)
                                            }
                                        >
                                            Ver detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {cargandoDetalle && <p>Cargando detalles...</p>}

            {ventaSeleccionada && (
                <div className="historial-detalle">
                    <div className="historial-detalle-header">
                        <h2>Detalle de venta #{ventaSeleccionada.id_venta}</h2>

                        <button
                            onClick={() => {
                                setVentaSeleccionada(null);
                                setDetalles([]);
                            }}
                        >
                            Cerrar
                        </button>
                    </div>

                    <p>
                        Usuario: {ventaSeleccionada.nombre_usuario}
                    </p>

                    <h3>Productos vendidos</h3>

                    <table className="historial-tabla">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            {detalles.map((detalle) => (
                                <tr key={detalle.id_producto}>
                                    <td>{detalle.nombre_producto}</td>
                                    <td>{detalle.cantidad}</td>
                                    <td>
                                        S/ {Number(
                                            detalle.precio_unitario
                                        ).toFixed(2)}
                                    </td>
                                    <td>
                                        S/ {Number(
                                            detalle.subtotal
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3 className="historial-total">
                        Total: S/ {Number(
                            ventaSeleccionada.total
                        ).toFixed(2)}
                    </h3>
                </div>
            )}
        </div>
    );
}

export default Historial;