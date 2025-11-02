import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/apiClient";
import type { Post, Comment, PostImage, Tag } from "../types";
import CommentList from "../components/CommentList";
import ImageGallery from "../components/ImageGallery";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);

        // obtener post (según tu backend esto ya incluye author y tags)
        const pRes = await api.get<Post>(`/posts/${id}`);
        const pData = pRes.data;
        setPost(pData);

        // comentarios
        const cRes = await api.get<Comment[]>(`/comments/post/${id}`);
        setComments(cRes.data || []);

        // imágenes del post (si las guardás por separado)
        const imgsRes = await api.get<PostImage[]>(`/images/post/${id}`);
        const imgs = imgsRes.data || [];
        setImages(imgs.map((i) => i.url));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      await Swal.fire({
        icon: "warning",
        title: "Iniciá sesión",
        text: "Debes iniciar sesión para comentar.",
      });
      return;
    }

    try {
      await api.post("/comments", {
        text: newComment.trim(),
        postId: Number(id),
        userId: user.id,
      });
      const cRes = await api.get<Comment[]>(`/comments/post/${id}`);
      setComments(cRes.data || []);
      setNewComment("");
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo publicar el comentario.",
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar esta publicación?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",    // rojo para eliminar
      cancelButtonColor: "#3085d6", // azul para cancelar — se ven bien separados
      reverseButtons: false,
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/posts/${id}`);
      await Swal.fire({
        icon: "success",
        title: "Eliminada",
        text: "La publicación se eliminó correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });

      // notificar a Home/Profile y volver al home
      window.dispatchEvent(new CustomEvent("postDeleted", { detail: { id: Number(id) } }));
      navigate("/");
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la publicación.",
      });
    }
  };

  const goBack = () => navigate(-1);

  if (loading) return <Loading />;
  if (!post) return <p className="p-4">Publicación no encontrada</p>;

  return (
    <div className="pt-14 px-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Detalle de publicación</h2>
          <button onClick={goBack} className="text-sm text-blue-600 underline">
            ← Volver
          </button>
        </div>

        {/* Autor (provisto por post.author desde el backend) */}
        {post.author && (
          <p className="text-gray-600 text-sm">
            Publicado por <span className="font-medium">@{post.author.nickName}</span>
          </p>
        )}

        {/* Descripción */}
        <p className="whitespace-pre-wrap text-gray-800">{post.description}</p>

        {/* Etiquetas (usamos post.tags que devuelve tu backend) */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag: Tag) => (
              <span key={tag.id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Galería de imágenes */}
        {images.length > 0 && <ImageGallery images={images} />}

        {/* Botones editar/eliminar (solo autor) */}
        {user && user.id === post.userId && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit/${post.id}`)}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
            >
              ✏️ Editar publicación
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              🗑️ Eliminar publicación
            </button>
          </div>
        )}

        <div>
          <h3 className="font-medium text-lg mb-3 text-gray-700">Comentarios</h3>
          <CommentList comments={comments} />
        </div>

        {user ? (
          <form onSubmit={submitComment} className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
              placeholder="Escribí tu comentario..."
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Agregar comentario
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-500 italic mt-4">Iniciá sesión para dejar un comentario 💬</p>
        )}
      </div>
    </div>
  );
}
