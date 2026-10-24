import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";
import { Card, CardContent } from "./card";

export type MetricTone = "blue" | "amber" | "red" | "green" | "slate";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tone?: MetricTone;
  trendLabel?: string;
  trendIcon?: React.ReactNode;
  secondary?: boolean;
}

const TONE_ICON: Record<MetricTone, string> = {
  blue: "border-[color:color-mix(in_srgb,var(--eos-accent)_40%,transparent)] bg-[color:var(--eos-accent-soft)] text-[color:var(--eos-accent)]",
  amber: "border-[color:color-mix(in_srgb,var(--eos-warning)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-warning)_12%,transparent)] text-[color:var(--eos-warning)]",
  red: "border-[color:color-mix(in_srgb,var(--eos-danger)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-danger)_12%,transparent)] text-[color:var(--eos-danger)]",
  green: "border-[color:color-mix(in_srgb,var(--eos-success)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-success)_12%,transparent)] text-[color:var(--eos-success)]",
  slate: "border-[color:var(--eos-border)] bg-[color:var(--eos-bg-secondary)] text-[color:var(--eos-text-secondary)]",
};

export function MetricCard({
  label,
  value,
  icon,
  tone = "blue",
  trendLabel,
  trendIcon,
  secondary = false,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card
      variant="kpi"
      className={cn(
        "h-full transition-colors",
        secondary && "opacity-95",
        className
      )}
      data-testid="metric-card"
      {...props}
    >
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          {icon && (
            <span
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-lg border",
                TONE_ICON[tone]
              )}
              aria-hidden
            >
              {icon}
            </span>
          )}
          {trendLabel && (
            <span className={cn(TYPOGRAPHY.meta, "inline-flex items-center gap-1.5")}>
              {trendIcon}
              <span>{trendLabel}</span>
            </span>
          )}
        </div>
        <p className={cn(TYPOGRAPHY.kpiLabel)}>{label}</p>
        <p className={cn(TYPOGRAPHY.kpiValue, "mt-2.5")}>{value}</p>
      </CardContent>
    </Card>
  );
}
