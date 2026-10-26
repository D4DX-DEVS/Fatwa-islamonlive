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
  { id: 57, children: kids(58, 59) },
  ...kids(60, 62, 61, 64, 63, 66, 46, 47, 48),
];

// Homepage blocks, in page order. `tabs` are the category filters shown on each block;
// the first tab is the block's default category.
export const SECTIONS: { title: string; tabs: number[] }[] = [
  { title: "Shariath", tabs: [44, 45, 35] },
  { title: "Up to date", tabs: [66] },
  { title: "Faith", tabs: [38, 34, 37, 36] },
  { title: "Medical", tabs: [48, 63, 72, 56] },
  { title: "Practice", tabs: [39, 40, 42, 41, 43] },
  { title: "Fiqh", tabs: [31, 69, 73, 67, 68, 75] },
  { title: "Behavioral etiquette", tabs: [62] },
  { title: "Women & Family", tabs: [50, 51, 52] },
  { title: "Economics", tabs: [57, 58, 59, 71] },
  { title: "Behavior", tabs: [62, 64] },
  { title: "Death", tabs: [70, 60] },
  { title: "Entertainments", tabs: [61, 74] },
  { title: "History & Politics", tabs: [65, 55] },
  { title: "Celebrations", tabs: [46] },
  { title: "Vow & Mantra", tabs: [47, 56] },
];
