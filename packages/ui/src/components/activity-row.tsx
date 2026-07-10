import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";

export interface ActivityRowProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  chip?: React.ReactNode;
}

export function ActivityRow({
  title,
  subtitle,
  icon,
  chip,
  className,
  ...props
}: ActivityRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-[4.25rem] items-start gap-4 rounded-lg border border-slate-200/80 bg-white px-4 py-3.5",
        className
      )}
      data-testid="activity-row"
      {...props}
    >
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 [&>svg]:h-5 [&>svg]:w-5"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <p className={cn(TYPOGRAPHY.body, "font-semibold text-slate-900")}>{title}</p>
          {chip}
        </div>
        {subtitle && <p className={cn(TYPOGRAPHY.meta)}>{subtitle}</p>}
      </div>
    </div>
  );
}
