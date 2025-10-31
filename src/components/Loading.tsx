import React from "react";

export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center p-4">
      <div className="animate-pulse text-gray-600">Cargando...</div>
    </div>
  );
}
