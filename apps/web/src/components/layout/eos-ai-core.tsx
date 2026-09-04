"use client";

import { BRANDING, cn } from "@rtb/ui";

type EosAiStatus = "online" | "degraded" | "offline";

export function EosAiCore({
  compact = false,
  status = "online",
  projectLabel,
  className,
}: {
  compact?: boolean;
  status?: EosAiStatus;
  projectLabel?: string;
  className?: string;
}) {
  const statusLabel =
    status === "online"
      ? "Engineering AI Online"
      : status === "degraded"
        ? "Engineering Intelligence Active"
        : "AI Systems Offline";

  return (
    <div
      className={cn("flex min-w-0 items-center gap-3", className)}
      data-testid="eos-ai-core"
      role="status"
      aria-label={`${BRANDING.intelligenceCore}: ${statusLabel}`}
    >
      <span
        className={cn(
          "eos-ai-pulse relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
          status === "online" && "border-[color:var(--eos-accent)] bg-[color:var(--eos-accent-soft)]",
          status === "degraded" && "border-[color:var(--eos-warning)] bg-[color:color-mix(in_srgb,var(--eos-warning)_14%,transparent)]",
          status === "offline" && "border-[color:var(--eos-danger)] bg-[color:color-mix(in_srgb,var(--eos-danger)_14%,transparent)]"
        )}
        aria-hidden
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--eos-accent)]" />
      </span>
      {compact ? (
        <span className="sr-only">
          {BRANDING.intelligenceCore}. {statusLabel}
          {projectLabel ? `. ${projectLabel}` : ""}
        </span>
      ) : (
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--eos-ai)]">
            {BRANDING.intelligenceCore}
          </p>
          <p className="truncate text-[0.9375rem] font-medium text-[color:var(--eos-text-primary)]">
            {statusLabel}
          </p>
          {projectLabel ? (
            <p className="truncate text-[0.8125rem] text-[color:var(--eos-text-secondary)]">{projectLabel}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
