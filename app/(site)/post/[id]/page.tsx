import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { post, postCategories, tags } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/post/[id]">): Promise<Metadata> {
  const p = await post(Number((await params).id));
  return p
    ? { title: p.title, description: p.excerpt.slice(0, 160), openGraph: { title: p.title, description: p.excerpt.slice(0, 160), type: "article", ...(p.image && { images: [p.image] }) } }
    : {};
}

export default async function Post({ params }: PageProps<"/post/[id]">) {
  const p = await post(Number((await params).id));
  if (!p) notFound();
  const [cats, tg] = await Promise.all([postCategories(p.id), tags(p.id)]);
  return (
    <article>
      <h1 className="text-3xl font-bold leading-tight">{p.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {p.author && <Link href={`/author/${p.author_id}`} className="hover:text-emerald-700">{p.author}</Link>} · {p.date.slice(0, 10)}
      </p>
      <div className="prose-content mt-6 leading-8" dangerouslySetInnerHTML={{ __html: p.content }} />
      <p className="mt-8 flex flex-wrap gap-2 text-sm">
        {cats.map((c) => (
          <Link key={c.id} href={`/category/${c.id}`} className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">{c.name}</Link>
        ))}
        {tg.map((t) => (
          <Link key={t.id} href={`/tag/${t.id}`} className="rounded bg-neutral-100 px-2 py-1 text-neutral-700">#{t.name}</Link>
        ))}
      </p>
    </article>
  );
}
