import Link from "@/components/Link";
import { permanentRedirect } from "next/navigation";
import Thumb from "@/components/Thumb";
import { categories, inEach, latest, type PostCard } from "@/lib/db";
import JsonLd from "@/components/JsonLd";
import { ORGANIZATION, WEBSITE, pageMeta } from "@/lib/seo";
import { FOOTER_LINKS, SECTIONS, formatDate, type Tone } from "@/lib/site";

// Tailwind needs whole class names, so each theme lists its classes in full
type Theme = { box: string; title: string; muted: string; chip: string; pill: string; rule: string; num: string };
const THEMES: Record<Tone, Theme> = {
  paper: { box: "bg-paper text-ink border-gold/35", title: "text-deep", muted: "text-ink/70", chip: "bg-deep text-champagne", pill: "bg-sand text-deep hover:bg-deep hover:text-champagne", rule: "border-gold/30", num: "text-goldtext" },
  sand: { box: "bg-sand text-ink border-gold/50", title: "text-deep", muted: "text-ink/70", chip: "bg-ink text-champagne", pill: "bg-paper/80 text-deep hover:bg-deep hover:text-champagne", rule: "border-gold/40", num: "text-jade" },
  deep: { box: "geo bg-deep text-ivory border-gold/40", title: "text-ivory", muted: "text-ivory/65", chip: "bg-gold text-ink", pill: "bg-white/10 text-champagne hover:bg-gold hover:text-ink", rule: "border-white/15", num: "text-gold" },
  dark: { box: "bg-ink text-ivory border-gold/40", title: "text-ivory", muted: "text-ivory/70", chip: "bg-gold text-ink", pill: "bg-white/15 text-ivory hover:bg-gold hover:text-ink", rule: "border-white/15", num: "text-gold" },
};
const SPAN = { 1: "", 2: "md:col-span-2", 3: "md:col-span-2 lg:col-span-3" } as const;
const SUPPORT = FOOTER_LINKS[0].href;

