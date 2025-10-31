import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // 🔹 Cierra sesión directamente sin pedir confirmación
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex items-center justify-between z-50">
      {/* 🔵 Sección izquierda */}
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-xl text-blue-700">
          UnaHur
        </Link>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-500"
          }
        >
          Inicio
        </NavLink>

        {user && (
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `ml-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`
            }
          >
            Crear publicación
          </NavLink>
        )}
      </div>

      {/* 🟢 Sección derecha */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-700">
              Hola, <strong>{user.nickName}</strong>
            </span>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-semibold underline"
                  : "text-gray-600 hover:text-blue-500 underline"
              }
            >
              Perfil
            </NavLink>
            <button
              onClick={handleLogout}
              className="ml-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
