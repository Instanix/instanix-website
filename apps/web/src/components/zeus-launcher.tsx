"use client";

import { getAgent, type AgentKey } from "@ix/agents";
import type { Dictionary, Locale } from "@ix/i18n";
import { AgentAvatar } from "@ix/ui";
import { X } from "lucide-react";
import { useId, useRef } from "react";
import { AssessmentForm } from "./assessment-form";

/**
 * Floating ZEUS button shown on every public page. It opens the project
 * assessment in a native modal dialog (focus trap and Escape come built in).
 */
export function ZeusLauncher({
  locale,
  copy,
  roles,
  bookingUrl,
  whatsappNumber,
  leadsEnabled,
}: {
  readonly locale: Locale;
  readonly copy: Dictionary["web"]["assessment"];
  readonly roles: Readonly<Record<AgentKey, string>>;
  readonly bookingUrl: string | null;
  readonly whatsappNumber: string | null;
  readonly leadsEnabled: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const zeus = getAgent("zeus");

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="ix-glass fixed end-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full py-1.5 ps-1.5 pe-5 text-sm font-extrabold shadow-ix-lg transition-transform hover:-translate-y-0.5 sm:end-6 sm:bottom-6"
      >
        <span className="relative">
          <AgentAvatar agent={zeus} size="sm" className="size-12 rounded-full" />
          <span aria-hidden="true" className="ix-anim-pulse absolute end-0 bottom-0 size-3 rounded-full border-2 border-surface bg-success" />
        </span>
        {copy.launcher.open}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // A click on the backdrop lands on the dialog element itself.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[92dvh] w-[min(100vw-1.5rem,52rem)] overflow-y-auto rounded-ix-lg border border-line bg-bg p-0 text-fg shadow-ix-lg backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <AgentAvatar agent={zeus} size="sm" />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-lg font-extrabold tracking-tight">
              {copy.launcher.title}
            </h2>
            <p className="truncate text-xs text-muted">{copy.launcher.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={copy.launcher.close}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-fg-soft transition-colors hover:border-brand hover:text-brand-text"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 sm:p-6">
          <AssessmentForm locale={locale} copy={copy} roles={roles} bookingUrl={bookingUrl} whatsappNumber={whatsappNumber} leadsEnabled={leadsEnabled} />
        </div>
      </dialog>
    </>
  );
}
