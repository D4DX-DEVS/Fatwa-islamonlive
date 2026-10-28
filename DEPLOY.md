# Deploying to Vercel (data stays on Cloudflare D1 + R2)

The site is a Next.js app on Vercel. Posts live in a Cloudflare D1 database (read and written over
Cloudflare's REST API) and images uploaded in the admin live in an R2 bucket (S3 API). The original
WordPress images are static files in `public/uploads`.

## Environment variables

Set these in Vercel: Project → Settings → Environment Variables (Production). Nothing secret goes in git.

| Variable | Value | Notes |
|---|---|---|
| `SITE_URL` | `https://fatwa.islamonlive.in` | sitemap, robots, feed (no trailing slash) |
| `ADMIN_PASSWORD` | a long random password | login for `/admin`; unset = admin locked |
| `CLOUDFLARE_ACCOUNT_ID` | account id | D1 REST API |
| `CLOUDFLARE_API_TOKEN` | API token with **D1: Edit** | use a token with only that permission |
| `D1_DATABASE_ID` | `e2aaf3e0-b88a-4529-a3fc-64d3a62f0096` | the `fatwa` database |
| `R2_ACCOUNT_ID` | account id | R2 S3 endpoint |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token keys (Object Read & Write) | uploads |
| `R2_BUCKET_NAME` | `fatwa` | |

Locally, `.env` (git-ignored) holds the same names for the `npm run cf` / `npm run db:seed:remote` commands.
`npm run dev` ignores them on purpose: it uses a private copy of `data/fatwa.db` (`.dev.db`) and a local
`.dev-uploads` folder, so local testing never touches live data. Put a local admin password in `.dev.vars`
(`ADMIN_PASSWORD=...`). To point a local server at the live database, run it with `REMOTE_DB=1` (careful: edits are real).

## One-time setup

1. The D1 database is already loaded. Only if you ever need to reload it from scratch, run
   `npm run db:seed:remote` (**drops and recreates the tables, erasing admin edits**).
2. Vercel → Add New → Project → import `D4DX-DEVS/Fatwa-islamonlive` (branch `main`). Framework: Next.js, no other settings.
3. Add the environment variables above, then Deploy.
4. Open the `*.vercel.app` address and click through: home, a post, a category, search, `/admin`.
5. Project → Settings → Domains → add `fatwa.islamonlive.in`. The domain's DNS is on Cloudflare, so in
   the Cloudflare DNS tab add the record Vercel shows (a CNAME to `cname.vercel-dns.com`, **DNS only / grey cloud**).
   Note the existing `fatwa` record first so you can switch back.

## How caching works

Every database read is cached by Next for an hour (tag `db`). Saving, creating or deleting a post in
`/admin` expires the tag immediately, so changes show on the next page load. The cache keeps the
site fast (about 30-80 ms warm) and keeps requests under Cloudflare's API limit (1,200 per 5 minutes).

## Admin images

"Featured image" uploads a JPG, PNG, GIF or WebP (max **4 MB**, Vercel's request limit) to R2; the file's bytes
are checked and SVG is refused. It is served from `/media/...` with a one-year cache. Replacing or removing an
image, or deleting the post, deletes the file from R2. Images from the old WordPress import are untouched.

## Day to day

| Task | Command |
|---|---|
| Local dev (local database copy) | `npm run dev` |
| Publish a new version | `git push origin main` (Vercel builds it) |
| Back up the live database | `npm run cf -- d1 export fatwa --remote --output backup.sql` |

D1 keeps 30 days of point-in-time history (`npm run cf -- d1 time-travel info fatwa`).

## Notes

- `data/fatwa.db` and `d1/seed.sql` are only the starting data. The live D1 database is the source of truth.
- **Vercel Hobby is for non-commercial use.** The site links to a donation page, so Pro ($20/month) may be required.
- Functions run in Vercel's default region (US). Each cold database call crosses to Cloudflare, so first loads of a
  page take roughly 0.5-1.5 s; cached loads are fast. Pro lets you pick a region near your readers.
- The old Cloudflare Worker (`fatwa` on workers.dev) is no longer used. Delete it in the Cloudflare dashboard when Vercel is live.

## Before pointing the real domain at it (go-live checklist)

1. **Test on the `*.vercel.app` address**, including `/admin` (log in, edit a post, upload an image, undo).
2. **Re-import if WordPress changed.** WordPress had 516 posts (newest 2023-08-31) when imported.
3. **Add the custom domain** (step 5 above). The old WordPress hosting stays untouched, so you can switch back by restoring the old DNS record.
4. **After launch:** submit `https://fatwa.islamonlive.in/sitemap.xml` in Google Search Console and spot-check old links such as `/?p=76451`.
5. **Keep a backup of the WordPress site** (files + database) until you are happy.
6. **Roll the API token and R2 keys you pasted into chat** (Cloudflare dashboard → My Profile → API Tokens, and R2 → Manage API tokens), then update Vercel and `.env`.
