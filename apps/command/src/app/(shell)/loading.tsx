"use client";

import { useI18n } from "@/components/i18n-provider";

export default function Loading() {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">{t.command.states.loading}</span>
      <div aria-hidden="true" className="space-y-2">
        <div className="ix-skeleton h-8 w-56" />
        <div className="ix-skeleton h-4 w-80 max-w-full" />
      </div>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="ix-skeleton h-56 rounded-ix" />
        ))}
      </div>
    </div>
  );
}
