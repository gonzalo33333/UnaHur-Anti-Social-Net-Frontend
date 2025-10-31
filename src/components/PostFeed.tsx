import React from "react";
import PostCard from "./PostCard";
import type { Post, Tag } from "../types";

type ExtendedPost = Post & {
  commentCount: number;
  imagesCount: number;
  images?: string[];
  tags?: Tag[];
};

type Props = {
  posts: ExtendedPost[];
  onDelete?: (id: number) => void;
  setPosts?: React.Dispatch<React.SetStateAction<ExtendedPost[]>>;
  layout?: "feed" | "grid"; // feed = vertical, grid = tarjetas lado a lado
};

export default function PostFeed({ posts, onDelete, setPosts, layout = "feed" }: Props) {
  if (!posts.length) return <p className="p-4">No hay publicaciones aún.</p>;

  const handleDelete = (id: number) => {
    if (onDelete) onDelete(id);
    else if (setPosts) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const containerClass =
    layout === "grid"
      ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3"
      : "max-w-3xl mx-auto flex flex-col gap-6 px-3 sm:px-6";

  return (
    <div className={containerClass}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          commentCount={post.commentCount}
          imagesCount={post.imagesCount}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
