import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { byCategory, category } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/category/[id]">): Promise<Metadata> {
  return { title: (await category(Number((await params).id)))?.name };
}

export default async function Category({ params }: PageProps<"/category/[id]">) {
  const id = Number((await params).id);
  const c = await category(id);
  if (!c) notFound();
  const posts = await byCategory(id);
  return (
    <>
      <BlockTitle count={posts.length}>{c.name}</BlockTitle>
      <PostList posts={posts} />
    </>
  );
}
