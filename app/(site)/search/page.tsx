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
      <BlockTitle eyebrow="Search" count={q ? results.length : undefined}>{q ? q : "Find a fatwa"}</BlockTitle>
      {/* the header box is small on phones, so the page repeats it */}
      <form action="/search" role="search" className="rise mb-8 flex gap-3 [--i:2]">
        <input name="q" defaultValue={q} placeholder="Search fatwas…" aria-label="Search" className="min-w-0 flex-1 rounded-full border border-gold/50 bg-paper px-6 py-3.5 text-lg font-semibold outline-none transition-shadow placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/25" />
        <button className="sheen rounded-full bg-deep px-8 font-extrabold uppercase tracking-[0.15em] text-champagne transition-colors hover:bg-ink">Search</button>
      </form>
      {q ? <PostList posts={results.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)} /> : <p className="text-lg font-semibold text-ink/55">Type a query above.</p>}
      <Pager page={n} last={last} href={(p) => `/search?q=${encodeURIComponent(q)}${p > 1 ? `&page=${p}` : ""}`} />
    </>
  );
}
