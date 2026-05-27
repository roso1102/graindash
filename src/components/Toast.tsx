"use client";

import { useEffect, useState, useCallback } from "react";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

let toastListeners: ((items: ToastItem[]) => void)[] = [];
let toastStore: ToastItem[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...toastStore]));
}

export function showToast(message: string, type: "success" | "error" | "warning" = "success") {
  const id = Math.random().toString(36).slice(2);
  toastStore = [...toastStore, { id, message, type }];
  notifyListeners();
  setTimeout(() => {
    toastStore = toastStore.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

const TYPE_CLASSES: Record<string, string> = {
  success: "bg-success/15 border-success text-success",
  error: "bg-danger/15 border-danger text-danger",
  warning: "bg-warning/15 border-warning text-warning",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    toastStore = toastStore.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm shadow-lg animate-[slideIn_0.2s_ease-out] ${TYPE_CLASSES[t.type]}`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-2 text-current opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
