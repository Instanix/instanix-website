import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

/**
 * Open to search engines and to AI answer engines (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended…): being cited by them is a goal of this site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
