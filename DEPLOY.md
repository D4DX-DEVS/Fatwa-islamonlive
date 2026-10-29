# Deploying to Cloudflare (Workers + D1 + R2)

The site runs as a Cloudflare Worker (via OpenNext). Posts live in a D1 database, images uploaded
in the admin live in an R2 bucket, and the original WordPress images are static assets of the Worker.
Public pages are rendered from D1 and kept in an edge cache (see "Page cache"); the admin is never cached.

Live address: `https://fatwa.d4dx-fatwa.workers.dev` (account workers.dev subdomain `d4dx-fatwa`).

## Where each setting lives (important)

`.env` is the main settings file (Cloudflare credentials included). The build copies `.env` into the Worker,
so `npm run deploy` runs `scripts/strip-env.mjs` to keep only `SITE_URL` there. **Always deploy with `npm run deploy`**
(or build, then `node scripts/strip-env.mjs`, then the OpenNext `deploy`), never `opennextjs-cloudflare deploy` directly,
or the secrets ship with the site.

| File (all git-ignored except `wrangler.jsonc`) | Contains | Used by |
|---|---|---|
| `.env` | `SITE_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ADMIN_PASSWORD` (+ unused R2/D1 reference values) | build, `npm run deploy`, `npm run db:seed:remote`, `npm run cf` |
| `.dev.vars` | `ADMIN_PASSWORD` for local work | `npm run dev` |
| `wrangler.jsonc` (committed) | D1 database id, R2 bucket name, `SITE_URL` var | wrangler |
| Cloudflare secret | `ADMIN_PASSWORD` for production | the live Worker |

The Worker reaches D1 and R2 through bindings (`DB`, `UPLOADS`), so no API token or R2 keys run inside it.
The deploy token needs permission to edit Workers, D1 and R2.

## Local development

`npm run dev` ignores Cloudflare on purpose: it uses a private copy of `data/fatwa.db` (`.dev.db`) and a local
`.dev-uploads` folder, so local testing never touches live data. Put a local admin password in `.dev.vars`
(`ADMIN_PASSWORD=...`).

## Publish a new version

```bash
npm run deploy
```

Set or change the production admin password (until it is set, `/admin` stays locked):

```bash
npm run cf -- secret put ADMIN_PASSWORD
```

Only if you ever need to reload the database from scratch: `npm run db:seed:remote`
(**drops and recreates the tables, erasing admin edits and uploaded-image links**).

## Page cache (stays inside the free plan)

D1's free tier allows 5M row reads a day and an uncached page costs from a few hundred to a few thousand, so
`worker.ts` (the Worker's entry point, wrapping the OpenNext app) stores every public page:

1. each Cloudflare location keeps its own quick copy;
2. the R2 bucket (`cache/pages/...`) keeps one copy for the whole world, so a page is rendered once, not once per location.

A stored page stays valid until the next change made in the admin (every save, create or delete writes
`cache/purged`; the editing location sees it at once, the others within 30 seconds) or 7 days. After a change a page
renders again the next time someone asks for it. A Cron Trigger (every 5 minutes, `wrangler.jsonc`) also renders up to
5 pages per run that are not stored or are out of date, so nearly every page is stored before anyone visits it.

- Never stored: `/admin`, form posts, search results, error pages, anything that sets a cookie.
- If D1 fails (for example the daily limit) while a page renders, the old stored copy is served instead of an error.
- Each page makes at most two database round trips (menu + page data); post, category, author and tag pages read only the rows they show.
- Links do not prefetch (`components/Link.tsx`): every prefetch would be a server request.
- Clear the whole cache by hand: `npm run cf -- r2 object put fatwa/cache/purged --pipe --remote <<< "$(date +%s)000"`
  (any newer timestamp works).

## Admin images

In the admin form, "Featured image" uploads a JPG, PNG, GIF or WebP (max 4 MB) to R2; the file's
bytes are checked (not just its name) and SVG is refused. It is served from `/media/...` with a
one-year cache. Replacing or removing an image, or deleting the post, deletes the file from R2.
Images from the old WordPress import are untouched.

## Custom domain

A Worker can only take a custom domain whose DNS zone is in the **same Cloudflare account**. `islamonlive.in`
is in a different account, so `fatwa.islamonlive.in` cannot be added from Workers & Pages here. Options:
move the zone into this account, or have the zone's account add a small forwarding Worker on
`fatwa.islamonlive.in/*` that fetches `https://fatwa.d4dx-fatwa.workers.dev`.

## Day to day

| Task | Command |
|---|---|
| Local dev | `npm run dev` |
| Publish a new version | `npm run deploy` |
| Back up the live database | `npm run cf -- d1 export fatwa --remote --output backup.sql` |
