import * as React from "react";
import { cn, cva, type VariantProps } from "../lib/utils";

const statusChipVariants = cva(
  "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.8125rem] font-semibold leading-none whitespace-nowrap",
  {
    variants: {
      status: {
        pending: "border-[color:color-mix(in_srgb,var(--eos-warning)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-warning)_14%,transparent)] text-[color:var(--eos-warning)]",
        approved: "border-[color:color-mix(in_srgb,var(--eos-success)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-success)_14%,transparent)] text-[color:var(--eos-success)]",
        rejected: "border-[color:color-mix(in_srgb,var(--eos-danger)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-danger)_14%,transparent)] text-[color:var(--eos-danger)]",
        open: "border-[color:color-mix(in_srgb,var(--eos-accent)_45%,transparent)] bg-[color:var(--eos-accent-soft)] text-[color:var(--eos-accent)]",
        closed: "border-[color:var(--eos-border)] bg-[color:var(--eos-bg-secondary)] text-[color:var(--eos-text-secondary)]",
        high: "border-[color:color-mix(in_srgb,var(--eos-warning)_55%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-warning)_16%,transparent)] text-[color:var(--eos-warning)]",
        medium: "border-[color:color-mix(in_srgb,var(--eos-warning)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-warning)_10%,transparent)] text-[color:var(--eos-warning)]",
        low: "border-[color:var(--eos-border)] bg-[color:var(--eos-bg-secondary)] text-[color:var(--eos-text-secondary)]",
        critical: "border-[color:color-mix(in_srgb,var(--eos-danger)_55%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-danger)_18%,transparent)] text-[color:var(--eos-danger)]",
        overdue: "border-[color:color-mix(in_srgb,var(--eos-danger)_50%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-danger)_12%,transparent)] text-[color:var(--eos-danger)]",
        complete: "border-[color:color-mix(in_srgb,var(--eos-success)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-success)_14%,transparent)] text-[color:var(--eos-success)]",
        "ai-review": "border-[color:color-mix(in_srgb,var(--eos-ai)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-ai)_14%,transparent)] text-[color:var(--eos-ai)]",
        neutral: "border-[color:var(--eos-border)] bg-[color:var(--eos-panel)] text-[color:var(--eos-text-secondary)]",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

export type StatusChipStatus = NonNullable<
  VariantProps<typeof statusChipVariants>["status"]
>;

const STATUS_LABELS: Record<StatusChipStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  open: "Open",
  closed: "Closed",
  high: "High",
  medium: "Medium",
  low: "Low",
  critical: "Critical",
  overdue: "Overdue",
  complete: "Complete",
  "ai-review": "AI Review Required",
  neutral: "Unknown",
};

/** Map free-form engineering status strings to chip variants. */
export function resolveStatusChip(value: string | null | undefined): {
  status: StatusChipStatus;
  label: string;
} {
  if (!value) return { status: "neutral", label: "—" };
  const raw = value.trim();
  const key = raw.toLowerCase().replace(/[\s_]+/g, "-");

  const aliases: Record<string, StatusChipStatus> = {
    pending: "pending",
    "in-review": "pending",
    review: "pending",
    "review-required": "ai-review",
    "ai-review": "ai-review",
    "ai-review-required": "ai-review",
    "requires-review": "ai-review",
    approved: "approved",
    accepted: "approved",
    rejected: "rejected",
    declined: "rejected",
    open: "open",
    active: "open",
    closed: "closed",
    resolved: "closed",
    high: "high",
    medium: "medium",
    med: "medium",
    low: "low",
    critical: "critical",
    overdue: "overdue",
    late: "overdue",
    complete: "complete",
    completed: "complete",
    done: "complete",
    operational: "complete",
  };

  const status = aliases[key] ?? "neutral";
  return {
    status,
    label: status === "neutral" ? raw : STATUS_LABELS[status],
  };
}

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  /** Free-form status; overrides `status` when provided */
  value?: string | null;
  showDot?: boolean;
}

export const StatusChip = React.forwardRef<HTMLSpanElement, StatusChipProps>(
  ({ className, status, value, showDot = true, children, ...props }, ref) => {
    const resolved = value != null ? resolveStatusChip(value) : null;
    const variant = resolved?.status ?? status ?? "neutral";
    const label = children ?? resolved?.label ?? STATUS_LABELS[variant];

    return (
      <span
        ref={ref}
        className={cn(statusChipVariants({ status: variant }), className)}
        data-testid="status-chip"
        data-status={variant}
        {...props}
      >
        {showDot && (
          <span
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80"
            aria-hidden
          />
        )}
        <span>{label}</span>
      </span>
    );
  }
);
StatusChip.displayName = "StatusChip";

export { statusChipVariants, STATUS_LABELS };
