// For whoever owns the islamonlive.in Cloudflare account: a Worker with the route fatwa.islamonlive.in/*
// that serves the Fatwa site (which runs in another Cloudflare account) under the real domain.
const ORIGIN = "https://fatwa.d4dx-fatwa.workers.dev";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const upstream = new Request(ORIGIN + url.pathname + url.search, request);
    upstream.headers.set("x-forwarded-host", url.host);
    const res = await fetch(upstream, { redirect: "manual" });
    const out = new Response(res.body, res);
    // keep redirects on the public domain
    const loc = out.headers.get("location");
    if (loc?.startsWith(ORIGIN)) out.headers.set("location", url.origin + loc.slice(ORIGIN.length));
    return out;
  },
};
