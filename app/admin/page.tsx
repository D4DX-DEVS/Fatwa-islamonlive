import type { Metadata } from "next";
import Link from "@/components/Link";
import { isAdmin } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";
import { PAGE_SIZE, categories, categoryNames, categoryPage, countAll, latest, search } from "@/lib/db";
import { login, remove } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const ctl = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-deep focus:ring-2 focus:ring-deep/20";
const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-deep focus:ring-2 focus:ring-deep/20";

export default async function Admin({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  if (!(await isAdmin())) {
    return (
      <form action={login} className="mx-auto mt-12 w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Sign in</h1>
          <p className="text-sm text-slate-500">Enter the admin password to manage posts.</p>
        </div>
        {sp.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Wrong password. Try again.</p>}
        <input name="password" type="password" placeholder="Password" aria-label="Password" required autoFocus className={field} />
        <button className="w-full rounded-lg bg-deep px-4 py-2 font-semibold text-white hover:bg-jade">Sign in</button>
      </form>
    );
  }
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = Math.trunc(Number(sp.cat)) || 0;
  const cats = await categories();
  const filtered = cat ? await categoryPage(cat, 0) : null;
  const total = filtered ? filtered.total : await countAll();
  const last = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(last, Math.max(1, Math.trunc(Number(sp.page)) || 1));
  const posts = q ? await search(q) : cat ? (await categoryPage(cat, (page - 1) * PAGE_SIZE)).posts : await latest((page - 1) * PAGE_SIZE);
  const names = await categoryNames(posts.map((p) => p.id));
  const href = (n: number) => `/admin?${new URLSearchParams({ ...(cat && { cat: String(cat) }), page: String(n) })}`;
  const btn = "inline-flex min-h-10 shrink-0 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold hover:bg-slate-100";
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Posts</h1>
        <span className="text-slate-500">({total})</span>
        <Link href="/admin/new" className="ml-auto inline-flex min-h-11 items-center rounded-lg border border-deep px-4 text-sm font-semibold text-deep hover:bg-deep hover:text-white">+ New post</Link>
      </div>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search title or text…" aria-label="Search posts" className={`${ctl} min-h-10 min-w-0 flex-1 basis-56 sm:flex-none sm:basis-72`} />
        <select name="cat" defaultValue={cat || ""} aria-label="Category" className={`${ctl} min-h-10 max-w-full`}>
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className={btn}>Filter</button>
        {(q || cat > 0) && <Link href="/admin" className="flex min-h-10 shrink-0 items-center px-2 text-sm text-slate-500 hover:text-slate-900">Clear</Link>}
      </form>
      {posts.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left max-md:block">
            <thead className="bg-slate-50 text-sm text-slate-500 max-md:hidden">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Date</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 max-md:block">
              {posts.map((p) => (
                <tr key={p.id} className="align-middle hover:bg-slate-50 max-md:block">
                  <td className="px-4 py-3 max-md:block max-md:pb-1 md:w-[46%] md:max-w-0">
                    <Link href={`/admin/${p.id}`} className="line-clamp-2 break-words font-medium hover:text-deep">{p.title}</Link>
                    <p className="mt-0.5 text-xs text-slate-500 md:hidden">{[p.date.slice(0, 10), names.get(p.id)?.join(", ")].filter(Boolean).join(" · ")}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 md:table-cell">{names.get(p.id)?.join(", ")}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-600 md:table-cell">{p.date.slice(0, 10)}</td>
                  <td className="px-4 py-3 max-md:block max-md:pt-1">
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Link href={`/admin/${p.id}`} className={btn}>Edit</Link>
                      <Link href={`/post/${p.id}`} target="_blank" className={btn}>View</Link>
                      <DeleteButton action={remove.bind(null, p.id)} label="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">No posts found.</p>
      )}
      {!q && last > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          {page > 1 ? <Link href={href(page - 1)} className={btn}>← Newer</Link> : <span />}
          <span className="text-slate-500">Page {page} of {last}</span>
          {page < last ? <Link href={href(page + 1)} className={btn}>Older →</Link> : <span />}
        </div>
      )}
      {q && <p className="mt-3 text-sm text-slate-500">{posts.length} result{posts.length === 1 ? "" : "s"} for “{q}”</p>}
    </div>
  );
}
