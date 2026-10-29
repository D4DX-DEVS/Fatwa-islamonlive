import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager from "@/components/Pager";
import PostList from "@/components/PostList";
import { PAGE_SIZE, countAll, latest } from "@/lib/db";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/page/[n]">): Promise<Metadata> {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1) return {};
  const last = Math.ceil((await countAll()) / PAGE_SIZE);
  return pageMeta({
    title: `All fatwas – page ${n} of ${last}`,
    description: `Every fatwa on Fatwa Islamonlive, newest first. Page ${n} of ${last}.`,
    path: `/page/${n}`,
  });
}

const href = (n: number) => `/page/${n}`;

export default async function Page({ params }: PageProps<"/page/[n]">) {
  const n = Number((await params).n);
  const last = Math.ceil((await countAll()) / PAGE_SIZE);
  if (!Number.isInteger(n) || n < 1 || n > last) notFound();
  return (
    <>
      <BlockTitle>All posts</BlockTitle>
      <PostList posts={await latest((n - 1) * PAGE_SIZE)} />
      <Pager page={n} last={last} href={href} />
    </>
  );
}
