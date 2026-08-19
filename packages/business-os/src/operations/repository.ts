import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessWorkActionLink,
  BusinessWorkCapacityFact,
  BusinessWorkCostFact,
  BusinessWorkItem,
  BusinessWorkMilestone,
} from "@rtb/types";
import { BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { mapActionLink, mapCapacityFact, mapCostFact, mapMilestone, mapWorkItem } from "./mappers";

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

export class WorkOperationsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listWork(scope: Scope): Promise<BusinessWorkItem[]> {
    const { data, error } = await table(this.supabase, "business_os_work_items")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list work: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapWorkItem);
  }

  async getWork(scope: Scope, id: string): Promise<BusinessWorkItem | null> {
    const { data, error } = await table(this.supabase, "business_os_work_items")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load work: ${error.message}`);
    return data ? mapWorkItem(data as Record<string, unknown>) : null;
  }

  async getWorkBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessWorkItem | null> {
    const { data, error } = await table(this.supabase, "business_os_work_items")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load work by source: ${error.message}`);
    return data ? mapWorkItem(data as Record<string, unknown>) : null;
  }

  async insertWork(row: Record<string, unknown>): Promise<BusinessWorkItem> {
    const { data, error } = await table(this.supabase, "business_os_work_items")
      .insert(row as never)
      .select("*")
      .single();
    return mapWorkItem(requireRow(data as Record<string, unknown> | null, error, "Work insert"));
  }

  async updateWork(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessWorkItem> {
    const { data, error } = await table(this.supabase, "business_os_work_items")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapWorkItem(requireRow(data as Record<string, unknown> | null, error, "Work update"));
  }

  async listMilestones(scope: Scope, workId?: string): Promise<BusinessWorkMilestone[]> {
    let query = table(this.supabase, "business_os_work_milestones")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("due_at", { ascending: true, nullsFirst: false });
    if (workId) query = query.eq("work_id", workId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list milestones: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapMilestone);
  }

  async getMilestoneBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessWorkMilestone | null> {
    const { data, error } = await table(this.supabase, "business_os_work_milestones")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load milestone: ${error.message}`);
    return data ? mapMilestone(data as Record<string, unknown>) : null;
  }

  async insertMilestone(row: Record<string, unknown>): Promise<BusinessWorkMilestone> {
    const { data, error } = await table(this.supabase, "business_os_work_milestones")
      .insert(row as never)
      .select("*")
      .single();
    return mapMilestone(requireRow(data as Record<string, unknown> | null, error, "Milestone insert"));
  }

  async updateMilestone(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessWorkMilestone> {
    const { data, error } = await table(this.supabase, "business_os_work_milestones")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapMilestone(requireRow(data as Record<string, unknown> | null, error, "Milestone update"));
  }

  async listActionLinks(scope: Scope, workId?: string): Promise<BusinessWorkActionLink[]> {
    let query = table(this.supabase, "business_os_work_action_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (workId) query = query.eq("work_id", workId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list work action links: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapActionLink);
  }

  async getActionLinkBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessWorkActionLink | null> {
    const { data, error } = await table(this.supabase, "business_os_work_action_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load action link: ${error.message}`);
    return data ? mapActionLink(data as Record<string, unknown>) : null;
  }

  async insertActionLink(row: Record<string, unknown>): Promise<BusinessWorkActionLink> {
    const { data, error } = await table(this.supabase, "business_os_work_action_links")
      .insert(row as never)
      .select("*")
      .single();
    return mapActionLink(requireRow(data as Record<string, unknown> | null, error, "Work action link insert"));
  }

  async listCostFacts(scope: Scope, workId?: string): Promise<BusinessWorkCostFact[]> {
    let query = table(this.supabase, "business_os_work_cost_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("period_end", { ascending: false });
    if (workId) query = query.eq("work_id", workId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list cost facts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapCostFact);
  }

  async getCostFactBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessWorkCostFact | null> {
    const { data, error } = await table(this.supabase, "business_os_work_cost_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load cost fact: ${error.message}`);
    return data ? mapCostFact(data as Record<string, unknown>) : null;
  }

  async insertCostFact(row: Record<string, unknown>): Promise<BusinessWorkCostFact> {
    const { data, error } = await table(this.supabase, "business_os_work_cost_facts")
      .insert(row as never)
      .select("*")
      .single();
    return mapCostFact(requireRow(data as Record<string, unknown> | null, error, "Cost fact insert"));
  }

  async updateCostFact(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessWorkCostFact> {
    const { data, error } = await table(this.supabase, "business_os_work_cost_facts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapCostFact(requireRow(data as Record<string, unknown> | null, error, "Cost fact update"));
  }

  async listCapacityFacts(scope: Scope, workId?: string): Promise<BusinessWorkCapacityFact[]> {
    let query = table(this.supabase, "business_os_work_capacity_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("period_end", { ascending: false });
    if (workId) query = query.eq("work_id", workId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list capacity facts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapCapacityFact);
  }

  async getCapacityFactBySourceRef(
    scope: Scope,
    sourceType: string,
    sourceRef: string,
  ): Promise<BusinessWorkCapacityFact | null> {
    const { data, error } = await table(this.supabase, "business_os_work_capacity_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load capacity fact: ${error.message}`);
    return data ? mapCapacityFact(data as Record<string, unknown>) : null;
  }

  async insertCapacityFact(row: Record<string, unknown>): Promise<BusinessWorkCapacityFact> {
    const { data, error } = await table(this.supabase, "business_os_work_capacity_facts")
      .insert(row as never)
      .select("*")
      .single();
    return mapCapacityFact(requireRow(data as Record<string, unknown> | null, error, "Capacity fact insert"));
  }

  async updateCapacityFact(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessWorkCapacityFact> {
    const { data, error } = await table(this.supabase, "business_os_work_capacity_facts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapCapacityFact(requireRow(data as Record<string, unknown> | null, error, "Capacity fact update"));
  }

  async getSettings(scope: Scope) {
    const { data, error } = await table(this.supabase, "business_os_work_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load work settings: ${error.message}`);
    const thresholds = {
      ...BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS,
      ...((data as { thresholds?: Record<string, number> } | null)?.thresholds ?? {}),
    };
    return { ...BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS, ...thresholds };
  }

  async upsertSettings(scope: Scope, thresholds: Record<string, unknown>, userId: string) {
    const existing = await table(this.supabase, "business_os_work_settings")
      .select("id")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (existing.data) {
      const { error } = await table(this.supabase, "business_os_work_settings")
        .update({ thresholds: asJson(thresholds), updated_at: new Date().toISOString() } as never)
        .eq("id", (existing.data as { id: string }).id);
      if (error) throw new Error(`Failed to update work settings: ${error.message}`);
      return;
    }
    const { error } = await table(this.supabase, "business_os_work_settings").insert({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      thresholds: asJson(thresholds),
      created_by: userId,
    } as never);
    if (error) throw new Error(`Failed to insert work settings: ${error.message}`);
  }
}
