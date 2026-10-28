import { requireAdmin } from "@/lib/auth";
import PostForm from "@/components/PostForm";

export default async function New({ searchParams }: PageProps<"/admin/new">) {
  await requireAdmin();
  return <PostForm error={String((await searchParams).error ?? "")} />;
}
