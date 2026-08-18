import type {
  BusinessFinancePeriod,
  BusinessFinanceReceivableSnapshot,
  BusinessFinanceSnapshot,
  BusinessFinanceSourceType,
} from "@rtb/types";

function str(value: unknown): string {
  return String(value ?? "");
}

function opt(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

export function mapPeriod(row: Record<string, unknown>): BusinessFinancePeriod {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    periodStart: str(row.period_start).slice(0, 10),
    periodEnd: str(row.period_end).slice(0, 10),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    status: row.status as BusinessFinancePeriod["status"],
    sourceType: row.source_type as BusinessFinanceSourceType,
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    syncedAt: str(row.synced_at),
    isDemo: Boolean(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapSnapshot(row: Record<string, unknown>): BusinessFinanceSnapshot {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    periodId: str(row.period_id),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    revenueMinor: opt(row.revenue_minor),
    costOfSalesMinor: opt(row.cost_of_sales_minor),
    operatingExpensesMinor: opt(row.operating_expenses_minor),
    cashMinor: opt(row.cash_minor),
    accountsReceivableMinor: opt(row.accounts_receivable_minor),
    accountsPayableMinor: opt(row.accounts_payable_minor),
    budgetRevenueMinor: opt(row.budget_revenue_minor),
    budgetExpensesMinor: opt(row.budget_expenses_minor),
    budgetProfitMinor: opt(row.budget_profit_minor),
    sourceType: row.source_type as BusinessFinanceSourceType,
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    syncedAt: str(row.synced_at),
    isDemo: Boolean(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapReceivable(row: Record<string, unknown>): BusinessFinanceReceivableSnapshot {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    periodId: str(row.period_id),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    outstandingMinor: opt(row.outstanding_minor),
    overdueMinor: opt(row.overdue_minor),
    ageingCurrentMinor: opt(row.ageing_current_minor),
    ageing130Minor: opt(row.ageing_1_30_minor),
    ageing3160Minor: opt(row.ageing_31_60_minor),
    ageing6190Minor: opt(row.ageing_61_90_minor),
    ageing90PlusMinor: opt(row.ageing_90_plus_minor),
    sourceType: row.source_type as BusinessFinanceSourceType,
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    syncedAt: str(row.synced_at),
    isDemo: Boolean(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
