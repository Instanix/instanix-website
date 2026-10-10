import path from "node:path";
import type { NextConfig } from "next";

/**
 * On the host the site runs as a Next.js standalone server, which is assembled at build time
 * from files inside the tracing root. The host is recognized the same way as in
 * scripts/self-contain-web.mjs, which first gives this folder its own dependency tree.
 */
const onHost = process.env.IX_SELF_CONTAIN === "1" || import.meta.dirname.split(path.sep).includes("hbuilds");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(onHost ? { output: "standalone" as const, outputFileTracingRoot: import.meta.dirname } : {}),
  transpilePackages: ["@ix/ui", "@ix/i18n", "@ix/agents", "@ix/ai", "@ix/db", "@ix/integrations"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
