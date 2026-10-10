import { AGENT_KEYS } from "@ix/agents";
import { ARTICLES } from "@/lib/articles";
import { SERVICES } from "@/lib/catalog";
import { INDUSTRIES } from "@/lib/industries";
import { LOCALES } from "@ix/i18n";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

const PATHS = ["", "/services", ...SERVICES.map((service) => `/services/${service.slug}`), "/industries", ...INDUSTRIES.map((industry) => `/industries/${industry.slug}`), "/demo", "/about", "/faq", "/privacy", "/work", "/assessment", "/platform", "/agents", "/solutions", "/business-applications", "/integrations", ...AGENT_KEYS.map((key) => `/agents/${key}`), "/insights", ...ARTICLES.map((article) => `/insights/${article.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    })),
  );
}
