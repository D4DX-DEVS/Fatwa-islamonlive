import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

const db = new DatabaseSync(join(process.cwd(), "data", "fatwa.db"));

export type Post = { id: number; title: string; excerpt: string; content: string; date: string; author_id: number; author: string | null; image: string | null };
export type Category = { id: number; name: string; parent: number };
export type PostCard = Pick<Post, "id" | "title" | "excerpt" | "date" | "image" | "author">;

const LIST = `SELECT p.id, p.title, p.excerpt, p.date, p.image, a.name AS author FROM posts p LEFT JOIN authors a ON a.id = p.author_id`;

export const PAGE_SIZE = 20;

export const latest = (offset = 0) =>
  db.prepare(`${LIST} ORDER BY p.date DESC LIMIT ? OFFSET ?`).all(PAGE_SIZE, offset) as PostCard[];
export const countAll = () => (db.prepare("SELECT COUNT(*) n FROM posts").get() as { n: number }).n;

const ids = (table: string) => (db.prepare(`SELECT id FROM ${table}`).all() as { id: number }[]).map((r) => String(r.id));
export const postIds = () => ids("posts");
export const categoryIds = () => ids("categories");
export const authorIds = () => ids("authors");

export const post = (id: number) =>
  db.prepare("SELECT p.*, a.name AS author FROM posts p LEFT JOIN authors a ON a.id = p.author_id WHERE p.id = ?").get(id) as Post | undefined;
export const postCategories = (id: number) =>
  db.prepare("SELECT c.id, c.name, c.parent FROM categories c JOIN post_categories pc ON pc.category_id = c.id WHERE pc.post_id = ?").all(id) as Category[];

export const categories = () =>
  db.prepare("SELECT c.id, c.name, c.parent, (SELECT COUNT(*) FROM post_categories WHERE category_id = c.id) AS n FROM categories c ORDER BY c.name").all() as (Category & { n: number })[];
export const category = (id: number) => db.prepare("SELECT id, name, parent FROM categories WHERE id = ?").get(id) as Category | undefined;
export const byCategory = (id: number) =>
  db.prepare(`${LIST} JOIN post_categories pc ON pc.post_id = p.id WHERE pc.category_id = ? ORDER BY p.date DESC`).all(id) as PostCard[];

// newest posts across the given categories (direct membership, like the original blocks)
export const inCategories = (ids: number[], limit: number) =>
  db
    .prepare(
      `${LIST} WHERE p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (${ids.map(() => "?").join(",")})) ORDER BY p.date DESC LIMIT ?`,
    )
    .all(...ids, limit) as PostCard[];

export const tags = (postId: number) =>
  db.prepare("SELECT t.id, t.name FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ?").all(postId) as { id: number; name: string }[];
export const tag = (id: number) => db.prepare("SELECT id, name FROM tags WHERE id = ?").get(id) as { id: number; name: string } | undefined;
export const tagIds = () => ids("tags");
export const byTag = (id: number) =>
  db.prepare(`${LIST} JOIN post_tags pt ON pt.post_id = p.id WHERE pt.tag_id = ? ORDER BY p.date DESC`).all(id) as PostCard[];

export const authors = () => db.prepare("SELECT id, name FROM authors ORDER BY name").all() as { id: number; name: string }[];

export type PostInput = { title: string; excerpt: string; content: string; author_id: number; categoryIds: number[] };
const setCategories = (id: number, cats: number[]) => {
  db.prepare("DELETE FROM post_categories WHERE post_id = ?").run(id);
  for (const c of cats) db.prepare("INSERT OR IGNORE INTO post_categories VALUES(?,?)").run(id, c);
};
export const createPost = (p: PostInput) => {
  const id = Number(
    db.prepare("INSERT INTO posts(slug, title, excerpt, content, date, author_id) VALUES('', ?, ?, ?, ?, ?)")
      .run(p.title, p.excerpt, p.content, new Date().toISOString().slice(0, 19), p.author_id).lastInsertRowid,
  );
  setCategories(id, p.categoryIds);
  return id;
};
export const updatePost = (id: number, p: PostInput) => {
  db.prepare("UPDATE posts SET title = ?, excerpt = ?, content = ?, author_id = ? WHERE id = ?").run(p.title, p.excerpt, p.content, p.author_id, id);
  setCategories(id, p.categoryIds);
};
export const deletePost = (id: number) => {
  db.prepare("DELETE FROM post_categories WHERE post_id = ?").run(id);
  db.prepare("DELETE FROM post_tags WHERE post_id = ?").run(id);
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
};

export const author = (id: number) => db.prepare("SELECT id, name FROM authors WHERE id = ?").get(id) as { id: number; name: string } | undefined;
export const byAuthor = (id: number) => db.prepare(`${LIST} WHERE p.author_id = ? ORDER BY p.date DESC`).all(id) as PostCard[];

export const search = (q: string) => {
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  return db
    .prepare(`${LIST} WHERE p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\' ORDER BY p.date DESC LIMIT 50`)
    .all(like, like) as PostCard[];
};
