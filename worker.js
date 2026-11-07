// Cloudflare Worker entry for accc (workers.dev). Static files come from the assets binding;
// /api/arolinks creates the Arolinks short link for the 24-hour key gate (secret AROLINKS_TOKEN).
import { onRequest as arolinks } from "./functions/api/arolinks.js";

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === "/api/arolinks" || path === "/api/arolinks/") return arolinks({ request, env });
    return env.ASSETS.fetch(request);
  }
};
