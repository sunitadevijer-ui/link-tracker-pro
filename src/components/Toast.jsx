import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function Toast({ toast, onDismiss }) {
  if (!toast || !toast.message) return null;

  const isError = toast.type === "error";
  const isInfo = toast.type === "info";

  return (
    <div className="toast-container" aria-live="polite">
      <div className={`toast-item ${isError ? "error" : "success"}`}>
        {isError ? (
          <AlertCircle size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
        ) : isInfo ? (
          <Info size={18} style={{ color: "var(--info)", flexShrink: 0 }} />
        ) : (
          <CheckCircle2 size={18} style={{ color: "var(--lime)", flexShrink: 0 }} />
        )}
        <span style={{ flex: 1, fontSize: "13px" }}>{toast.message}</span>
        <button
          className="btn-icon"
          style={{ width: "22px", height: "22px", border: "none", background: "transparent" }}
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
