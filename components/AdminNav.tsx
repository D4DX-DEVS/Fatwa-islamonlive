"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { item } from "@/components/adminStyles";

const icon = (d: string) => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
// the sidebar's own pages; the current one is outlined
export default function AdminNav() {
  const path = usePathname();
  const links = [
    { href: "/admin", label: "Posts", on: path === "/admin" || (path.startsWith("/admin/") && path !== "/admin/new"), d: "M4 6h16M4 12h16M4 18h10" },
    { href: "/admin/new", label: "New post", on: path === "/admin/new", d: "M12 5v14M5 12h14" },
  ];
  return (
    <>
      {links.map((l) => (
        <Link key={l.href} href={l.href} aria-current={l.on ? "page" : undefined} className={`${item} ${l.on ? "!border-deep bg-deep/5 !text-deep" : ""}`}>
          {icon(l.d)}{l.label}
        </Link>
      ))}
    </>
  );
}
