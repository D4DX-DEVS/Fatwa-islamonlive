import type { MetadataRoute } from "next";
import { authorIds, categoryIds, postIds } from "@/lib/db";

const SITE = process.env.SITE_URL ?? "https://fatwa.islamonlive.in";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, posts, people] = await Promise.all([categoryIds(), postIds(), authorIds()]);
  return [
    { url: `${SITE}/` },
    ...cats.map((id) => ({ url: `${SITE}/category/${id}` })),
    ...people.map((id) => ({ url: `${SITE}/author/${id}` })),
    ...posts.map((id) => ({ url: `${SITE}/post/${id}` })),
  ];
}
