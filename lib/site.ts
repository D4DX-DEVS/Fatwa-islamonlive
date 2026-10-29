// Copied from the original WordPress site: main menu tree and homepage blocks (category ids).

export type MenuItem = { id: number; children?: MenuItem[] };

const kids = (...ids: number[]): MenuItem[] => ids.map((id) => ({ id }));

export const MENU: MenuItem[] = [
  { id: 34 }, { id: 35 }, { id: 36 }, { id: 37 }, { id: 38 },
  { id: 39, children: kids(40, 41, 42, 43) },
  { id: 44 }, { id: 45 },
];

// The original's "മറ്റുള്ളവ" (Others) dropdown
export const MENU_MORE: MenuItem[] = [
  { id: 49, children: kids(50, 51, 52, 53) },
  ...kids(54, 55, 56),
  ...kids(57, 58, 59, 60, 62, 61, 64, 63, 66, 46, 47, 48),
];

// The original's footer menu (external pages on the main islamonlive.in site and the donation page)
export const FOOTER_LINKS = [
  { label: "Support Us", href: "https://pages.razorpay.com/pl_Qic33jB70iIWlA/view" },
  { label: "About Us", href: "https://islamonlive.in/about/" },
  { label: "Privacy", href: "https://islamonlive.in/privacy-policy/" },
  { label: "Terms of Use", href: "https://islamonlive.in/terms-of-use/" },
  { label: "Contact us", href: "https://islamonlive.in/contact/" },
];

// Homepage blocks, in page order. `tabs` are the category filters shown on each block;
// the first tab is the block's default category. tone/layout/span drive the magazine look.
export type Tone = "green" | "amber" | "teal" | "sky" | "pink" | "purple" | "orange" | "rose" | "yellow" | "stone" | "dark";
export type Layout = "card" | "split" | "overlay";
export const SECTIONS: { title: string; tabs: number[]; tone: Tone; layout?: Layout; span?: 1 | 2 | 3 }[] = [
  { title: "Shariath", tabs: [44, 45, 35], tone: "green", layout: "split", span: 2 },
  { title: "Up to date", tabs: [66], tone: "sky" },
  { title: "Faith", tabs: [38, 34, 37, 36], tone: "amber" },
  { title: "Medical", tabs: [48, 63, 72, 56], tone: "teal" },
  { title: "Practice", tabs: [39, 40, 42, 41, 43], tone: "yellow" },
  { title: "Fiqh", tabs: [31, 69, 73, 67, 68, 75], tone: "orange", layout: "split", span: 2 },
  { title: "Behavioral etiquette", tabs: [62], tone: "dark", layout: "overlay" },
  { title: "Women & Family", tabs: [50, 51, 52], tone: "pink" },
  { title: "Economics", tabs: [57, 58, 59, 71], tone: "sky", layout: "split", span: 2 },
  { title: "Behavior", tabs: [62, 64], tone: "dark", layout: "overlay" },
  { title: "Death", tabs: [70, 60], tone: "stone" },
  { title: "Entertainments", tabs: [61, 74], tone: "purple", layout: "split", span: 2 },
  { title: "History & Politics", tabs: [65, 55], tone: "yellow" },
  { title: "Celebrations", tabs: [46], tone: "rose" },
  { title: "Vow & Mantra", tabs: [47, 56], tone: "green", layout: "split", span: 3 },
];

export const formatDate = (iso: string) =>
  new Date(iso.slice(0, 10)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
