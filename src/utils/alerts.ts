import Swal from "sweetalert2";

export const successAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#2563eb", // azul tailwind
    customClass: {
      confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
    },
  });
};

export const errorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626", // rojo tailwind
    customClass: {
      confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
    },
  });
};

export const infoAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#2563eb",
    customClass: {
      confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
    },
  });
};

export const confirmAlert = async (title: string, text?: string) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#dc2626",
    customClass: {
      confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
      cancelButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
    },
  });
  return result.isConfirmed;
};
