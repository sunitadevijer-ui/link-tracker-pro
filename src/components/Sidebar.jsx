import React from "react";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  FileText,
  Settings,
  RefreshCw,
  LogOut,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink
} from "lucide-react";

export function Sidebar({
  page,
  setPage,
  linksCount,
  isDemoMode,
  isConfigured,
  userEmail,
  onRefresh,
  loading,
  onSignOut,
  mobileOpen,
  setMobileOpen
}) {
  const navItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Links", label: "Links", icon: Link2, badge: linksCount },
    { id: "Analytics", label: "Analytics", icon: BarChart3 },
    { id: "Reports", label: "Reports", icon: FileText },
    { id: "Settings", label: "Settings", icon: Settings },
  ];

  function handleNav(id) {
    setPage(id);
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
    }
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35 }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Sidebar Navigation">
        <div className="brand">
          <div className="brand-icon-box" aria-hidden="true">
            <Zap size={20} />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">
              LinkTracker <span className="badge-pro">PRO</span>
            </span>
            <span className="brand-sub">Attribution & Analytics</span>
          </div>
          {mobileOpen && (
            <button
              className="btn-icon"
              style={{ marginLeft: "auto" }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="status-card">
            <div className="status-indicator">
              <span className={`dot-live ${isDemoMode ? "demo" : ""}`} />
              <span>{isDemoMode ? "Demo Workspace" : "Supabase Live"}</span>
            </div>
            <button
              className="btn-icon"
              onClick={onRefresh}
              title="Refresh data"
              aria-label="Refresh data"
              disabled={loading}
              style={{ width: "28px", height: "28px" }}
            >
              <RefreshCw size={13} className={loading ? "spin-icon" : ""} />
            </button>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">
              {(userEmail || "U")[0].toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-email" title={userEmail}>
                {userEmail || "Guest User"}
              </span>
              <span className="user-role">
                {isDemoMode ? "Interactive Preview" : "Authenticated"}
              </span>
            </div>
            {onSignOut && (
              <button
                className="btn-icon danger-hover"
                onClick={onSignOut}
                title="Sign out / Exit"
                aria-label="Sign out"
                style={{ width: "30px", height: "30px" }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
