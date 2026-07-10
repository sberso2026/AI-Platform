import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn("mb-4 flex items-end justify-between gap-3", className)}
      data-testid="section-header"
      {...props}
    >
      <div className="min-w-0">
        <h2 className={cn(TYPOGRAPHY.sectionHeading)}>{title}</h2>
        {description && <p className={cn(TYPOGRAPHY.meta, "mt-1")}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
