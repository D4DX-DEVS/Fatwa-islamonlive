import PostList from "@/components/PostList";
import { search } from "@/lib/db";

export default async function Search({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">Search{q && `: ${q}`}</h1>
      {q ? <PostList posts={search(q)} /> : <p className="text-neutral-500">Type a query.</p>}
    </>
  );
}
