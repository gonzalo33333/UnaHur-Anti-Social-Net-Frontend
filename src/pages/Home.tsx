import React, { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../api/apiClient";
import type { Post, Comment, PostImage, Tag } from "../types";
import Loading from "../components/Loading";
import PostFeed from "../components/PostFeed";

type ExtendedPost = Post & {
  commentCount: number;
  imagesCount: number;
  images?: string[];
  tags?: Tag[];
};

export default function Home() {
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

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/posts?page=${pageNum}&limit=5`);
      const basePosts = res.data.posts || [];

      const postsWithExtras: ExtendedPost[] = await Promise.all(
        basePosts.map(async (post: Post) => {
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

      // 🔹 evitar duplicados
      setPosts((prev) => {
        const newPosts = postsWithExtras.filter((p) => !prev.some((old) => old.id === p.id));
        return [...prev, ...newPosts];
      });

      setHasMore(pageNum < res.data.totalPages);
    } catch (err) {
      console.error("Error cargando posts:", err);
      setError("No se pudieron cargar las publicaciones. Probá recargar la página.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  // 🔹 Escuchar eventos de eliminación
  useEffect(() => {
    const handlePostDeleted = (ev: Event) => {
      const { id } = (ev as CustomEvent<{ id: number }>).detail;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    window.addEventListener("postDeleted", handlePostDeleted);
    return () => window.removeEventListener("postDeleted", handlePostDeleted);
  }, []);

  return (
    <div className="pt-12 min-h-screen ">
      <header className="py-8 text-center bg-white shadow-sm mb-6 rounded-lg">
        <h1 className="text-4xl font-bold text-blue-700">
          Bienvenido a <span className="text-blue-800">UnaHur Anti-Social Net</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Explorá publicaciones, comentá y compartí tus ideas.
        </p>
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
          {!hasMore && (
            <p className="text-gray-500 my-4 text-center">No hay más publicaciones.</p>
          )}
        </>
      )}
    </div>
  );
}
