import Link from "next/link";
import { MENU, MENU_MORE, type MenuItem } from "@/lib/site";

const link = "block whitespace-nowrap px-3 py-3 transition-colors hover:bg-white/15 focus-visible:bg-white/15";
const MORE = -1;

// flip: open sub-menus to the left (for items near the right edge, so they stay on screen)
function Item({ item, names, nested = false, flip = false }: { item: MenuItem; names: Map<number, string>; nested?: boolean; flip?: boolean }) {
  const label = names.get(item.id);
  const a =
    item.id === MORE ? (
      <span tabIndex={0} className={`${link} cursor-default`}>{label} ▾</span>
    ) : (
      <Link href={`/category/${item.id}`} className={link}>{label}{item.children && (nested ? (flip ? " ‹" : " ›") : " ▾")}</Link>
    );
  if (!item.children) return <li>{a}</li>;
  // phones: top-level menus span the full bar and sub-menus are hidden (all categories are also in the footer)
  const pos = nested
    ? `hidden top-0 rounded-lg md:block ${flip ? "right-full" : "left-full"}`
    : `top-full left-0 right-0 rounded-b-lg md:min-w-48 ${item.id === MORE ? "md:left-auto" : "md:right-auto"}`;
  return (
    <li className="group md:relative">
      {a}
      <ul className={`invisible absolute z-30 min-w-48 bg-[#1f5c1a] py-1 shadow-xl group-focus-within:visible group-hover:visible ${pos}`}>
        {item.children.map((c) => <Item key={c.id} item={c} names={names} nested flip={flip || item.id === MORE} />)}
      </ul>
    </li>
  );
}

export default function Nav({ names }: { names: Map<number, string> }) {
  const all = new Map(names).set(MORE, "മറ്റുള്ളവ");
  return (
    <nav className="relative z-40 bg-[#2d7c26] shadow-md md:sticky md:top-0">
      <ul className="mx-auto flex max-w-6xl flex-wrap px-2 text-sm font-semibold text-white">
        <li><Link href="/" className={link}>ഹോം</Link></li>
        {MENU.map((m) => <Item key={m.id} item={m} names={all} />)}
        <Item item={{ id: MORE, children: MENU_MORE }} names={all} />
      </ul>
    </nav>
  );
}
