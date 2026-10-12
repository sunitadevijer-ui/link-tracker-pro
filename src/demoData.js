// Demo Data for Link Tracker Pro
// CLEARLY LABELED AS SAMPLE DATA - Used when Supabase is not yet configured or when exploring Demo Mode.

export function generateDemoData() {
  const now = new Date();

  const links = [
    {
      id: "demo-link-1",
      title: "Product Hunt Launch 2026",
      slug: "ph-launch",
      destination_url: "https://www.producthunt.com/posts/link-tracker-pro",
      is_active: true,
      created_at: new Date(now.getTime() - 25 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: "demo-link-2",
      title: "Twitter / X Announcement Thread",
      slug: "x-launch-thread",
      destination_url: "https://x.com/linktrackerpro/status/1884920401",
      is_active: true,
      created_at: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
    {
      id: "demo-link-3",
      title: "Weekly Tech Digest #48",
      slug: "tech-digest-48",
      destination_url: "https://newsletter.technotes.dev/p/issue-48-devtools",
      is_active: true,
      created_at: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: "demo-link-4",
      title: "YouTube SaaS Breakdown Video",
      slug: "yt-review",
      destination_url: "https://youtube.com/watch?v=7X89BvA2234",
      is_active: true,
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: "demo-link-5",
      title: "GitHub Open Source Docs",
      slug: "github-docs",
      destination_url: "https://github.com/link-tracker-pro/core-sdk",
      is_active: true,
      created_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: "demo-link-6",
      title: "LinkedIn Growth Article",
      slug: "linkedin-post",
      destination_url: "https://linkedin.com/pulse/mastering-attribution-in-2026",
      is_active: false,
      created_at: new Date(now.getTime() - 18 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
    },
  ];

  const referrers = [
    { host: "t.co", source: "twitter", weight: 32 },
    { host: "producthunt.com", source: "producthunt", weight: 26 },
    { host: "news.ycombinator.com", source: "hacker-news", weight: 14 },
    { host: "google.com", source: "google-organic", weight: 12 },
    { host: "youtube.com", source: "youtube", weight: 8 },
    { host: "linkedin.com", source: "linkedin", weight: 5 },
    { host: null, source: null, weight: 3 }, // Direct / unknown
  ];

  const devices = [
    { type: "mobile", weight: 52 },
    { type: "desktop", weight: 42 },
    { type: "tablet", weight: 6 },
  ];

  const browsers = ["Chrome", "Safari", "Edge", "Firefox"];

  const events = [];
  let eventId = 1000;

  // Generate synthetic clicks over the last 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now.getTime() - dayOffset * 86400000);
    // Baseline clicks with weekly pattern (higher midweek, lower weekend)
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? 14 : 34 + Math.floor(Math.sin(dayOffset / 3) * 12);
    // Recent days have a spike
    const spike = dayOffset <= 4 ? 22 : 0;
    const dayTotal = Math.max(8, baseCount + spike + Math.floor(Math.random() * 10));

    for (let c = 0; c < dayTotal; c++) {
      eventId++;
      const link = links[Math.floor(Math.random() * (links.length - 1))]; // mostly active links
      const isBot = Math.random() < 0.08; // 8% bot traffic (Slackbot, Twitterbot, etc.)

      // Pick referrer
      const randRef = Math.random() * 100;
      let accum = 0;
      let chosenRef = referrers[0];
      for (const r of referrers) {
        accum += r.weight;
        if (randRef <= accum) {
          chosenRef = r;
          break;
        }
      }

      // Pick device
      const randDev = Math.random() * 100;
      let devAccum = 0;
      let chosenDevice = "desktop";
      for (const d of devices) {
        devAccum += d.weight;
        if (randDev <= devAccum) {
          chosenDevice = d.type;
          break;
        }
      }

      // Timestamp within the day
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const eventTime = new Date(dayDate);
      eventTime.setHours(hour, minute, second);

      events.push({
        id: eventId,
        link_id: link.id,
        clicked_at: eventTime.toISOString(),
        referrer_host: chosenRef.host,
        utm_source: chosenRef.source,
        utm_medium: chosenRef.source ? (chosenDevice === "mobile" ? "social-mobile" : "referral") : null,
        utm_campaign: "launch-2026",
        country_code: ["US", "DE", "GB", "IN", "CA", "FR", "NL", "JP"][Math.floor(Math.random() * 8)],
        device_type: isBot ? "bot" : chosenDevice,
        user_agent_family: browsers[Math.floor(Math.random() * browsers.length)],
        is_bot: isBot,
      });
    }
  }

  return { links, events };
}

const STORAGE_KEY_LINKS = "ltp_demo_links_v2";
const STORAGE_KEY_EVENTS = "ltp_demo_events_v2";

export function getInitialDemoState() {
  try {
    const savedLinks = localStorage.getItem(STORAGE_KEY_LINKS);
    const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (savedLinks && savedEvents) {
      return {
        links: JSON.parse(savedLinks),
        events: JSON.parse(savedEvents),
      };
    }
  } catch (err) {
    console.warn("Could not read demo data from storage:", err);
  }

  const generated = generateDemoData();
  saveDemoState(generated.links, generated.events);
  return generated;
}

export function saveDemoState(links, events) {
  try {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.warn("Could not persist demo data to storage:", err);
  }
}

export function resetDemoState() {
  try {
    localStorage.removeItem(STORAGE_KEY_LINKS);
    localStorage.removeItem(STORAGE_KEY_EVENTS);
  } catch {}
  return generateDemoData();
}
