import React, { useEffect } from "react";
import { AlertCircle, Trash2, X } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  busy = false
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && !busy) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div className="modal-dialog" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "var(--danger-bg)",
                border: "1px solid var(--danger-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--danger)",
                flexShrink: 0
              }}
            >
              <Trash2 size={18} />
            </div>
            <div>
              <h2 id="confirm-modal-title" className="modal-title" style={{ fontSize: "16px" }}>
                {title}
              </h2>
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "20px 24px" }}>
          <p id="confirm-modal-desc" style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
