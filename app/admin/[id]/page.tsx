import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import PostForm from "@/components/PostForm";
import { post, postCategories } from "@/lib/db";

export default async function Edit({ params, searchParams }: PageProps<"/admin/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const p = await post(id);
  if (!p) notFound();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Edit post {id}</h1>
      <PostForm post={p} selected={(await postCategories(id)).map((c) => c.id)} error={String((await searchParams).error ?? "")} />
    </>
  );
}
