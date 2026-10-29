import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { author, byAuthor } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/author/[id]">): Promise<Metadata> {
  return { title: (await author(Number((await params).id)))?.name };
}

export default async function Author({ params }: PageProps<"/author/[id]">) {
  const id = Number((await params).id);
  const a = await author(id);
  if (!a) notFound();
  const posts = await byAuthor(id);
  return (
    <>
      <BlockTitle count={posts.length}>{a.name}</BlockTitle>
      <PostList posts={posts} />
    </>
  );
}
