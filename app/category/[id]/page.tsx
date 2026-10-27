import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { byCategory, categoryIds, category } from "@/lib/db";

export const generateStaticParams = () => categoryIds().map((id) => ({ id }));

export async function generateMetadata({ params }: PageProps<"/category/[id]">): Promise<Metadata> {
  return { title: category(Number((await params).id))?.name };
}

export default async function Category({ params }: PageProps<"/category/[id]">) {
  const id = Number((await params).id);
  const c = category(id);
  if (!c) notFound();
  return (
    <>
      <BlockTitle>{c.name}</BlockTitle>
      <PostList posts={byCategory(id)} />
    </>
  );
}
