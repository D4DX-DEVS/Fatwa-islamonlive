import Link from "next/link";

// Page heading: green accent bar, title, optional count pill
export default function BlockTitle({ children, href, count }: { children: React.ReactNode; href?: string; count?: number }) {
  return (
    <h1 className="mb-5 flex flex-wrap items-center gap-3 text-2xl font-bold leading-snug sm:text-3xl">
      <span aria-hidden className="h-7 w-1.5 shrink-0 rounded-full bg-brand" />
      {href ? <Link href={href}>{children}</Link> : children}
      {count !== undefined && <span className="rounded-full bg-brand-soft px-3 py-0.5 text-sm font-semibold text-brand">{count} posts</span>}
    </h1>
  );
}
