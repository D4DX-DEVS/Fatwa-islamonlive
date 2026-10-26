import Link from "next/link";
import Thumb from "@/components/Thumb";
import { categories, inCategories, latest, type PostCard } from "@/lib/db";
import { SECTIONS } from "@/lib/site";

function Hero({ posts }: { posts: PostCard[] }) {
  const [a, b, c] = posts;
  const tile = (p: PostCard, cls: string, size: string) => (
    <Link href={`/post/${p.id}`} className={`group relative block overflow-hidden rounded-lg ${cls}`}>
      <Thumb src={p.image} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
      <span className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 font-semibold leading-snug text-white ${size}`}>{p.title}</span>
    </Link>
  );
  return (
    <div className="grid gap-2 md:grid-cols-3 md:grid-rows-2">
      {tile(a, "h-64 md:col-span-2 md:row-span-2 md:h-[28rem]", "text-xl")}
      {tile(b, "h-48 md:h-auto", "text-sm")}
      {tile(c, "h-48 md:h-auto", "text-sm")}
    </div>
  );
}

function Block({ title, tabs, names }: { title: string; tabs: number[]; names: Map<number, string> }) {
  const [first, ...rest] = inCategories(tabs, 5);
  if (!first) return null;
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b-2 border-[#2d7c26]">
        <h2 className="inline-block bg-[#2d7c26] px-3 py-1 text-sm font-bold uppercase text-white">{title}</h2>
        {tabs.length > 1 && (
          <p className="flex flex-wrap gap-x-3 pb-1 text-xs text-neutral-500">
            {tabs.map((id) => <Link key={id} href={`/category/${id}`} className="hover:text-[#2d7c26]">{names.get(id)}</Link>)}
          </p>
        )}
      </div>
      <Link href={`/post/${first.id}`} className="group block">
        <div className="overflow-hidden rounded"><Thumb src={first.image} className="h-44 w-full transition-transform duration-500 group-hover:scale-105" /></div>
        <h3 className="mt-2 font-bold leading-snug group-hover:text-[#2d7c26]">{first.title}</h3>
      </Link>
      <p className="mt-1 line-clamp-3 text-sm text-neutral-600">{first.excerpt}</p>
      <ul className="mt-3 space-y-3">
        {rest.map((p) => (
          <li key={p.id}>
            <Link href={`/post/${p.id}`} className="flex gap-3">
              <Thumb src={p.image} className="h-14 w-20 shrink-0 rounded" />
              <span className="text-sm font-semibold leading-snug hover:text-[#2d7c26]">{p.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home() {
  const recent = latest(0);
  const hero = [...recent.filter((p) => p.image), ...recent.filter((p) => !p.image)].slice(0, 3);
  const names = new Map(categories().map((c) => [c.id, c.name]));
  return (
    <>
      <Hero posts={hero} />
      <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
        {SECTIONS.map((s) => <Block key={s.title} {...s} names={names} />)}
      </div>
      <p className="mt-8 text-center">
        <Link href="/page/1" className="inline-block rounded-full bg-[#2d7c26] px-5 py-2 text-sm font-bold text-white hover:bg-[#0e5921]">All posts →</Link>
      </p>
    </>
  );
}
