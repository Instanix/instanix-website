"use client";

import type { Locale } from "@ix/i18n";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * First-party statistics without cookies. It reports page views and a few key actions to
 * this site's own endpoint and to nobody else. It never sends what a visitor types, and it
 * stays silent for visitors who ask not to be tracked.
 */

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

function send(payload: { kind: "view" | "action"; name?: string; path: string; locale: string; referrer?: string | null }) {
  try {
    if (optedOut()) return;
    void fetch("/api/v1/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Statistics must never break the page.
  }
}

/** Records a key action, e.g. `track("lead_submitted")`. Lowercase letters, digits and underscores only. */
export function track(name: string) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  send({ kind: "action", name, path, locale: path.startsWith("/ar") ? "ar" : "en" });
}

/** What a click on a link means, when the link does not say so itself with `data-track`. */
function actionForLink(href: string): string | null {
  if (href.startsWith("https://wa.me/")) return "whatsapp";
  if (href.includes("calendly.com")) return "booking";
  if (href.startsWith("mailto:")) return "email";
  if (/\/assessment\/?$/.test(href.split(/[?#]/)[0] ?? "")) return "assessment_open";
  return null;
}

export function SiteStats({ locale }: { readonly locale: Locale }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    // The first view carries where the visitor came from; later ones are navigation inside the site.
    send({ kind: "view", path: pathname, locale, referrer: first.current ? document.referrer || null : null });
    first.current = false;
  }, [pathname, locale]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-track], a[href]") : null;
      if (!target) return;
      const name = target.getAttribute("data-track") ?? (target instanceof HTMLAnchorElement ? actionForLink(target.href) : null);
      if (name) track(name);
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
