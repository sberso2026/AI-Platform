import type { CommercialUsageAggregate } from "@rtb/types";
import type { UsageMetricView } from "./administration-types";

const METRIC_ALLOWANCES: Record<string, number> = {
  ai_operations: 10000,
  document_pages: 50000,
  images_analyzed: 5000,
  reports_generated: 500,
  storage_gb: 100,
  api_calls: 100000,
  telemetry_events: 250000,
  digital_twin_computations: 1000,
};

const METRIC_LABELS: Record<string, string> = {
  ai_operations: "AI operations",
  document_pages: "Document pages processed",
  images_analyzed: "Images analyzed",
  reports_generated: "Reports generated",
  storage_gb: "Storage consumed",
  api_calls: "API calls",
  telemetry_events: "Telemetry events",
  digital_twin_computations: "Digital twin computations",
};

export function mapUsageMetrics(
  aggregates: CommercialUsageAggregate[],
  options?: { showOverageEstimate?: boolean }
): UsageMetricView[] {
  return aggregates.map((agg) => {
    const allowance = METRIC_ALLOWANCES[agg.metric_key];
    const consumed = agg.total_quantity;
    const remaining =
      allowance !== undefined ? Math.max(0, allowance - consumed) : undefined;
    const projected =
      allowance !== undefined
        ? Math.round(consumed * 1.15)
        : undefined;

    return {
      metricKey: agg.metric_key,
      name: METRIC_LABELS[agg.metric_key] ?? agg.name,
      unit: agg.unit,
      includedAllowance: allowance,
      consumed,
      remaining,
      projectedPeriodUsage: projected,
      thresholdAlert: allowance !== undefined && consumed / allowance >= 0.85,
      billableOverageEstimateCents:
        options?.showOverageEstimate && allowance !== undefined && consumed > allowance
          ? Math.round((consumed - allowance) * 10)
          : undefined,
    };
  });
}
