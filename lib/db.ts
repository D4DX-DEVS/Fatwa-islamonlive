import { getCloudflareContext } from "@opennextjs/cloudflare";

// Cloudflare D1 (SQLite). The binding is declared in wrangler.jsonc.
const d1 = () => getCloudflareContext().env.DB;
const rows = async <T>(sql: string, ...args: unknown[]) => (await d1().prepare(sql).bind(...args).all<T>()).results;
const row = <T>(sql: string, ...args: unknown[]) => d1().prepare(sql).bind(...args).first<T>();

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

export type PostInput = { title: string; excerpt: string; content: string; author_id: number; categoryIds: number[] };
const categoryStatements = (id: number, cats: number[]) => [
  d1().prepare("DELETE FROM post_categories WHERE post_id = ?").bind(id),
  ...cats.map((c) => d1().prepare("INSERT OR IGNORE INTO post_categories VALUES(?,?)").bind(id, c)),
];
export const createPost = async (p: PostInput) => {
  const { meta } = await d1()
    .prepare("INSERT INTO posts(slug, title, excerpt, content, date, author_id) VALUES('', ?, ?, ?, ?, ?)")
    .bind(p.title, p.excerpt, p.content, new Date().toISOString().slice(0, 19), p.author_id)
    .run();
  const id = meta.last_row_id;
  await d1().batch(categoryStatements(id, p.categoryIds));
  return id;
};
export const updatePost = (id: number, p: PostInput) =>
  d1().batch([
    d1().prepare("UPDATE posts SET title = ?, excerpt = ?, content = ?, author_id = ? WHERE id = ?").bind(p.title, p.excerpt, p.content, p.author_id, id),
    ...categoryStatements(id, p.categoryIds),
  ]);
export const deletePost = (id: number) =>
  d1().batch([
    d1().prepare("DELETE FROM post_categories WHERE post_id = ?").bind(id),
    d1().prepare("DELETE FROM post_tags WHERE post_id = ?").bind(id),
    d1().prepare("DELETE FROM posts WHERE id = ?").bind(id),
  ]);

export const search = (q: string) => {
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  return rows<PostCard>(`${LIST} WHERE p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\' ORDER BY p.date DESC LIMIT 50`, like, like);
};
