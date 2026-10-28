// Admin pages depend on the login cookie, so never prerender or cache them at build time
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
