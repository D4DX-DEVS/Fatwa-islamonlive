import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager, { parsePage } from "@/components/Pager";
import PostList from "@/components/PostList";
import { PAGE_SIZE, authorPage } from "@/lib/db";

const href = (id: number) => (n: number) => (n === 1 ? `/author/${id}` : `/author/${id}?page=${n}`);

// the page and its metadata share one cached database call
const load = async ({ params, searchParams }: PageProps<"/author/[id]">) => {
  const id = Number((await params).id);
  const n = parsePage((await searchParams).page);
  return { id, n, data: Number.isInteger(id) && n ? await authorPage(id, (n - 1) * PAGE_SIZE) : null };
};

export async function generateMetadata(props: PageProps<"/author/[id]">): Promise<Metadata> {
  const { id, n, data } = await load(props);
  return { title: data?.head?.name, alternates: { canonical: href(id)(n || 1) } };
}

export default async function Author(props: PageProps<"/author/[id]">) {
  const { id, n, data } = await load(props);
  if (!data?.head) notFound();
  const last = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  if (n > last) notFound();
  return (
    <>
      <BlockTitle count={data.total}>{data.head.name}</BlockTitle>
      <PostList posts={data.posts} />
      <Pager page={n} last={last} href={href(id)} />
    </>
  );
}
