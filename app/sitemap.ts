import type { MetadataRoute } from "next";
import { categoryIds, postIds } from "@/lib/db";

const SITE = process.env.SITE_URL ?? "https://fatwa.islamonlive.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE },
    ...categoryIds().map((id) => ({ url: `${SITE}/category/${id}` })),
    ...postIds().map((id) => ({ url: `${SITE}/post/${id}` })),
  ];
}
