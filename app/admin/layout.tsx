import Image from "next/image";
import Link from "@/components/Link";
import AdminNav from "@/components/AdminNav";
import { item } from "@/components/adminStyles";
import { isAdmin } from "@/lib/auth";
import { logout } from "./actions";

// Admin pages depend on the login cookie, so never prerender or cache them at build time
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const signedIn = await isAdmin();
  if (!signedIn) return <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">{children}</div>;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <Link href="/admin" className="block px-1 pb-2">
          <Image src="/logo.png" alt="Fatwa Admin" width={300} height={99} className="h-10 w-auto lg:h-12" />
        </Link>
        <nav aria-label="Admin" className="flex flex-wrap gap-1 lg:flex-col">
          <AdminNav />
          <Link href="/" target="_blank" className={item}>
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
            View site
          </Link>
        </nav>
        <form action={logout} className="lg:mt-auto">
          <button className={`${item} w-full`}>
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" /></svg>
            Log out
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
