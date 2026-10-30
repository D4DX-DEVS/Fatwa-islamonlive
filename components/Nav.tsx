import Link from "@/components/Link";
import { MENU, MENU_MORE, type MenuItem } from "@/lib/site";

const link = "block whitespace-nowrap px-4 py-3 text-ivory transition-colors hover:text-champagne focus-visible:text-champagne md:px-3 md:py-3.5";
const MORE = -1;

function Item({ item, names, nested = false }: { item: MenuItem; names: Map<number, string>; nested?: boolean }) {
  const label = <span className="sweep">{names.get(item.id)}</span>;
  const a =
    item.id === MORE ? (
      <span tabIndex={0} className={`${link} cursor-default`}>{label} <span aria-hidden className="text-gold">▾</span></span>
    ) : (
      <Link href={`/category/${item.id}`} className={link}>{label}{item.children && <span aria-hidden className="text-gold"> ▾</span>}</Link>
    );
  if (!item.children) return <li>{a}</li>;
  // phones list every sub-menu inline; from md up, top-level menus drop down (fading and sliding in) and sub-menus open inline under their parent so they never leave the screen
  const pos = nested
    ? "max-md:block md:hidden md:bg-black/25 md:pl-3 md:group-focus-within:block md:group-hover:block"
    : `max-md:block max-md:pl-4 md:invisible md:absolute md:top-full md:z-30 md:min-w-56 md:translate-y-3 md:rounded-b-2xl md:border-t-2 md:border-gold md:bg-deep md:py-2 md:opacity-0 md:shadow-2xl md:transition-all md:duration-300 md:group-focus-within:visible md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:opacity-100 ${item.id === MORE ? "md:left-auto md:right-0" : "md:left-0 md:right-auto"}`;
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
    <nav aria-label="Main" className="geo relative z-40 border-y border-gold/40 bg-deep shadow-lg md:sticky md:top-0 md:overflow-x-clip">
      {/* CSS-only phone menu: the checkbox is toggled by the hamburger label */}
      <input type="checkbox" id="menu-toggle" aria-label="Menu" className="peer sr-only" />
      <div className="flex items-center justify-between px-2 text-ivory md:hidden">
        <Link href="/" className="px-4 py-3 text-base font-extrabold">ഹോം</Link>
        <label htmlFor="menu-toggle" className="cursor-pointer rounded-lg p-3 text-gold peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <span className="sr-only">Toggle menu</span>
        </label>
      </div>
      <ul className="mx-auto hidden max-w-7xl flex-col px-2 text-[15px] font-bold peer-checked:flex max-md:max-h-[70vh] max-md:overflow-y-auto md:flex md:flex-row md:flex-wrap">
        <li className="max-md:hidden"><Link href="/" className={link}><span className="sweep">ഹോം</span></Link></li>
        {MENU.map((m) => <Item key={m.id} item={m} names={all} />)}
        <Item item={{ id: MORE, children: MENU_MORE }} names={all} />
      </ul>
    </nav>
  );
}
