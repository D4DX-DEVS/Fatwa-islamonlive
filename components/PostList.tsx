import Link from "next/link";
import type { PostCard } from "@/lib/db";
import Thumb from "./Thumb";

export default function PostList({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return <p className="text-neutral-500">No posts found.</p>;
  return (
    <ul className="divide-y divide-neutral-200">
      {posts.map((p) => (
        <li key={p.id} className="flex gap-4 py-4">
          <Link href={`/post/${p.id}`} className="shrink-0"><Thumb src={p.image} className="h-24 w-36" /></Link>
          <div className="min-w-0 break-words">
            <Link href={`/post/${p.id}`} className="text-lg font-semibold leading-snug hover:text-[#2d7c26]">{p.title}</Link>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.excerpt}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {p.author ? `${p.author} · ` : ""}
              {p.date.slice(0, 10)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
