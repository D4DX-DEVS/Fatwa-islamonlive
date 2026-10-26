"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, clearSession, requireAdmin, setSession } from "@/lib/auth";
import { createPost, deletePost, updatePost } from "@/lib/db";

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
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  if (!title || !content.trim()) redirect(id ? `/admin/${id}?error=1` : "/admin/new?error=1");
  const input = {
    title,
    content,
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    author_id: Number(formData.get("author_id")) || 1,
    categoryIds: formData.getAll("categories").map(Number).filter(Number.isInteger),
  };
  const postId = id ?? createPost(input);
  if (id) updatePost(id, input);
  revalidatePath("/", "layout");
  redirect(`/post/${postId}`);
}

export async function remove(id: number) {
  await requireAdmin();
  deletePost(id);
  revalidatePath("/", "layout");
  redirect("/admin");
}
