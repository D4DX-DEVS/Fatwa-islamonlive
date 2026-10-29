import type { Metadata } from "next";

export const SITE = process.env.SITE_URL ?? "https://fatwa.islamonlive.in";
export const SITE_NAME = "Fatwa Islamonlive";
export const OG_FALLBACK = "/og-default.png"; // 1200x630, used when a page has no picture of its own
export const ORG_ID = `${SITE}/#organization`;

// The site's own pages for people (webdesk, islamonlive) are credited to the organisation, not a person
const HOUSE_AUTHORS = new Set(["webdesk", "islamonlive"]);
export const isHouseAuthor = (name: string | null) => !name || HOUSE_AUTHORS.has(name.trim().toLowerCase());

// plain-text summary of HTML or an excerpt, cut at a word boundary
export function plain(html: string, max = 160) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).trim() + "…";
}

// One place for the title, description, canonical, Open Graph and Twitter tags of a page.
// `path` is relative to metadataBase (app/layout.tsx), so every URL uses the real domain.
export function pageMeta(o: {
  title: string | { absolute: string };
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  published?: string;
  author?: string | null;
}): Metadata {
  const heading = typeof o.title === "string" ? o.title : o.title.absolute;
  const image = o.image ?? OG_FALLBACK;
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: {
      title: heading,
      description: o.description,
      url: o.path,
      siteName: SITE_NAME,
      locale: "ml_IN",
      type: o.type ?? "website",
      images: [image],
      ...(o.type === "article" && { publishedTime: o.published, authors: o.author ? [o.author] : undefined }),
    },
    twitter: { card: "summary_large_image", title: heading, description: o.description, images: [image] },
  };
}

// schema.org nodes used on several pages; the same @id lets a post point at the organisation that publishes it
export const ORGANIZATION = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: SITE + "/", logo: { "@type": "ImageObject", url: SITE + "/logo.png", width: 300, height: 99 } };
export const WEBSITE = {
  "@type": "WebSite",
  "@id": SITE + "/#website",
  url: SITE + "/",
  name: SITE_NAME,
  inLanguage: "ml",
  publisher: { "@id": ORG_ID },
  potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: SITE + "/search?q={search_term_string}" }, "query-input": "required name=search_term_string" },
};
