// One-off WordPress -> SQLite import. Run: node scripts/import.mjs
// WARNING: drops and rebuilds all tables, wiping any edits made in /admin.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const HOST = "https://fatwa.islamonlive.in";
const API = `${HOST}/?rest_route=/wp/v2`;

async function get(url) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url);
    if (r.status < 500) return r;
    await new Promise((ok) => setTimeout(ok, 1500 * (i + 1)));
  }
  return fetch(url);
}

async function all(endpoint, fields) {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await get(`${API}/${endpoint}&per_page=100&page=${page}&_fields=${fields}`);
    if (res.status === 400) break; // past last page
    if (!res.ok) throw new Error(`${endpoint} p${page}: ${res.status}`);
    out.push(...(await res.json()));
    if (page >= Number(res.headers.get("x-wp-totalpages") ?? 1)) break;
  }
  return out;
}

const cats = await all("categories", "id,name,slug,parent,count");
const tags = await all("tags", "id,name,slug");
const users = await all("users", "id,name,slug");
const posts = await all("posts", "id,date,slug,title,excerpt,content,categories,tags,author,featured_media");
const media = await all("media", "id,source_url");
console.log({ cats: cats.length, users: users.length, posts: posts.length, media: media.length });

const mediaUrl = new Map(media.map((m) => [m.id, m.source_url]));
const UPLOAD = /https?:\/\/fatwa\.islamonlive\.in\/wp-content\/uploads\/[^\s"')]+/g;
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
      e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (NAMED[e] ?? m));
// WP double-encodes some entities (&amp;#8217;), so decode twice
const strip = (s) => decode(decode(s.replace(/<[^>]+>/g, ""))).trim();

// collect + download images
const urls = new Set();
for (const p of posts) {
  for (const u of p.content.rendered.match(UPLOAD) ?? []) urls.add(u);
  const f = mediaUrl.get(p.featured_media);
  if (f) urls.add(f);
}
const local = (u) => "/uploads/" + new URL(u).pathname.split("/wp-content/uploads/")[1];
const queue = [...urls];
let failed = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let u; (u = queue.pop()); ) {
    const dest = join("public", local(u));
    if (existsSync(dest)) continue;
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error(r.status);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    } catch { failed++; }
  }
}));
console.log(`images: ${urls.size} total, ${failed} failed`);
const rewrite = (html) => html.replace(UPLOAD, local);

mkdirSync("data", { recursive: true });
const db = new DatabaseSync("data/fatwa.db");
db.exec(`
DROP TABLE IF EXISTS post_tags; DROP TABLE IF EXISTS tags; DROP TABLE IF EXISTS post_categories; DROP TABLE IF EXISTS posts; DROP TABLE IF EXISTS categories; DROP TABLE IF EXISTS authors;
CREATE TABLE categories(id INTEGER PRIMARY KEY, name TEXT, slug TEXT, parent INTEGER);
CREATE TABLE authors(id INTEGER PRIMARY KEY, name TEXT, slug TEXT);
CREATE TABLE posts(id INTEGER PRIMARY KEY, slug TEXT, title TEXT, excerpt TEXT, content TEXT, date TEXT, author_id INTEGER, image TEXT);
CREATE TABLE post_categories(post_id INTEGER, category_id INTEGER, PRIMARY KEY(post_id, category_id));
CREATE TABLE tags(id INTEGER PRIMARY KEY, name TEXT, slug TEXT);
CREATE TABLE post_tags(post_id INTEGER, tag_id INTEGER, PRIMARY KEY(post_id, tag_id));
CREATE INDEX posts_date ON posts(date DESC);
`);
const iCat = db.prepare("INSERT INTO categories VALUES(?,?,?,?)");
const iAut = db.prepare("INSERT INTO authors VALUES(?,?,?)");
const iPost = db.prepare("INSERT INTO posts VALUES(?,?,?,?,?,?,?,?)");
const iTag = db.prepare("INSERT INTO tags VALUES(?,?,?)");
const iPT = db.prepare("INSERT OR IGNORE INTO post_tags VALUES(?,?)");
const iPC = db.prepare("INSERT OR IGNORE INTO post_categories VALUES(?,?)");
db.exec("BEGIN");
for (const c of cats) iCat.run(c.id, strip(c.name), c.slug, c.parent);
for (const t of tags) iTag.run(t.id, strip(t.name), t.slug);
for (const u of users) iAut.run(u.id, u.name, u.slug);
for (const p of posts) {
  const f = mediaUrl.get(p.featured_media);
  iPost.run(p.id, p.slug, strip(p.title.rendered), strip(p.excerpt.rendered), rewrite(p.content.rendered), p.date, p.author, f ? local(f) : null);
  for (const c of p.categories) iPC.run(p.id, c);
  for (const t of p.tags) iPT.run(p.id, t);
}
db.exec("COMMIT");
console.log("done");
