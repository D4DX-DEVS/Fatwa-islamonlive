import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Images are small and served as static files
  images: { unoptimized: true },
  // admin forms are server actions (1 MB default body limit is too small for a 4 MB image); behind the domain forwarder the browser origin is the real domain
  experimental: {
    serverActions: { bodySizeLimit: "6mb", allowedOrigins: [new URL(process.env.SITE_URL ?? "http://localhost:3000").host] },
  },
  // addresses the old WordPress site served that have a direct equivalent here
  async redirects() {
    return [
      { source: "/feed", destination: "/feed.xml", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-content/uploads/:path*", destination: "/uploads/:path*", permanent: true },
    ];
  },
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
      // imported images never change under the same filename
      { source: "/uploads/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      { source: "/logo.png", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      { source: "/islamonlive-logo.png", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
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

// `next dev` only: load the local admin password (node --env-file breaks Next's child process on Node 24)
if (process.env.NODE_ENV === "development") {
  try { process.loadEnvFile(".dev.vars"); } catch { /* no local password file: /admin stays locked */ }
}
