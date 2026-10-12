import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Zap } from "lucide-react";
import { supabase, isConfigured } from "./supabase";
import { getInitialDemoState, saveDemoState, resetDemoState } from "./demoData";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { LinkModal } from "./components/LinkModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { Toast } from "./components/Toast";
import { AuthScreen } from "./components/AuthScreen";
import { SetupScreen } from "./components/SetupScreen";
import { DashboardPage } from "./pages/DashboardPage";
import { LinksPage } from "./pages/LinksPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./styles.css";

const dateLabel = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function App() {
  const pathname = window.location.pathname;
  if (pathname.startsWith("/go/")) {
    const slug = pathname.replace(/^\/go\//, "").split("/")[0].split("?")[0];
    return <ClientRedirectScreen slug={slug} />;
  }

  const [session, setSession] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(!isConfigured);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [links, setLinks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [range, setRange] = useState("7");

  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [modalBusy, setModalBusy] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Copy feedback and toast
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize Supabase Auth session if configured
  useEffect(() => {
    if (!isConfigured || !supabase) {
      loadDemoData();
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      if (!data?.session) {
        setIsDemoMode(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        setIsDemoMode(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load data whenever session or mode changes
  useEffect(() => {
    if (session && !isDemoMode) {
      loadLiveData();
    } else if (isDemoMode) {
      loadDemoData();
    } else {
      setLinks([]);
      setEvents([]);
    }
  }, [session, isDemoMode]);

  // Auto-refresh metrics when user switches back to this tab after clicking/testing links
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        if (session && !isDemoMode) {
          loadLiveData();
        }
      }
    }
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [session, isDemoMode]);

  function loadDemoData() {
    const data = getInitialDemoState();
    setLinks(data.links);
    setEvents(data.events);
  }

  async function loadLiveData() {
    if (!supabase || !session) return;
    setLoading(true);
    try {
      const { data: linkRows, error: linkError } = await supabase
        .from("tracked_links")
        .select("id,user_id,title,slug,destination_url,is_active,created_at,updated_at")
        .order("created_at", { ascending: false });

      if (linkError) throw linkError;
      setLinks(linkRows || []);

      const ids = (linkRows || []).map((l) => l.id);
      if (ids.length) {
        const start = new Date();
        start.setDate(start.getDate() - 90);
        const { data: eventRows, error: eventError } = await supabase
          .from("click_events")
          .select("id,link_id,clicked_at,referrer_host,utm_source,utm_medium,utm_campaign,country_code,device_type,user_agent_family,is_bot")
          .in("link_id", ids)
          .gte("clicked_at", start.toISOString())
          .order("clicked_at", { ascending: false })
          .limit(10000);

        if (eventError) throw eventError;
        setEvents(eventRows || []);
      } else {
        setEvents([]);
      }
    } catch (err) {
      showToast(err.message || "Could not load analytics from Supabase.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }

  // Supabase Auth Handler
  async function handleSignIn(e) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const method = authMode === "signup" ? "signUp" : "signInWithPassword";
      const { data, error } = await supabase.auth[method]({ email, password });
      if (error) throw error;
      if (authMode === "signup" && !data.session) {
        setAuthError("Account created! Check your email to confirm, then sign in.");
      } else {
        setIsDemoMode(false);
        showToast("Authenticated successfully.");
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (isDemoMode) {
      if (isConfigured) {
        setIsDemoMode(false);
      } else {
        showToast("Exited demo workspace.");
      }
      return;
    }
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
      showToast("Signed out.");
    }
  }

  // Link Modal Operations
  function openCreateLink() {
    setEditingLink(null);
    setLinkModalOpen(true);
  }

  function openEditLink(link) {
    setEditingLink(link);
    setLinkModalOpen(true);
  }

  async function handleSaveLink(linkData, setErrorCallback) {
    setModalBusy(true);

    if (isDemoMode) {
      // Handle in demo state
      try {
        if (editingLink) {
          const updatedLinks = links.map((l) =>
            l.id === editingLink.id
              ? { ...l, ...linkData, updated_at: new Date().toISOString() }
              : l
          );
          setLinks(updatedLinks);
          saveDemoState(updatedLinks, events);
          showToast("Link updated successfully.");
        } else {
          // Check slug uniqueness
          if (links.some((l) => l.slug === linkData.slug)) {
            setErrorCallback("This slug is already used by another link.");
            setModalBusy(false);
            return;
          }
          const newLink = {
            id: `demo-link-${Date.now()}`,
            title: linkData.title,
            slug: linkData.slug,
            destination_url: linkData.destination_url,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updatedLinks = [newLink, ...links];
          setLinks(updatedLinks);
          saveDemoState(updatedLinks, events);
          showToast("Tracked link created.");
        }
        setLinkModalOpen(false);
      } catch (err) {
        setErrorCallback(err.message || "Failed to save link.");
      } finally {
        setModalBusy(false);
      }
      return;
    }

    // Real Supabase persistence
    try {
      const payload = {
        title: linkData.title,
        destination_url: linkData.destination_url,
        slug: linkData.slug,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingLink) {
        result = await supabase
          .from("tracked_links")
          .update(payload)
          .eq("id", editingLink.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("tracked_links")
          .insert({ ...payload, user_id: session.user.id })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setLinkModalOpen(false);
      await loadLiveData();
      showToast(editingLink ? "Link updated." : "Tracked link created.");
    } catch (err) {
      setErrorCallback(err.message || "Could not save link to Supabase.");
    } finally {
      setModalBusy(false);
    }
  }

  // Link Status Toggle
  async function handleToggleLink(link) {
    const nextState = !link.is_active;

    if (isDemoMode) {
      const updated = links.map((l) =>
        l.id === link.id ? { ...l, is_active: nextState } : l
      );
      setLinks(updated);
      saveDemoState(updated, events);
      showToast(nextState ? "Link activated." : "Link paused.");
      return;
    }

    try {
      const { error } = await supabase
        .from("tracked_links")
        .update({ is_active: nextState, updated_at: new Date().toISOString() })
        .eq("id", link.id);

      if (error) throw error;
      await loadLiveData();
      showToast(nextState ? "Link activated." : "Link paused.");
    } catch (err) {
      showToast(err.message || "Failed to update status.", "error");
    }
  }

  // Link Deletion Dialog
  function promptDeleteLink(link) {
    setLinkToDelete(link);
    setConfirmModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!linkToDelete) return;
    setDeleteBusy(true);

    if (isDemoMode) {
      const updatedLinks = links.filter((l) => l.id !== linkToDelete.id);
      const updatedEvents = events.filter((e) => e.link_id !== linkToDelete.id);
      setLinks(updatedLinks);
      setEvents(updatedEvents);
      saveDemoState(updatedLinks, updatedEvents);
      setConfirmModalOpen(false);
      setLinkToDelete(null);
      setDeleteBusy(false);
      showToast("Link and its analytics removed.");
      return;
    }

    try {
      const { error } = await supabase
        .from("tracked_links")
        .delete()
        .eq("id", linkToDelete.id);

      if (error) throw error;

      setConfirmModalOpen(false);
      setLinkToDelete(null);
      await loadLiveData();
      showToast("Link deleted successfully.");
    } catch (err) {
      showToast(err.message || "Failed to delete link.", "error");
    } finally {
      setDeleteBusy(false);
    }
  }

  // Copy Short Link Helper
  async function handleCopyLink(link) {
    const base = window.location.origin;
    const shortUrl = `${base}/go/${encodeURIComponent(link.slug)}`;
    setCopiedSlug(link.slug);
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToast(`Copied ${shortUrl} to clipboard!`);
    } catch {
      window.prompt("Copy tracked URL:", shortUrl);
    }
    setTimeout(() => setCopiedSlug(null), 2500);
  }

  // Analytics Computations
  const activeIds = useMemo(() => new Set(links.map((l) => l.id)), [links]);
  const validEvents = useMemo(
    () => events.filter((e) => activeIds.has(e.link_id)),
    [events, activeIds]
  );

  const filteredEvents = useMemo(() => {
    const days = Number(range);
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    from.setHours(0, 0, 0, 0);
    return validEvents.filter((e) => new Date(e.clicked_at) >= from);
  }, [validEvents, range]);

  const nonBotEvents = useMemo(
    () => filteredEvents.filter((e) => !e.is_bot),
    [filteredEvents]
  );

  const totalClicks = nonBotEvents.length;

  const chartData = useMemo(() => {
    const days = Number(range);
    const list = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      list.push({
        key,
        day: dateLabel(key),
        clicks: nonBotEvents.filter((e) => e.clicked_at.slice(0, 10) === key).length,
      });
    }
    return list;
  }, [nonBotEvents, range]);

  const sourceData = useMemo(() => {
    const counts = {};
    nonBotEvents.forEach((e) => {
      const source =
        e.utm_source ||
        (e.referrer_host ? e.referrer_host.replace(/^www\./, "") : "Direct / Unknown");
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 6);
  }, [nonBotEvents]);

  const deviceData = useMemo(() => {
    const counts = {};
    nonBotEvents.forEach((e) => {
      const d = e.device_type || "unknown";
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name[0].toUpperCase() + name.slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [nonBotEvents]);

  // Demo reset
  function handleResetDemo() {
    const fresh = resetDemoState();
    setLinks(fresh.links);
    setEvents(fresh.events);
    showToast("Demo data restored to initial baseline.");
  }

  // Setup Screen Display condition
  if (!isConfigured && !isDemoMode && showSetupModal) {
    return (
      <SetupScreen
        onLaunchDemo={() => {
          setIsDemoMode(true);
          setShowSetupModal(false);
          loadDemoData();
        }}
      />
    );
  }

  // Auth Screen condition (if Supabase is configured and not signed in and not demo)
  if (isConfigured && !session && !isDemoMode) {
    return (
      <AuthScreen
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authBusy={authBusy}
        authError={authError}
        signIn={handleSignIn}
        onExploreDemo={() => {
          setIsDemoMode(true);
          loadDemoData();
        }}
      />
    );
  }

  // Primary Dashboard Shell
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        linksCount={links.length}
        isDemoMode={isDemoMode}
        isConfigured={isConfigured}
        userEmail={session?.user?.email || (isDemoMode ? "demo@workspace.local" : null)}
        onRefresh={isDemoMode ? loadDemoData : loadLiveData}
        loading={loading}
        onSignOut={handleSignOut}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-wrapper">
        {/* Prominent Demo Mode Notification Banner */}
        {isDemoMode && (
          <aside className="demo-banner" aria-label="Demo Mode Notice">
            <div className="demo-banner-content">
              <span className="demo-banner-tag">Sample Data Mode</span>
              <span>
                Displaying interactive demo metrics. Link creations & tests are saved locally. Connect Supabase & Netlify for production tracking.
              </span>
            </div>
            {!isConfigured && (
              <button
                className="banner-action-btn"
                onClick={() => setShowSetupModal(true)}
              >
                Configure Supabase
              </button>
            )}
            {isConfigured && (
              <button
                className="banner-action-btn"
                onClick={() => setIsDemoMode(false)}
              >
                Sign In to Live Account
              </button>
            )}
          </aside>
        )}

        <Header
          page={page}
          range={range}
          setRange={setRange}
          onCreateLink={openCreateLink}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isDemoMode={isDemoMode}
        />

        <main id="main-content">
          {page === "Dashboard" && (
            <DashboardPage
              links={links}
              totalClicks={totalClicks}
              filteredEvents={filteredEvents}
              range={range}
              chartData={chartData}
              sourceData={sourceData}
              deviceData={deviceData}
              loading={loading}
              copiedSlug={copiedSlug}
              onCopyLink={handleCopyLink}
              onOpenCreate={openCreateLink}
              onOpenEdit={openEditLink}
              onToggleLink={handleToggleLink}
              onDeleteLink={promptDeleteLink}
              onNavigateToLinks={() => setPage("Links")}
            />
          )}

          {page === "Links" && (
            <LinksPage
              links={links}
              filteredEvents={filteredEvents}
              copiedSlug={copiedSlug}
              onCopyLink={handleCopyLink}
              onOpenCreate={openCreateLink}
              onOpenEdit={openEditLink}
              onToggleLink={handleToggleLink}
              onDeleteLink={promptDeleteLink}
            />
          )}

          {page === "Analytics" && (
            <AnalyticsPage
              filteredEvents={filteredEvents}
              range={range}
              chartData={chartData}
              sourceData={sourceData}
              deviceData={deviceData}
              totalClicks={totalClicks}
            />
          )}

          {page === "Reports" && (
            <ReportsPage
              links={links}
              filteredEvents={filteredEvents}
              range={range}
              onShowToast={showToast}
            />
          )}

          {page === "Settings" && (
            <SettingsPage
              user={session?.user || { email: "demo@workspace.local" }}
              isDemoMode={isDemoMode}
              isConfigured={isConfigured}
              onRefresh={isDemoMode ? loadDemoData : loadLiveData}
              onResetDemo={handleResetDemo}
              onSignOut={handleSignOut}
              onShowSetup={() => setShowSetupModal(true)}
            />
          )}
        </main>

        <footer className="app-footer">
          <div>
            Link Tracker Pro <span style={{ color: "var(--lime)" }}>•</span> Production SaaS Dashboard
          </div>
          <div>
            {isDemoMode ? "Interactive Demo Dataset" : "Connected to Supabase PostgreSQL"}
          </div>
        </footer>
      </div>

      {/* Link Creation & Edit Modal */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleSaveLink}
        editingLink={editingLink}
        busy={modalBusy}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Tracked Link?"
        message={`Are you sure you want to delete "${linkToDelete?.title || ""}"? This will permanently remove the short link /go/${linkToDelete?.slug || ""} and all associated click attribution records.`}
        confirmText="Delete Link"
        busy={deleteBusy}
      />

      {/* Global Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function ClientRedirectScreen({ slug }) {
  const [error, setError] = useState("");

  useEffect(() => {
    async function resolveRedirect() {
      if (!slug) {
        setError("Invalid link slug.");
        return;
      }

      if (supabase) {
        try {
          const { data, error: queryError } = await supabase
            .from("tracked_links")
            .select("id, destination_url, is_active")
            .eq("slug", slug)
            .maybeSingle();

          if (queryError || !data || !data.is_active) {
            setError("This tracked link is paused or does not exist.");
            return;
          }

          // Forward to destination URL
          window.location.replace(data.destination_url);
        } catch (err) {
          setError(err.message || "Failed to resolve link.");
        }
      } else {
        const state = getInitialDemoState();
        const found = state.links.find((l) => l.slug === slug);
        if (found && found.is_active) {
          window.location.replace(found.destination_url);
        } else {
          setError("This demo link is paused or does not exist.");
        }
      }
    }
    resolveRedirect();
  }, [slug]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          padding: "36px 32px",
          maxWidth: "420px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div className="brand-icon-box" style={{ width: "48px", height: "48px" }}>
          <Zap size={24} />
        </div>
        {error ? (
          <>
            <h2 style={{ fontSize: "18px", color: "var(--danger)", fontWeight: "700" }}>
              Link Unavailable
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{error}</p>
            <a href="/" className="btn btn-secondary" style={{ marginTop: "8px" }}>
              Go to Dashboard
            </a>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Redirecting...</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Please wait while we forward you to your destination.
            </p>
            <div
              className="status-dot-sm"
              style={{
                width: "10px",
                height: "10px",
                background: "var(--lime)",
                boxShadow: "0 0 10px var(--lime)",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
