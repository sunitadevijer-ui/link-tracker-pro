import React, { useState, useMemo } from "react";
import {
  Link2, Search, X, Plus, ExternalLink, Copy, Check, Edit3,
  Play, Pause, Trash2, Filter, ArrowUpDown, Calendar
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export function LinksPage({
  links,
  filteredEvents,
  copiedSlug,
  onCopyLink,
  onOpenCreate,
  onOpenEdit,
  onToggleLink,
  onDeleteLink
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, paused
  const [sortBy, setSortBy] = useState("clicks-desc"); // clicks-desc, clicks-asc, newest, oldest, title

  const linksWithMetrics = useMemo(() => {
    return links.map((link) => {
      const linkEvents = filteredEvents.filter((e) => e.link_id === link.id);
      const humanClicks = linkEvents.filter((e) => !e.is_bot).length;
      const botClicks = linkEvents.filter((e) => e.is_bot).length;
      return {
        ...link,
        humanClicks,
        botClicks,
        totalEvents: linkEvents.length
      };
    });
  }, [links, filteredEvents]);

  const filteredLinks = useMemo(() => {
    let result = [...linksWithMetrics];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((l) => l.is_active);
    } else if (statusFilter === "paused") {
      result = result.filter((l) => !l.is_active);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.slug.toLowerCase().includes(q) ||
          l.destination_url.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "clicks-desc") return b.humanClicks - a.humanClicks;
      if (sortBy === "clicks-asc") return a.humanClicks - b.humanClicks;
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [linksWithMetrics, statusFilter, search, sortBy]);

  const activeCount = links.filter((l) => l.is_active).length;
  const pausedCount = links.length - activeCount;

  return (
    <div className="page-content">
      <div className="panel" style={{ paddingBottom: "16px" }}>
        <div className="panel-header">
          <div className="panel-title-wrap">
            <h2 className="panel-title">
              <span>Tracked Links</span>
              <span className="kpi-badge lime">{links.length} Total</span>
            </h2>
            <span className="panel-desc">
              Manage short URL redirects, UTM tags, and review individual click volumes.
            </span>
          </div>

          <button className="btn btn-lime" onClick={onOpenCreate}>
            <Plus size={16} />
            <span>Create Link</span>
          </button>
        </div>

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, slug, or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search links"
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div className="filter-pills" role="tablist" aria-label="Status filters">
              <button
                className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
                role="tab"
                aria-selected={statusFilter === "all"}
              >
                All ({links.length})
              </button>
              <button
                className={`filter-pill ${statusFilter === "active" ? "active" : ""}`}
                onClick={() => setStatusFilter("active")}
                role="tab"
                aria-selected={statusFilter === "active"}
              >
                Active ({activeCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "paused" ? "active" : ""}`}
                onClick={() => setStatusFilter("paused")}
                role="tab"
                aria-selected={statusFilter === "paused"}
              >
                Paused ({pausedCount})
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowUpDown size={14} style={{ color: "var(--text-tertiary)" }} />
              <select
                className="select-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                aria-label="Sort links by"
              >
                <option value="clicks-desc">Most Clicks</option>
                <option value="clicks-asc">Fewest Clicks</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Links Data Table */}
        {filteredLinks.length > 0 ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title & Destination Target</th>
                  <th>Tracked Slug</th>
                  <th>Human Clicks</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => {
                  const isCopied = copiedSlug === link.slug;
                  const dateStr = new Date(link.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

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
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`slug-copy-btn ${isCopied ? "copied" : ""}`}
                          onClick={() => onCopyLink(link)}
                          title="Click to copy full tracked URL"
                        >
                          <span>/go/{link.slug}</span>
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}>
                            {link.humanClicks.toLocaleString()}
                          </strong>
                          {link.botClicks > 0 && (
                            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                              +{link.botClicks} bot/previews
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${link.is_active ? "active" : "paused"}`}>
                          <span className="status-dot-sm" />
                          {link.is_active ? "Active" : "Paused"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                          {dateStr}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon"
                            onClick={() => onOpenEdit(link)}
                            title="Edit destination or title"
                            aria-label="Edit link"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => onToggleLink(link)}
                            title={link.is_active ? "Pause link redirect" : "Resume link redirect"}
                            aria-label="Toggle link active state"
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
        ) : search ? (
          <EmptyState
            icon={Search}
            title={`No results matching "${search}"`}
            description="Try modifying your keyword, check for typos, or clear your search query."
            actionText="Clear Search"
            onAction={() => setSearch("")}
          />
        ) : statusFilter !== "all" ? (
          <EmptyState
            icon={Filter}
            title={`No ${statusFilter} links`}
            description={`You currently do not have any links with status "${statusFilter}".`}
            actionText="Show All Links"
            onAction={() => setStatusFilter("all")}
          />
        ) : (
          <EmptyState
            icon={Link2}
            title="No tracked links yet"
            description="Create your first link to shorten URLs and capture real-time click attribution."
            actionText="+ Create Link"
            onAction={onOpenCreate}
          />
        )}
      </div>
    </div>
  );
}
