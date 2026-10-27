import { latest } from "@/lib/db";

const SITE = process.env.SITE_URL ?? "https://fatwa.islamonlive.in";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export async function GET() {
  const items = (await latest(0)).map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/post/${p.id}</link>
      <guid isPermaLink="true">${SITE}/post/${p.id}</guid>
      <pubDate>${new Date(`${p.date}Z`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Fatwa Islamonlive</title>
    <link>${SITE}</link>
    <description>The one and only comprehensive Fatwa portal in Malayalam</description>
    <language>ml</language>${items.join("")}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
