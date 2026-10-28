import { MEDIA_KEY, getImage } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!MEDIA_KEY.test(key)) return new Response("Not found", { status: 404 });
  const img = await getImage(key);
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(img.body, {
    headers: {
      "Content-Type": img.type,
      ...(img.etag && { ETag: img.etag }),
      // keys contain a random id and are never reused, so browsers and Vercel's CDN may keep them for a year
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
