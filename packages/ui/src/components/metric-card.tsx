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
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
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
      className={cn(
        "h-full border-slate-200 bg-white transition-colors",
        secondary && "border-slate-200/90 bg-slate-50/50",
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
