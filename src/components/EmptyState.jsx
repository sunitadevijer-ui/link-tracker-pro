import React from "react";

export function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="empty-state-box">
      {Icon && (
        <div className="empty-icon-wrap">
          <Icon size={24} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {actionText && onAction && (
        <button className="btn btn-lime" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
