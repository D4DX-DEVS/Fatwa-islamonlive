import { requireAdmin } from "@/lib/auth";
import PostForm from "@/components/PostForm";

export default async function New({ searchParams }: PageProps<"/admin/new">) {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">New post</h1>
      <PostForm error={!!(await searchParams).error} />
    </>
  );
}
