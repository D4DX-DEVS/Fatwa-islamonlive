import { save, remove } from "@/app/admin/actions";
import { authors, categories, type Post } from "@/lib/db";

const input = "w-full rounded border border-neutral-300 px-3 py-2";
const ERRORS: Record<string, string> = {
  required: "Title and content are required.",
  size: "Image must be under 5 MB.",
  type: "Only JPG, PNG, GIF or WebP images are allowed.",
};

export default async function PostForm({ post, selected = [], error }: { post?: Post; selected?: number[]; error?: string }) {
  const [authorList, categoryList] = await Promise.all([authors(), categories()]);
  return (
    <>
      <form action={save.bind(null, post?.id ?? null)} className="space-y-4">
        {error && <p className="text-red-600">{ERRORS[error] ?? "Something went wrong."}</p>}
        <label className="block">Title<input name="title" defaultValue={post?.title} required className={input} /></label>
        <label className="block">Excerpt<textarea name="excerpt" defaultValue={post?.excerpt} rows={2} className={input} /></label>
        <label className="block">Content (HTML)<textarea name="content" defaultValue={post?.content} required rows={16} className={`${input} font-mono text-sm`} /></label>
        <div>
          <label className="block">Featured image (JPG, PNG, GIF or WebP, up to 5 MB)
            <input type="file" name="image" accept="image/jpeg,image/png,image/gif,image/webp" className="mt-1 block text-sm" />
          </label>
          {post?.image && (
            <div className="mt-2 flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt="" className="h-16 w-24 rounded object-cover" />
              <label><input type="checkbox" name="remove_image" /> Remove current image</label>
            </div>
          )}
        </div>
        <label className="block">Author
          <select name="author_id" defaultValue={post?.author_id} className={input}>
            {authorList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <legend className="mb-1">Categories</legend>
          {categoryList.map((c) => (
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
