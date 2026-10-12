import { createClient } from "@supabase/supabase-js";

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

function json(statusCode, body) {
  return { statusCode, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) };
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

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

export async function handler(event) {
  const slug = event.pathParameters?.splat || event.queryStringParameters?.slug || "";
  if (!/^[a-zA-Z0-9_-]{3,60}$/.test(slug)) return json(400, { error: "Invalid link slug." });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: "Server is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify." });

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: link, error } = await supabase
    .from("tracked_links")
    .select("id, destination_url, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return json(500, { error: "Could not look up this link." });
  if (!link || !link.is_active) return json(404, { error: "This tracked link is unavailable." });
  if (!isValidHttpUrl(link.destination_url)) return json(500, { error: "Destination URL is invalid." });

  const ua = event.headers?.["user-agent"] || event.headers?.["User-Agent"] || "";
  const referrer = event.headers?.referer || event.headers?.Referer || "";
  let referrerHost = null;
  try { if (referrer) referrerHost = new URL(referrer).hostname.slice(0, 253); } catch {}

  // Country may be provided by Netlify's edge headers; absence is normal.
  const country = cleanParam(event.headers?.["x-country"] || event.headers?.["x-nf-country"] || null);
  const params = event.queryStringParameters || {};
  const isBot = classifyDevice(ua) === "bot";
  const click = {
    link_id: link.id,
    referrer_host: referrerHost,
    utm_source: cleanParam(params.utm_source),
    utm_medium: cleanParam(params.utm_medium),
    utm_campaign: cleanParam(params.utm_campaign),
    country_code: country,
    device_type: classifyDevice(ua),
    user_agent_family: /edg/i.test(ua) ? "Edge" : /firefox/i.test(ua) ? "Firefox" : /chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Other",
    is_bot: isBot
  };

  // Log known bot/previews too, but the dashboard distinguishes them. Click data
  // is intentionally minimal: no raw IP address or full user-agent is stored.
  const { error: insertError } = await supabase.from("click_events").insert(click);
  if (insertError) {
    // Still redirect if analytics insert fails; do not break user navigation.
    console.error("Click event insert failed:", insertError.message);
  }

  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: link.destination_url
    },
    body: ""
  };
}