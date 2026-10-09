import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-ix border border-line bg-surface shadow-ix", className)} {...props} />;
}

export function Eyebrow({ className, children }: { readonly className?: string; readonly children: ReactNode }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold tracking-wide text-brand-text uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
      {children}
    </p>
  );
}

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-fg-soft",
  brand: "bg-brand-soft text-brand-text",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  readonly tone?: BadgeTone;
  readonly dot?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        BADGE_TONES[tone],
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/** Explicit empty state: used wherever there is no real data to show. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly body?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-4 py-8 text-center", className)}>
      {icon ? (
        <div aria-hidden="true" className="mb-1 grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-text">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-fg">{title}</p>
      {body ? <p className="max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
