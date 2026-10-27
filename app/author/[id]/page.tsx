import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import PostList from "@/components/PostList";
import { author, authorIds, byAuthor } from "@/lib/db";

export const generateStaticParams = () => authorIds().map((id) => ({ id }));

export async function generateMetadata({ params }: PageProps<"/author/[id]">): Promise<Metadata> {
  return { title: author(Number((await params).id))?.name };
}

export default async function Author({ params }: PageProps<"/author/[id]">) {
  const id = Number((await params).id);
  const a = author(id);
  if (!a) notFound();
  return (
    <>
      <BlockTitle>{a.name}</BlockTitle>
      <PostList posts={byAuthor(id)} />
    </>
  );
}
