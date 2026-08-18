import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessFinanceIngestInput,
  BusinessFinancePeriod,
  BusinessFinanceReceivableSnapshot,
  BusinessFinanceSnapshot,
} from "@rtb/types";
import { BUSINESS_FINANCE_SOURCE_TYPES } from "@rtb/types";
import { mapPeriod, mapReceivable, mapSnapshot } from "./mappers";
import { parseMinor } from "./money";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

function minorCol(value: unknown): string | null {
  const parsed = parseMinor(value ?? null);
  return parsed === null ? null : parsed.toString();
}

export class FinanceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPeriods(scope: Scope): Promise<BusinessFinancePeriod[]> {
    const { data, error } = await table(this.supabase, "business_os_finance_periods")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("period_end", { ascending: false });
    if (error) throw new Error(`Failed to list finance periods: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapPeriod);
  }

  async listSnapshots(scope: Scope): Promise<BusinessFinanceSnapshot[]> {
    const { data, error } = await table(this.supabase, "business_os_finance_snapshots")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("synced_at", { ascending: false });
    if (error) throw new Error(`Failed to list finance snapshots: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapSnapshot);
  }

  async listReceivables(scope: Scope): Promise<BusinessFinanceReceivableSnapshot[]> {
    const { data, error } = await table(this.supabase, "business_os_finance_receivable_snapshots")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (error) throw new Error(`Failed to list receivable snapshots: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapReceivable);
  }

  async loadSettings(scope: Scope): Promise<Record<string, unknown> | null> {
    const { data, error } = await table(this.supabase, "business_os_finance_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load finance settings: ${error.message}`);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async upsertSettings(
    scope: Scope,
    input: { thresholds: Record<string, unknown>; createdBy?: string },
  ) {
    const existing = await this.loadSettings(scope);
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      thresholds: input.thresholds as Json,
      created_by: input.createdBy ?? null,
    };
    const query = existing
      ? table(this.supabase, "business_os_finance_settings")
          .update(payload as never)
          .eq("id", String(existing.id))
          .select("*")
          .single()
      : table(this.supabase, "business_os_finance_settings").insert(payload as never).select("*").single();
    const { data, error } = await query;
    return requireRow(data as Record<string, unknown> | null, error, "Finance settings upsert");
  }

  async ingest(
    scope: Scope,
    input: BusinessFinanceIngestInput,
    createdBy?: string,
  ): Promise<{
    period: BusinessFinancePeriod;
    snapshot: BusinessFinanceSnapshot;
    receivables: BusinessFinanceReceivableSnapshot | null;
    created: boolean;
  }> {
    if (!BUSINESS_FINANCE_SOURCE_TYPES.includes(input.sourceType)) {
      throw new Error("invalid_source_type");
    }
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) throw new Error("currency_required");
    const scale = input.scale ?? 2;
    if (scale < 0 || scale > 6) throw new Error("invalid_scale");
    if (input.periodEnd < input.periodStart) throw new Error("invalid_period");

    const now = new Date().toISOString();
    const provenance = {
      ...(input.provenance ?? {}),
      domain: "finance",
      live: input.isDemo ? false : input.provenance?.live === true,
      ingestedAt: now,
    } as Json;

    const periods = await this.listPeriods(scope);
    const existingPeriod = periods.find(
      (p) =>
        p.periodStart === input.periodStart &&
        p.periodEnd === input.periodEnd &&
        p.currency === currency,
    );

    const periodPayload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      currency,
      scale,
      status: input.status ?? "open",
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      source_timestamp: input.sourceTimestamp ?? null,
      provenance,
      synced_at: now,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };

    let period: BusinessFinancePeriod;
    if (existingPeriod) {
      const { data, error } = await table(this.supabase, "business_os_finance_periods")
        .update(periodPayload as never)
        .eq("id", existingPeriod.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      period = mapPeriod(requireRow(data as Record<string, unknown> | null, error, "Finance period update"));
    } else {
      const { data, error } = await table(this.supabase, "business_os_finance_periods")
        .insert(periodPayload as never)
        .select("*")
        .single();
      period = mapPeriod(requireRow(data as Record<string, unknown> | null, error, "Finance period insert"));
    }

    const snapshots = await this.listSnapshots(scope);
    const existingSnapshot = snapshots.find((s) => s.periodId === period.id);
    const snapshotPayload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      period_id: period.id,
      currency,
      scale,
      revenue_minor: minorCol(input.revenueMinor),
      cost_of_sales_minor: minorCol(input.costOfSalesMinor),
      operating_expenses_minor: minorCol(input.operatingExpensesMinor),
      cash_minor: minorCol(input.cashMinor),
      accounts_receivable_minor: minorCol(input.accountsReceivableMinor),
      accounts_payable_minor: minorCol(input.accountsPayableMinor),
      budget_revenue_minor: minorCol(input.budgetRevenueMinor),
      budget_expenses_minor: minorCol(input.budgetExpensesMinor),
      budget_profit_minor: minorCol(input.budgetProfitMinor),
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      source_timestamp: input.sourceTimestamp ?? null,
      provenance,
      synced_at: now,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };

    let snapshot: BusinessFinanceSnapshot;
    if (existingSnapshot) {
      const { data, error } = await table(this.supabase, "business_os_finance_snapshots")
        .update(snapshotPayload as never)
        .eq("id", existingSnapshot.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      snapshot = mapSnapshot(requireRow(data as Record<string, unknown> | null, error, "Finance snapshot update"));
    } else {
      const { data, error } = await table(this.supabase, "business_os_finance_snapshots")
        .insert(snapshotPayload as never)
        .select("*")
        .single();
      snapshot = mapSnapshot(requireRow(data as Record<string, unknown> | null, error, "Finance snapshot insert"));
    }

    const hasReceivable =
      input.outstandingMinor != null ||
      input.overdueMinor != null ||
      input.ageingCurrentMinor != null ||
      input.ageing130Minor != null ||
      input.ageing3160Minor != null ||
      input.ageing6190Minor != null ||
      input.ageing90PlusMinor != null;

    let receivables: BusinessFinanceReceivableSnapshot | null = null;
    if (hasReceivable) {
      const recvs = await this.listReceivables(scope);
      const existingRecv = recvs.find((r) => r.periodId === period.id);
      const recvPayload = {
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        period_id: period.id,
        currency,
        scale,
        outstanding_minor: minorCol(input.outstandingMinor),
        overdue_minor: minorCol(input.overdueMinor),
        ageing_current_minor: minorCol(input.ageingCurrentMinor),
        ageing_1_30_minor: minorCol(input.ageing130Minor),
        ageing_31_60_minor: minorCol(input.ageing3160Minor),
        ageing_61_90_minor: minorCol(input.ageing6190Minor),
        ageing_90_plus_minor: minorCol(input.ageing90PlusMinor),
        source_type: input.sourceType,
        source_ref: input.sourceRef ?? null,
        source_timestamp: input.sourceTimestamp ?? null,
        provenance,
        synced_at: now,
        is_demo: input.isDemo ?? false,
        created_by: createdBy ?? null,
      };
      if (existingRecv) {
        const { data, error } = await table(this.supabase, "business_os_finance_receivable_snapshots")
          .update(recvPayload as never)
          .eq("id", existingRecv.id)
          .eq("tenant_id", scope.tenantId)
          .eq("workspace_id", scope.workspaceId)
          .select("*")
          .single();
        receivables = mapReceivable(
          requireRow(data as Record<string, unknown> | null, error, "Receivable snapshot update"),
        );
      } else {
        const { data, error } = await table(this.supabase, "business_os_finance_receivable_snapshots")
          .insert(recvPayload as never)
          .select("*")
          .single();
        receivables = mapReceivable(
          requireRow(data as Record<string, unknown> | null, error, "Receivable snapshot insert"),
        );
      }
    }

    return { period, snapshot, receivables, created: !existingPeriod };
  }
}
