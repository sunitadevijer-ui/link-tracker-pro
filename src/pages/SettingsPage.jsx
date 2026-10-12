import React from "react";
import {
  Settings, Database, ShieldCheck, RefreshCw, RotateCcw,
  LogOut, Globe, Key, CheckCircle2, AlertTriangle, ExternalLink
} from "lucide-react";

export function SettingsPage({
  user,
  isDemoMode,
  isConfigured,
  onRefresh,
  onResetDemo,
  onSignOut,
  onShowSetup
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "Not configured";

  return (
    <div className="page-content" style={{ maxWidth: "1000px" }}>
      {/* Account & Profile */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <h2 className="panel-title">
              <Settings size={18} />
              <span>Workspace Profile</span>
            </h2>
            <span className="panel-desc">Account identity and operational environment</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                Signed-in Account
              </strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {user?.email || "Guest User (Demo Mode)"}
              </div>
            </div>
            <span className={`status-pill ${isDemoMode ? "paused" : "active"}`}>
              <span className="status-dot-sm" />
              {isDemoMode ? "Demo Mode" : "Authenticated"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                Workspace Tier
              </strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Link Tracker Pro Enterprise License
              </div>
            </div>
            <span className="kpi-badge lime">PRO ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Database & Infrastructure */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <h2 className="panel-title">
              <Database size={18} />
              <span>Database & Architecture</span>
            </h2>
            <span className="panel-desc">Supabase integration and security policies</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                Supabase Connection
              </strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {isConfigured ? `Connected to ${supabaseUrl}` : "No Supabase project bound in .env"}
              </div>
            </div>
            <span className={`status-pill ${isConfigured ? "active" : "paused"}`}>
              <span className="status-dot-sm" />
              {isConfigured ? "Connected" : "Unconfigured"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                Row Level Security (RLS)
              </strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Multi-tenant database isolation enforced via PostgreSQL RLS policies.
              </div>
            </div>
            <span className="kpi-badge lime">RLS Hardened</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                Short URL Pathing
              </strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Incoming <code>/go/:slug</code> requests routed via Netlify serverless redirect function.
              </div>
            </div>
            <span className="status-pill active">
              <span className="status-dot-sm" />
              Active
            </span>
          </div>
        </div>
      </section>

      {/* Maintenance & Data Actions */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <h2 className="panel-title">
              <RefreshCw size={18} />
              <span>Workspace Actions</span>
            </h2>
            <span className="panel-desc">Synchronize cache or reset test environment</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--border-subtle)"
            }}
          >
            <div>
              <strong style={{ fontSize: "13px" }}>Refresh Analytics Telemetry</strong>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Re-query latest link states and click timestamps from database.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={onRefresh}>
              <RefreshCw size={14} />
              <span>Refresh Now</span>
            </button>
          </div>

          {isDemoMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <strong style={{ fontSize: "13px" }}>Reset Demo Sample Data</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Clear locally created links and restore pristine demo dataset.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={onResetDemo}>
                <RotateCcw size={14} />
                <span>Reset Demo State</span>
              </button>
            </div>
          )}

          {!isConfigured && onShowSetup && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <strong style={{ fontSize: "13px" }}>Supabase Setup Guide</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  View required schema SQL and environment variables for production.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={onShowSetup}>
                <Database size={14} />
                <span>View Setup Steps</span>
              </button>
            </div>
          )}

          {onSignOut && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0"
              }}
            >
              <div>
                <strong style={{ fontSize: "13px", color: "var(--danger)" }}>
                  {isDemoMode ? "Exit Demo Workspace" : "Sign Out"}
                </strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Terminate current session and return to login screen.
                </p>
              </div>
              <button className="btn btn-danger" onClick={onSignOut}>
                <LogOut size={14} />
                <span>{isDemoMode ? "Exit Preview" : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
