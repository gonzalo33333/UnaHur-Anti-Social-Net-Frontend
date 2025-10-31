import React, { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import PostFeed from "../components/PostFeed";
import type { Post, Comment, PostImage, Tag } from "../types";

type ExtendedPost = Post & {
  commentCount: number;
  imagesCount: number;
  images?: string[];
  tags?: Tag[];
};

export default function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchUserPosts = useCallback(async (pageNum: number) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/posts?page=${pageNum}&limit=5`);
      const all: Post[] = res.data.posts || [];
      const userPosts: Post[] = all.filter((p: Post) => p.userId === user.id);

      const postsWithExtras: ExtendedPost[] = await Promise.all(
        userPosts.map(async (post: Post) => {
          try {
            const [commentsRes, imagesRes] = await Promise.all([
              api.get<Comment[]>(`/comments/post/${post.id}`),
              api.get<PostImage[]>(`/images/post/${post.id}`),
            ]);

            return {
              ...post,
              commentCount: commentsRes.data?.length ?? 0,
              imagesCount: imagesRes.data?.length ?? 0,
              images: (imagesRes.data || []).map((i) => i.url),
              tags: post.tags || [],
            };
          } catch {
            return { ...post, commentCount: 0, imagesCount: 0, images: [], tags: post.tags || [] };
          }
        })
      );

      setPosts((prev) => {
        const newPosts = postsWithExtras.filter((p) => !prev.some((old) => old.id === p.id));
        return [...prev, ...newPosts];
      });

      setHasMore(pageNum < res.data.totalPages);
    } catch (err) {
      console.error("Error cargando publicaciones del perfil:", err);
      setError("No se pudieron cargar las publicaciones del perfil.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchUserPosts(page);
  }, [page, user, fetchUserPosts]);

  // 🔹 Escuchar eventos de eliminación
  useEffect(() => {
    const handlePostDeleted = (ev: Event) => {
      const { id } = (ev as CustomEvent<{ id: number }>).detail;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    window.addEventListener("postDeleted", handlePostDeleted);
    return () => window.removeEventListener("postDeleted", handlePostDeleted);
  }, []);

  if (!user) return <p className="p-4">Iniciá sesión para ver tu perfil.</p>;

  return (
    <div className="pt-12 min-h-screen bg-gray-100">
      <header className="py-8 text-center bg-white shadow-sm mb-6">
        <h1 className="text-4xl font-bold text-blue-700">
          Perfil de <span className="text-blue-800">{user?.nickName}</span>
        </h1>
        <p className="text-gray-600 mt-2">Tus publicaciones en UnaHur.</p>
      </header>

      {posts.length === 0 && loading ? (
        <Loading />
      ) : error ? (
        <p className="p-4 text-center text-red-600">{error}</p>
      ) : (
        <>
          <PostFeed
            posts={posts}
            onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
          {loading && <Loading />}
          <div ref={lastPostRef} />
          {!hasMore && <p className="text-gray-500 my-4 text-center">No hay más publicaciones.</p>}
        </>
      )}
    </div>
  );
}
