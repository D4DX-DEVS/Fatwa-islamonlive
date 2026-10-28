import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import PostForm from "@/components/PostForm";
import { post, postCategories } from "@/lib/db";

export default async function Edit({ params, searchParams }: PageProps<"/admin/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const p = await post(id);
  if (!p) notFound();
  const sp = await searchParams;
  return <PostForm post={p} selected={(await postCategories(id)).map((c) => c.id)} error={String(sp.error ?? "")} saved={!!sp.saved} />;
}
