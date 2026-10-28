import Link from "next/link";
import SiteShell from "@/components/SiteShell";

// Unmatched URLs render outside the (site) layout, so wrap them in the site chrome here
export default function NotFound() {
  return (
    <SiteShell>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-neutral-600">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-4 inline-block text-emerald-700 underline">Back to home</Link>
    </SiteShell>
  );
}
