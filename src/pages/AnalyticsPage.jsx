import React, { useState, useMemo } from "react";
import {
  Area, AreaChart, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  BarChart3, MousePointerClick, ShieldCheck, Smartphone, Laptop, Tablet,
  Bot, Globe, Filter, Sparkles, Layers, Info
} from "lucide-react";
import { KpiCard } from "../components/KpiCard";

export function AnalyticsPage({
  filteredEvents,
  range,
  chartData,
  sourceData,
  deviceData,
  totalClicks
}) {
  const [includeBots, setIncludeBots] = useState(false);

  const humanEvents = useMemo(() => filteredEvents.filter((e) => !e.is_bot), [filteredEvents]);
  const botEvents = useMemo(() => filteredEvents.filter((e) => e.is_bot), [filteredEvents]);

  // Dynamic chart data depending on bot toggle
  const displayChartData = useMemo(() => {
    const days = Number(range);
    const list = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const dayEvents = filteredEvents.filter((e) => e.clicked_at.slice(0, 10) === key);
      const count = includeBots ? dayEvents.length : dayEvents.filter((e) => !e.is_bot).length;
      list.push({ key, day: label, clicks: count });
    }
    return list;
  }, [filteredEvents, range, includeBots]);

  // Browser breakdown
  const browserData = useMemo(() => {
    const counts = {};
    humanEvents.forEach((e) => {
      const family = e.user_agent_family || "Other";
      counts[family] = (counts[family] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [humanEvents]);

  // UTM Campaigns breakdown
  const utmCampaigns = useMemo(() => {
    const counts = {};
    humanEvents.forEach((e) => {
      if (e.utm_campaign) {
        counts[e.utm_campaign] = (counts[e.utm_campaign] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [humanEvents]);

  const topChannel = sourceData[0]?.name || "None";
  const botShare = filteredEvents.length
    ? Math.round((botEvents.length / filteredEvents.length) * 100)
    : 0;

  return (
    <div className="page-content">
      {/* Top Analytics Metrics */}
      <section className="kpi-grid">
        <KpiCard
          icon={MousePointerClick}
          label="Human Verified Clicks"
          value={humanEvents.length.toLocaleString()}
          sub={`${100 - botShare}% of all recorded events`}
          badgeText="Verified"
          badgeType="lime"
        />
        <KpiCard
          icon={Bot}
          label="Filtered Bot Hits"
          value={botEvents.length.toLocaleString()}
          sub="Search crawlers, slackbots & link previews"
          badgeText={`${botShare}% filtered`}
          badgeType="neutral"
        />
        <KpiCard
          icon={Globe}
          label="Primary Traffic Source"
          value={topChannel}
          sub={`${sourceData[0]?.clicks || 0} visits via this channel`}
          badgeText="Top 1"
          badgeType="lime"
        />
        <KpiCard
          icon={Layers}
          label="Total Logged Hits"
          value={filteredEvents.length.toLocaleString()}
          sub={`Over last ${range} days period`}
          badgeText="Gross Traffic"
          badgeType="neutral"
        />
      </section>

      {/* Main Trend Chart with Bot Filter Switch */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <h2 className="panel-title">Attribution & Velocity Timeline</h2>
            <span className="panel-desc">
              Daily click aggregation for the past {range} days
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Include bot previews:
            </span>
            <button
              className={`btn btn-secondary ${includeBots ? "active" : ""}`}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                borderColor: includeBots ? "var(--lime-border)" : "var(--border-card)",
                color: includeBots ? "var(--lime-bright)" : "var(--text-secondary)"
              }}
              onClick={() => setIncludeBots(!includeBots)}
              aria-pressed={includeBots}
            >
              {includeBots ? "Bots Included (Gross)" : "Human Only (Filtered)"}
            </button>
          </div>
        </div>

        <div className="chart-container tall">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayChartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsLimeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3e635" stopOpacity={0.3} />
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
                          <span>{data.clicks.toLocaleString()} events</span>
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
                fill="url(#analyticsLimeArea)"
                activeDot={{ r: 5, fill: "#a3e635", stroke: "#08090b", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Traffic Sources Bar Chart & Device Mix */}
      <section className="grid-2col">
        {/* Horizontal Bar Chart for Sources */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">Channel Distribution</h2>
              <span className="panel-desc">Top referrer domains and UTM source tags</span>
            </div>
          </div>

          {sourceData.length > 0 ? (
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceData.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid stroke="#1e252e" horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: "#cbd5e1", fontSize: 11 }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-sidebar)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "8px",
                      color: "#f8fafc"
                    }}
                  />
                  <Bar dataKey="clicks" fill="#a3e635" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state-box" style={{ padding: "30px 10px" }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                No channel events recorded yet.
              </span>
            </div>
          )}
        </div>

        {/* Devices & Browsers */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">Client Platforms & Browsers</h2>
              <span className="panel-desc">Hardware form factors and browsers</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="device-stat-grid">
              {["Mobile", "Desktop", "Tablet"].map((dev) => {
                const count =
                  deviceData.find((d) => d.name.toLowerCase() === dev.toLowerCase())?.value || 0;
                const Icon = dev === "Mobile" ? Smartphone : dev === "Desktop" ? Laptop : Tablet;
                return (
                  <div key={dev} className="device-stat-item">
                    <div className="device-stat-top">
                      <span>{dev}</span>
                      <Icon size={14} />
                    </div>
                    <div className="device-stat-val">{count}</div>
                  </div>
                );
              })}
            </div>

            {/* Browser Distribution List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)" }}>
                BROWSER ENGINE DISTRIBUTION
              </span>
              {browserData.map((b) => (
                <div
                  key={b.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border-subtle)"
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{b.name}</span>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>
                    {b.value.toLocaleString()} clicks
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* UTM Campaign Breakdown if present */}
      {utmCampaigns.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h2 className="panel-title">Tracked UTM Campaigns</h2>
              <span className="panel-desc">Active campaign initiatives attributed via query parameters</span>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Recorded Clicks</th>
                  <th>Share of UTM Traffic</th>
                </tr>
              </thead>
              <tbody>
                {utmCampaigns.map((c) => {
                  const totalUtm = utmCampaigns.reduce((sum, item) => sum + item.clicks, 0);
                  const share = totalUtm > 0 ? Math.round((c.clicks / totalUtm) * 100) : 0;
                  return (
                    <tr key={c.name}>
                      <td>
                        <strong style={{ color: "var(--lime-bright)", fontFamily: "var(--font-mono)" }}>
                          {c.name}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)" }}>{c.clicks.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className="kpi-badge neutral">{share}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
