import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Noto_Sans_Malayalam } from "next/font/google";
import Nav from "@/components/Nav";
import { categories, latest } from "@/lib/db";
import { FOOTER_LINKS } from "@/lib/site";
import "./globals.css";

const font = Noto_Sans_Malayalam({ subsets: ["malayalam", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Fatwa Islamonlive", template: "%s | Fatwa Islamonlive" },
  description: "The one and only comprehensive Fatwa portal in Malayalam",
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const all = await categories();
  const names = new Map(all.map((c) => [c.id, c.name]));
  const ticker = (await latest(0)).slice(0, 5);
  return (
    <html lang="ml">
      <body className={`${font.className} min-h-screen bg-neutral-50 text-neutral-900`}>
        <header className="bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
            <Link href="/"><Image src="/logo.png" alt="Fatwa Islamonlive" width={300} height={99} priority className="h-[60px] w-auto shrink sm:h-[70px]" /></Link>
            <form action="/search" role="search">
              <input name="q" placeholder="Search…" aria-label="Search" className="w-28 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm outline-none transition-all focus:w-36 focus:border-[#2d7c26] sm:w-56 sm:focus:w-72" />
            </form>
          </div>
        </header>
        <Nav names={names} />
        <div className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-hidden px-4 py-2 text-sm">
            <span className="shrink-0 rounded bg-[#dd3333] px-2 py-0.5 text-xs font-bold uppercase text-white">Latest updates</span>
            <div className="flex min-w-0 gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              {ticker.map((p) => <Link key={p.id} href={`/post/${p.id}`} className="hover:text-[#2d7c26]">{p.title}</Link>)}
            </div>
          </div>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 bg-[#222] text-neutral-300">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <nav aria-label="Footer" className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white">
              {FOOTER_LINKS.map((l) => <a key={l.href} href={l.href} className="hover:text-[#7bc96f]">{l.label}</a>)}
              <Link href="/feed.xml" className="hover:text-[#7bc96f]">RSS</Link>
              <Link href="/admin" className="text-neutral-400 hover:text-[#7bc96f]">Admin</Link>
            </nav>
            <h2 className="mb-3 border-b border-neutral-600 pb-2 font-bold text-white">Categories</h2>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {all.filter((c) => c.n > 0).map((c) => (
                <Link key={c.id} href={`/category/${c.id}`} className="hover:text-white">{c.name}</Link>
              ))}
            </p>
          </div>
          <p className="bg-black py-3 text-center text-xs text-neutral-400">© Copyright islamonlive.in, All Rights Reserved</p>
        </footer>
      </body>
    </html>
  );
}
