import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createClient } from "@supabase/supabase-js";

function devRedirectPlugin(env) {
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    url && serviceKey
      ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;

  function classifyDevice(ua = "") {
    if (/bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|discordbot/i.test(ua)) return "bot";
    if (/ipad|tablet/i.test(ua)) return "tablet";
    if (/mobi|iphone|android/i.test(ua)) return "mobile";
    if (ua) return "desktop";
    return "unknown";
  }

  function cleanParam(value) {
    if (!value) return null;
    return String(value).slice(0, 200).replace(/[\u0000-\u001F\u007F]/g, "");
  }

  return {
    name: "dev-link-redirect",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, "http://localhost");
        const match = parsedUrl.pathname.match(/^\/go\/([a-zA-Z0-9_-]+)/);
        if (!match) return next();

        const slug = match[1];
        if (!supabase) {
          console.warn(`[dev-redirect] Supabase credentials not found in env for /go/${slug}`);
          return next();
        }

        try {
          const { data: link, error } = await supabase
            .from("tracked_links")
            .select("id, destination_url, is_active")
            .eq("slug", slug)
            .maybeSingle();

          if (error) {
            console.error(`[dev-redirect] Database error for slug ${slug}:`, error.message);
            return next();
          }

          if (!link || !link.is_active) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(`<!DOCTYPE html><html><body style="background:#090a0d;color:#f8fafc;font-family:sans-serif;padding:60px 20px;text-align:center;"><h2 style="color:#f87171;">Link Unavailable</h2><p style="color:#94a3b8;">This tracked short link is paused or does not exist.</p></body></html>`);
            return;
          }

          const ua = req.headers["user-agent"] || "";
          const referrer = req.headers.referer || req.headers.referrer || "";
          let referrerHost = null;
          try {
            if (referrer) referrerHost = new URL(referrer).hostname.slice(0, 253);
          } catch {}

          const isBot = classifyDevice(ua) === "bot";
          const click = {
            link_id: link.id,
            referrer_host: referrerHost,
            utm_source: cleanParam(parsedUrl.searchParams.get("utm_source")),
            utm_medium: cleanParam(parsedUrl.searchParams.get("utm_medium")),
            utm_campaign: cleanParam(parsedUrl.searchParams.get("utm_campaign")),
            country_code: null,
            device_type: classifyDevice(ua),
            user_agent_family: /edg/i.test(ua)
              ? "Edge"
              : /firefox/i.test(ua)
              ? "Firefox"
              : /chrome/i.test(ua)
              ? "Chrome"
              : /safari/i.test(ua)
              ? "Safari"
              : "Other",
            is_bot: isBot,
          };

          // Record click event in Supabase
          const { error: insertError } = await supabase.from("click_events").insert(click);
          if (insertError) {
            console.error("[dev-redirect] Click insert error:", insertError.message);
          } else {
            console.log(`[dev-redirect] Successfully recorded click for /go/${slug} -> ${link.destination_url}`);
          }

          // 302 Found redirect
          res.statusCode = 302;
          res.setHeader("Location", link.destination_url);
          res.setHeader("Cache-Control", "no-store, max-age=0");
          res.end();
        } catch (err) {
          console.error("[dev-redirect] Unexpected error:", err);
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), devRedirectPlugin(env)],
    server: { host: "0.0.0.0" },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/recharts")) {
              return "recharts";
            }
            if (id.includes("node_modules/@supabase")) {
              return "supabase";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "lucide";
            }
          },
        },
      },
    },
  };
});