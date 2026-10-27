// Dump data/fatwa.db to d1/seed.sql for Cloudflare D1. Run: node scripts/export-d1.mjs
// Then: npx wrangler d1 execute DB --local|--remote --file d1/seed.sql
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";

const db = new DatabaseSync("data/fatwa.db", { readOnly: true });
const MAX_STMT = 90_000; // D1 rejects statements over 100,000 bytes
const q = (v) => (v == null ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replaceAll("'", "''")}'`);
const bytes = (s) => Buffer.byteLength(s);

const out = [
  `DROP TABLE IF EXISTS post_tags; DROP TABLE IF EXISTS tags; DROP TABLE IF EXISTS post_categories;`,
  `DROP TABLE IF EXISTS posts; DROP TABLE IF EXISTS categories; DROP TABLE IF EXISTS authors;`,
  `CREATE TABLE categories(id INTEGER PRIMARY KEY, name TEXT, slug TEXT, parent INTEGER);`,
  `CREATE TABLE authors(id INTEGER PRIMARY KEY, name TEXT, slug TEXT);`,
  `CREATE TABLE posts(id INTEGER PRIMARY KEY, slug TEXT, title TEXT, excerpt TEXT, content TEXT, date TEXT, author_id INTEGER, image TEXT);`,
  `CREATE TABLE post_categories(post_id INTEGER, category_id INTEGER, PRIMARY KEY(post_id, category_id));`,
  `CREATE TABLE tags(id INTEGER PRIMARY KEY, name TEXT, slug TEXT);`,
  `CREATE TABLE post_tags(post_id INTEGER, tag_id INTEGER, PRIMARY KEY(post_id, tag_id));`,
  `CREATE INDEX posts_date ON posts(date DESC);`,
];

const insert = (table, row) => `INSERT INTO ${table} VALUES(${Object.values(row).map(q).join(",")});`;
for (const t of ["categories", "authors", "tags", "post_categories", "post_tags"])
  for (const r of db.prepare(`SELECT * FROM ${t}`).all()) out.push(insert(t, r));

let split = 0;
for (const p of db.prepare("SELECT * FROM posts ORDER BY id").all()) {
  const stmt = insert("posts", p);
  if (bytes(stmt) <= MAX_STMT) { out.push(stmt); continue; }
  // oversized: insert with empty content, then append content in chunks
  out.push(insert("posts", { ...p, content: "" }));
  const chars = [...p.content];
  for (let i = 0, step = 8000; i < chars.length; i += step) {
    out.push(`UPDATE posts SET content = content || ${q(chars.slice(i, i + step).join(""))} WHERE id = ${p.id};`);
  }
  split++;
}

const longest = Math.max(...out.map(bytes));
if (longest > 100_000) throw new Error(`statement of ${longest} bytes exceeds D1 limit`);
mkdirSync("d1", { recursive: true });
writeFileSync("d1/seed.sql", out.join("\n") + "\n");
console.log(`d1/seed.sql: ${out.length} statements, longest ${longest} bytes, ${split} posts split`);
