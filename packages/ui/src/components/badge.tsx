import * as React from "react";
import { cn } from "../lib/utils";

export const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
      {
        "border-transparent bg-primary text-primary-foreground": variant === "default",
        "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
        "text-foreground": variant === "outline",
        "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400": variant === "success",
        "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400": variant === "warning",
        "border-transparent bg-destructive/15 text-destructive": variant === "destructive",
      },
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";
