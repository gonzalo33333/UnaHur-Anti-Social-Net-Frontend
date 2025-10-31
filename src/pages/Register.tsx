import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import type { User } from "../types";
import { successAlert, errorAlert } from "../utils/alerts";

export default function Register() {
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    nickName: "",
    email: "",
  });
  const navigate = useNavigate();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { name: "", nickName: "", email: "" };
    let hasError = false;

    // 🔹 Validaciones locales
    if (!name.trim()) {
      errors.name = "El nombre completo es obligatorio.";
      hasError = true;
    }

    if (!nickName.trim()) {
      errors.nickName = "El nombre de usuario es obligatorio.";
      hasError = true;
    } else if (nickName.includes(" ")) {
      errors.nickName = "El nombre de usuario no puede tener espacios.";
      hasError = true;
    } else if (nickName.length > 15) {
      errors.nickName = "Máximo 15 caracteres.";
      hasError = true;
    }

    if (!email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
      hasError = true;
    } else if (!validateEmail(email)) {
      errors.email = "El correo electrónico no es válido.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    try {
      // 🔹 Obtener todos los usuarios del backend
      const usersRes = await api.get<User[]>("/users");
      const users = usersRes.data || [];

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedNick = nickName.trim();

      const nickExists = users.some((u) => u.nickName === normalizedNick);
      const emailExists = users.some((u) => u.email === normalizedEmail);

      if (nickExists) {
        errors.nickName = "Ese nombre de usuario ya está registrado.";
        hasError = true;
      }
      if (emailExists) {
        errors.email = "Ese correo electrónico ya está registrado.";
        hasError = true;
      }

      setFieldErrors(errors);
      if (hasError) return;

      // 🔹 Crear usuario nuevo
      const response = await api.post("/users", {
        nickName: normalizedNick,
        email: normalizedEmail,
        name: name.trim(),
      });

      console.log("✅ Usuario creado:", response.data);

      await successAlert(
        "Usuario creado",
        "Tu cuenta fue registrada con éxito. Serás redirigido al login."
      );

      navigate("/login");
    } catch (err: unknown) {
      console.error(err);

      let message = "No se pudo crear el usuario. Intentalo nuevamente.";

      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message;
        }
      }

      await errorAlert("Error", message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">
          Crear nueva cuenta
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre completo */}
          <div>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`border rounded-lg p-2 w-full ${
                fieldErrors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Nickname */}
          <div>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              className={`border rounded-lg p-2 w-full ${
                fieldErrors.nickName ? "border-red-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.nickName && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.nickName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border rounded-lg p-2 w-full ${
                fieldErrors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition"
          >
            Crear usuario
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          ¿Ya tenés una cuenta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  );
}
