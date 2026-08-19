import type { Json, SupabaseClient } from "@rtb/database";
import type { BusinessProfitFact } from "@rtb/types";
import { BUSINESS_PROFIT_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { mapProfitFact } from "./mappers";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

export function minorCol(value: unknown): string | null {
  const parsed = parseMinor(value ?? null);
  return parsed === null ? null : parsed.toString();
}

export function asJson(value: unknown): Json {
  return value as Json;
}

export class ProfitIntelligenceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listFacts(scope: Scope): Promise<BusinessProfitFact[]> {
    const { data, error } = await table(this.supabase, "business_os_profit_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("period_end", { ascending: false });
    if (error) throw new Error(`Failed to list profit facts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapProfitFact);
  }

  async getFactBySourceRef(
    scope: Scope,
    sourceType: string,
    sourceRef: string,
  ): Promise<BusinessProfitFact | null> {
    const { data, error } = await table(this.supabase, "business_os_profit_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load profit fact: ${error.message}`);
    return data ? mapProfitFact(data as Record<string, unknown>) : null;
  }

  async insertFact(row: Record<string, unknown>): Promise<BusinessProfitFact> {
    const { data, error } = await table(this.supabase, "business_os_profit_facts")
      .insert(row as never)
      .select("*")
      .single();
    return mapProfitFact(requireRow(data as Record<string, unknown> | null, error, "Profit fact insert"));
  }

  async updateFact(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessProfitFact> {
    const { data, error } = await table(this.supabase, "business_os_profit_facts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapProfitFact(requireRow(data as Record<string, unknown> | null, error, "Profit fact update"));
  }

  async getSettings(scope: Scope) {
    const { data, error } = await table(this.supabase, "business_os_profit_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load profit settings: ${error.message}`);
    const row = (data as Record<string, unknown> | null) ?? {};
    const thresholds = (row.thresholds as Record<string, unknown> | undefined) ?? {};
    return { ...BUSINESS_PROFIT_DEFAULT_THRESHOLDS, ...(thresholds as Partial<typeof BUSINESS_PROFIT_DEFAULT_THRESHOLDS>) };
  }

  async upsertSettings(scope: Scope, thresholds: Record<string, unknown>, createdBy?: string): Promise<void> {
    const { error } = await table(this.supabase, "business_os_profit_settings").upsert(
      {
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        thresholds: thresholds as Json,
        provenance: { domain: "profit" } as Json,
        created_by: createdBy ?? null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,workspace_id" },
    );
    if (error) throw new Error(`Failed to save profit settings: ${error.message}`);
  }
}
