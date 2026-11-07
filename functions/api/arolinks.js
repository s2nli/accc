// GET /api/arolinks?url=<page on this same site>  ->  { shortenedUrl }
// Creates the short link for the 24-hour key gate. The shortener's API token stays on the server.
// Settings (Cloudflare Worker -> Settings -> Variables and secrets):
//   SHORTENER_TOKEN  (secret)  your VipLink API token   [AROLINKS_TOKEN still works as a fallback]
//   SHORTENER_API    (text, optional)  API address, default https://vplink.in/api
export async function onRequest({ request, env }) {
  const h = { "content-type": "application/json", "cache-control": "no-store" };
  const out = (o, c) => new Response(JSON.stringify(o), { status: c || 200, headers: h });
  try {
    const me = new URL(request.url);
    const t = new URL(me.searchParams.get("url") || "");
    if (t.host !== me.host) return out({ error: "bad url" }, 400);
    const token = env.SHORTENER_TOKEN || env.AROLINKS_TOKEN;
    if (!token) return out({ error: "token missing" }, 500);
    const api = env.SHORTENER_API || "https://vplink.in/api";
    const r = await fetch(api + "?api=" + encodeURIComponent(token) + "&url=" + encodeURIComponent(t.href));
    const j = await r.json();
    const s = j && (j.shortenedUrl || j.shortened_url || j.short_url || j.shortUrl);
    return out({ shortenedUrl: s || "", status: j && j.status ? j.status : undefined, message: s ? undefined : (j && j.message) || undefined });
  } catch (e) {
    return out({ error: "failed" }, 502);
  }
}
