import { NextResponse, type NextRequest } from "next/server";

// Old WordPress plain-permalink URLs (/?p=ID etc.) -> new routes, without the stale query string
const ROUTES = { p: "post", cat: "category", author: "author" } as const;

export function proxy(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  for (const [key, route] of Object.entries(ROUTES)) {
    const id = q.get(key);
    if (id && /^\d+$/.test(id)) return NextResponse.redirect(new URL(`/${route}/${id}`, request.url), 308);
  }
  const s = q.get("s");
  if (s) return NextResponse.redirect(new URL(`/search?q=${encodeURIComponent(s)}`, request.url), 308);
  return NextResponse.next();
}

export const config = { matcher: "/" };
