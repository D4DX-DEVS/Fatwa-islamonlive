import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_Malayalam } from "next/font/google";
import { categories } from "@/lib/db";
import "./globals.css";

const font = Noto_Sans_Malayalam({ subsets: ["malayalam", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Fatwa Islamonlive", template: "%s | Fatwa Islamonlive" },
  description: "Comprehensive Fatwa portal in Malayalam",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const top = categories().filter((c) => c.parent === 0 && c.n > 0);
  return (
    <html lang="ml">
      <body className={`${font.className} min-h-screen bg-white text-neutral-900`}>
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 px-4 py-3">
            <Link href="/" className="text-xl font-bold text-emerald-800">Fatwa Islamonlive</Link>
            <form action="/search" className="ml-auto">
              <input name="q" placeholder="Search…" className="rounded border border-neutral-300 px-3 py-1 text-sm" />
            </form>
          </div>
          <nav className="mx-auto flex max-w-4xl gap-4 overflow-x-auto px-4 pb-2 text-sm text-neutral-600">
            {top.map((c) => (
              <Link key={c.id} href={`/category/${c.id}`} className="whitespace-nowrap hover:text-emerald-700">{c.name}</Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
