import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const fallback =
    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

  // 👉 Función para moverse al anterior o siguiente
  const changeImage = (direction: "prev" | "next") => {
    if (selected === null) return;
    if (direction === "prev")
      setSelected((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
    else
      setSelected((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
  };

  return (
    <>
      {/* Miniaturas en grilla */}
      <div className="grid grid-cols-2 gap-2 my-2">
        {images.map((u, i) => (
          <motion.img
            key={i}
            src={u}
            alt={`img-${i}`}
            className="w-full h-40 object-cover rounded cursor-pointer hover:opacity-80"
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelected(i)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
          />
        ))}
      </div>

      {/* Modal con carrusel */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute top-5 right-5 text-white"
              onClick={() => setSelected(null)}
            >
              <X size={28} />
            </button>

            <button
              className="absolute left-5 text-white"
              onClick={() => changeImage("prev")}
            >
              <ChevronLeft size={40} />
            </button>

            <motion.img
              key={selected}
              src={images[selected]}
              alt={`zoom-${selected}`}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallback;
              }}
            />

            <button
              className="absolute right-5 text-white"
              onClick={() => changeImage("next")}
            >
              <ChevronRight size={40} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
