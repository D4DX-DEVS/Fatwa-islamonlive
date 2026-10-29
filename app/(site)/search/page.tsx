import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager, { parsePage } from "@/components/Pager";
import PostList from "@/components/PostList";
import { PAGE_SIZE, search } from "@/lib/db";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function Search({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const n = parsePage(sp.page);
  const results = q ? await search(q) : [];
  const last = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  if (!n || n > last) notFound();
  return (
    <>
      <BlockTitle count={q ? results.length : undefined}>{q ? `Search: ${q}` : "Search"}</BlockTitle>
      {/* the header box is small on phones, so the page repeats it */}
      <form action="/search" role="search" className="mb-5 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search fatwas…" aria-label="Search" className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
        <button className="rounded-xl bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-dark">Search</button>
      </form>
      {q ? <PostList posts={results.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)} /> : <p className="text-neutral-500">Type a query above.</p>}
      <Pager page={n} last={last} href={(p) => `/search?q=${encodeURIComponent(q)}${p > 1 ? `&page=${p}` : ""}`} />
    </>
  );
}
