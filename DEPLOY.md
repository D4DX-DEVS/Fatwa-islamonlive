# Deploying to Cloudflare (Workers + D1 + R2)

The site runs as a Cloudflare Worker (via OpenNext). Posts live in a D1 database, images uploaded
in the admin live in an R2 bucket, and the original WordPress images are static assets of the Worker.
Every page renders on request, so admin edits show up immediately.

## Where each setting lives (important)

The build copies `.env` into the deployed Worker, so **no secret may ever go in `.env`**.

| File (all git-ignored except `wrangler.jsonc`) | Contains | Used by |
|---|---|---|
| `.env` | `SITE_URL` only (not secret) | build, runtime |
| `.dev.vars` | `ADMIN_PASSWORD` for local work | `npm run dev`, `npm run preview` |
| `.cloudflare.env` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (+ unused R2/D1 reference values) | `npm run deploy`, `npm run db:seed:remote` only |
| `wrangler.jsonc` (committed) | D1 database id, R2 bucket name, `SITE_URL` var | wrangler |
| Cloudflare secret | `ADMIN_PASSWORD` for production | the live Worker |

The Worker reaches D1 and R2 through bindings (`DB`, `UPLOADS`), so the R2 S3 keys are not needed.
The API token needs permission to edit Workers, D1 and R2.

## One-time setup (database and bucket already created)

```bash
# 1. load all posts into D1  (WARNING: drops and recreates the tables, so run it ONCE,
#    before you use the admin. Running it again erases admin edits and uploaded-image links.)
npm run db:seed:remote

# 2. set the production admin password as a secret (it prompts for the value)
npx wrangler secret put ADMIN_PASSWORD

# 3. build and deploy
npm run deploy
```

If you don't want to keep an API token in a file, delete `.cloudflare.env`, run `npx wrangler login`
once, and use `npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy` instead of the npm scripts.

## Admin images

In the admin form, "Featured image" uploads a JPG, PNG, GIF or WebP (max 5 MB) to R2; the file's
bytes are checked (not just its name) and SVG is refused. It is served from `/media/...` with a
one-year cache. Replacing or removing an image, or deleting the post, deletes the file from R2.
Images from the old WordPress import are untouched.

## Custom domain

Cloudflare dashboard → Workers & Pages → `fatwa` → Settings → Domains & Routes → Add →
Custom domain → `fatwa.islamonlive.in`. The domain's DNS must be on Cloudflare.

## Day to day

| Task | Command |
|---|---|
| Local dev (Node, local D1/R2) | `npm run db:seed:local` once, then `npm run dev` |
| Test on the real Workers runtime | `npm run preview` |
| Publish a new version | `npm run deploy` |
| Back up the live database | `npx wrangler d1 export fatwa --remote --output backup.sql` |

D1 also keeps 30 days of point-in-time history (`npx wrangler d1 time-travel info fatwa`).
After changing the D1 database id in `wrangler.jsonc`, run `npm run db:seed:local` again (local data is stored per id).

## Notes

- `data/fatwa.db` and `d1/seed.sql` are only the starting data. After the first deploy, the live
  D1 database is the source of truth (admin edits live there, not in git).
- Worker size is about 1.1 MiB compressed, within the free plan's 3 MiB limit.
- Images are not resized by Cloudflare (`images.unoptimized`), they are served as uploaded.

## Before pointing the real domain at it (go-live checklist)

1. **Use the Workers Paid plan ($5/month).** The free plan allows only 10 ms of CPU per request;
   server-rendering a post page can exceed that and visitors would see Cloudflare error 1102.
   Paid also raises the D1 limits (free: 5M rows read and 100k rows written per day).
2. **Deploy first, test on the temporary address.** After `npm run deploy`, open the
   `https://fatwa.<your-subdomain>.workers.dev` link it prints and click through: home, a post,
   a category, search, `/admin` (log in, edit a post, upload an image, undo). Watch for errors with
   `npx wrangler tail fatwa`.
3. **Re-import if WordPress changed.** WordPress had 516 posts (newest 2023-08-31) when imported.
   If new posts were published since: `node scripts/import.mjs`, `node scripts/export-d1.mjs`,
   then `npm run db:seed:remote` (this replaces all data, so do it before using the admin).
4. **Protect `/admin` further (recommended).** Cloudflare Zero Trust → Access → add an application
   for `fatwa.islamonlive.in/admin*` so only your email can even reach the login page. Free for up to 50 users.
5. **Add the custom domain** (see above). Do it when traffic is low; the old WordPress hosting
   stays untouched, so you can switch back by restoring the old DNS record.
6. **Turn on in the Cloudflare dashboard:** SSL/TLS → Always Use HTTPS, and HSTS once HTTPS is confirmed.
7. **After launch:** submit `https://fatwa.islamonlive.in/sitemap.xml` in Google Search Console,
   and spot-check old links such as `https://fatwa.islamonlive.in/?p=76451` (they redirect to `/post/76451`).
8. **Keep a backup of the WordPress site** (files + database) until you are happy.
9. **Roll the API token and R2 keys you pasted into chat** (Cloudflare dashboard → My Profile → API Tokens,
   and R2 → Manage API tokens) once everything is deployed, then update `.cloudflare.env`.
