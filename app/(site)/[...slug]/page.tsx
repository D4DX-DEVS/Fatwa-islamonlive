import { notFound, permanentRedirect } from "next/navigation";
import { idBySlug } from "@/lib/db";

// Old WordPress URLs end in the slug of what they point at: /category/sub/post-slug/ (a post) or /category/sub/ (a category)
export default async function OldPermalink({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const last = slug[slug.length - 1];
  const post = await idBySlug("posts", last);
  if (post) permanentRedirect(`/post/${post}`);
  const category = await idBySlug("categories", last);
  if (category) permanentRedirect(`/category/${category}`);
  notFound();
}
