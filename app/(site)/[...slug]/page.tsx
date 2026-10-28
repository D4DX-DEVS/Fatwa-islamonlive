import { notFound, permanentRedirect } from "next/navigation";
import { postIdBySlug } from "@/lib/db";

// Old WordPress permalinks (/category/sub/post-slug/) redirect to /post/<id>; the slug is the last path segment
export default async function OldPermalink({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const last = slug[slug.length - 1];
  const id = await postIdBySlug(last);
  if (!id) notFound();
  permanentRedirect(`/post/${id}`);
}
