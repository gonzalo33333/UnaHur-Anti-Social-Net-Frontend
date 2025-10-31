import Swal from "sweetalert2";

export const successAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#2563eb", // azul tailwind
  });
};

export const errorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626", // rojo tailwind
  });
};

export const infoAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#2563eb",
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
    cancelButtonColor: "#6b7280",
  });
  return result.isConfirmed;
};
