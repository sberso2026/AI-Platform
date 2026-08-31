import * as React from "react";
import { cn, cva, type VariantProps } from "../lib/utils";

const statusChipVariants = cva(
  "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.8125rem] font-semibold leading-none whitespace-nowrap",
  {
    variants: {
      status: {
        pending: "border-amber-200 bg-amber-50 text-amber-900",
        approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
        rejected: "border-red-200 bg-red-50 text-red-900",
        open: "border-sky-200 bg-sky-50 text-sky-900",
        closed: "border-slate-200 bg-slate-100 text-slate-700",
        high: "border-orange-200 bg-orange-50 text-orange-900",
        medium: "border-amber-200 bg-amber-50 text-amber-900",
        low: "border-slate-200 bg-slate-50 text-slate-700",
        critical: "border-red-300 bg-red-100 text-red-950",
        overdue: "border-rose-300 bg-rose-50 text-rose-950",
        complete: "border-emerald-200 bg-emerald-50 text-emerald-900",
        "in-progress": "border-blue-200 bg-blue-50 text-blue-900",
        "ai-review": "border-violet-200 bg-violet-50 text-violet-950",
        neutral: "border-slate-200 bg-white text-slate-700",
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
  "in-progress": "In Progress",
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
    "in-progress": "in-progress",
    progress: "in-progress",
    draft: "pending",
    "review-required": "ai-review",
    "ai-review": "ai-review",
    "ai-review-required": "ai-review",
    "requires-review": "ai-review",
    approved: "approved",
    accepted: "approved",
    verified: "approved",
    rejected: "rejected",
    declined: "rejected",
    open: "open",
    active: "open",
    closed: "closed",
    resolved: "closed",
    inactive: "closed",
    archived: "closed",
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
  };

  const status = aliases[key] ?? "neutral";
  const presented =
    status === "neutral"
      ? raw.replace(/[_-]+/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())
      : STATUS_LABELS[status];
  return {
    status,
    label: presented,
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
