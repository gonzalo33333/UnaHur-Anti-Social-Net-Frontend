import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${BASE}/api`, // 👈 importante
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Interceptor de respuesta:
 * - Si el backend devuelve { post: {...} } lo reemplazamos por {...}
 * - Si devuelve { data: ... } o ya es la estructura simple, lo dejamos
 *
 * Esto normaliza la mayoría de las inconsistencias que tenías en distintos handlers
 * (ej: algunos lugares esperaban res.data y otros res.data.post).
 */
api.interceptors.response.use(
  (response) => {
    try {
      const d = response.data;
      // Si viene { post: {...} } -> devolver post directamente
      if (d && typeof d === "object" && "post" in d && (d.post !== null && d.post !== undefined)) {
        response.data = d.post;
      }
    } catch  {
      // no hacemos nada, devolvemos la response tal cual
    }
    return response;
  },
  (error) => {
    // Pasamos el error tal cual para que los catch locales lo manejen
    return Promise.reject(error);
  }
);
