import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import Thumb from "@/components/Thumb";
import { inCategories, post, postCategories, tags } from "@/lib/db";
import { formatDate } from "@/lib/site";

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
  const related = cats.length ? (await inCategories(cats.map((c) => c.id), 5)).filter((r) => r.id !== p.id).slice(0, 4) : [];

  const url = `${process.env.SITE_URL ?? ""}/post/${p.id}`;
  const share = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${p.title} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(url)}` },
  ];
  const chip = "rounded-full px-3 py-1 text-sm font-medium transition-colors";

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-x-2 text-sm text-neutral-500">
        <Link href="/" className="hover:text-brand">ഹോം</Link>
        {cats[0] && <><span aria-hidden>›</span><Link href={`/category/${cats[0].id}`} className="hover:text-brand">{cats[0].name}</Link></>}
      </nav>
      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
        <h1 className="text-2xl font-bold leading-snug sm:text-4xl sm:leading-snug">{p.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
          {p.author && <Link href={`/author/${p.author_id}`} className="rounded-full bg-brand-soft px-3 py-0.5 font-medium text-brand hover:bg-brand hover:text-white">{p.author}</Link>}
          <time dateTime={p.date.slice(0, 10)}>{formatDate(p.date)}</time>
        </p>
        {p.image && <Thumb src={p.image} priority className="mt-6 aspect-video w-full rounded-xl" />}
        <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: p.content }} />
        {(cats.length > 0 || tg.length > 0) && (
          <p className="mt-8 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
            {cats.map((c) => <Link key={c.id} href={`/category/${c.id}`} className={`${chip} bg-brand-soft text-brand hover:bg-brand hover:text-white`}>{c.name}</Link>)}
            {tg.map((t) => <Link key={t.id} href={`/tag/${t.id}`} className={`${chip} bg-neutral-100 text-neutral-700 hover:bg-neutral-200`}>#{t.name}</Link>)}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-neutral-600">Share</span>
          {share.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`${chip} border border-neutral-200 hover:border-brand hover:text-brand`}>{s.label}</a>)}
        </div>
      </article>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2.5 text-xl font-bold"><span aria-hidden className="h-5 w-1.5 rounded-full bg-brand" />Related</h2>
          <PostList posts={related} />
        </section>
      )}
    </div>
  );
}
