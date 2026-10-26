import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import { byCategory, categoryIds, category } from "@/lib/db";

export const generateStaticParams = () => categoryIds().map((id) => ({ id }));

export default async function Category({ params }: PageProps<"/category/[id]">) {
  const id = Number((await params).id);
  const c = category(id);
  if (!c) notFound();
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">{c.name}</h1>
      <PostList posts={byCategory(id)} />
    </>
  );
}
