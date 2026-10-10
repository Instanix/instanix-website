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
 * When a WhatsApp number is configured, a WhatsApp button sits above it.
 */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
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
      {whatsappNumber ? (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp_float"
          aria-label={copy.launcher.whatsapp}
          title={copy.launcher.whatsapp}
          className="fixed end-4 bottom-[4.75rem] z-40 grid size-12 place-items-center rounded-full bg-[#25d366] text-white shadow-ix-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366] sm:end-6 sm:bottom-[5.5rem] print:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
            <path d={WHATSAPP_PATH} />
          </svg>
        </a>
      ) : null}
      <button
        type="button"
        data-track="zeus_open"
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
        data-lenis-prevent
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
