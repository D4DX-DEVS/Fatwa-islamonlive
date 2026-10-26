import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import { author, authorIds, byAuthor } from "@/lib/db";

export const generateStaticParams = () => authorIds().map((id) => ({ id }));

export default async function Author({ params }: PageProps<"/author/[id]">) {
  const id = Number((await params).id);
  const a = author(id);
  if (!a) notFound();
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">{a.name}</h1>
      <PostList posts={byAuthor(id)} />
    </>
  );
}
