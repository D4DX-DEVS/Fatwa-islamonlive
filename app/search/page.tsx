import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { search } from "@/lib/db";

export default async function Search({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  return (
    <>
      <BlockTitle>Search{q && `: ${q}`}</BlockTitle>
      {q ? <PostList posts={search(q)} /> : <p className="text-neutral-500">Type a query.</p>}
    </>
  );
}
