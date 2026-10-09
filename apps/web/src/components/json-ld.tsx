import { SITE_URL } from "@/lib/env";

/** Emits schema.org structured data. Content comes from our own dictionaries; "<" is escaped defensively. */
export function JsonLd({ data }: { readonly data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") }}
    />
  );
}

export function faqSchema(items: readonly { readonly q: string; readonly a: string }[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

/** `trail` is the path from the site root, e.g. [["Services", "/en/services"], ["AI Agents", "/en/services/ai-agents"]]. */
export function breadcrumbSchema(trail: readonly (readonly [name: string, path: string])[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE_URL}${path}` })),
  };
}
