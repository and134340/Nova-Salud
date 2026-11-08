
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Historial from "./pages/Historial";
import Usuarios from "./pages/Usuarios";
import Categorias from "./pages/Categorias";
import Login from "./pages/Login";

import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";

function ProtectedRoute() {
    const { usuario } = useAuth();

    return usuario ? <MainLayout /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
    const { usuario } = useAuth();

    return (
        <Routes>

            <Route
                path="/login"
                element={
                    usuario
                        ? <Navigate to="/" replace />
                        : <Login />
                }
            />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/historial" element={<Historial />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/categorias" element={<Categorias />} />
            </Route>

            <Route
                path="*"
                element={<Navigate to={usuario ? "/" : "/login"} replace />}
            />

        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
