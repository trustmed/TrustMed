"use client";

import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toast, ToastType } from "@/hooks/useToast";

interface ToastRendererProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function toastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-border bg-card text-foreground";
  }
}

function ToastIcon({ type }: { type: ToastType }) {
  const cls = "h-4 w-4 shrink-0";
  if (type === "success") return <CheckCircle className={cn(cls, "text-green-600")} />;
  if (type === "error") return <XCircle className={cn(cls, "text-red-600")} />;
  return <Info className={cn(cls, "text-primary")} />;
}

export function ToastRenderer({ toasts, onRemove }: ToastRendererProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-4",
            toastStyles(toast.type)
          )}
        >
          <ToastIcon type={toast.type} />
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
