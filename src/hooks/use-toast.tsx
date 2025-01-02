import { useRef } from "react";
import { Toast } from "primereact/toast";

export const useToast = () => {
  const toast = useRef<Toast>(null);

  const show = (
    severity: "success" | "error" | "info" | "warn",
    summary: string,
    detail: string
  ) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      className: "bg-red-500 text-white",
      icon: "pi pi-exclamation-triangle",
    });
  };

  const clear = () => {
    toast.current?.clear();
  };

  return { toast, show, clear };
};
