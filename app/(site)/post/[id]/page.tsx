import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import Thumb from "@/components/Thumb";
import { postBundle } from "@/lib/db";
import { formatDate } from "@/lib/site";

// the page and its metadata share one cached database call
const load = async (params: PageProps<"/post/[id]">["params"]) => {
  const id = Number((await params).id);
  return Number.isInteger(id) ? postBundle(id) : null;
};

export async function generateMetadata({ params }: PageProps<"/post/[id]">): Promise<Metadata> {
  const p = (await load(params))?.post;
  return p
    ? { title: p.title, description: p.excerpt.slice(0, 160), openGraph: { title: p.title, description: p.excerpt.slice(0, 160), type: "article", ...(p.image && { images: [p.image] }) } }
    : {};
}

export default async function Post({ params }: PageProps<"/post/[id]">) {
  const bundle = await load(params);
  if (!bundle?.post) notFound();
  const { post: p, cats, tags: tg, related } = bundle;

  const url = `${process.env.SITE_URL ?? ""}/post/${p.id}`;
  const share = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${p.title} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(url)}` },
  ];
  const chip = "rounded-full px-4 py-1.5 text-sm font-bold transition-all duration-300";

  return (
    <div className="mx-auto max-w-3xl">
      <div aria-hidden className="progress" />
      <nav aria-label="Breadcrumb" className="rise mb-6 flex flex-wrap items-center gap-x-3 text-sm font-semibold text-ink/55">
        <Link href="/" className="transition-colors hover:text-deep">ഹോം</Link>
        {cats[0] && <><span aria-hidden className="text-gold">◆</span><Link href={`/category/${cats[0].id}`} className="transition-colors hover:text-deep">{cats[0].name}</Link></>}
      </nav>

      <article>
        <header>
          {cats[0] && <p className="rise text-sm font-extrabold text-gold [--i:1]">{cats[0].name}</p>}
          <h1 className="rise mt-3 text-[2rem] font-extrabold leading-[1.28] text-deep [--i:2] sm:text-[3.4rem] sm:leading-[1.2]">{p.title}</h1>
          <p className="rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold [--i:3]">
            {p.author && <Link href={`/author/${p.author_id}`} className="rounded-full bg-deep px-4 py-1.5 font-bold text-champagne transition-colors hover:bg-gold hover:text-ink">{p.author}</Link>}
            <span aria-hidden className="h-px w-8 bg-gold" />
            <time dateTime={p.date.slice(0, 10)} className="text-ink/60">{formatDate(p.date)}</time>
          </p>
        </header>

        {p.image && <Thumb src={p.image} priority className="rise mt-8 aspect-video w-full rounded-[1.75rem] border border-gold/40 shadow-2xl shadow-deep/20 [--i:4]" />}

        <div className="mt-10 rounded-[2rem] border border-gold/30 bg-paper p-6 shadow-sm sm:p-10">
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: p.content }} />
          {(cats.length > 0 || tg.length > 0) && (
            <p className="mt-10 flex flex-wrap gap-2.5 border-t border-gold/30 pt-6">
              {cats.map((c) => <Link key={c.id} href={`/category/${c.id}`} className={`${chip} bg-deep text-champagne hover:-translate-y-0.5 hover:bg-gold hover:text-ink`}>{c.name}</Link>)}
              {tg.map((t) => <Link key={t.id} href={`/tag/${t.id}`} className={`${chip} border border-gold/50 text-deep hover:-translate-y-0.5 hover:bg-sand`}>#{t.name}</Link>)}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-sm">
            <span className="mr-1 text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold">Share</span>
            {share.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`${chip} sheen bg-ink text-champagne hover:-translate-y-0.5 hover:bg-deep`}>{s.label}</a>)}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 flex items-center gap-4 text-3xl font-extrabold text-deep">
            Related <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold to-transparent" />
          </h2>
          <PostList posts={related} />
        </section>
      )}
    </div>
  );
}
