import type { MetadataRoute } from "next";
import { categoryIds, postIds } from "@/lib/db";

const SITE = process.env.SITE_URL ?? "https://fatwa.islamonlive.in";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, posts] = await Promise.all([categoryIds(), postIds()]);
  return [
    { url: SITE },
    ...cats.map((id) => ({ url: `${SITE}/category/${id}` })),
    ...posts.map((id) => ({ url: `${SITE}/post/${id}` })),
  ];
}
