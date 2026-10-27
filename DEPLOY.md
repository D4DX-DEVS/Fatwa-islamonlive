# Deploying to Cloudflare (Workers + D1)

The site runs as a Cloudflare Worker (via OpenNext) and reads its data from a D1 database.
Images are served from the Worker's static assets. Every page renders on request, so admin
edits show up immediately.

## One-time setup

```bash
# 1. log in to your Cloudflare account
npx wrangler login

# 2. create the database; copy the "database_id" it prints
npx wrangler d1 create fatwa
```

Put that id in `wrangler.jsonc`:

```jsonc
"d1_databases": [{ "binding": "DB", "database_name": "fatwa", "database_id": "<paste id>" }]
```

```bash
# 3. load all posts into D1  (WARNING: drops and recreates the tables, so run it ONCE,
#    before you use the admin. Running it again erases admin edits.)
npm run db:seed:remote

# 4. set the admin password as a secret (it prompts for the value)
npx wrangler secret put ADMIN_PASSWORD

# 5. build and deploy
npm run deploy
```

`SITE_URL` is already set in `wrangler.jsonc` under `vars`; change it there if the address differs.

## Custom domain

Cloudflare dashboard → Workers & Pages → `fatwa` → Settings → Domains & Routes → Add →
Custom domain → `fatwa.islamonlive.in`. The domain's DNS must be on Cloudflare.

## Day to day

| Task | Command |
|---|---|
| Local dev (Node, local D1) | `npm run db:seed:local` once, then `npm run dev` (admin password comes from `.env`) |
| Test on the real Workers runtime | `npm run preview` (admin password comes from `.dev.vars`) |
| Publish a new version | `npm run deploy` |
| Back up the live database | `npx wrangler d1 export fatwa --remote --output backup.sql` |

D1 also keeps 30 days of point-in-time history (`npx wrangler d1 time-travel info fatwa`).

## Notes

- `data/fatwa.db` and `d1/seed.sql` are only the starting data. After the first deploy, the live
  D1 database is the source of truth (admin edits live there, not in git).
- Worker size is about 1.1 MiB compressed, within the free plan's 3 MiB limit.
- Images are not resized by Cloudflare (`images.unoptimized`), they are served as uploaded.
- The admin has no image upload yet; new posts show a grey box instead of a picture.

## Before pointing the real domain at it (go-live checklist)

1. **Use the Workers Paid plan ($5/month).** The free plan allows only 10 ms of CPU per request;
   server-rendering a post page can exceed that and visitors would see Cloudflare error 1102.
   Paid also raises the D1 limits (free: 5M rows read and 100k rows written per day).
2. **Deploy first, test on the temporary address.** After `npm run deploy`, open the
   `https://fatwa.<your-subdomain>.workers.dev` link it prints and click through: home, a post,
   a category, search, `/admin` (log in, edit a post, undo the edit). Watch for errors with
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
