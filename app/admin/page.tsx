import type { Metadata } from "next";
import Link from "@/components/Link";
import { isAdmin } from "@/lib/auth";
import { PAGE_SIZE, categoryNames, countAll, latest, search } from "@/lib/db";
import { login } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

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
  const total = await countAll();
  const last = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(last, Math.max(1, Math.trunc(Number(sp.page)) || 1));
  const posts = await (q ? search(q) : latest((page - 1) * PAGE_SIZE));
  const cats = await categoryNames(posts.map((p) => p.id));
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Posts</h1>
        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{total}</span>
        <Link href="/admin/new" className="ml-auto rounded-lg bg-deep px-4 py-2 text-sm font-semibold text-white hover:bg-jade">+ New post</Link>
      </div>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search posts by title or text…" aria-label="Search posts" className={field} />
        <button className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-100">Search</button>
        {q && <Link href="/admin" className="flex shrink-0 items-center px-2 text-sm text-slate-500 hover:text-slate-900">Clear</Link>}
      </form>
      <p className="mb-2 text-sm text-slate-500">{q ? `${posts.length} result${posts.length === 1 ? "" : "s"} for “${q}”` : `Page ${page} of ${last}`}</p>
      {posts.length ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-slate-50">
              <div className="min-w-0 basis-full break-words sm:flex-1 sm:basis-0">
                <Link href={`/admin/${p.id}`} className="font-medium hover:text-deep">{p.title}</Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {[p.date.slice(0, 10), p.author, cats.get(p.id)?.join(", ")].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Link href={`/post/${p.id}`} target="_blank" className="shrink-0 py-2 text-sm text-slate-500 hover:text-slate-900">View ↗</Link>
              <Link href={`/admin/${p.id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold hover:bg-white">Edit</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">No posts found.</p>
      )}
      {!q && last > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={`/admin?page=${page - 1}`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold hover:bg-slate-100">← Newer</Link> : <span />}
          {page < last ? <Link href={`/admin?page=${page + 1}`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold hover:bg-slate-100">Older →</Link> : <span />}
        </div>
      )}
    </>
  );
}
