import type { Metadata } from "next";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { search } from "@/lib/db";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function Search({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const results = q ? await search(q) : [];
  return (
    <>
      <BlockTitle count={q ? results.length : undefined}>{q ? `Search: ${q}` : "Search"}</BlockTitle>
      {/* the header box is small on phones, so the page repeats it */}
      <form action="/search" role="search" className="mb-5 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search fatwas…" aria-label="Search" className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
        <button className="rounded-xl bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-dark">Search</button>
      </form>
      {q ? <PostList posts={results} /> : <p className="text-neutral-500">Type a query above.</p>}
    </>
  );
}
