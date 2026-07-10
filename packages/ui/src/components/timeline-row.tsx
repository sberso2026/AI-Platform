import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";

export interface TimelineRowProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  eventType?: string;
  occurredAt?: string | Date | null;
  icon?: React.ReactNode;
  entity?: string;
}

function formatMetaDate(value?: string | Date | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TimelineRow({
  title,
  eventType,
  occurredAt,
  icon,
  entity,
  className,
  ...props
}: TimelineRowProps) {
  const when = formatMetaDate(occurredAt);
  const meta = [eventType, when].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "flex min-h-[4.25rem] gap-4 rounded-lg border border-slate-200/80 bg-white px-4 py-3.5",
        className
      )}
      data-testid="timeline-row"
      {...props}
    >
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 [&>svg]:h-5 [&>svg]:w-5"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn(TYPOGRAPHY.body, "font-semibold text-slate-900")}>{title}</p>
        {meta && <p className={cn(TYPOGRAPHY.meta)}>{meta}</p>}
        {entity && <p className={cn(TYPOGRAPHY.meta, "text-slate-400")}>{entity}</p>}
      </div>
    </div>
  );
}
