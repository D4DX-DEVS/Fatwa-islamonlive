import Link from "next/link";
import BlockTitle from "@/components/BlockTitle";
import Thumb from "@/components/Thumb";
import { inCategoryTree, latest, type PostCard } from "@/lib/db";

// Mirrors the original homepage blocks: [title, category id]
const SECTIONS: [string, number][] = [
  ["Faith", 38], ["Practice", 39],
  ["Women & Family", 49], ["Economics", 57],
  ["Up to date", 66], ["Medical", 48],
  ["Behavioral etiquette", 62], ["Death", 60],
  ["Entertainments", 74], ["History & Politics", 65],
  ["Celebrations", 46], ["Society & Culture", 54],
];

function Hero({ posts }: { posts: PostCard[] }) {
  const [a, b, c] = posts;
  const tile = (p: PostCard, cls: string, size: string) => (
    <Link href={`/post/${p.id}`} className={`group relative block overflow-hidden ${cls}`}>
      <Thumb src={p.image} className="absolute inset-0 h-full w-full" />
      <span className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 font-semibold text-white ${size}`}>{p.title}</span>
    </Link>
  );
  return (
    <div className="grid gap-1 md:grid-cols-3 md:grid-rows-2">
      {tile(a, "h-64 md:col-span-2 md:row-span-2 md:h-[28rem]", "text-xl")}
      {tile(b, "h-48 md:h-auto", "text-sm")}
      {tile(c, "h-48 md:h-auto", "text-sm")}
    </div>
  );
}

function Block({ title, id }: { title: string; id: number }) {
  const [first, ...rest] = inCategoryTree(id, 5);
  if (!first) return null;
  return (
    <section>
      <BlockTitle href={`/category/${id}`}>{title}</BlockTitle>
      <Link href={`/post/${first.id}`} className="block">
        <Thumb src={first.image} className="h-44 w-full" />
        <h3 className="mt-2 font-bold leading-snug hover:text-[#2d7c26]">{first.title}</h3>
      </Link>
      <p className="mt-1 line-clamp-3 text-sm text-neutral-600">{first.excerpt}</p>
      <ul className="mt-3 space-y-3">
        {rest.map((p) => (
          <li key={p.id}>
            <Link href={`/post/${p.id}`} className="flex gap-3">
              <Thumb src={p.image} className="h-14 w-20 shrink-0" />
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
  return (
    <>
      <Hero posts={hero} />
      <div className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2">
        {SECTIONS.map(([t, id]) => <Block key={id} title={t} id={id} />)}
      </div>
      <p className="mt-8 text-center">
        <Link href="/page/1" className="inline-block bg-[#2d7c26] px-4 py-2 text-sm font-bold text-white">All posts →</Link>
      </p>
    </>
  );
}
