import Link from "next/link";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { PAGE_SIZE, countAll, latest } from "@/lib/db";

export function generateStaticParams() {
  return Array.from({ length: Math.ceil(countAll() / PAGE_SIZE) }, (_, i) => ({ n: String(i + 1) }));
}

export default async function Page({ params }: PageProps<"/page/[n]">) {
  const n = Number((await params).n);
  const last = Math.ceil(countAll() / PAGE_SIZE);
  if (!Number.isInteger(n) || n < 1 || n > last) notFound();
  return (
    <>
      <BlockTitle>Page {n}</BlockTitle>
      <PostList posts={latest((n - 1) * PAGE_SIZE)} />
      <p className="mt-4 flex gap-4 text-sm text-emerald-700">
        {n > 1 && <Link href={n === 2 ? "/" : `/page/${n - 1}`}>← Newer</Link>}
        {n < last && <Link href={`/page/${n + 1}`}>Older →</Link>}
      </p>
    </>
  );
}