function Hero({ posts }: { posts: PostCard[] }) {
  const [main, ...side] = posts;
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.75fr_1fr]">
      <Link href={`/post/${main.id}`} className="drift zoom group relative isolate block min-h-[27rem] overflow-hidden rounded-[2rem] border border-gold/50 shadow-2xl shadow-deep/30 sm:min-h-[36rem]">
        <Thumb src={main.image} priority className="absolute inset-0 h-full w-full" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/5" />
        <span className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <span className="rise inline-block rounded-full bg-gold px-4 py-1 text-xs font-extrabold uppercase tracking-[0.25em] text-ink">Featured</span>
          <span className="rise mt-5 block text-[1.5rem] font-extrabold leading-[1.3] text-ivory [--i:2] sm:text-[2.25rem] sm:leading-[1.25]"><span className="sweep">{main.title}</span></span>
          <span className="rise mt-5 flex items-center gap-4 text-sm font-semibold text-champagne [--i:3]">
            {main.author && <span>{main.author}</span>}
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span>{formatDate(main.date)}</span>
          </span>
        </span>
      </Link>

      <div className="flex flex-col gap-5">
        <div className="geo rise rounded-[2rem] border border-gold/40 bg-deep p-6 text-ivory shadow-xl shadow-deep/20 [--i:2] sm:p-7">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Latest fatwas</h2>
          <ul className="mt-2 divide-y divide-white/10">
            {side.map((p, i) => (
              <li key={p.id}>
                <Link href={`/post/${p.id}`} className="group flex items-start gap-4 py-4">
                  <span aria-hidden className="w-11 shrink-0 text-[2.6rem] font-extrabold leading-none text-gold/90 transition-transform duration-500 group-hover:-translate-y-1">0{i + 1}</span>
                  <span className="min-w-0">
                    <span className="line-clamp-3 text-[15px] font-bold leading-snug"><span className="sweep">{p.title}</span></span>
                    <span className="mt-1.5 block text-xs font-semibold text-champagne/70">{formatDate(p.date)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <a href={SUPPORT} className="sheen rise group flex flex-1 items-center justify-between gap-4 rounded-[2rem] bg-gradient-to-br from-gold via-champagne to-gold p-6 text-ink shadow-xl shadow-gold/30 transition-transform duration-500 hover:-translate-y-1 [--i:3] sm:p-7">
          <span>
            <span className="block text-2xl font-extrabold leading-tight">Support Us</span>
            <span className="mt-1 block text-sm font-semibold text-ink/70">Help keep this portal free for everyone.</span>
          </span>
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-xl text-gold transition-transform duration-500 group-hover:translate-x-1.5">→</span>
        </a>
      </div>
    </section>
  );
}

function Pills({ tabs, names, theme }: { tabs: number[]; names: Map<number, string>; theme: Theme }) {
  if (tabs.length < 2) return null;
  return (
    <p className="flex flex-wrap gap-1.5 text-xs font-bold">
      {tabs.map((id) => <Link key={id} href={`/category/${id}`} className={`inline-flex min-h-11 items-center rounded-full px-3.5 transition-colors duration-300 ${theme.pill}`}>{names.get(id)}</Link>)}
    </p>
  );
}

function Row({ p, n, theme }: { p: PostCard; n?: number; theme: Theme }) {
  return (
    <li>
      <Link href={`/post/${p.id}`} className="group zoom flex items-center gap-3.5">
        {n !== undefined && <span aria-hidden className={`w-8 shrink-0 text-2xl font-extrabold tabular-nums ${theme.num}`}>{String(n).padStart(2, "0")}</span>}
        <Thumb src={p.image} className="h-16 w-[5.5rem] shrink-0 rounded-xl" />
        <span className="min-w-0">
          <span className={`line-clamp-2 break-words text-[15px] font-bold leading-snug ${theme.title}`}><span className="sweep">{p.title}</span></span>
          <span className={`mt-0.5 block text-xs font-semibold ${theme.muted}`}>{formatDate(p.date)}</span>
        </span>
      </Link>
    </li>
  );
}

function Block({ title, tabs, tone, layout = "card", span = 1, names, items, n }: (typeof SECTIONS)[number] & { names: Map<number, string>; items: PostCard[]; n: number }) {
  // lead with a post that has a picture so the card never opens on a blank thumbnail
  const lead = items.find((p) => p.image) ?? items[0];
  if (!lead) return null;
  const rest = items.filter((p) => p !== lead);
  const t = THEMES[tone];
  const head = (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h2 className="flex items-center gap-3">
        <span aria-hidden className={`text-sm font-extrabold tabular-nums ${t.num}`}>{String(n).padStart(2, "0")}</span>
        <span className={`rounded-full px-4 py-1.5 text-sm font-extrabold uppercase tracking-[0.12em] ${t.chip}`}>{title}</span>
      </h2>
      <Pills tabs={tabs} names={names} theme={t} />
    </div>
  );
  const frame = `reveal rounded-[1.75rem] border p-5 shadow-sm sm:p-6 ${t.box} ${SPAN[span]}`;

  if (layout === "overlay" && lead.image) {
    return (
      <section className={`${frame} drift zoom relative isolate flex min-h-[24rem] flex-col justify-between overflow-hidden`}>
        <Thumb src={lead.image} className="absolute inset-0 -z-10 h-full w-full" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        {head}
        <div>
          <Link href={`/post/${lead.id}`} className="block text-[1.7rem] font-extrabold leading-snug text-ivory"><span className="sweep">{lead.title}</span></Link>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-ivory/80">
            {rest.slice(0, 2).map((p) => <li key={p.id}><Link href={`/post/${p.id}`} className="block py-3 transition-colors hover:text-gold"><span className="line-clamp-1"><span className="mr-2 text-gold">◆</span>{p.title}</span></Link></li>)}
          </ul>
        </div>
      </section>
    );
  }

  if (layout === "split" || layout === "overlay") {
    return (
      <section className={`${frame} flex flex-col`}>
        {head}
        {/* wide banner on top, numbered headlines in two columns underneath */}
        <Link href={`/post/${lead.id}`} className={`group zoom relative block aspect-video overflow-hidden rounded-2xl ${span === 3 ? "sm:aspect-[3/1]" : "sm:aspect-[5/2]"}`}>
          <Thumb src={lead.image} className="absolute inset-0 h-full w-full" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-5 text-lg font-extrabold leading-snug text-ivory sm:p-6 sm:text-xl"><span className="sweep">{lead.title}</span></span>
        </Link>
        <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">{rest.map((p, i) => <Row key={p.id} p={p} n={i + 1} theme={t} />)}</ul>
      </section>
    );
  }

  return (
    <section className={`${frame} flex flex-col`}>
      {head}
      <Link href={`/post/${lead.id}`} className="group zoom block">
        <div className="overflow-hidden rounded-2xl"><Thumb src={lead.image} className="aspect-video w-full" /></div>
        <h3 className={`mt-4 text-xl font-extrabold leading-snug ${t.title}`}><span className="sweep">{lead.title}</span></h3>
      </Link>
      <p className={`mt-2 line-clamp-2 font-serif text-sm leading-relaxed ${t.muted}`}>{lead.excerpt}</p>
      <ul className={`mt-auto space-y-4 border-t pt-5 ${t.rule}`}>{rest.map((p) => <Row key={p.id} p={p} theme={t} />)}</ul>
    </section>
  );
}

export const metadata = pageMeta({
  title: { absolute: "Fatwa Islamonlive | Malayalam fatwa portal" },
  description: "Fatwa Islamonlive is a Malayalam fatwa portal: questions and answers on faith, worship, family, finance and daily life, published by Islamonlive.",
  path: "/",
});

// Old WordPress plain-permalink URLs (/?p=ID etc.) -> new routes
const LEGACY = { p: "post", cat: "category", author: "author" } as const;

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  for (const [key, route] of Object.entries(LEGACY)) {
    const v = sp[key];
    if (typeof v === "string" && /^\d+$/.test(v)) permanentRedirect(`/${route}/${v}`);
  }
  if (sp.feed) permanentRedirect("/feed.xml");
  if (typeof sp.s === "string" && sp.s) permanentRedirect(`/search?q=${encodeURIComponent(sp.s)}`);

  // three independent queries, run together (every round trip to D1 costs latency)
  const [recent, cats, lists] = await Promise.all([latest(0), categories(), inEach(SECTIONS.map((s) => s.tabs), 20)]);
  const hero = [...recent.filter((p) => p.image), ...recent.filter((p) => !p.image)].slice(0, 4);
  const names = new Map(cats.map((c) => [c.id, c.name]));

  // a post shows once on the page: each card skips posts the hero or an earlier card already used
  const used = new Set(hero.map((p) => p.id));
  const blocks = [];
  for (const [i, s] of SECTIONS.entries()) {
    const items = lists[i].filter((p) => !used.has(p.id)).slice(0, s.layout === "split" ? 7 : 5);
    items.forEach((p) => used.add(p.id));
    if (items.length) blocks.push(<Block key={s.title} {...s} names={names} items={items} n={blocks.length + 1} />);
  }
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [ORGANIZATION, WEBSITE] }} />
      <h1 className="sr-only">Fatwa Islamonlive</h1>
      <Hero posts={hero} />
      <div className="mt-12 grid grid-flow-dense grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">{blocks}</div>
      <p className="mt-14 text-center">
        <Link href="/page/1" className="sheen inline-block rounded-full bg-deep px-9 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-champagne shadow-xl shadow-deep/30 transition-all duration-500 hover:-translate-y-1 hover:bg-ink">Browse all posts →</Link>
      </p>
    </>
  );
}
