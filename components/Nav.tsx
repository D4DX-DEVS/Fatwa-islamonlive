import Link from "next/link";
import { MENU, MENU_MORE, type MenuItem } from "@/lib/site";

const link = "block whitespace-nowrap px-3 py-3 transition-colors hover:bg-white/15 focus-visible:bg-white/15";
const MORE = -1;

function Item({ item, names, nested = false }: { item: MenuItem; names: Map<number, string>; nested?: boolean }) {
  const label = names.get(item.id);
  const a =
    item.id === MORE ? (
      <span tabIndex={0} className={`${link} cursor-default`}>{label} ▾</span>
    ) : (
      <Link href={`/category/${item.id}`} className={link}>{label}{item.children && (nested ? " ›" : " ▾")}</Link>
    );
  if (!item.children) return <li>{a}</li>;
  const pos = nested ? "left-full top-0 rounded-lg" : "left-0 top-full rounded-b-lg";
  return (
    <li className="group relative">
      {a}
      <ul className={`invisible absolute z-30 min-w-48 translate-y-1 bg-[#1f5c1a] py-1 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${pos}`}>
        {item.children.map((c) => <Item key={c.id} item={c} names={names} nested />)}
      </ul>
    </li>
  );
}

export default function Nav({ names }: { names: Map<number, string> }) {
  const all = new Map(names).set(MORE, "മറ്റുള്ളവ");
  return (
    <nav className="sticky top-0 z-40 bg-[#2d7c26] shadow-md">
      <ul className="mx-auto flex max-w-6xl flex-wrap px-2 text-sm font-semibold text-white">
        <li><Link href="/" className={link}>ഹോം</Link></li>
        {MENU.map((m) => <Item key={m.id} item={m} names={all} />)}
        <Item item={{ id: MORE, children: MENU_MORE }} names={all} />
      </ul>
    </nav>
  );
}
