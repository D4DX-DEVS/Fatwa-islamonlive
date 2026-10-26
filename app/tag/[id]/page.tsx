import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import { byTag, tag, tagIds } from "@/lib/db";

export const generateStaticParams = () => tagIds().map((id) => ({ id }));

export default async function Tag({ params }: PageProps<"/tag/[id]">) {
  const id = Number((await params).id);
  const t = tag(id);
  if (!t) notFound();
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">#{t.name}</h1>
      <PostList posts={byTag(id)} />
    </>
  );
}
