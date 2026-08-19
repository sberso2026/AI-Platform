import type {
  BusinessProfitAttributionConfidence,
  BusinessProfitAttributionMethod,
  BusinessProfitDimensionType,
  BusinessProfitFact,
  BusinessProfitValueState,
} from "@rtb/types";

function str(value: unknown): string {
  return String(value ?? "");
}

function opt(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function bool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
}

export function mapProfitFact(row: Record<string, unknown>): BusinessProfitFact {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    periodStart: str(row.period_start).slice(0, 10),
    periodEnd: str(row.period_end).slice(0, 10),
    dimensionType: row.dimension_type as BusinessProfitDimensionType,
    dimensionId: opt(row.dimension_id),
    dimensionRef: opt(row.dimension_ref),
    dimensionName: str(row.dimension_name),
    revenueMinor: opt(row.revenue_minor),
    directCostMinor: opt(row.direct_cost_minor),
    allocatedCostMinor: opt(row.allocated_cost_minor),
    contributionMinor: opt(row.contribution_minor),
    profitAfterAllocatedMinor: opt(row.profit_after_allocated_minor),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    valueState: (row.value_state as BusinessProfitValueState) ?? "actual",
    attributionMethod: (row.attribution_method as BusinessProfitAttributionMethod) ?? "unknown",
    attributionConfidence: (row.attribution_confidence as BusinessProfitAttributionConfidence) ?? "unknown",
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
