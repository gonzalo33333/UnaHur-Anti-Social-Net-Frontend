import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";
import { errorAlert, infoAlert } from "../utils/alerts";

export default function Login() {
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickName || !password) {
      await infoAlert("Campos incompletos", "Por favor completá todos los campos.");
      return;
    }

    try {
      const response = await api.get<User[]>("/users");
      const users = response.data;

      const user = users.find(
        (u) => u.nickName.trim().toLowerCase() === nickName.trim().toLowerCase()
      );

      // 🧩 Primero: verificar si el usuario existe
      if (!user) {
        await infoAlert(
          "Usuario no encontrado",
          "Registrate antes de ingresar para continuar."
        );
        return;
      }

      // 🔐 Segundo: verificar contraseña
      if (password !== "123456") {
        await errorAlert("Contraseña incorrecta", "La contraseña fija es 123456.");
        return;
      }

      // ✅ Si todo está bien, iniciar sesión
      login(user);
      navigate("/");

    } catch (err) {
      console.error(err);
      await errorAlert("Error de conexión", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="pt-12 flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Contraseña (123456)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          ¿Todavía no tenés una cuenta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline"
          >
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}
