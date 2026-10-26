import Link from "next/link";
import type { PostCard } from "@/lib/db";

export default function PostList({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return <p className="text-neutral-500">No posts found.</p>;
  return (
    <ul className="divide-y divide-neutral-200">
      {posts.map((p) => (
        <li key={p.id} className="py-4">
          <Link href={`/post/${p.id}`} className="text-lg font-semibold leading-snug hover:text-emerald-700">
            {p.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.excerpt}</p>
          <p className="mt-1 text-xs text-neutral-400">
            {p.author ? `${p.author} · ` : ""}
            {p.date.slice(0, 10)}
          </p>
        </li>
      ))}
    </ul>
  );
}
