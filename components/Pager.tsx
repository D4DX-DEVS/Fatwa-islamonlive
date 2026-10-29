import Link from "@/components/Link";

// ?page=N -> N (1 when absent); 0 when it is not a positive whole number
export function parsePage(raw: string | string[] | undefined) {
  const n = Number((Array.isArray(raw) ? raw[0] : raw) ?? 1);
  return Number.isInteger(n) && n >= 1 ? n : 0;
}

// 1 … n-2 n-1 [n] n+1 n+2 … last
function windowed(n: number, last: number) {
  const pages = [...new Set([1, n - 2, n - 1, n, n + 1, n + 2, last].filter((x) => x >= 1 && x <= last))].sort((a, b) => a - b);
  return pages.flatMap((x, i) => (i && x - pages[i - 1] > 1 ? [`gap${x}`, x] : [x]));
}

export default function Pager({ page, last, href }: { page: number; last: number; href: (n: number) => string }) {
  if (last < 2) return null;
  const cell = "grid h-11 min-w-11 place-items-center rounded-full border px-4 text-sm font-extrabold transition-all duration-300";
  const idle = `${cell} border-gold/40 bg-paper text-deep hover:-translate-y-0.5 hover:border-deep hover:bg-deep hover:text-champagne`;
  return (
    <nav aria-label="Pages" className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
      {page > 1 && <Link href={href(page - 1)} className={idle}>← Newer</Link>}
      {windowed(page, last).map((x) =>
        typeof x === "string" ? <span key={x} className="px-1 text-goldtext">…</span>
        : x === page ? <span key={x} aria-current="page" className={`${cell} border-deep bg-deep text-gold shadow-lg shadow-deep/30`}>{x}</span>
        : <Link key={x} href={href(x)} className={idle}>{x}</Link>,
      )}
      {page < last && <Link href={href(page + 1)} className={idle}>Older →</Link>}
    </nav>
  );
}
