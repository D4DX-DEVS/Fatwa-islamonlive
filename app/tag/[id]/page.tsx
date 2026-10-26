import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { byTag, tag, tagIds } from "@/lib/db";

export const generateStaticParams = () => tagIds().map((id) => ({ id }));

export default async function Tag({ params }: PageProps<"/tag/[id]">) {
  const id = Number((await params).id);
  const t = tag(id);
  if (!t) notFound();
  return (
    <>
      <BlockTitle>#{t.name}</BlockTitle>
      <PostList posts={byTag(id)} />
    </>
  );
}
