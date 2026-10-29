import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager, { parsePage } from "@/components/Pager";
import PostList from "@/components/PostList";
import { PAGE_SIZE, byTag, tag } from "@/lib/db";

const href = (id: number) => (n: number) => (n === 1 ? `/tag/${id}` : `/tag/${id}?page=${n}`);

export async function generateMetadata({ params, searchParams }: PageProps<"/tag/[id]">): Promise<Metadata> {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page) || 1;
  const t = await tag(id);
  return { title: t && `#${t.name}`, alternates: { canonical: href(id)(n) } };
}

export default async function Tag({ params, searchParams }: PageProps<"/tag/[id]">) {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page);
  const t = await tag(id);
  if (!t || !n) notFound();
  const posts = await byTag(id);
  const last = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  if (n > last) notFound();
  return (
    <>
      <BlockTitle count={posts.length}>#{t.name}</BlockTitle>
      <PostList posts={posts.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)} />
      <Pager page={n} last={last} href={href(id)} />
    </>
  );
}
