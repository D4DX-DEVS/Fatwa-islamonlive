import Image from "next/image";
import Link from "@/components/Link";
import Nav from "@/components/Nav";
import { categories, latest } from "@/lib/db";
import { FOOTER_LINKS } from "@/lib/site";

// The public site's header, menu, ticker and footer (the admin has its own shell)
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const [all, ticker] = await Promise.all([categories(), latest(0, 5)]);
  const names = new Map(all.map((c) => [c.id, c.name]));
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-ink focus:shadow-lg">Skip to content</a>

      <div className="bg-ink text-champagne/80">
        <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-between gap-4 px-4 text-xs font-semibold uppercase tracking-[0.2em]">
          <p className="truncate"><span className="sm:hidden">Malayalam fatwa portal</span><span className="max-sm:hidden">The comprehensive fatwa portal in Malayalam</span></p>
          <p className="flex shrink-0 gap-3">
            <a href={FOOTER_LINKS[0].href} className="flex min-h-11 items-center px-2 transition-colors hover:text-gold">Support us</a>
            <Link href="/feed.xml" className="flex min-h-11 items-center px-2 max-sm:hidden transition-colors hover:text-gold">RSS</Link>
          </p>
        </div>
      </div>

      <header className="geo bg-ivory">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/" className="rise shrink-0"><Image src="/logo.png" alt="Fatwa Islamonlive" width={300} height={99} priority className="h-[52px] w-auto sm:h-[68px]" /></Link>
          <form action="/search" role="search" className="group/search rise relative ml-auto [--i:1]">
            <svg aria-hidden width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input name="q" placeholder="Search…" aria-label="Search" className="w-32 rounded-full border border-gold/50 bg-paper py-2.5 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-500 placeholder:text-ink/40 focus:w-44 focus:border-gold focus:ring-4 focus:ring-gold/25 sm:w-64 sm:focus:w-80" />
          </form>
          <a href="https://www.islamonlive.in" aria-label="Islamonlive" className="rise hidden shrink-0 transition-transform duration-500 hover:scale-105 md:block [--i:2]"><Image src="/islamonlive-logo.png" alt="Islamonlive" width={298} height={81} className="h-[54px] w-auto" /></a>
        </div>
      </header>

      <Nav names={names} />

      <div className="border-b border-gold/40 bg-ink text-ivory">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 text-sm">
          <span className="sheen pulse flex shrink-0 items-center gap-2 rounded-full bg-gold px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-ink">Latest</span>
          <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
            {/* the list twice, scrolled by half its width, loops without a jump; the copy is hidden from screen readers */}
            <div className="marquee flex w-max whitespace-nowrap">
              {[...ticker, ...ticker].map((p, i) => (
                <Link key={i} href={`/post/${p.id}`} aria-hidden={i >= ticker.length || undefined} tabIndex={i >= ticker.length ? -1 : undefined} className="py-3 pr-12 font-medium transition-colors hover:text-gold">
                  <span aria-hidden className="mr-3 text-gold">◆</span>{p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main id="main" className="mx-auto max-w-7xl px-4 py-10">{children}</main>

      <footer className="geo mt-16 border-t-4 border-gold bg-deep text-ivory/80">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-14">
          <p className="max-w-3xl text-3xl font-extrabold leading-snug text-ivory sm:text-5xl sm:leading-tight">
            The one and only comprehensive <span className="text-gold">Fatwa</span> portal in Malayalam.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.6fr]">
            <div>
              <span className="inline-block rounded-2xl bg-ivory p-3.5"><Image src="/islamonlive-logo.png" alt="Islamonlive" width={298} height={81} className="h-11 w-auto" /></span>
              <nav aria-label="Footer" className="mt-8">
                <h2 className="mb-4 text-xs font-extrabold uppercase tracking-[0.25em] text-gold">Links</h2>
                <ul className="text-sm font-semibold">
                  {FOOTER_LINKS.map((l) => <li key={l.href}><a href={l.href} className="inline-block min-h-11 min-w-11 py-3 transition-colors hover:text-gold"><span className="sweep">{l.label}</span></a></li>)}
                  <li><Link href="/feed.xml" className="inline-block min-h-11 min-w-11 py-3 transition-colors hover:text-gold"><span className="sweep">RSS</span></Link></li>
                  <li><Link href="/admin" className="inline-block min-h-11 min-w-11 py-3 text-ivory/65 transition-colors hover:text-gold">Admin</Link></li>
                </ul>
              </nav>
            </div>
            <div>
              <h2 className="mb-4 text-xs font-extrabold uppercase tracking-[0.25em] text-gold">Categories</h2>
              <p className="flex flex-wrap gap-2 text-[13px] font-semibold">
                {all.filter((c) => c.n > 0).map((c) => (
                  <Link key={c.id} href={`/category/${c.id}`} className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-3.5 text-champagne transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-ink">{c.name}</Link>
                ))}
              </p>
            </div>
          </div>
          <p className="mt-14 border-t border-gold/25 pt-6 text-center text-xs tracking-wide text-ivory/65">© Copyright islamonlive.in, All Rights Reserved</p>
        </div>
      </footer>
    </>
  );
}
