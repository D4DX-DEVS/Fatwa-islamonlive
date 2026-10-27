import { getCloudflareContext } from "@opennextjs/cloudflare";

// Images uploaded in the admin live in the R2 bucket bound as UPLOADS and are served by /media/[...key].
const bucket = () => getCloudflareContext().env.UPLOADS;
const MAX_BYTES = 5 * 1024 * 1024;
const PREFIX = "/media/";
const TYPES = { jpg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" } as const;
type Ext = keyof typeof TYPES;

// Trust the file's bytes, not its name or declared type (and no SVG, which can carry scripts)
function detect(b: Uint8Array): Ext | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "gif";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}

export const MEDIA_KEY = /^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|gif|webp)$/;

export async function saveImage(file: File): Promise<{ url: string } | { error: "size" | "type" }> {
  if (file.size > MAX_BYTES) return { error: "size" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = detect(bytes);
  if (!ext) return { error: "type" };
  const d = new Date();
  const key = `uploads/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
  await bucket().put(key, bytes, { httpMetadata: { contentType: TYPES[ext] } });
  return { url: PREFIX + key };
}

// Best effort: images from the old WordPress import (/uploads/...) are static files and are left alone
export async function removeImage(url: string | null | undefined) {
  if (url?.startsWith(PREFIX) && MEDIA_KEY.test(url.slice(PREFIX.length))) await bucket().delete(url.slice(PREFIX.length));
}

export const getImage = (key: string) => bucket().get(key);
