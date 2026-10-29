import { getCloudflareContext } from "@opennextjs/cloudflare";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { prod } from "@/lib/db";

// Images uploaded in the admin live in the R2 bucket bound as UPLOADS and are served by /media/[...key].
// In dev (see `prod` in lib/db.ts) they go to the local .dev-uploads folder instead.
const bucket = () => getCloudflareContext().env.UPLOADS;
const devFile = (key: string) => join(".dev-uploads", key);
const MAX_BYTES = 4 * 1024 * 1024;
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
  if (prod) await bucket().put(key, bytes, { httpMetadata: { contentType: TYPES[ext] } });
  else {
    await mkdir(dirname(devFile(key)), { recursive: true });
    await writeFile(devFile(key), bytes);
  }
  return { url: PREFIX + key };
}

// Best effort: images from the old WordPress import (/uploads/...) are static files and are left alone
export async function removeImage(url: string | null | undefined) {
  if (!url?.startsWith(PREFIX) || !MEDIA_KEY.test(url.slice(PREFIX.length))) return;
  const key = url.slice(PREFIX.length);
  if (prod) await bucket().delete(key);
  else await rm(devFile(key), { force: true });
}

export async function getImage(key: string): Promise<{ body: BodyInit; type: string; etag: string | null } | null> {
  if (prod) {
    const obj = await bucket().get(key);
    return obj ? { body: obj.body as unknown as BodyInit, type: obj.httpMetadata?.contentType ?? "application/octet-stream", etag: obj.httpEtag } : null;
  }
  try {
    const ext = key.split(".").pop() as Ext;
    return { body: new Uint8Array(await readFile(devFile(key))), type: TYPES[ext], etag: null };
  } catch {
    return null;
  }
}
