import type { Metadata } from "next";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { search } from "@/lib/db";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function Search({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  return (
    <>
      <BlockTitle>Search{q && `: ${q}`}</BlockTitle>
      {q ? <PostList posts={await search(q)} /> : <p className="text-neutral-500">Type a query.</p>}
    </>
  );
}
