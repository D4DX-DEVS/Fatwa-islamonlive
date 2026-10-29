// Entry point of the deployed Worker: the OpenNext app wrapped in a page cache.
// D1's free tier allows 5M row reads a day and every uncached page costs thousands, so public pages are
// kept at the edge: served as-is for FRESH seconds, then served once more instantly while a new copy
// renders in the background. Admin edits therefore show on public pages within about FRESH seconds.
// @ts-ignore: produced by `opennextjs-cloudflare build`
import openNext from "./.open-next/worker.js";

const FRESH = 600; // seconds a stored page is served without re-rendering
const KEEP = 86400; // seconds an old copy is kept so it can still be served instantly
const STAMP = "x-cached-at";

const textual = (type: string) => /^(text\/(html|plain|xml)|application\/(xml|rss\+xml))/.test(type);

// the copy that goes into the cache (long edge lifetime, timestamp to judge freshness)
function forCache(res: Response) {
  const copy = new Response(res.body, res);
  copy.headers.set("cache-control", `public, s-maxage=${KEEP}`);
  copy.headers.set(STAMP, String(Date.now()));
  copy.headers.delete("vary");
  return copy;
}

// the copy that goes to the browser: it always asks again, the edge decides what is fresh
function forBrowser(res: Response) {
  const out = new Response(res.body, res);
  out.headers.delete(STAMP);
  out.headers.set("cache-control", "public, max-age=0, must-revalidate");
  return out;
}

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // only plain page loads: not the admin, not Next's client-side data requests, not form posts
    const cacheable =
      request.method === "GET" &&
      !url.pathname.startsWith("/admin") &&
      !url.searchParams.has("_rsc") &&
      !request.headers.has("rsc") &&
      !request.headers.has("next-action");
    if (!cacheable) return openNext.fetch(request, env, ctx);

    const cache = (caches as unknown as { default: Cache }).default;
    const key = new Request(url.toString());

    // render a new copy and store it; the browser gets the original
    const render = async () => {
      const res: Response = await openNext.fetch(request, env, ctx);
      const type = res.headers.get("content-type") ?? "";
      if (res.status !== 200 || res.headers.has("set-cookie")) return res;
      if (type.startsWith("image/")) {
        // uploaded images carry their own year-long cache header
        ctx.waitUntil(cache.put(key, res.clone()));
        return res;
      }
      if (!textual(type)) return res;
      ctx.waitUntil(cache.put(key, forCache(res.clone())));
      return forBrowser(res);
    };

    const hit = await cache.match(key);
    if (!hit) return render();
    if (hit.headers.get("content-type")?.startsWith("image/")) return hit;

    const age = (Date.now() - Number(hit.headers.get(STAMP))) / 1000;
    if (age > FRESH) {
      // stale: mark this copy fresh right away so a burst of visitors triggers one refresh, then re-render
      ctx.waitUntil(cache.put(key, forCache(hit.clone())).then(() => render().then((r) => r.body?.cancel())));
    }
    return forBrowser(hit);
  },
};
