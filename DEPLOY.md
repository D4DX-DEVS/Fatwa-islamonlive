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
