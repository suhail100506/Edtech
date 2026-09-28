"use client";

import React from "react";
import { useDataset } from "@/lib/context/DatasetContext";
import { CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useDataset();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isInfo = toast.type === "info";

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5",
              isSuccess && "bg-white border-emerald-200 text-slate-800",
              isError && "bg-white border-rose-200 text-slate-800",
              isInfo && "bg-white border-blue-200 text-slate-800"
            )}
          >
            <div className="mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-600" />}
              {isInfo && <AlertTriangle className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-text">{toast.title}</h4>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text rounded-md p-0.5 hover:bg-slate-100 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
