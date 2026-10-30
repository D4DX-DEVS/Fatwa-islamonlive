import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

// In production (the Cloudflare Worker) the database is the D1 binding declared in wrangler.jsonc. In dev
// (`next dev`) a private SQLite copy of data/fatwa.db is used, so local tests never touch live data.
export const prod = process.env.NODE_ENV === "production";

type Stmt = { sql: string; params: unknown[] };
type Result = { results: Record<string, unknown>[]; meta: { last_row_id: number } };

let sqlite: import("node:sqlite").DatabaseSync | undefined;
async function local(stmts: Stmt[]): Promise<Result[]> {
  if (!sqlite) {
    const { DatabaseSync } = await import("node:sqlite");
    const { copyFileSync, existsSync } = await import("node:fs");
    if (!existsSync(".dev.db")) copyFileSync("data/fatwa.db", ".dev.db");
    sqlite = new DatabaseSync(".dev.db");
    // the same indexes d1/seed.sql creates on D1, so dev query plans match production
    for (const sql of [
      "CREATE INDEX IF NOT EXISTS posts_date ON posts(date DESC)",
      "CREATE INDEX IF NOT EXISTS pc_category ON post_categories(category_id)",
      "CREATE INDEX IF NOT EXISTS pt_tag ON post_tags(tag_id)",
      "CREATE INDEX IF NOT EXISTS posts_author ON posts(author_id, date DESC)",
      "CREATE INDEX IF NOT EXISTS posts_slug ON posts(slug)",
      "CREATE INDEX IF NOT EXISTS categories_slug ON categories(slug)",
      "CREATE INDEX IF NOT EXISTS tags_slug ON tags(slug)",
      "CREATE INDEX IF NOT EXISTS authors_slug ON authors(slug)",
    ]) sqlite.exec(sql);
  }
  const db = sqlite;
  const exec = (s: Stmt): Result => {
    const q = db.prepare(s.sql);
    if (/^s*select/i.test(s.sql)) return { results: q.all(...(s.params as never[])) as Record<string, unknown>[], meta: { last_row_id: 0 } };
    return { results: [], meta: { last_row_id: Number(q.run(...(s.params as never[])).lastInsertRowid) } };
  };
  if (stmts.length === 1) return [exec(stmts[0])];
  db.exec("BEGIN");
  try {
    const out = stmts.map(exec);
    db.exec("COMMIT");
    return out;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// A batch runs as one transaction on both drivers.
async function run(stmts: Stmt[]): Promise<Result[]> {
  if (!prod) return local(stmts);
  const db = getCloudflareContext().env.DB;
  const prepared = stmts.map((s) => db.prepare(s.sql).bind(...s.params));
  return (prepared.length === 1 ? [await prepared[0].all()] : await db.batch(prepared)) as unknown as Result[];
}
// Every change also marks the stored pages (worker.ts) out of date; this location sees it at once, the others within 30 s
async function write(stmts: Stmt[]) {
  const out = await run(stmts);
  if (prod) {
    await getCloudflareContext().env.UPLOADS.put("cache/purged", String(Date.now()));
    await (caches as unknown as { default: Cache }).default.delete(new Request("https://cache.internal/purged"));
  }
  return out;
}

const rows = async <T>(sql: string, ...params: unknown[]) => (await run([{ sql, params }]))[0].results as T[];
const row = async <T>(sql: string, ...params: unknown[]) => (await rows<T>(sql, ...params))[0] ?? null;
const stmt = (sql: string, ...params: unknown[]): Stmt => ({ sql, params });

export type Post = { id: number; title: string; excerpt: string; content: string; date: string; author_id: number; author: string | null; image: string | null };
export type Category = { id: number; name: string; parent: number };
export type PostCard = Pick<Post, "id" | "title" | "excerpt" | "date" | "image" | "author">;

// Post cards. Author names are looked up after the page is cut, not for every matching post.
const cards = (from: string) =>
  `SELECT x.id, x.title, x.excerpt, x.date, x.image, a.name AS author FROM (SELECT p.id, p.title, p.excerpt, p.date, p.image, p.author_id FROM posts p ${from} ORDER BY p.date DESC LIMIT ? OFFSET ?) x LEFT JOIN authors a ON a.id = x.author_id ORDER BY x.date DESC`;
const inGroup = (n: number) => `WHERE p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (${Array(n).fill("?").join(",")}))`;

export const PAGE_SIZE = 20;

// cache(): the layout and the page both ask for these in one request, so they share one query
export const latest = cache((offset: number, limit = PAGE_SIZE) => rows<PostCard>(cards(""), limit, offset));
export const countAll = cache(async () => (await row<{ n: number }>("SELECT COUNT(*) n FROM posts"))!.n);

const ids = async (table: string) => (await rows<{ id: number }>(`SELECT id FROM ${table}`)).map((r) => String(r.id));
export const postIds = () => ids("posts");
// categories that have posts (an empty category page is thin content and stays out of the sitemap)
export const categoryIds = async () => (await rows<{ id: number }>("SELECT DISTINCT category_id AS id FROM post_categories")).map((r) => String(r.id));
// authors that have posts (an author page with none would be empty)
export const authorIds = async () => (await rows<{ id: number }>("SELECT DISTINCT author_id AS id FROM posts WHERE author_id IS NOT NULL")).map((r) => String(r.id));

// admin edit form
export const post = (id: number) =>
  row<Post>("SELECT p.*, a.name AS author FROM posts p LEFT JOIN authors a ON a.id = p.author_id WHERE p.id = ?", id);
export const postCategories = (id: number) =>
  rows<Category>("SELECT c.id, c.name, c.parent FROM categories c JOIN post_categories pc ON pc.category_id = c.id WHERE pc.post_id = ?", id);

// everything a post page shows, in one database round trip (cache(): the page and its metadata share it)
export const postBundle = cache(async (id: number) => {
  const [p, c, t, r] = (
    await run([
      stmt("SELECT p.*, a.name AS author FROM posts p LEFT JOIN authors a ON a.id = p.author_id WHERE p.id = ?", id),
      stmt("SELECT c.id, c.name, c.parent FROM categories c JOIN post_categories pc ON pc.category_id = c.id WHERE pc.post_id = ?", id),
      stmt("SELECT t.id, t.name FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ?", id),
      // related: newest other posts sharing a category
      stmt(cards("WHERE p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (SELECT category_id FROM post_categories WHERE post_id = ?)) AND p.id <> ?"), id, id, 4, 0),
    ])
  ).map((x) => x.results);
  return { post: (p[0] as Post) ?? null, cats: c as Category[], tags: t as { id: number; name: string }[], related: r as PostCard[] };
});

// category names for a page of posts in one query (admin list)
export const categoryNames = async (postIds: number[]) => {
  const names = new Map<number, string[]>();
  if (!postIds.length) return names;
  const found = await rows<{ post_id: number; name: string }>(
    `SELECT pc.post_id, c.name FROM post_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.post_id IN (${postIds.map(() => "?").join(",")}) ORDER BY c.name`,
    ...postIds,
  );
  for (const { post_id, name } of found) names.set(post_id, [...(names.get(post_id) ?? []), name]);
  return names;
};

export const categories = cache(() =>
  // n is 1 when the category has posts: an index probe per category instead of counting every link on every page view
  rows<Category & { n: number }>(
    "SELECT c.id, c.name, c.parent, EXISTS(SELECT 1 FROM post_categories pc WHERE pc.category_id = c.id) AS n FROM categories c ORDER BY c.name",
  ),
);

// newest posts for each group of categories, sent as a single batch (direct membership, like the original blocks)
export const inEach = async (groups: number[][], limit: number) =>
  (await run(groups.map((g) => stmt(cards(inGroup(g.length)), ...g, limit, 0)))).map((r) => r.results as PostCard[]);

// a category, tag or author page: its heading, the total and one page of posts, in one round trip
type Listing<H> = { head: H | null; total: number; posts: PostCard[] };
const listing = async <H>(head: Stmt, count: Stmt, list: Stmt): Promise<Listing<H>> => {
  const [h, c, l] = (await run([head, count, list])).map((r) => r.results);
  return { head: (h[0] as H) ?? null, total: (c[0] as { n: number }).n, posts: l as PostCard[] };
};
export const categoryPage = cache((id: number, offset: number) =>
  listing<Category>(
    stmt("SELECT id, name, parent FROM categories WHERE id = ?", id),
    stmt("SELECT COUNT(*) n FROM post_categories WHERE category_id = ?", id),
    stmt(cards("JOIN post_categories pc ON pc.post_id = p.id WHERE pc.category_id = ?"), id, PAGE_SIZE, offset),
  ),
);
export const tagPage = cache((id: number, offset: number) =>
  listing<{ id: number; name: string }>(
    stmt("SELECT id, name FROM tags WHERE id = ?", id),
    stmt("SELECT COUNT(*) n FROM post_tags WHERE tag_id = ?", id),
    stmt(cards("JOIN post_tags pt ON pt.post_id = p.id WHERE pt.tag_id = ?"), id, PAGE_SIZE, offset),
  ),
);
export const authorPage = cache((id: number, offset: number) =>
  listing<{ id: number; name: string }>(
    stmt("SELECT id, name FROM authors WHERE id = ?", id),
    stmt("SELECT COUNT(*) n FROM posts WHERE author_id = ?", id),
    stmt(cards("WHERE p.author_id = ?"), id, PAGE_SIZE, offset),
  ),
);

export const authors = () => rows<{ id: number; name: string }>("SELECT id, name FROM authors ORDER BY name");

// image: undefined = keep the current one, null = remove it, string = new image URL
export type PostInput = { title: string; excerpt: string; content: string; author_id: number; categoryIds: number[]; image?: string | null };
const categoryStatements = (id: number, cats: number[]) => [
  stmt("DELETE FROM post_categories WHERE post_id = ?", id),
  ...cats.map((c) => stmt("INSERT OR IGNORE INTO post_categories VALUES(?,?)", id, c)),
];
export const createPost = async (p: PostInput) => {
  const [{ meta }] = await write([
    stmt("INSERT INTO posts(slug, title, excerpt, content, date, author_id, image) VALUES('', ?, ?, ?, ?, ?, ?)", p.title, p.excerpt, p.content, new Date().toISOString().slice(0, 19), p.author_id, p.image ?? null),
  ]);
  const id = meta.last_row_id;
  await write(categoryStatements(id, p.categoryIds));
  return id;
};
export const updatePost = (id: number, p: PostInput) => {
  const sets = ["title = ?", "excerpt = ?", "content = ?", "author_id = ?"];
  const args: unknown[] = [p.title, p.excerpt, p.content, p.author_id];
  if (p.image !== undefined) {
    sets.push("image = ?");
    args.push(p.image);
  }
  return write([stmt(`UPDATE posts SET ${sets.join(", ")} WHERE id = ?`, ...args, id), ...categoryStatements(id, p.categoryIds)]);
};
export const deletePost = (id: number) =>
  write([
    stmt("DELETE FROM post_categories WHERE post_id = ?", id),
    stmt("DELETE FROM post_tags WHERE post_id = ?", id),
    stmt("DELETE FROM posts WHERE id = ?", id),
  ]);

export const search = (q: string) => {
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  return rows<PostCard>(cards("WHERE p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\'"), like, like, 500, 0);
};

// Old WordPress URLs carry slugs. They are stored percent-encoded and lowercase (as WordPress emitted them); the URL may arrive decoded or encoded.
export const idBySlug = async (table: "posts" | "categories" | "tags" | "authors", slug: string) => {
  let decoded = slug;
  try { decoded = decodeURIComponent(slug); } catch { /* keep as is */ }
  const r = await row<{ id: number }>(`SELECT id FROM ${table} WHERE slug IN (?, ?) LIMIT 1`, slug.toLowerCase(), encodeURIComponent(decoded).toLowerCase());
  return r?.id ?? null;
};
