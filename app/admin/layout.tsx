import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logout } from "./actions";

// Admin pages depend on the login cookie, so never prerender or cache them at build time
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const signedIn = await isAdmin();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="text-lg font-bold text-[#2d7c26]">Fatwa Admin</Link>
          <nav className="ml-auto flex items-center gap-5 text-sm text-slate-600">
            <Link href="/" target="_blank" className="hover:text-slate-900">View site ↗</Link>
            {signedIn && (
              <form action={logout}>
                <button className="hover:text-slate-900">Log out</button>
              </form>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
