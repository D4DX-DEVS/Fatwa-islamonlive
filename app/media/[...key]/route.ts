import { MEDIA_KEY, getImage } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!MEDIA_KEY.test(key)) return new Response("Not found", { status: 404 });
  const obj = await getImage(key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      ETag: obj.httpEtag,
      // keys contain a random id and are never reused, so browsers may keep them for a year
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
