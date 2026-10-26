import type { NextConfig } from "next";

// Old WordPress plain-permalink URLs -> new routes
const legacy = (key: string, to: string) => ({
  source: "/",
  has: [{ type: "query" as const, key, value: "(?<id>\\d+)" }],
  destination: to,
  permanent: true,
});

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      legacy("p", "/post/:id"),
      legacy("cat", "/category/:id"),
      legacy("author", "/author/:id"),
      { source: "/", has: [{ type: "query", key: "s", value: "(?<q>.+)" }], destination: "/search?q=:q", permanent: true },
    ];
  },
};

export default nextConfig;
