import Link from "@/components/Link";
import { save, remove } from "@/app/admin/actions";
import DeleteButton from "@/components/DeleteButton";
import { authors, categories, type Post } from "@/lib/db";

const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-deep focus:ring-2 focus:ring-deep/20";
const card = "min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
const label = "block text-sm font-semibold text-slate-700";
const ERRORS: Record<string, string> = {
  required: "Title and content are required.",
  size: "Image must be under 4 MB.",
  type: "Only JPG, PNG, GIF or WebP images are allowed.",
};

export default async function PostForm({ post, selected = [], error, saved }: { post?: Post; selected?: number[]; error?: string; saved?: boolean }) {
  const [authorList, categoryList] = await Promise.all([authors(), categories()]);
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/admin" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-100">← Back to posts</Link>
        <h1 className="text-xl font-bold">{post ? "Edit post" : "New post"}</h1>
        {post && <Link href={`/post/${post.id}`} target="_blank" className="ml-auto text-sm text-slate-500 hover:text-slate-900">View post ↗</Link>}
      </div>
      {saved && <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">Saved. Your changes are live.</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{ERRORS[error] ?? "Something went wrong."}</p>}
      <form action={save.bind(null, post?.id ?? null)}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className={`${card} space-y-4`}>
            <label className={label}>Title
              <input name="title" defaultValue={post?.title} required className={`${input} text-base font-semibold`} />
            </label>
            <label className={label}>Excerpt <span className="font-normal text-slate-400">(short summary, optional)</span>
              <textarea name="excerpt" defaultValue={post?.excerpt} rows={2} className={input} />
            </label>
            <label className={label}>Content <span className="font-normal text-slate-400">(HTML)</span>
              <textarea name="content" defaultValue={post?.content} required rows={18} className={`${input} font-mono`} />
            </label>
          </div>
          <div className="space-y-5">
            <div className={card}>
              <label className={label}>Featured image
                <input type="file" name="image" accept="image/jpeg,image/png,image/gif,image/webp" className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-semibold hover:file:bg-slate-200" />
              </label>
              <p className="mt-1 text-xs text-slate-400">JPG, PNG, GIF or WebP, up to 4 MB.</p>
              {post?.image && (
                <div className="mt-3 space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt="" className="h-32 w-full rounded-lg object-cover" />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="remove_image" /> Remove current image</label>
                </div>
              )}
            </div>
            <div className={card}>
              <label className={label}>Author
                <select name="author_id" defaultValue={post?.author_id} className={input}>
                  {authorList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
            </div>
            <fieldset className={card}>
              <legend className="sr-only">Categories</legend>
              <p className={label}>Categories</p>
              <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1 text-sm">
                {categoryList.map((c) => (
                  <label key={c.id} className="flex items-center gap-2"><input type="checkbox" name="categories" value={c.id} defaultChecked={selected.includes(c.id)} /> {c.name}</label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
        <div className="sticky bottom-0 -mx-4 mt-5 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <Link href="/admin" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Cancel</Link>
          <button className="rounded-lg bg-deep px-6 py-2 font-semibold text-white hover:bg-jade">Save</button>
        </div>
      </form>
      {post && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-white p-4">
          <p className="text-sm text-slate-500">Permanently remove this post and its image.</p>
          <DeleteButton action={remove.bind(null, post.id)} />
        </div>
      )}
    </>
  );
}
