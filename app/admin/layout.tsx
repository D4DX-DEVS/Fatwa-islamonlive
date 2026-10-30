import Link from "@/components/Link";
import { isAdmin } from "@/lib/auth";
import { logout } from "./actions";

// Admin pages depend on the login cookie, so never prerender or cache them at build time
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const signedIn = await isAdmin();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b-2 border-gold bg-deep">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="text-lg font-bold text-white">Fatwa Admin</Link>
          <nav className="ml-auto flex items-center gap-5 text-sm text-white/80">
            <Link href="/" target="_blank" className="hover:text-white">View site ↗</Link>
            {signedIn && (
              <form action={logout}>
                <button className="hover:text-white">Log out</button>
              </form>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
