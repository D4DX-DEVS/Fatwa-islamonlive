import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secret = () => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD env var not set");
  return pw;
};
const sign = () => createHmac("sha256", secret()).update("admin").digest("hex");

export const checkPassword = (input: string) => {
  const a = createHmac("sha256", "x").update(input).digest();
  const b = createHmac("sha256", "x").update(secret()).digest();
  return timingSafeEqual(a, b);
};

export async function setSession() {
  (await cookies()).set("admin", sign(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
}
export async function clearSession() {
  (await cookies()).delete("admin");
}
export async function isAdmin() {
  const v = (await cookies()).get("admin")?.value ?? "";
  const ok = sign();
  return v.length === ok.length && timingSafeEqual(Buffer.from(v), Buffer.from(ok));
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}
