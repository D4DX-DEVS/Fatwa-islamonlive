import Link from "next/link";
import PostList from "@/components/PostList";
import { latest } from "@/lib/db";

export default function Home() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">Latest fatwas</h1>
      <PostList posts={latest(0)} />
      <p className="mt-4 text-sm">
        <Link href="/page/2" className="text-emerald-700">Older →</Link>
      </p>
    </>
  );
}
