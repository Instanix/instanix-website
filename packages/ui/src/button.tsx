import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "on-ink";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "ix-btn inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow,transform,color] duration-300 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "ix-btn-primary text-on-primary",
  secondary: "ix-btn-glass text-fg",
  ghost: "text-fg-soft hover:bg-surface-2 hover:text-fg",
  "on-ink": "border border-ink-line bg-white/8 text-on-ink backdrop-blur hover:bg-white/14",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-7 text-base",
};

/** Class string for anything that should look like a button (e.g. a router link). */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
