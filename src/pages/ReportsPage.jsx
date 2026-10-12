import React, { useState } from "react";
import { Download, FileText, CheckCircle2, ShieldCheck, Database, Calendar } from "lucide-react";
import { KpiCard } from "../components/KpiCard";

export function ReportsPage({
  links,
  filteredEvents,
  range,
  onShowToast
}) {
  const [downloading, setDownloading] = useState(false);

  const humanEvents = filteredEvents.filter((e) => !e.is_bot);
  const botEvents = filteredEvents.filter((e) => e.is_bot);

  const linkStats = links.map((link) => {
    const linkEvents = filteredEvents.filter((e) => e.link_id === link.id);
    const humanClicks = linkEvents.filter((e) => !e.is_bot).length;
    return {
      ...link,
      humanClicks,
      totalEvents: linkEvents.length
    };
  }).sort((a, b) => b.humanClicks - a.humanClicks);

  function exportCsv() {
    setDownloading(true);
    try {
      const origin = window.location.origin;
      const headers = [
        "Title",
        "Short Slug",
        "Tracked Short URL",
        "Destination Target URL",
        "Human Clicks",
        "Total Events Logged",
        "Status",
        "Created At"
      ];

      const rows = linkStats.map((l) => [
        l.title,
        l.slug,
        `${origin}/go/${l.slug}`,
        l.destination_url,
        l.humanClicks,
        l.totalEvents,
        l.is_active ? "Active" : "Paused",
        l.created_at
      ]);

      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) =>
          row
            .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
      ].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const linkElem = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      linkElem.setAttribute("href", url);
      linkElem.setAttribute("download", `link-tracker-pro-report-${dateStr}.csv`);
      document.body.appendChild(linkElem);
      linkElem.click();
      document.body.removeChild(linkElem);
      URL.revokeObjectURL(url);

      if (onShowToast) {
        onShowToast("Report exported successfully to CSV.");
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast(err.message || "Could not generate CSV export.", "error");
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="page-content">
      {/* KPI Cards for Report */}
      <section className="kpi-grid">
        <KpiCard
          icon={FileText}
          label="Tracked Assets"
          value={links.length.toLocaleString()}
          sub="Assets included in audit"
          badgeText="Scope"
          badgeType="neutral"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Attributed Human Clicks"
          value={humanEvents.length.toLocaleString()}
          sub={`Over selected ${range} days`}
          badgeText="Verified"
          badgeType="lime"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Bot & Scraper Events"
          value={botEvents.length.toLocaleString()}
          sub="Excluded from attribution metrics"
          badgeText="Cleaned"
          badgeType="neutral"
        />
        <KpiCard
          icon={Calendar}
          label="Audit Window"
          value={`${range} Days`}
          sub="Rolling lookback window"
          badgeText="Current"
          badgeType="lime"
        />
      </section>

      {/* Export Action Panel */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <h2 className="panel-title">Export Attribution Data</h2>
            <span className="panel-desc">
              Download clean CSV reports with short links, target destinations, and click performance.
            </span>
          </div>

          <button
            className="btn btn-lime"
            onClick={exportCsv}
            disabled={downloading}
          >
            <Download size={16} />
            <span>{downloading ? "Generating CSV..." : "Export to CSV"}</span>
          </button>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Tracked Short URL</th>
                <th>Destination Target</th>
                <th>Human Clicks</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {linkStats.map((link) => (
                <tr key={link.id}>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{link.title}</strong>
                  </td>
                  <td>
                    <code style={{ color: "var(--lime)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                      /go/{link.slug}
                    </code>
                  </td>
                  <td>
                    <span
                      style={{
                        color: "var(--text-tertiary)",
                        fontSize: "12px",
                        maxWidth: "260px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block"
                      }}
                      title={link.destination_url}
                    >
                      {link.destination_url}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: "var(--font-mono)" }}>
                      {link.humanClicks.toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <span className={`status-pill ${link.is_active ? "active" : "paused"}`}>
                      <span className="status-dot-sm" />
                      {link.is_active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "16px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            background: "var(--bg-surface)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          🛡️ <strong>Compliance & Export Policy:</strong> Exported reports contain aggregate campaign counts and routing URLs. Individual visitor IP addresses, cookies, or personally identifiable information are never stored or exported.
        </div>
      </section>
    </div>
  );
}
