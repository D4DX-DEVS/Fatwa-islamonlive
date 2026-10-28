"use server";

import { redirect } from "next/navigation";
import { checkPassword, clearSession, requireAdmin, setSession } from "@/lib/auth";
import { createPost, deletePost, post, updatePost } from "@/lib/db";
import { removeImage, saveImage } from "@/lib/uploads";

export async function login(formData: FormData) {
  if (!checkPassword(String(formData.get("password") ?? ""))) redirect("/admin?error=1");
  await setSession();
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin");
}

export async function save(id: number | null, formData: FormData) {
  await requireAdmin();
  const back = id ? `/admin/${id}` : "/admin/new";
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  if (!title || !content.trim()) redirect(`${back}?error=required`);

  let image: string | null | undefined; // undefined = leave the current image alone
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file);
    if ("error" in saved) redirect(`${back}?error=${saved.error}`);
    image = saved.url;
  } else if (formData.get("remove_image")) image = null;

  const input = {
    title,
    content,
    image,
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    author_id: Number(formData.get("author_id")) || 1,
    categoryIds: formData.getAll("categories").map(Number).filter(Number.isInteger),
  };
  const before = id ? await post(id) : null;
  const postId = id ?? (await createPost(input));
  if (id) await updatePost(id, input);
  if (image !== undefined) await removeImage(before?.image);
  redirect(`/admin/${postId}?saved=1`);
}

export async function remove(id: number) {
  await requireAdmin();
  const before = await post(id);
  await deletePost(id);
  await removeImage(before?.image);
  redirect("/admin");
}
