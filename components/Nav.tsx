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
      <Link href={`/category/${item.id}`} className={link}>{label}{item.children && " ▾"}</Link>
    );
  if (!item.children) return <li>{a}</li>;
  // top-level menus drop down; sub-menus open inline under their parent so they never leave the screen
  const pos = nested
    ? "hidden bg-black/20 pl-3 group-focus-within:block group-hover:block"
    : `invisible absolute top-full left-0 right-0 z-30 min-w-48 rounded-b-lg bg-[#1f5c1a] py-1 shadow-xl group-focus-within:visible group-hover:visible ${item.id === MORE ? "md:left-auto" : "md:right-auto"}`;
  return (
    // "Others" sits at the row's right end and can wrap on mid widths, so only pin it to its button on wide screens
    <li className={`group ${item.id === MORE ? "lg:relative" : "md:relative"}`}>
      {a}
      <ul className={pos}>
        {item.children.map((c) => <Item key={c.id} item={c} names={names} nested />)}
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
