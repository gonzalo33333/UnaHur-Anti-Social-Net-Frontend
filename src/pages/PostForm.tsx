import React, { useEffect, useState } from "react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import type { PostImage, Tag } from "../types";
import { errorAlert } from "../utils/alerts";

interface PostFormProps {
  mode: "create" | "edit" | "view";
}

export default function PostForm({ mode }: PostFormProps) {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<PostImage[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode !== "create");
  const [saving, setSaving] = useState(false);

  const [duplicateTagError, setDuplicateTagError] = useState("");

  // 🟦 Si está en modo edición o vista, carga datos del post existente
  useEffect(() => {
    if (mode === "create" || !id) return;
    (async () => {
      try {
        const postRes = await api.get(`/posts/${id}`);
        const postData = postRes.data?.post ?? postRes.data;
        setDescription(postData.description ?? "");

        const imgsRes = await api.get<PostImage[]>(`/images/post/${id}`);
        setExistingImages(imgsRes.data || []);

        const postTags = Array.isArray(postData.tags) ? postData.tags : [];
        setTags(postTags);
      } catch {
        setError("Error cargando la publicación");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, mode]);

  const handleDeleteImage = async (imgId: number) => {
    try {
      await api.delete(`/images/${imgId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
    } catch {
      alert("No se pudo eliminar la imagen");
    }
  };

  const handleAddImageField = () => setNewImages((prev) => [...prev, ""]);
  const handleChangeNewImage = (i: number, value: string) => {
    setNewImages((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const handleAddCustomTag = async () => {
  const name = customTag.trim();
  if (!name) return;

  // 🔹 Validación de duplicado
  if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
    setDuplicateTagError("Esta etiqueta ya fue agregada a la publicación.");
    return;
  }

  try {
    const res = await api.post<Tag>("/tags", { name });
    setTags((prev) => [...prev, res.data]);
    setCustomTag("");
    setDuplicateTagError(""); // limpiar error si se agrega correctamente
  } catch {
    alert("No se pudo agregar la etiqueta");
  }
};

  const handleRemoveTag = (tagId: number) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (saving || mode === "view") return;
  if (!user) return alert("Debes estar logueado.");

  // 🔹 VALIDACIÓN: descripción obligatoria
  if (!description.trim()) {
  errorAlert("Error", "La descripción no puede estar vacía"); // ⚠️ Usando SweetAlert
  return; // 🚫 Detener ejecución
}

  try {
    setSaving(true);
    let postId = id;

    if (mode === "create") {
      const res = await api.post("/posts", {
        description,
        userId: user.id,
      });
      postId = res.data.id;
    } else {
      await api.put(`/posts/${id}`, { description });
    }

    const validNew = newImages.map((u) => u.trim()).filter(Boolean);
    for (const url of validNew) {
      await api.post("/images", { url, postId: Number(postId) });
    }

    for (const tag of tags) {
      await api.post(`/posts/${postId}/addTag/${tag.id}`).catch(() => {});
    }

    navigate(mode === "create" ? "/" : `/post/${postId}`);
  } catch {
    setError("Error al guardar la publicación");
  } finally {
    setSaving(false);
  }
};



  if (loading) return <p className="p-4">Cargando...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="mt-24 max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        {mode === "create"
          ? "Crear publicación"
          : mode === "edit"
          ? "Editar publicación"
          : "Ver publicación"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 📝 Descripción */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={mode === "view"}
          className="w-full border rounded p-2 disabled:bg-gray-100"
          placeholder="Escribe tu descripción..."
        />

        {/* 🖼️ Imágenes existentes */}
        {existingImages.length > 0 && (
          <div>
            <p className="font-medium mb-1">Imágenes:</p>
            <div className="grid grid-cols-2 gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.url}
                    alt="post"
                    className="w-full h-32 object-cover rounded"
                  />
                  {mode === "edit" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs"
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ➕ Agregar imágenes */}
        {mode !== "view" && (
          <div>
            <p className="font-medium mb-1">Agregar imágenes:</p>
            {newImages.map((url, i) => (
              <input
                key={i}
                type="text"
                value={url}
                onChange={(e) => handleChangeNewImage(i, e.target.value)}
                placeholder={`Imagen ${i + 1} (https://...)`}
                className="w-full border rounded p-2 mb-1"
              />
            ))}
            <button
              type="button"
              onClick={handleAddImageField}
              className="text-blue-600 text-sm underline"
            >
              + Agregar otra imagen
            </button>
          </div>
        )}

        {/* 🏷️ Etiquetas */}
        <div>
          <p className="font-medium mb-1">Etiquetas:</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center gap-1"
              >
                #{t.name}
                {mode !== "view" && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t.id)}
                    className="text-red-500 font-bold hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {mode !== "view" && (
  <>
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Agregar nueva etiqueta..."
        value={customTag}
        onChange={(e) => setCustomTag(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 flex-1"
      />
      <button
        type="button"
        onClick={handleAddCustomTag}
        className="bg-blue-600 text-white px-3 py-1 rounded-lg"
      >
        Agregar
      </button>
    </div>

    {/* 🛑 Mensaje de error si la etiqueta ya existe */}
    {duplicateTagError && (
      <p className="text-red-600 text-sm mt-1">{duplicateTagError}</p>
    )}
  </>
)}

        </div>

        {/* Guardar */}
        {mode !== "view" && (
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {saving
              ? "Guardando..."
              : mode === "create"
              ? "Publicar"
              : "Guardar cambios"}
          </button>
        )}
      </form>
    </div>
  );
}
