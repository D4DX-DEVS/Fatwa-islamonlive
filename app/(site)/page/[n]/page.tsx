import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { PAGE_SIZE, countAll, latest } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/page/[n]">): Promise<Metadata> {
  return { title: `Page ${(await params).n}` };
}

const href = (n: number) => (n === 1 ? "/" : `/page/${n}`);

// 1 … n-2 n-1 [n] n+1 n+2 … last
function windowed(n: number, last: number) {
  const pages = [...new Set([1, n - 2, n - 1, n, n + 1, n + 2, last].filter((x) => x >= 1 && x <= last))].sort((a, b) => a - b);
  return pages.flatMap((x, i) => (i && x - pages[i - 1] > 1 ? [`gap${x}`, x] : [x]));
}

export default async function Page({ params }: PageProps<"/page/[n]">) {
  const n = Number((await params).n);
  const last = Math.ceil((await countAll()) / PAGE_SIZE);
  if (!Number.isInteger(n) || n < 1 || n > last) notFound();
  const cell = "grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold ring-1 ring-black/10 transition-colors";
  return (
    <>
      <BlockTitle>All posts</BlockTitle>
      <PostList posts={await latest((n - 1) * PAGE_SIZE)} />
      <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {n > 1 && <Link href={href(n - 1)} className={`${cell} bg-white hover:bg-brand-soft`}>← Newer</Link>}
        {windowed(n, last).map((x) =>
          typeof x === "string" ? <span key={x} className="px-1 text-neutral-400">…</span>
          : x === n ? <span key={x} aria-current="page" className={`${cell} bg-brand text-white ring-brand`}>{x}</span>
          : <Link key={x} href={href(x)} className={`${cell} bg-white hover:bg-brand-soft`}>{x}</Link>,
        )}
        {n < last && <Link href={`/page/${n + 1}`} className={`${cell} bg-white hover:bg-brand-soft`}>Older →</Link>}
      </nav>
    </>
  );
}
