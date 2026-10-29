import Link from "@/components/Link";

// Page heading: gold eyebrow, big display title, count badge and a gold rule that draws itself in
export default function BlockTitle({ children, href, count, eyebrow = "Fatwa Islamonlive" }: { children: React.ReactNode; href?: string; count?: number; eyebrow?: string }) {
  return (
    <div className="mb-8">
      <p className="rise text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h1 className="rise mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-4xl font-extrabold leading-tight text-deep [--i:1] sm:text-6xl sm:leading-tight">
        {href ? <Link href={href}>{children}</Link> : children}
        {count !== undefined && (
          <span className="rounded-full bg-deep px-4 py-1 text-sm font-bold tracking-wide text-champagne sm:text-base">{count} posts</span>
        )}
      </h1>
      <div aria-hidden className="mt-5 flex items-center gap-3">
        <span className="h-px w-full max-w-md origin-left bg-gradient-to-r from-gold to-transparent [animation:grow_1.2s_cubic-bezier(.2,.7,.2,1)_.3s_both]" />
        <span className="text-gold">◆</span>
      </div>
    </div>
  );
}
