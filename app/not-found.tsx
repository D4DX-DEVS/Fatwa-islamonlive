import Link from "next/link";
import SiteShell from "@/components/SiteShell";

// Unmatched URLs render outside the (site) layout, so wrap them in the site chrome here
export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-6xl font-bold text-brand/25">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-neutral-600">The page you are looking for does not exist or has moved.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/" className="rounded-full bg-brand px-5 py-2 text-white transition-colors hover:bg-brand-dark">Home</Link>
          <Link href="/search" className="rounded-full border border-neutral-200 px-5 py-2 transition-colors hover:border-brand hover:text-brand">Search</Link>
        </div>
      </div>
    </SiteShell>
  );
}
