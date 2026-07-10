import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-6 py-7",
        className
      )}
      data-testid="empty-state"
      {...props}
    >
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <p className={cn(TYPOGRAPHY.cardTitle)}>{title}</p>
        {description && <p className={cn(TYPOGRAPHY.bodySecondary, "max-w-prose")}>{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
