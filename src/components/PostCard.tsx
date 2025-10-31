// src/components/PostCard.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import type { Post, Tag } from "../types";

type PostWithExtras = Post & {
  images?: string[];
  tags?: Tag[];
};

type Props = {
  post: PostWithExtras;
  commentCount: number;
  imagesCount: number;
  onDelete?: (id: number) => void;
};

export default function PostCard({
  post,
  commentCount,
  imagesCount,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm("¿Seguro que querés eliminar esta publicación?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      alert("Publicación eliminada");
      onDelete?.(post.id);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la publicación");
    }
  };

  return (
    <article className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-full">
      {/* 🔹 Botones de edición y borrado */}
      {user && user.id === post.userId && (
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => navigate(`/edit/${post.id}`)}
            className="text-yellow-500 hover:text-yellow-600"
            title="Editar publicación"
          >
            ✎
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            title="Eliminar publicación"
          >
            ✖
          </button>
        </div>
      )}

      <div className="p-5 flex flex-col">
        {/* 🔹 Autor */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {post.author ? post.author.nickName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">
              {post.author?.nickName ?? "Usuario desconocido"}
            </p>
            <p className="text-xs text-gray-500">Publicado recientemente</p>
          </div>
        </div>

        {/* 🔹 Descripción */}
        <p className="mb-3 text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
          {post.description}
        </p>

        {/* 🔹 Imágenes (máx. 4 visibles) */}
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3 rounded-lg overflow-hidden">
            {post.images.slice(0, 4).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`img-${i}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
            {post.images.length > 4 && (
              <div className="flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-semibold rounded-lg">
                +{post.images.length - 4}
              </div>
            )}
          </div>
        )}

        {/* 🔹 Etiquetas */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 🔹 Contadores + Ver más */}
        <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-3 mt-3">
          <div>
            💬 {commentCount} comentarios • 🖼️ {imagesCount} imágenes
          </div>
          <Link
            to={`/post/${post.id}`}
            className="text-blue-600 hover:underline"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}
