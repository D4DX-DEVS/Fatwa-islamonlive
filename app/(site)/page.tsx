import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import Thumb from "@/components/Thumb";
import { categories, inCategories, latest, type PostCard } from "@/lib/db";
import { FOOTER_LINKS, SECTIONS, formatDate, type Tone } from "@/lib/site";

// Tailwind needs whole class names, so each tone lists its classes in full
const TONES: Record<Tone, { box: string; chip: string }> = {
  green: { box: "bg-white ring-black/5", chip: "bg-brand text-white" },
  amber: { box: "bg-amber-50 ring-amber-200/70", chip: "bg-amber-700 text-white" },
  teal: { box: "bg-teal-50 ring-teal-200/70", chip: "bg-teal-700 text-white" },
  sky: { box: "bg-sky-50 ring-sky-200/70", chip: "bg-sky-700 text-white" },
  pink: { box: "bg-pink-50 ring-pink-200/70", chip: "bg-pink-600 text-white" },
  purple: { box: "bg-purple-50 ring-purple-200/70", chip: "bg-purple-700 text-white" },
  orange: { box: "bg-orange-50 ring-orange-200/70", chip: "bg-orange-700 text-white" },
  rose: { box: "bg-rose-50 ring-rose-200/70", chip: "bg-rose-700 text-white" },
  yellow: { box: "bg-yellow-50 ring-yellow-200/70", chip: "bg-yellow-700 text-white" },
  stone: { box: "bg-stone-100 ring-stone-200", chip: "bg-stone-700 text-white" },
  dark: { box: "bg-neutral-900 ring-black/10", chip: "bg-white/20 text-white backdrop-blur" },
};
const SPAN = { 1: "", 2: "md:col-span-2", 3: "md:col-span-2 lg:col-span-3" } as const;
const SUPPORT = FOOTER_LINKS[0].href;

function Hero({ posts }: { posts: PostCard[] }) {
  const [main, ...side] = posts;
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Link href={`/post/${main.id}`} className="group relative block h-72 overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 sm:h-96 lg:h-[26rem]">
        <Thumb src={main.image} priority className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5 pt-24 text-white sm:p-7 sm:pt-28">
          <span className="text-xl font-bold leading-snug sm:text-3xl sm:leading-snug">{main.title}</span>
          <span className="mt-2 block text-xs text-white/75">{main.author ? `${main.author} · ` : ""}{formatDate(main.date)}</span>
        </span>
      </Link>
      <div className="flex flex-col gap-4">
        <ul className="divide-y divide-neutral-100 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          {side.map((p) => (
            <li key={p.id} className="py-3 first:pt-0 last:pb-0">
              <Link href={`/post/${p.id}`} className="group flex gap-3">
                <Thumb src={p.image} className="h-16 w-24 shrink-0 rounded-xl" />
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">{p.title}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{formatDate(p.date)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <a href={SUPPORT} className="flex flex-1 items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5">
          <span>
            <span className="block text-lg font-bold">Support Us</span>
            <span className="text-sm text-white/80">Help keep this portal free for everyone.</span>
          </span>
          <span aria-hidden className="text-2xl">→</span>
        </a>
      </div>
    </div>
  );
}

