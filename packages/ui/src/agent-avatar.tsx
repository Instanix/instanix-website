import type { AgentDefinition } from "@ix/agents";
import type { CSSProperties } from "react";
import { cn } from "./cn";

const SIZES = {
  xs: "size-6",
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
  xl: "size-28",
} as const;

/**
 * Accent-tinted tile behind the official character renders. The renders are
 * transparent (built by `pnpm agent-art` into each app's /public/agents), so the
 * tile follows the theme: a soft tint on light, a deep tint on dark.
 */
const TILE =
  "bg-[radial-gradient(110%_100%_at_50%_0%,color-mix(in_srgb,var(--agent)_34%,var(--ix-surface)),color-mix(in_srgb,var(--agent)_10%,var(--ix-surface))_75%)]";

function accentStyle(agent: AgentDefinition): CSSProperties {
  return { "--agent": agent.accent } as CSSProperties;
}

/** Square identity mark: the agent's head-and-chest bust. */
export function AgentAvatar({
  agent,
  size = "md",
  className,
}: {
  readonly agent: AgentDefinition;
  readonly size?: keyof typeof SIZES;
  readonly className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={accentStyle(agent)}
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-[30%] ring-1 ring-[color-mix(in_srgb,var(--agent)_35%,transparent)]",
        "shadow-[0_10px_22px_-12px_var(--agent)]",
        TILE,
        SIZES[size],
        className,
      )}
    >
      {/* Decorative: the agent's name is always rendered as text next to the avatar. */}
      <img
        src={`/agents/${agent.key}-bust.webp`}
        alt=""
        width={320}
        height={320}
        loading="lazy"
        decoding="async"
        className="size-full translate-y-[6%] object-cover"
      />
    </span>
  );
}

/** Full-body character with no tile, for hero compositions. */
export function AgentFigure({
  agent,
  className,
  priority = false,
}: {
  readonly agent: AgentDefinition;
  readonly className?: string;
  readonly priority?: boolean;
}) {
  return (
    <img
      src={`/agents/${agent.key}.webp`}
      alt=""
      aria-hidden="true"
      width={400}
      height={900}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("h-full w-auto object-contain drop-shadow-[0_24px_30px_rgb(6_23_58/0.3)]", className)}
    />
  );
}
