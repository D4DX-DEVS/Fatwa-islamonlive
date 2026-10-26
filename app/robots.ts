import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL ?? "https://fatwa.islamonlive.in";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/admin" }, sitemap: `${SITE}/sitemap.xml` };
}
