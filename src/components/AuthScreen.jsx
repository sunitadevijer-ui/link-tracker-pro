import React, { useState } from "react";
import { Zap, ShieldCheck, TrendingUp, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

export function AuthScreen({
  email,
  setEmail,
  password,
  setPassword,
  authMode,
  setAuthMode,
  authBusy,
  authError,
  signIn,
  onExploreDemo
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="brand-icon-box">
            <Zap size={20} />
          </div>
          <div>
            <span style={{ fontSize: "16px", fontWeight: "800" }}>
              LinkTracker <span style={{ color: "var(--lime)" }}>PRO</span>
            </span>
          </div>
        </div>

        <div className="auth-hero-main">
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--lime)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            ATTRIBUTION INTELLIGENCE
          </span>
          <h1 className="auth-hero-title">
            Every click tells <br />
            <span>a story.</span>
          </h1>
          <p className="auth-hero-desc">
            Production-grade short links with deep attribution, instant 302 redirects, and real-time conversion insights.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <TrendingUp size={16} className="auth-feature-icon" />
              <span>Real-time traffic trends & UTM parameter attribution</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheck size={16} className="auth-feature-icon" />
              <span>Privacy-conscious tracking without invasive cookies or raw IP logging</span>
            </div>
            <div className="auth-feature-item">
              <Lock size={16} className="auth-feature-icon" />
              <span>Hardened multi-tenant isolation with Supabase Row-Level Security</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
          © 2026 Link Tracker Pro. Designed for performance & scale.
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div className="brand-icon-box" style={{ width: "28px", height: "28px" }}>
                <Zap size={15} />
              </div>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>LinkTracker Pro</span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {authMode === "signup" ? "Create your workspace" : "Welcome back"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
              {authMode === "signup"
                ? "Enter your email to create an authenticated account."
                : "Sign in with your credentials to access your link analytics."}
            </p>
          </div>

          <div className="auth-toggle-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === "signin" ? "active" : ""}`}
              onClick={() => setAuthMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
              onClick={() => setAuthMode("signup")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {authError && (
              <div className="form-error-alert" role="alert">
                <span>{authError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-email"
                  className="form-input"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  className="btn-icon"
                  style={{
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "28px",
                    height: "28px",
                    background: "transparent",
                    border: "none"
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-lime"
              style={{ width: "100%", padding: "11px", marginTop: "4px" }}
              disabled={authBusy}
            >
              {authBusy ? "Verifying..." : authMode === "signup" ? "Create Account" : "Sign In to Workspace"}
            </button>
          </form>

          {onExploreDemo && (
            <div style={{ textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "18px" }}>
              <button
                type="button"
                onClick={onExploreDemo}
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "color 0.15s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lime)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                <span>Preview dashboard with sample demo data</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
