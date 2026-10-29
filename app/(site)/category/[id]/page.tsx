import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlockTitle from "@/components/BlockTitle";
import Pager, { parsePage } from "@/components/Pager";
import PostList from "@/components/PostList";
import { pageMeta } from "@/lib/seo";
import { PAGE_SIZE, categoryPage, idBySlug } from "@/lib/db";

const href = (id: number) => (n: number) => (n === 1 ? `/category/${id}` : `/category/${id}?page=${n}`);

// the page and its metadata share one cached database call
const load = async ({ params, searchParams }: PageProps<"/category/[id]">) => {
  const raw = (await params).id;
  const id = Number(raw);
  // an old WordPress category address carries the slug instead of the id
  if (!Number.isInteger(id)) {
    const found = await idBySlug("categories", raw);
    if (found) permanentRedirect(`/category/${found}`);
  }
  const n = parsePage((await searchParams).page);
  return { id, n, data: Number.isInteger(id) && n ? await categoryPage(id, (n - 1) * PAGE_SIZE) : null };
};

export async function generateMetadata(props: PageProps<"/category/[id]">): Promise<Metadata> {
  const { id, n, data } = await load(props);
  if (!data?.head) return {};
  const name = data.head.name;
  const page = n > 1 ? ` – page ${n}` : "";
  return pageMeta({
    title: `${name}${page}`,
    description: `Fatwas in the ${name} category on Fatwa Islamonlive (${data.total} posts).${n > 1 ? ` Page ${n}.` : ""}`,
    path: href(id)(n || 1),
  });
}

export default async function Category(props: PageProps<"/category/[id]">) {
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
