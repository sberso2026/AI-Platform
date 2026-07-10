import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

/**
 * Page title block used inside the app header / page chrome.
 * Typography: ~30px title, ~15px subtitle.
 */
export function PageHeader({ title, description, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("min-w-0", className)} data-testid="page-header" {...props}>
      <h1 className={cn(TYPOGRAPHY.pageTitle, "select-none truncate")}>{title}</h1>
      {description && (
        <p className={cn(TYPOGRAPHY.pageSubtitle, "mt-1 select-none truncate")}>{description}</p>
      )}
    </div>
  );
}
