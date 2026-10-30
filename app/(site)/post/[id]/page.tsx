import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import Thumb from "@/components/Thumb";
import JsonLd from "@/components/JsonLd";
import { postBundle } from "@/lib/db";
import { ORGANIZATION, SITE, ORG_ID, isHouseAuthor, pageMeta, plain } from "@/lib/seo";
import { formatDate } from "@/lib/site";

// the page and its metadata share one cached database call
const load = async (params: PageProps<"/post/[id]">["params"]) => {
  const id = Number((await params).id);
  return Number.isInteger(id) ? postBundle(id) : null;
};

export async function generateMetadata({ params }: PageProps<"/post/[id]">): Promise<Metadata> {
  const p = (await load(params))?.post;
  if (!p) return {};
  return pageMeta({
    title: p.title,
    description: plain(p.excerpt || p.content),
    path: `/post/${p.id}`,
    image: p.image,
    type: "article",
    published: p.date,
    author: isHouseAuthor(p.author) ? null : p.author,
  });
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
  const pageUrl = `${SITE}/post/${p.id}`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION,
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: p.title,
        description: plain(p.excerpt || p.content),
        inLanguage: "ml",
        datePublished: p.date,
        ...(p.image && { image: [`${SITE}${p.image}`] }),
        author: isHouseAuthor(p.author) ? { "@id": ORG_ID } : { "@type": "Person", name: p.author, url: `${SITE}/author/${p.author_id}` },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        ...(cats[0] && { articleSection: cats[0].name }),
        ...(tg.length > 0 && { keywords: tg.map((t) => t.name).join(", ") }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ഹോം", item: `${SITE}/` },
          ...(cats[0] ? [{ "@type": "ListItem", position: 2, name: cats[0].name, item: `${SITE}/category/${cats[0].id}` }] : []),
          { "@type": "ListItem", position: cats[0] ? 3 : 2, name: p.title, item: pageUrl },
        ],
      },
    ],
  };
  const chip = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-bold transition-all duration-300";

  return (
    <div className="mx-auto max-w-3xl lg:max-w-6xl">
      <JsonLd data={ld} />
      <div aria-hidden className="progress" />
      <nav aria-label="Breadcrumb" className="rise mb-3 flex flex-wrap items-center gap-x-3 text-sm font-semibold text-ink/70">
        <Link href="/" className="inline-block min-w-11 py-3 transition-colors hover:text-deep">ഹോം</Link>
        {cats[0] && <><span aria-hidden className="text-gold">◆</span><Link href={`/category/${cats[0].id}`} className="inline-block py-3 transition-colors hover:text-deep">{cats[0].name}</Link></>}
      </nav>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10">
      <article>
        <header>
          {cats[0] && <p className="rise text-sm font-extrabold text-goldtext [--i:1]">{cats[0].name}</p>}
          <h1 className="rise mt-3 text-[2rem] font-extrabold leading-[1.28] text-deep [--i:2] sm:text-[3.4rem] sm:leading-[1.2]">{p.title}</h1>
          <p className="rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold [--i:3]">
            {p.author && <Link href={`/author/${p.author_id}`} className="inline-flex min-h-11 items-center rounded-full bg-deep px-4 font-bold text-champagne transition-colors hover:bg-gold hover:text-ink">{p.author}</Link>}
            <span aria-hidden className="h-px w-8 bg-gold" />
            <time dateTime={p.date.slice(0, 10)} className="text-ink/70">{formatDate(p.date)}</time>
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
            <span className="mr-1 text-xs font-extrabold uppercase tracking-[0.25em] text-goldtext">Share</span>
            {share.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`${chip} sheen bg-ink text-champagne hover:-translate-y-0.5 hover:bg-deep`}>{s.label}</a>)}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <aside aria-labelledby="related" className="mt-16 lg:sticky lg:top-6 lg:mt-0">
          <h2 id="related" className="mb-6 flex items-center gap-4 text-2xl font-extrabold text-deep sm:text-3xl lg:text-2xl">
            Related <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold to-transparent" />
          </h2>
          {/* phones and tablets: the usual cards; wide screens: a compact column beside the article */}
          <div className="lg:hidden"><PostList posts={related.slice(0, 4)} /></div>
          <ul className="hidden space-y-4 lg:block">
            {related.map((r) => (
              <li key={r.id} className="reveal group zoom lift relative rounded-3xl border border-gold/30 bg-paper p-3">
                <Thumb src={r.image} className="aspect-video w-full rounded-2xl" />
                <Link href={`/post/${r.id}`} className="mt-3 line-clamp-3 px-1 text-lg font-extrabold leading-snug text-deep after:absolute after:inset-0"><span className="sweep">{r.title}</span></Link>
                <p className="mt-2 px-1 text-xs font-bold uppercase tracking-wider text-goldtext">{formatDate(r.date)}</p>
              </li>
            ))}
          </ul>
        </aside>
      )}
      </div>
    </div>
  );
}
