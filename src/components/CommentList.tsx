import React from "react";
import type { Comment } from "../types";

type Props = {
  comments: Comment[];
};

export default function CommentList({ comments }: Props) {
  if (!comments.length)
    return <p className="text-gray-500">No hay comentarios aún.</p>;

  return (
    <ul className="space-y-2">
      {comments.map((c) => (
        <li
          key={c.id}
          className="border border-gray-200 rounded-lg p-2 bg-gray-50"
        >
          <p className="text-gray-800">{c.text}</p> {/* 👈 acá usamos text */}
          {c.author && (
            <p className="text-sm text-gray-500 mt-1">
              Por: <span className="font-medium">{c.author.nickName}</span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
