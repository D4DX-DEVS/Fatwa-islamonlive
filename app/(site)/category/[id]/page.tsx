import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager, { parsePage } from "@/components/Pager";
import PostList from "@/components/PostList";
import { PAGE_SIZE, byCategory, category } from "@/lib/db";

const href = (id: number) => (n: number) => (n === 1 ? `/category/${id}` : `/category/${id}?page=${n}`);

export async function generateMetadata({ params, searchParams }: PageProps<"/category/[id]">): Promise<Metadata> {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page) || 1;
  return { title: (await category(id))?.name, alternates: { canonical: href(id)(n) } };
}

export default async function Category({ params, searchParams }: PageProps<"/category/[id]">) {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page);
  const c = await category(id);
  if (!c || !n) notFound();
  const posts = await byCategory(id);
  const last = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  if (n > last) notFound();
  return (
    <>
      <BlockTitle count={posts.length}>{c.name}</BlockTitle>
      <PostList posts={posts.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)} />
      <Pager page={n} last={last} href={href(id)} />
    </>
  );
}
