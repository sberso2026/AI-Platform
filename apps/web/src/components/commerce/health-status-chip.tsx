import { cn } from "@rtb/ui";
import type { HealthStatus } from "@rtb/platform-core";
import { HEALTH_STATUS_LABELS } from "@rtb/platform-core";

const HEALTH_TONE: Record<HealthStatus, string> = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  degraded: "border-orange-200 bg-orange-50 text-orange-900",
  failed: "border-red-200 bg-red-50 text-red-900",
  suspended: "border-slate-200 bg-slate-100 text-slate-700",
};

export function HealthStatusChip({
  status,
  className,
}: {
  status: HealthStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col gap-0.5 rounded-md border px-2 py-1 text-xs",
        HEALTH_TONE[status],
        className
      )}
      data-testid="status-health"
      data-status={status}
      aria-label={`Health: ${HEALTH_STATUS_LABELS[status]}`}
    >
      <span className="text-[0.65rem] font-medium uppercase tracking-wide opacity-70">
        Health
      </span>
      <span className="font-semibold">{HEALTH_STATUS_LABELS[status]}</span>
    </span>
  );
}
