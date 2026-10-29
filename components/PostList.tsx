import Link from "next/link";
import type { PostCard } from "@/lib/db";
import { formatDate } from "@/lib/site";
import Thumb from "./Thumb";

export default function PostList({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return <p className="rounded-2xl bg-white p-8 text-center text-neutral-500 shadow-sm ring-1 ring-black/5">No posts found.</p>;
  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.id} className="group relative flex gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <Thumb src={p.image} className="h-20 w-28 shrink-0 rounded-xl sm:h-28 sm:w-40" />
          <div className="min-w-0 break-words">
            {/* the title link stretches over the whole card */}
            <Link href={`/post/${p.id}`} className="line-clamp-2 text-base font-semibold leading-snug after:absolute after:inset-0 group-hover:text-brand sm:text-lg">{p.title}</Link>
            {p.excerpt && <p className="mt-1 hidden line-clamp-2 text-sm text-neutral-600 sm:block">{p.excerpt}</p>}
            <p className="mt-2 text-xs text-neutral-500">
              {p.author ? `${p.author} · ` : ""}
              {formatDate(p.date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
