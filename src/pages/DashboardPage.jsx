import React from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  Link2, MousePointerClick, TrendingUp, Activity, ExternalLink,
  Copy, Check, Edit3, Play, Pause, Trash2, Smartphone, Laptop, Tablet, ArrowUpRight
} from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { EmptyState } from "../components/EmptyState";

export function DashboardPage({
  links,
  totalClicks,
  filteredEvents,
  range,
  chartData,
  sourceData,
  deviceData,
  loading,
  copiedSlug,
  onCopyLink,
  onOpenCreate,
  onOpenEdit,
  onToggleLink,
  onDeleteLink,
  onNavigateToLinks
}) {
  const activeLinksCount = links.filter((l) => l.is_active).length;
  const botEventsCount = filteredEvents.filter((e) => e.is_bot).length;
  const avgClicks = links.length ? Math.round(totalClicks / links.length) : 0;
  const activeRate = links.length ? Math.round((activeLinksCount / links.length) * 100) : 0;

  // Recent 5 links sorted by clicks
  const topLinks = [...links]
    .map((l) => {
      const linkClicks = filteredEvents.filter((e) => e.link_id === l.id && !e.is_bot).length;
      return { ...l, clicks: linkClicks };
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  return (
    <div className="page-content">
      {/* KPI Metric Cards */}
      <section className="kpi-grid">
        <KpiCard
          icon={Link2}
          label="Total Tracked Links"
          value={links.length.toLocaleString()}
          sub={`${activeLinksCount} active · ${links.length - activeLinksCount} paused`}
          badgeText="Active"
          badgeType="lime"
        />
        <KpiCard
          icon={MousePointerClick}
          label="Tracked Clicks"
          value={totalClicks.toLocaleString()}
          sub={`Filtered out ${botEventsCount} bot & preview hits`}
          badgeText={`Last ${range}d`}
          badgeType="neutral"
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg. Clicks / Link"
          value={avgClicks.toLocaleString()}
          sub="Attribution velocity per asset"
          badgeText="Average"
          badgeType="neutral"
        />
        <KpiCard
          icon={Activity}
          label="Active Link Health"
          value={`${activeRate}%`}
          sub="All active routing rules healthy"
          badgeText="100% SLA"
          badgeType="lime"
        />
      </section>

      {/* Main Charts & Traffic Sources */}
      <section className="grid-2col">
        {/* Click Performance Chart */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">
                <span>Click Performance</span>
                <span className="kpi-badge lime" style={{ fontSize: "10px", padding: "2px 7px" }}>
                  Live Data
                </span>
              </h2>
              <span className="panel-desc">
                Non-bot click traffic distribution over the last {range} days
              </span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state-box" style={{ height: "280px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Loading analytics telemetry...</span>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonLimeArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e252e" vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "#22272e" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "#22272e" }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="custom-chart-tooltip">
                            <div className="tooltip-date">{data.day}</div>
                            <div className="tooltip-value">
                              <MousePointerClick size={14} />
                              <span>{data.clicks.toLocaleString()} clicks</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#a3e635"
                    strokeWidth={2.5}
                    fill="url(#neonLimeArea)"
                    activeDot={{ r: 5, fill: "#a3e635", stroke: "#08090b", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Traffic Sources */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">Top Traffic Channels</h2>
              <span className="panel-desc">Referrer host & UTM attribution</span>
            </div>
          </div>

          {sourceData && sourceData.length > 0 ? (
            <div className="source-list">
              {sourceData.slice(0, 5).map((source, index) => {
                const maxClicks = sourceData[0]?.clicks || 1;
                const pct = Math.round((source.clicks / (totalClicks || 1)) * 100);
                const barWidth = Math.max(6, Math.round((source.clicks / maxClicks) * 100));

                return (
                  <div key={source.name} className="source-item">
                    <div className="source-meta">
                      <span className="source-name" title={source.name}>
                        <span className="source-rank-pill">{index + 1}</span>
                        <span>{source.name}</span>
                      </span>
                      <div className="source-stats">
                        <span className="source-clicks">{source.clicks.toLocaleString()}</span>
                        <span className="source-pct">({pct}%)</span>
                      </div>
                    </div>
                    <div className="source-bar-track">
                      <div className="source-bar-fill" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-box" style={{ padding: "30px 10px" }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                No clicks recorded yet. Share a link to inspect traffic sources.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Top Performing Links Table & Device Distribution */}
      <section className="grid-2col">
        {/* Top Performing Links */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">Top Performing Assets</h2>
              <span className="panel-desc">Highest click volume in selected date window</span>
            </div>
            {links.length > 5 && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={onNavigateToLinks}
              >
                <span>View All Links</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>

          {topLinks.length > 0 ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset & Destination</th>
                    <th>Tracking Slug</th>
                    <th>Clicks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link) => {
                    const isCopied = copiedSlug === link.slug;
                    return (
                      <tr key={link.id}>
                        <td>
                          <div className="link-meta-cell">
                            <span className="link-title-text">{link.title}</span>
                            <a
                              className="link-dest-url"
                              href={link.destination_url}
                              target="_blank"
                              rel="noreferrer"
                              title={link.destination_url}
                            >
                              <span>{link.destination_url}</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </td>
                        <td>
                          <button
                            className={`slug-copy-btn ${isCopied ? "copied" : ""}`}
                            onClick={() => onCopyLink(link)}
                            title="Copy tracked short URL"
                          >
                            <span>/go/{link.slug}</span>
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </td>
                        <td>
                          <strong style={{ fontFamily: "var(--font-mono)" }}>
                            {link.clicks.toLocaleString()}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-pill ${link.is_active ? "active" : "paused"}`}>
                            <span className="status-dot-sm" />
                            {link.is_active ? "Active" : "Paused"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-icon"
                              onClick={() => onOpenEdit(link)}
                              title="Edit link details"
                              aria-label="Edit link"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => onToggleLink(link)}
                              title={link.is_active ? "Pause link" : "Activate link"}
                              aria-label="Toggle link status"
                            >
                              {link.is_active ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button
                              className="btn-icon danger-hover"
                              onClick={() => onDeleteLink(link)}
                              title="Delete link"
                              aria-label="Delete link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Link2}
              title="No tracked links created yet"
              description="Create your first tracked short link to start measuring traffic attribution."
              actionText="+ Create Link"
              onAction={onOpenCreate}
            />
          )}
        </div>

        {/* Device Breakdown */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">Device Breakdown</h2>
              <span className="panel-desc">Client user-agent distribution</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="device-stat-grid">
              {["Mobile", "Desktop", "Tablet"].map((dev) => {
                const count =
                  deviceData.find((d) => d.name.toLowerCase() === dev.toLowerCase())?.value || 0;
                const Icon = dev === "Mobile" ? Smartphone : dev === "Desktop" ? Laptop : Tablet;
                const pct = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
                return (
                  <div key={dev} className="device-stat-item">
                    <div className="device-stat-top">
                      <span>{dev}</span>
                      <Icon size={14} />
                    </div>
                    <div className="device-stat-val">{count}</div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      {pct}% share
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                background: "var(--bg-surface)",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                lineHeight: "1.5"
              }}
            >
              🔒 <strong>Privacy Assurance:</strong> Click logging is stateless and never captures raw IP addresses or persistent identifiers.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
