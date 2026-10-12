import React from "react";

export function KpiCard({ icon: Icon, label, value, sub, badgeText, badgeType = "lime" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon-wrap">
          {Icon && <Icon size={20} />}
        </div>
        {badgeText && (
          <span className={`kpi-badge ${badgeType}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
      </div>
      {sub && (
        <div className="kpi-footer">
          {sub}
        </div>
      )}
    </div>
  );
}
