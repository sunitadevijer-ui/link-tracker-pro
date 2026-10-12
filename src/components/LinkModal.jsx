import React, { useState, useEffect } from "react";
import { X, Link2, AlertCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export function LinkModal({
  isOpen,
  onClose,
  onSave,
  editingLink,
  busy
}) {
  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showUtm, setShowUtm] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [error, setError] = useState("");

  const slugify = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title || "");
      setDestinationUrl(editingLink.destination_url || "");
      setSlug(editingLink.slug || "");
      setSlugManuallyEdited(true);
      setShowUtm(false);
    } else {
      setTitle("");
      setDestinationUrl("");
      setSlug("");
      setSlugManuallyEdited(false);
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setShowUtm(false);
    }
    setError("");
  }, [editingLink, isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && !busy) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  function handleTitleChange(e) {
    const val = e.target.value;
    setTitle(val);
    if (!slugManuallyEdited && !editingLink) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(e) {
    setSlug(slugify(e.target.value));
    setSlugManuallyEdited(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    let trimmedDest = destinationUrl.trim();
    const cleanSlug = slugify(slug || title);

    if (!trimmedTitle || trimmedTitle.length < 1 || trimmedTitle.length > 120) {
      setError("Title must be between 1 and 120 characters.");
      return;
    }

    if (!cleanSlug || cleanSlug.length < 3 || cleanSlug.length > 60) {
      setError("Short slug must be between 3 and 60 characters.");
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(trimmedDest);
    } catch {
      setError("Please provide a valid destination URL (e.g. https://example.com).");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Only http:// and https:// URLs are supported.");
      return;
    }

    // Attach UTM parameters if provided
    if (utmSource || utmMedium || utmCampaign) {
      if (utmSource) parsedUrl.searchParams.set("utm_source", utmSource.trim());
      if (utmMedium) parsedUrl.searchParams.set("utm_medium", utmMedium.trim());
      if (utmCampaign) parsedUrl.searchParams.set("utm_campaign", utmCampaign.trim());
      trimmedDest = parsedUrl.toString();
    }

    onSave({
      id: editingLink?.id,
      title: trimmedTitle,
      destination_url: trimmedDest,
      slug: cleanSlug,
    }, setError);
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-heading"
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="modal-heading" className="modal-title">
              {editingLink ? "Edit Tracked Link" : "Create New Link"}
            </h2>
            <span className="modal-subtitle">
              {editingLink
                ? "Update destination target or custom alias."
                : "Generate a branded short link with attribution tracking."}
            </span>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error-alert" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="link-title-input">
                <span>Link Title</span>
                <span className="form-hint">{title.length}/120</span>
              </label>
              <input
                id="link-title-input"
                className="form-input"
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Product Launch Newsletter #12"
                value={title}
                onChange={handleTitleChange}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="link-dest-input">
                Destination URL
              </label>
              <input
                id="link-dest-input"
                className="form-input"
                type="url"
                required
                placeholder="https://example.com/pricing"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
              <span className="form-hint">
                The target website visitors will be safely 302-redirected to.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="link-slug-input">
                Custom Short Slug
              </label>
              <div className="slug-input-addon">
                <span className="slug-prefix">/go/</span>
                <input
                  id="link-slug-input"
                  className="form-input"
                  type="text"
                  required
                  minLength={3}
                  maxLength={60}
                  pattern="[a-zA-Z0-9_-]{3,60}"
                  placeholder="launch-deal"
                  value={slug}
                  onChange={handleSlugChange}
                />
              </div>
              <span className="form-hint">
                Letters, numbers, hyphens, and underscores only (3-60 chars).
              </span>
            </div>

            {/* Optional UTM Builder */}
            <div style={{ marginTop: "4px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "space-between", padding: "8px 12px" }}
                onClick={() => setShowUtm(!showUtm)}
              >
                <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={14} style={{ color: "var(--lime)" }} />
                  UTM Campaign Tags (Optional)
                </span>
                {showUtm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showUtm && (
                <div
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">UTM Source</label>
                    <input
                      className="form-input"
                      placeholder="e.g. twitter, newsletter, youtube"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">UTM Medium</label>
                    <input
                      className="form-input"
                      placeholder="e.g. social, email, cpc"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">UTM Campaign</label>
                    <input
                      className="form-input"
                      placeholder="e.g. summer-sale-2026"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-lime"
              disabled={busy}
            >
              {busy ? "Saving..." : editingLink ? "Save Changes" : "Create Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
