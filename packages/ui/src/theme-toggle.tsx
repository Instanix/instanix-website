"use client";

import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "@ix/i18n";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "./cn";

const EVENT = "ix-theme-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({
  labels,
  className,
}: {
  readonly labels: { readonly useLight: string; readonly useDark: string };
  readonly className?: string;
}) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this page view.
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "dark" ? labels.useDark : labels.useLight}
      className={cn(
        "grid size-10 place-items-center rounded-xl border border-line bg-surface text-fg-soft transition-colors hover:border-brand hover:text-brand-text",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-4.5" aria-hidden="true" /> : <Moon className="size-4.5" aria-hidden="true" />}
    </button>
  );
}
