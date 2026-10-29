import Image from "next/image";
import Link from "@/components/Link";
import Nav from "@/components/Nav";
import { categories, latest } from "@/lib/db";
import { FOOTER_LINKS } from "@/lib/site";

// The public site's header, menu, ticker and footer (the admin has its own shell)
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const all = await categories();
  const names = new Map(all.map((c) => [c.id, c.name]));
  const ticker = await latest(0, 5);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">Skip to content</a>
      <header className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/"><Image src="/logo.png" alt="Fatwa Islamonlive" width={300} height={99} priority className="h-[52px] w-auto shrink sm:h-[64px]" /></Link>
          <form action="/search" role="search" className="relative ml-auto">
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input name="q" placeholder="Search…" aria-label="Search" className="w-32 rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:w-40 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 sm:w-60 sm:focus:w-72" />
          </form>
          <a href="https://www.islamonlive.in" aria-label="Islamonlive" className="hidden shrink-0 md:block"><Image src="/islamonlive-logo.png" alt="Islamonlive" width={298} height={81} className="h-[54px] w-auto" /></a>
        </div>
      </header>
      <Nav names={names} />
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-hidden px-4 py-2 text-sm">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#dd3333] px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-white" />Latest
          </span>
          <div className="flex min-w-0 gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
            {ticker.map((p) => <Link key={p.id} href={`/post/${p.id}`} className="hover:text-brand">{p.title}</Link>)}
          </div>
        </div>
      </div>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mt-12 bg-[#10241a] text-neutral-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_2fr]">
          <div>
            <span className="inline-block rounded-xl bg-white p-3"><Image src="/islamonlive-logo.png" alt="Islamonlive" width={298} height={81} className="h-10 w-auto" /></span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">The one and only comprehensive Fatwa portal in Malayalam.</p>
          </div>
          <nav aria-label="Footer">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Links</h2>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.map((l) => <li key={l.href}><a href={l.href} className="hover:text-white">{l.label}</a></li>)}
              <li><Link href="/feed.xml" className="hover:text-white">RSS</Link></li>
              <li><Link href="/admin" className="text-neutral-500 hover:text-white">Admin</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Categories</h2>
            <p className="flex flex-wrap gap-2 text-xs">
              {all.filter((c) => c.n > 0).map((c) => (
                <Link key={c.id} href={`/category/${c.id}`} className="rounded-full bg-white/10 px-3 py-1 transition-colors hover:bg-white/20 hover:text-white">{c.name}</Link>
              ))}
            </p>
          </div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs text-neutral-500">© Copyright islamonlive.in, All Rights Reserved</p>
      </footer>
    </>
  );
}
