import { updateTag } from "next/cache";

// On Vercel the data lives in Cloudflare D1, reached over its REST API. In dev (no VERCEL, unless REMOTE_DB=1)
// a private SQLite copy of data/fatwa.db is used, so local tests never touch live data.
export const remote = !!process.env.VERCEL || process.env.REMOTE_DB === "1";

type Stmt = { sql: string; params: unknown[] };
type Result = { results: Record<string, unknown>[]; meta: { last_row_id: number } };

let sqlite: import("node:sqlite").DatabaseSync | undefined;
async function local(stmts: Stmt[]): Promise<Result[]> {
  if (!sqlite) {
    const { DatabaseSync } = await import("node:sqlite");
    const { copyFileSync, existsSync } = await import("node:fs");
    if (!existsSync(".dev.db")) copyFileSync("data/fatwa.db", ".dev.db");
    sqlite = new DatabaseSync(".dev.db");
  }
  const db = sqlite;
  const exec = (s: Stmt): Result => {
    const q = db.prepare(s.sql);
    if (/^\s*select/i.test(s.sql)) return { results: q.all(...(s.params as never[])) as Record<string, unknown>[], meta: { last_row_id: 0 } };
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

// Reads are cached by Next (tag "db") until an admin write expires the tag; a batch runs as one transaction.
async function run(stmts: Stmt[], write = false): Promise<Result[]> {
  if (!remote) return local(stmts);
  const { CLOUDFLARE_ACCOUNT_ID: account, D1_DATABASE_ID: database, CLOUDFLARE_API_TOKEN: token } = process.env;
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(stmts.length === 1 ? stmts[0] : { batch: stmts }),
    ...(write ? { cache: "no-store" } : { next: { revalidate: 3600, tags: ["db"] } }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  return json.result;
}
const write = async (stmts: Stmt[]) => {
  const out = await run(stmts, true);
  updateTag("db"); // only called from server actions, so the next read is fresh
  return out;
};

const rows = async <T>(sql: string, ...params: unknown[]) => (await run([{ sql, params }]))[0].results as T[];
const row = async <T>(sql: string, ...params: unknown[]) => (await rows<T>(sql, ...params))[0] ?? null;
const stmt = (sql: string, ...params: unknown[]): Stmt => ({ sql, params });

export type Post = { id: number; title: string; excerpt: string; content: string; date: string; author_id: number; author: string | null; image: string | null };
export type Category = { id: number; name: string; parent: number };
export type PostCard = Pick<Post, "id" | "title" | "excerpt" | "date" | "image" | "author">;

const LIST = `SELECT p.id, p.title, p.excerpt, p.date, p.image, a.name AS author FROM posts p LEFT JOIN authors a ON a.id = p.author_id`;

export const PAGE_SIZE = 20;

export const latest = (offset = 0) => rows<PostCard>(`${LIST} ORDER BY p.date DESC LIMIT ? OFFSET ?`, PAGE_SIZE, offset);
export const countAll = async () => (await row<{ n: number }>("SELECT COUNT(*) n FROM posts"))!.n;

const ids = async (table: string) => (await rows<{ id: number }>(`SELECT id FROM ${table}`)).map((r) => String(r.id));
export const postIds = () => ids("posts");
export const categoryIds = () => ids("categories");

export const post = (id: number) =>
  row<Post>("SELECT p.*, a.name AS author FROM posts p LEFT JOIN authors a ON a.id = p.author_id WHERE p.id = ?", id);
export const postCategories = (id: number) =>
  rows<Category>("SELECT c.id, c.name, c.parent FROM categories c JOIN post_categories pc ON pc.category_id = c.id WHERE pc.post_id = ?", id);

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

export const categories = () =>
  rows<Category & { n: number }>(
    "SELECT c.id, c.name, c.parent, COUNT(pc.post_id) AS n FROM categories c LEFT JOIN post_categories pc ON pc.category_id = c.id GROUP BY c.id ORDER BY c.name",
  );
export const category = (id: number) => row<Category>("SELECT id, name, parent FROM categories WHERE id = ?", id);
export const byCategory = (id: number) =>
  rows<PostCard>(`${LIST} JOIN post_categories pc ON pc.post_id = p.id WHERE pc.category_id = ? ORDER BY p.date DESC`, id);

// newest posts across the given categories (direct membership, like the original blocks)
export const inCategories = (catIds: number[], limit: number) =>
  rows<PostCard>(
    `${LIST} WHERE p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (${catIds.map(() => "?").join(",")})) ORDER BY p.date DESC LIMIT ?`,
    ...catIds,
    limit,
  );

export const tags = (postId: number) =>
  rows<{ id: number; name: string }>("SELECT t.id, t.name FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ?", postId);
export const tag = (id: number) => row<{ id: number; name: string }>("SELECT id, name FROM tags WHERE id = ?", id);
export const byTag = (id: number) =>
  rows<PostCard>(`${LIST} JOIN post_tags pt ON pt.post_id = p.id WHERE pt.tag_id = ? ORDER BY p.date DESC`, id);

export const authors = () => rows<{ id: number; name: string }>("SELECT id, name FROM authors ORDER BY name");
export const author = (id: number) => row<{ id: number; name: string }>("SELECT id, name FROM authors WHERE id = ?", id);
export const byAuthor = (id: number) => rows<PostCard>(`${LIST} WHERE p.author_id = ? ORDER BY p.date DESC`, id);

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
  return rows<PostCard>(`${LIST} WHERE p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\' ORDER BY p.date DESC LIMIT 500`, like, like);
};

// slugs are stored percent-encoded and lowercase (as WordPress emitted them); the URL may arrive decoded or encoded
export const postIdBySlug = async (slug: string) => {
  let decoded = slug;
  try { decoded = decodeURIComponent(slug); } catch { /* keep as is */ }
  const r = await row<{ id: number }>("SELECT id FROM posts WHERE slug IN (?, ?) LIMIT 1", slug.toLowerCase(), encodeURIComponent(decoded).toLowerCase());
  return r?.id ?? null;
};
