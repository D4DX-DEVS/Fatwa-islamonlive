# SEO audit and implementation notes

Audit of the Next.js 16 app (App Router, server-rendered on every request, stored page cache in front, Cloudflare Workers + D1 + R2).
Measurements below are **lab / local-server numbers**. There is no real-user (field) Core Web Vitals data yet; that comes from
Google Search Console and the Chrome UX Report once the real domain is live and has traffic.

## Public routes

| Route | Content | Indexable | In sitemap |
|---|---|---|---|
| `/` | magazine home | yes | yes |
| `/post/<id>` | one fatwa (516) | yes | yes |
| `/category/<id>` (`?page=N`) | category archive (43 with posts) | yes | yes (page 1) |
| `/author/<id>` (`?page=N`) | author archive (48 with posts) | yes | yes (page 1) |
| `/tag/<id>` (`?page=N`) | tag archive (162; 145 have 1-2 posts) | yes | no |
| `/page/<n>` | all posts, newest first (26 pages) | yes | no |
| `/search?q=` | search results | `noindex` | no |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt` | machine-readable | n/a | n/a |
| `/admin/*` | admin | `noindex` header + robots `Disallow` | no |
| old WordPress URLs | permalinks, category, tag, author, feed, sitemap, `wp-content/uploads` | 308 to the new address | n/a |

## Findings before the work (initial condition)

| Severity | Finding |
|---|---|
| Critical | `favicon.ico` was the stock Create Next App icon; no brand favicon, touch icon or default share image |
| Critical | Old WordPress category, tag, author, feed, sitemap and image URLs returned 404 (only old post links redirected) |
| High | Category, author, tag, list and search pages all shared one generic meta description |
| High | Home, category, author, tag and list pages had no Open Graph or Twitter tags; posts lacked `og:url`, `og:site_name`, locale; posts without a picture had no share image |
| High | No structured data on any page |
| High | Any other address serving the Worker (workers.dev, the old Vercel copy) was indexable: duplicate-content risk |
| Medium | "Newer" link on `/page/2` pointed to the home page instead of `/page/1` |
| Medium | Home title was only the brand name; list titles were `Page 2`; 404 page had a generic title and a canonical |
| Medium | Gold text on ivory was 2.2:1 contrast (WCAG needs 4.5:1); some grey text 3.8:1; focus ring was low-contrast gold on ivory |
| Medium | The serif font was preloaded on every page (86 KB extra) |
| Medium | Sitemap omitted author pages and listed empty categories |
| Low | 96 post titles exceed 70 characters with the brand suffix (Google truncates by pixel width, not characters) |
| Low | Leftover create-next-app files in `public/` (`next.svg`, `vercel.svg`, ...), unused |

## Implemented

- `lib/seo.ts`: one `pageMeta()` helper gives every page its title, description, canonical, Open Graph and Twitter tags (relative to `metadataBase`, so URLs use the real domain).
- Metadata per page type: home, post (description from the excerpt, image, published time), category, author, tag, `/page/N`; 404 titled and without canonical.
- `components/JsonLd.tsx` + JSON-LD: Organization and WebSite (home, with the site's real search as `SearchAction`), `Article` and `BreadcrumbList` (every post; posts credited to `webdesk` or `islamonlive` name the organisation as author, others a `Person`). Content matches what the page shows (the breadcrumb is visible on posts). No ratings, reviews, prices or addresses.
- Sitemap: home, categories with posts, authors with posts, all posts (608 URLs); home written with the same trailing slash as its canonical.
- Redirects (permanent, 308): old category/tag/author slugs to `/category|tag|author/<id>` (`app/(site)/[...slug]`, the three `[id]` routes), `/feed` to `/feed.xml`, `/wp-sitemap.xml` and `/sitemap_index.xml` to `/sitemap.xml`, `/wp-content/uploads/*` to `/uploads/*` (`next.config.ts`).
- `worker.ts`: any host other than `SITE_URL` (checked through `x-forwarded-host`, which the domain forwarder sets) gets `X-Robots-Tag: noindex, nofollow` and a disallow-all `robots.txt`.
- Brand assets (`scripts/brand-assets.py`): `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`, `public/og-default.png` (1200x630 share image; contains no Malayalam text).
- Accessibility: new `goldtext` colour for gold text on light backgrounds (5.2-6.2:1), muted greys raised to 5.7-6.3:1, focus ring dark green on light areas and gold on dark ones. Pager, skip link, landmarks and one H1 per page were already in place.
- Performance: serif font no longer preloaded (preloaded fonts 189 KB to 103 KB on every page).

## Measurements (lab, local Worker, gzip)

| | Before | After |
|---|---|---|
| Preloaded fonts per page | 189 KB (4 files) | 103 KB (2 files) |
| Home HTML | 32 KB | about 32 KB (JSON-LD adds under 1 KB) |
| CSS | 11 KB | 11 KB |
| JavaScript (8 files, the Next.js runtime) | 179 KB | 179 KB |
| Hero images | 18-57 KB | unchanged |

LCP/INP/CLS could not be measured: the preview browser pane is unfocused and records no paint timings. Run Lighthouse or
PageSpeed Insights against the live domain and watch the Search Console Core Web Vitals report.

## Verification run

`tsc --noEmit`, `eslint`, production build (`opennextjs-cloudflare build`), and a crawl of all 608 sitemap URLs on the
built Worker: all 200, a canonical equal to each page's own URL, one H1, Open Graph image and URL present, 516 of 516 posts with
parseable Article + BreadcrumbList JSON-LD, none of the sitemap URLs `noindex`. All 516 old post links still land on the right post.

## Search intent per page type (hypotheses to validate in Search Console; no search-volume data was available)

| Page | Likely intent | Notes |
|---|---|---|
| Post | informational, long-tail Malayalam questions | Title is the question; description starts with the label "ചോദ്യം:", which spends snippet space |
| Category | topical hub (zakat, fasting, marriage, ...) | No introductory text; this is the biggest content gap |
| Home | navigational / brand | Title now `Fatwa Islamonlive \| Malayalam fatwa portal` |
| Author | navigational (a known scholar) | 33 of 48 authors have 1-2 posts |
| Tag | long-tail | 145 of 162 tags have 1-2 posts: thin |
| `/page/N` | crawl path only | rarely a search target |

Possible keyword cannibalisation: 3 pairs of posts share an identical title (`/post/76184` & `64661`, `75375` & `58923`,
`65091` & `46584`); 4 tags carry the same name as an author (tag 85 and author 10 are both "ഡോ. യൂസുഫുല്‍ ഖറദാവി").

## Remaining issues and risks

- Real domain not yet live: canonical URLs, the sitemap, Open Graph and JSON-LD all point at `https://fatwa.islamonlive.in`.
- **Needs approval, not done:** `noindex, follow` for tag pages with fewer than 3 posts, and for tags that duplicate an author. They are not in the sitemap, so the effect is small, but it changes indexing.
- Redirect chains from old URLs with a trailing slash take two hops (strip the slash, then the redirect). Search engines follow this; a single hop would need a middleware change.
- Old WordPress image sizes (`name-300x200.jpg`) and old date archives were not migrated and still 404.
- Images are served as uploaded (no resizing): fine at the current 18-57 KB for the main ones, but no responsive `srcset`.
- Featured images have empty `alt` (decorative): alt text for the real content of each image needs an editor.
- 167 posts have no picture and share with the default image.
- The old Vercel copy (`fatwa-islamonlive.vercel.app`) still exists, was built before these changes and has no `noindex`. It names the real domain as canonical, but deleting the project is cleaner.
- Duplicate-title posts and missing category intros are content decisions for the editors.

## Next steps (need account access)

1. After DNS: verify the domain in Google Search Console (Domain property, DNS TXT) and submit `https://fatwa.islamonlive.in/sitemap.xml`.
2. Check Search Console > Pages for "Duplicate, Google chose a different canonical" and for the old WordPress URLs that were indexed.
3. Add privacy-friendly analytics (Cloudflare Web Analytics needs the Cloudflare account that owns the zone) so there is real traffic data.
4. After a few weeks check the Core Web Vitals report (real-user data) and the Rich Results Test / Schema Markup Validator on a sample post.
5. Ask the editors to add a short intro to each main category and to merge or retitle the 3 duplicate-title posts.
