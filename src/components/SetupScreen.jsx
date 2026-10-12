import React, { useState } from "react";
import { Zap, Database, ExternalLink, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";

export function SetupScreen({ onLaunchDemo }) {
  const [copied, setCopied] = useState(false);

  const envSample = `# Frontend Variables (Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key

# Server-Side Function Variable (Netlify)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`;

  function handleCopy() {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="setup-container">
      <div className="setup-box">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-icon-box" style={{ width: "42px", height: "42px" }}>
              <Zap size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800" }}>
                LinkTracker <span style={{ color: "var(--lime)" }}>PRO</span>
              </h2>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                Production Deployment Setup
              </span>
            </div>
          </div>
          <span className="status-pill paused">
            <span className="status-dot-sm" />
            Supabase Not Connected
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Connect Your Workspace Database
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
            Link Tracker Pro uses Supabase for authentication, Row-Level Security, and high-throughput click analytics. To link your database:
          </p>
        </div>

        <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-primary)", fontSize: "13px" }}>
          <li>
            Create a free database at{" "}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              supabase.com <ExternalLink size={12} />
            </a>
          </li>
          <li>
            Open the <strong>SQL Editor</strong> in Supabase and execute the script inside <code>supabase/schema.sql</code>.
          </li>
          <li>
            Copy your Project URL and Anon Key into your local <code>.env</code> file.
          </li>
          <li>
            Deploy to Netlify and add <code>SUPABASE_SERVICE_ROLE_KEY</code> in Netlify Environment Variables.
          </li>
        </ol>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)" }}>
              SAMPLE .ENV CONFIGURATION
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: "4px 8px", fontSize: "11px" }}
              onClick={handleCopy}
            >
              {copied ? <Check size={12} style={{ color: "var(--lime)" }} /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy Template"}</span>
            </button>
          </div>
          <div className="setup-code-block">{envSample}</div>
        </div>

        <div
          style={{
            background: "rgba(163, 230, 53, 0.08)",
            border: "1px solid var(--lime-border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--lime-bright)" }}>
              Want to preview the dashboard right now?
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Explore the full production UI with sample links, interactive charts, and reports.
            </div>
          </div>
          <button
            className="btn btn-lime"
            onClick={onLaunchDemo}
            style={{ flexShrink: 0 }}
          >
            <span>Explore Demo</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
