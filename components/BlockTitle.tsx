import Link from "next/link";

// Section heading in the original theme's style: coloured label on a thin rule
export default function BlockTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  const label = <span className="inline-block bg-[#2d7c26] px-3 py-1 text-sm font-bold uppercase text-white">{children}</span>;
  return <h2 className="mb-3 border-b-2 border-[#2d7c26]">{href ? <Link href={href}>{label}</Link> : label}</h2>;
}
