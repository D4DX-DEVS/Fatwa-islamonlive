import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { byTag, tag } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/tag/[id]">): Promise<Metadata> {
  const t = await tag(Number((await params).id));
  return { title: t && `#${t.name}` };
}

export default async function Tag({ params }: PageProps<"/tag/[id]">) {
  const id = Number((await params).id);
  const t = await tag(id);
  if (!t) notFound();
  return (
    <>
      <BlockTitle>#{t.name}</BlockTitle>
      <PostList posts={await byTag(id)} />
    </>
  );
}
