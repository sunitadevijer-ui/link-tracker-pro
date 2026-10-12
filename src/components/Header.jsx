import React from "react";
import { Plus, Menu, Calendar, Sparkles } from "lucide-react";

export function Header({
  page,
  range,
  setRange,
  onCreateLink,
  mobileOpen,
  setMobileOpen,
  isDemoMode
}) {
  const pageDescriptions = {
    Dashboard: "Real-time traffic performance, conversion velocity, and campaign intelligence.",
    Links: "Create, organize, and monitor all short tracking links in one place.",
    Analytics: "Deep-dive attribution metrics, visitor devices, referrers, and campaign sources.",
    Reports: "Audit campaign metrics and export attribution logs for client reporting.",
    Settings: "Configure workspace parameters, Supabase database bindings, and redirects."
  };

  return (
    <>
      <div className="mobile-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="brand-icon-box" style={{ width: "32px", height: "32px" }}>
            <Sparkles size={16} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "14px" }}>LinkTracker Pro</span>
        </div>
        <button
          className="btn-icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <header className="header-topbar">
        <div className="header-left">
          <div className="header-eyebrow">
            <span>Link Tracker Pro</span>
            <span style={{ color: "var(--text-tertiary)" }}>/</span>
            <span>{page}</span>
          </div>
          <h1 className="header-title">
            {page === "Dashboard" ? "Good to see you 👋" : page}
          </h1>
          <p className="header-desc">
            {pageDescriptions[page] || "Manage and optimize your link ecosystem."}
          </p>
        </div>

        <div className="header-actions">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              className="select-input"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Select date range"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>

          <button
            className="btn btn-lime"
            onClick={onCreateLink}
            aria-label="Create new tracked link"
          >
            <Plus size={16} />
            <span>Create Link</span>
          </button>
        </div>
      </header>
    </>
  );
}
