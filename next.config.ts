import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Images are small and served straight from Cloudflare's asset storage
  images: { unoptimized: true },
  // admin image uploads go through a server action (5 MB image + form overhead)
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// lets `next dev` use the D1 binding from wrangler.jsonc
initOpenNextCloudflareForDev();

// `next dev` only: load the local admin password (node --env-file breaks Next's child process on Node 24)
if (process.env.NODE_ENV === "development") {
  try { process.loadEnvFile(".dev.vars"); } catch { /* no local password file: /admin stays locked */ }
}
