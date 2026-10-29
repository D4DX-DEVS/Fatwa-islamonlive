import Link from "next/link";
import { MENU, MENU_MORE, type MenuItem } from "@/lib/site";

const link = "block whitespace-nowrap px-4 py-3 transition-colors hover:bg-white/15 focus-visible:bg-white/15 md:my-1.5 md:rounded-lg md:px-3 md:py-1.5";
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
  // phones list every sub-menu inline; from md up, top-level menus drop down and sub-menus open inline under their parent so they never leave the screen
  const pos = nested
    ? "max-md:block md:hidden md:bg-black/20 md:pl-3 md:group-focus-within:block md:group-hover:block"
    : `max-md:block max-md:pl-4 md:invisible md:absolute md:top-full md:z-30 md:min-w-52 md:rounded-b-xl md:bg-brand-dark md:py-1 md:shadow-xl md:group-focus-within:visible md:group-hover:visible ${item.id === MORE ? "md:left-auto md:right-0" : "md:left-0 md:right-auto"}`;
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
    <nav aria-label="Main" className="relative z-40 bg-gradient-to-r from-brand-dark via-brand to-brand-dark shadow-md md:sticky md:top-0">
      {/* CSS-only phone menu: the checkbox is toggled by the hamburger label */}
      <input type="checkbox" id="menu-toggle" aria-label="Menu" className="peer sr-only" />
      <div className="flex items-center justify-between px-2 text-white md:hidden">
        <Link href="/" className="px-4 py-3 text-sm font-semibold">ഹോം</Link>
        <label htmlFor="menu-toggle" className="cursor-pointer rounded-lg p-3 peer-focus-visible:ring-2 peer-focus-visible:ring-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="sr-only">Toggle menu</span>
        </label>
      </div>
      <ul className="mx-auto hidden max-w-6xl flex-col px-2 text-sm font-semibold text-white peer-checked:flex max-md:max-h-[70vh] max-md:overflow-y-auto md:flex md:flex-row md:flex-wrap">
        <li className="max-md:hidden"><Link href="/" className={link}>ഹോം</Link></li>
        {MENU.map((m) => <Item key={m.id} item={m} names={all} />)}
        <Item item={{ id: MORE, children: MENU_MORE }} names={all} />
      </ul>
    </nav>
  );
}
