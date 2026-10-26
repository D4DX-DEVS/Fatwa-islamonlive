import { save, remove } from "@/app/admin/actions";
import { authors, categories, type Post } from "@/lib/db";

const input = "w-full rounded border border-neutral-300 px-3 py-2";

export default function PostForm({ post, selected = [], error }: { post?: Post; selected?: number[]; error?: boolean }) {
  return (
    <>
      <form action={save.bind(null, post?.id ?? null)} className="space-y-4">
        {error && <p className="text-red-600">Title and content are required.</p>}
        <label className="block">Title<input name="title" defaultValue={post?.title} required className={input} /></label>
        <label className="block">Excerpt<textarea name="excerpt" defaultValue={post?.excerpt} rows={2} className={input} /></label>
        <label className="block">Content (HTML)<textarea name="content" defaultValue={post?.content} required rows={16} className={`${input} font-mono text-sm`} /></label>
        <label className="block">Author
          <select name="author_id" defaultValue={post?.author_id} className={input}>
            {authors().map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <legend className="mb-1">Categories</legend>
          {categories().map((c) => (
            <label key={c.id}><input type="checkbox" name="categories" value={c.id} defaultChecked={selected.includes(c.id)} /> {c.name}</label>
          ))}
        </fieldset>
        <button className="rounded bg-emerald-700 px-4 py-2 text-white">Save</button>
      </form>
      {post && (
        <form action={remove.bind(null, post.id)} className="mt-6">
          <button className="text-sm text-red-600 underline">Delete this post</button>
        </form>
      )}
    </>
  );
}
