import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PostForm from "./pages/PostForm";
import { Routes, Route } from "react-router-dom"; // <-- asegurate de tener esto

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <main className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
                  <PostForm mode="view" />
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
        </main>
      </div>
    </AuthProvider>
  );
}
