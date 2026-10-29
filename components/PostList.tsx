import Link from "@/components/Link";
import type { PostCard } from "@/lib/db";
import { formatDate } from "@/lib/site";
import Thumb from "./Thumb";

export default function PostList({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return <p className="rounded-3xl border border-gold/40 bg-paper p-10 text-center text-lg font-semibold text-ink/70">No posts found.</p>;
  return (
    <ul className="space-y-4">
      {posts.map((p) => (
        <li key={p.id} className="reveal group zoom lift relative flex gap-4 rounded-3xl border border-gold/30 bg-paper p-3 sm:gap-6 sm:p-4">
          <Thumb src={p.image} className="h-24 w-28 shrink-0 rounded-2xl sm:h-36 sm:w-52" />
          <div className="min-w-0 self-center break-words">
            {/* the title link stretches over the whole card */}
            <Link href={`/post/${p.id}`} className="line-clamp-2 text-lg font-extrabold leading-snug text-deep after:absolute after:inset-0 sm:text-2xl sm:leading-snug"><span className="sweep">{p.title}</span></Link>
            {p.excerpt && <p className="mt-2 line-clamp-2 font-serif text-[15px] leading-relaxed text-ink/70 max-sm:hidden">{p.excerpt}</p>}
            <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs font-bold uppercase tracking-wider text-goldtext">
              {p.author && <><span className="normal-case tracking-normal text-jade">{p.author}</span><span aria-hidden>◆</span></>}
              <span>{formatDate(p.date)}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
