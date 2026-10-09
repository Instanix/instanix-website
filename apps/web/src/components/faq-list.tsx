import { ChevronDown } from "lucide-react";

/** Question-and-answer list. Uses native <details>, so answers stay in the HTML for crawlers and work without JavaScript. */
export function FaqList({ items }: { readonly items: readonly { readonly q: string; readonly a: string }[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-ix border border-line bg-surface shadow-ix">
      {items.map(({ q, a }) => (
        <details key={q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start font-bold transition-colors hover:bg-surface-2 sm:px-6 [&::-webkit-details-marker]:hidden">
            <h3 className="text-base sm:text-lg">{q}</h3>
            <ChevronDown className="size-5 shrink-0 text-brand-text transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="px-5 pb-5 text-pretty text-fg-soft sm:px-6">{a}</p>
        </details>
      ))}
    </div>
  );
}
