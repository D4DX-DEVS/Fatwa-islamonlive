import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_Malayalam } from "next/font/google";
import { categories } from "@/lib/db";
import "./globals.css";

const font = Noto_Sans_Malayalam({ subsets: ["malayalam", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Fatwa Islamonlive", template: "%s | Fatwa Islamonlive" },
  description: "The one and only comprehensive Fatwa portal in Malayalam",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const all = categories();
  const top = all.filter((c) => c.parent === 0 && c.n > 0);
  return (
    <html lang="ml">
      <body className={`${font.className} min-h-screen bg-white text-neutral-900`}>
        <div className="h-6 bg-black" />
        <header>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/"><img src="/logo.png" alt="Fatwa Islamonlive" width={272} height={90} className="h-[70px] w-auto" /></Link>
            <form action="/search" className="hidden sm:block">
              <input name="q" placeholder="Search…" aria-label="Search" className="rounded border border-neutral-300 px-3 py-1 text-sm" />
            </form>
          </div>
          <nav className="bg-[#2d7c26]">
            <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-sm font-semibold text-white">
              <Link href="/" className="whitespace-nowrap px-3 py-3 hover:bg-[#0e5921]">Home</Link>
              {top.map((c) => (
                <Link key={c.id} href={`/category/${c.id}`} className="whitespace-nowrap px-3 py-3 hover:bg-[#0e5921]">{c.name}</Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 bg-[#222] text-neutral-300">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="mb-3 border-b border-neutral-600 pb-2 font-bold text-white">Categories</h2>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {all.filter((c) => c.n > 0).map((c) => (
                <Link key={c.id} href={`/category/${c.id}`} className="hover:text-white">{c.name}</Link>
              ))}
            </p>
          </div>
          <p className="bg-black py-3 text-center text-xs text-neutral-400">© Fatwa.Islamonlive.in. All Rights Reserved.</p>
        </footer>
      </body>
    </html>
  );
}
