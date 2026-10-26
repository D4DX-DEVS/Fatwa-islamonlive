import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { countAll, latest, search } from "@/lib/db";
import { login, logout } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function Admin({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  if (!(await isAdmin())) {
    const error = sp.error;
    return (
      <form action={login} className="max-w-xs space-y-3">
        <h1 className="text-2xl font-bold">Admin</h1>
        {error && <p className="text-red-600">Wrong password.</p>}
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        <button className="rounded bg-emerald-700 px-4 py-2 text-white">Log in</button>
      </form>
    );
  }
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const posts = q ? search(q) : latest(0);
  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Admin ({countAll()} posts)</h1>
        <Link href="/admin/new" className="rounded bg-emerald-700 px-3 py-1 text-white">New post</Link>
        <form action={logout} className="ml-auto"><button className="text-sm underline">Log out</button></form>
      </div>
      <form className="mb-3"><input name="q" defaultValue={q} placeholder="Find a post to edit…" className="w-full rounded border border-neutral-300 px-3 py-1" /></form>
      <p className="mb-2 text-sm text-neutral-500">{q ? `Results for "${q}"` : `Latest ${posts.length}`}</p>
      <ul className="divide-y divide-neutral-200">
        {posts.map((p) => (
          <li key={p.id} className="flex justify-between gap-4 py-2">
            <span>{p.title}</span>
            <Link href={`/admin/${p.id}`} className="text-emerald-700">Edit</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
