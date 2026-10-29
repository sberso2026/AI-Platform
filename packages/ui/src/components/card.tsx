import * as React from "react";
import { cn } from "../lib/utils";

export type CardVariant =
  | "default"
  | "kpi"
  | "alert"
  | "intelligence"
  | "evidence"
  | "health"
  | "ai"
  | "action";

const CARD_VARIANT: Record<CardVariant, string> = {
  default: "eos-panel-elevated",
  kpi: "eos-panel-elevated eos-card-kpi",
  alert: "eos-panel-elevated eos-card-alert",
  intelligence: "eos-panel-elevated eos-card-intelligence",
  evidence: "eos-panel-elevated eos-card-evidence",
  health: "eos-panel-elevated eos-card-health",
  ai: "eos-panel-elevated eos-card-ai",
  action: "eos-panel-elevated eos-card-action",
};

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    data-eos-card={variant}
    className={cn(
      "rounded-xl border border-[color:var(--eos-border)] bg-[color:var(--eos-panel-elevated)] text-[color:var(--eos-text-primary)] shadow-[var(--eos-glow)]",
      CARD_VARIANT[variant],
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-[1.125rem] font-semibold leading-snug tracking-tight text-[color:var(--eos-text-primary)]", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[0.9375rem] text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";
