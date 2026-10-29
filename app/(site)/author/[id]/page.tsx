import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager, { parsePage } from "@/components/Pager";
import PostList from "@/components/PostList";
import { PAGE_SIZE, author, byAuthor } from "@/lib/db";

const href = (id: number) => (n: number) => (n === 1 ? `/author/${id}` : `/author/${id}?page=${n}`);

export async function generateMetadata({ params, searchParams }: PageProps<"/author/[id]">): Promise<Metadata> {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page) || 1;
  return { title: (await author(id))?.name, alternates: { canonical: href(id)(n) } };
}

export default async function Author({ params, searchParams }: PageProps<"/author/[id]">) {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page);
  const a = await author(id);
  if (!a || !n) notFound();
  const posts = await byAuthor(id);
  const last = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  if (n > last) notFound();
  return (
    <>
      <BlockTitle count={posts.length}>{a.name}</BlockTitle>
      <PostList posts={posts.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)} />
      <Pager page={n} last={last} href={href(id)} />
    </>
  );
}