function Pills({ tabs, names, dark }: { tabs: number[]; names: Map<number, string>; dark?: boolean }) {
  if (tabs.length < 2) return null;
  const pill = dark ? "bg-white/15 text-white hover:bg-white hover:text-neutral-900" : "bg-white/80 text-neutral-700 hover:bg-neutral-900 hover:text-white";
  return (
    <p className="flex flex-wrap gap-1.5 text-xs">
      {tabs.map((id) => <Link key={id} href={`/category/${id}`} className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${pill}`}>{names.get(id)}</Link>)}
    </p>
  );
}

function Row({ p, n }: { p: PostCard; n?: number }) {
  return (
    <li>
      <Link href={`/post/${p.id}`} className="group flex items-center gap-3">
        {n !== undefined && <span className="w-6 shrink-0 text-lg font-bold tabular-nums text-neutral-300">{String(n).padStart(2, "0")}</span>}
        <Thumb src={p.image} className="h-14 w-20 shrink-0 rounded-lg" />
        <span className="min-w-0">
          <span className="line-clamp-2 break-words text-sm font-semibold leading-snug group-hover:text-brand">{p.title}</span>
          <span className="mt-0.5 block text-xs text-neutral-500">{formatDate(p.date)}</span>
        </span>
      </Link>
    </li>
  );
}

function Block({ title, tabs, tone, layout = "card", span = 1, names, items }: (typeof SECTIONS)[number] & { names: Map<number, string>; items: PostCard[] }) {
  // lead with a post that has a picture so the card never opens on a blank thumbnail
  const lead = items.find((p) => p.image) ?? items[0];
  if (!lead) return null;
  const rest = items.filter((p) => p !== lead);
  const t = TONES[tone];
  const head = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className={`rounded-lg px-3 py-1 text-sm font-bold ${t.chip}`}>{title}</h2>
      <Pills tabs={tabs} names={names} dark={tone === "dark"} />
    </div>
  );

  if (layout === "overlay" && lead.image) {
    return (
      <section className={`relative isolate flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-sm ring-1 ${t.box} ${SPAN[span]}`}>
        <Thumb src={lead.image} className="absolute inset-0 -z-10 h-full w-full" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        {head}
        <div>
          <Link href={`/post/${lead.id}`} className="block text-2xl font-bold leading-snug hover:underline">{lead.title}</Link>
          <ul className="mt-3 space-y-1.5 text-sm text-white/85">
            {rest.slice(0, 2).map((p) => <li key={p.id}><Link href={`/post/${p.id}`} className="line-clamp-1 hover:text-white hover:underline">› {p.title}</Link></li>)}
          </ul>
        </div>
      </section>
    );
  }

  const box = `flex flex-col rounded-2xl p-5 shadow-sm ring-1 ${t.box} ${SPAN[span]}`;
  if (layout === "split" || layout === "overlay") {
    return (
      <section className={box}>
        {head}
        {/* wide banner on top, numbered headlines in two columns underneath */}
        <Link href={`/post/${lead.id}`} className={`group relative block aspect-video overflow-hidden rounded-xl ${span === 3 ? "sm:aspect-[3/1]" : "sm:aspect-[5/2]"}`}>
          <Thumb src={lead.image} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-14 text-lg font-bold leading-snug text-white sm:text-xl">{lead.title}</span>
        </Link>
        <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">{rest.map((p, i) => <Row key={p.id} p={p} n={i + 1} />)}</ul>
      </section>
    );
  }

  return (
    <section className={box}>
      {head}
      <Link href={`/post/${lead.id}`} className="group block">
        <div className="overflow-hidden rounded-xl"><Thumb src={lead.image} className="aspect-video w-full transition-transform duration-500 group-hover:scale-105" /></div>
        <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-brand">{lead.title}</h3>
      </Link>
      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{lead.excerpt}</p>
      <ul className="mt-auto space-y-3 border-t border-black/5 pt-4">{rest.map((p) => <Row key={p.id} p={p} />)}</ul>
    </section>
  );
}

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

  const recent = await latest(0);
  const hero = [...recent.filter((p) => p.image), ...recent.filter((p) => !p.image)].slice(0, 4);
  const names = new Map((await categories()).map((c) => [c.id, c.name]));

  // a post shows once on the page: each card skips posts the hero or an earlier card already used
  const used = new Set(hero.map((p) => p.id));
  const blocks = [];
  for (const s of SECTIONS) {
    const items = (await inCategories(s.tabs, 7 + used.size)).filter((p) => !used.has(p.id)).slice(0, s.layout === "split" ? 7 : 5);
    items.forEach((p) => used.add(p.id));
    if (items.length) blocks.push(<Block key={s.title} {...s} names={names} items={items} />);
  }
  return (
    <>
      <h1 className="sr-only">Fatwa Islamonlive</h1>
      <Hero posts={hero} />
      <div className="mt-8 grid grid-flow-dense grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">{blocks}</div>
      <p className="mt-10 text-center">
        <Link href="/page/1" className="inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-dark">All posts →</Link>
      </p>
    </>
  );
}
