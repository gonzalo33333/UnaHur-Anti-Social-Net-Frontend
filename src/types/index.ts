export interface User {
  id: number;
  nickName: string;
  email?: string; // opcional por si lo agregás más adelante
}

export interface Tag {
  id: number;
  name: string;
}

export interface PostImage {
  id: number;
  url: string;
  postId: number;
}

export interface Comment {
  id: number;
  text: string; // 👈 coincide con tu backend
  postId: number;
  userId: number;
  createdAt?: string;
  author?: {
    id: number;
    nickName: string;
  };
}

export interface Post {
  id: number;
  description: string;
  userId: number;
  author?: User; // 👈 agregado para que funcione en PostCard
  tags?: Tag[];
  createdAt?: string;
  updatedAt?: string;
}
