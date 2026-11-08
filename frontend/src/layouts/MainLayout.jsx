
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    Boxes,
    ShoppingCart,
    History,
    Users,
    Bell,
    Search,
    Menu,
    Pill,
    Tags,
    LogOut
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Productos", path: "/productos", icon: Package },
    { name: "Categorías", path: "/categorias", icon: Tags },
    { name: "Inventario", path: "/inventario", icon: Boxes },
    { name: "Ventas", path: "/ventas", icon: ShoppingCart },
    { name: "Historial", path: "/historial", icon: History },
    { name: "Usuarios", path: "/usuarios", icon: Users }
];

function MainLayout() {
    const [menuOpen, setMenuOpen] = useState(false);

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const cerrarSesion = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const inicial = usuario?.nombre?.charAt(0).toUpperCase() || "U";

    return (
        <div className="app-container">

            <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>

                <div className="brand">
                    <div className="brand-icon">
                        <Pill size={25} />
                    </div>
                    <div>
                        <h2>Nova Salud</h2>
                        <span>Gestión de botica</span>
                    </div>
                </div>

                <div className="menu-title">MENÚ PRINCIPAL</div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? "active" : ""}`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-avatar">{inicial}</div>
                    <div>
                        <strong>{usuario?.nombre}</strong>
                        <span>{usuario?.rol || "Usuario"}</span>
                    </div>
                </div>

            </aside>

            <main className="main-content">

                <header className="topbar">

                    <button
                        className="mobile-menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <Menu size={23} />
                    </button>

                    <div className="search-box">
                        <Search size={19} />
                        <input
                            type="text"
                            placeholder="Buscar en Nova Salud..."
                        />
                    </div>

                    <div className="topbar-right">

                        <button className="notification-button">
                            <Bell size={21} />
                            <span className="notification-dot"></span>
                        </button>

                        <div className="profile">
                            <div className="user-avatar">{inicial}</div>

                            <div className="profile-info">
                                <strong>{usuario?.nombre}</strong>
                                <span>{usuario?.rol}</span>
                            </div>
                        </div>

                        <button
                            className="logout-button"
                            onClick={cerrarSesion}
                            title="Cerrar sesión"
                        >
                            <LogOut size={19} />
                            <span>Cerrar sesión</span>
                        </button>

                    </div>
                </header>

                <section className="page-content">
                    <Outlet />
                </section>

            </main>
        </div>
    );
}

export default MainLayout;
