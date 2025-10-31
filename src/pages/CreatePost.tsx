import React, { useEffect, useState } from "react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import type { Tag } from "../types";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tagExists, setTagExists] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Tag[]>("/tags");
        setTags(res.data || []);
      } catch (err) {
        console.error("Error cargando etiquetas:", err);
      }
    })();
  }, []);

  // Detectar si la etiqueta ya existe mientras el usuario escribe
  useEffect(() => {
    const name = customTag.trim().toLowerCase();
    if (!name) {
      setTagExists(false);
      return;
    }
    const exists = tags.some((t) => t.name.toLowerCase() === name);
    setTagExists(exists);
  }, [customTag, tags]);

  const handleAddImageField = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const handleChangeImage = (index: number, value: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddTag = async () => {
    const name = customTag.trim();
    if (!name) return;

    const existingTag = tags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );

    if (existingTag) {
      // Si ya existe, seleccionarla
      if (!selectedTags.includes(existingTag.id)) {
        setSelectedTags((prev) => [...prev, existingTag.id]);
      }
      setCustomTag("");
      return;
    }

    try {
      const res = await api.post<Tag>("/tags", { name });
      const newTag = res.data;
      setTags((prev) => [...prev, newTag]);
      setSelectedTags((prev) => [...prev, newTag.id]);
      setCustomTag("");
    } catch (err) {
      console.error("No se pudo crear la etiqueta:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la etiqueta. Probá de nuevo.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleRemoveTag = (id: number) => {
    setSelectedTags((prev) => prev.filter((t) => t !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }
    if (!user) {
      setError("Debes estar logueado para publicar");
      return;
    }

    try {
      setLoading(true);

      const postRes = await api.post("/posts", {
        description: description.trim(),
        userId: user.id,
      });
      const postId = postRes.data.id;

      const validUrls = imageUrls.map((u) => u.trim()).filter((u) => u);
      for (const url of validUrls) {
        await api.post("/images", { url, postId });
      }

      for (const tagId of selectedTags) {
        try {
          await api.post(`/posts/${postId}/addTag/${tagId}`);
        } catch (err) {
          console.warn(`No se pudo asociar tag ${tagId}:`, err);
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Publicación creada",
        text: "Tu publicación se creó con éxito",
        showConfirmButton: false,
        timer: 1500,
        position: "center",
      });

      navigate("/profile");
    } catch (err) {
      console.error("Error creando publicación:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la publicación.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        Crear nueva publicación
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escribí algo..."
          className="w-full border rounded p-2"
        />

        {/* Imágenes */}
        <div className="space-y-2">
          <p className="font-medium">URLs de imágenes (opcional):</p>
          {imageUrls.map((url, i) => (
            <div key={i}>
              <label className="text-sm text-gray-600 font-medium">
                Imagen {i + 1}:
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => handleChangeImage(i, e.target.value)}
                placeholder="https://..."
                className="w-full border rounded p-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImageField}
            className="text-blue-600 text-sm underline"
          >
            + Agregar otra imagen
          </button>
        </div>

        {/* Etiquetas */}
        <div className="mt-4">
          <p className="font-medium mb-1">Etiquetas:</p>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ej: viajes, comida..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className={`border rounded-lg p-2 flex-1 ${
                tagExists ? "border-yellow-400 bg-yellow-50" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
            >
              Agregar
            </button>
          </div>

          {/* 🏷️ Mostrar etiquetas seleccionadas */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTags.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <div
                    key={id}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(id)}
                      className="ml-1 text-xs bg-blue-800 rounded-full px-1 hover:bg-blue-900"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Creando..." : "Crear publicación"}
        </button>
      </form>
    </div>
  );
}
