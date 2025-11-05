import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PostForm from "./pages/PostForm";
import PostDetail from "./pages/PostDetail";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import fondo from "./assets/fondo.jpg";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/home" replace /> : <Register />}
      />
      <Route
        path="/"
        element={
          user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <PostForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <PostForm mode="create" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<p>Página no encontrada</p>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url(${fondo})`,
        }}
      >
        <NavBar />
        <main className="max-w-5xl mx-auto p-4">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}
