import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessDecisionContext,
  BusinessDecisionEvidenceItem,
  BusinessDecisionImpact,
  BusinessDecisionLesson,
  BusinessDecisionOption,
  BusinessDecisionOutcome,
} from "@rtb/types";
import { BUSINESS_DECISION_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { mapContext, mapEvidence, mapImpact, mapLesson, mapOption, mapOutcome } from "./mappers";

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

export class DecisionActionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listContexts(scope: Scope): Promise<BusinessDecisionContext[]> {
    const { data, error } = await table(this.supabase, "business_os_decision_contexts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list decision contexts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapContext);
  }

  async getContext(scope: Scope, decisionId: string): Promise<BusinessDecisionContext | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_contexts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("decision_id", decisionId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load decision context: ${error.message}`);
    return data ? mapContext(data as Record<string, unknown>) : null;
  }

  async getContextBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessDecisionContext | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_contexts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load context by source: ${error.message}`);
    return data ? mapContext(data as Record<string, unknown>) : null;
  }

  async insertContext(row: Record<string, unknown>): Promise<BusinessDecisionContext> {
    const { data, error } = await table(this.supabase, "business_os_decision_contexts")
      .insert(row as never)
      .select("*")
      .single();
    return mapContext(requireRow(data as Record<string, unknown> | null, error, "Decision context insert"));
  }

  async updateContext(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessDecisionContext> {
    const { data, error } = await table(this.supabase, "business_os_decision_contexts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapContext(requireRow(data as Record<string, unknown> | null, error, "Decision context update"));
  }

  async listEvidence(scope: Scope, decisionId?: string): Promise<BusinessDecisionEvidenceItem[]> {
    let query = table(this.supabase, "business_os_decision_evidence")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("linked_at", { ascending: true });
    if (decisionId) query = query.eq("decision_id", decisionId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list evidence: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapEvidence);
  }

  async getEvidenceBySource(
    scope: Scope,
    decisionId: string,
    sourceType: string,
    sourceRef: string,
  ): Promise<BusinessDecisionEvidenceItem | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_evidence")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("decision_id", decisionId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load evidence: ${error.message}`);
    return data ? mapEvidence(data as Record<string, unknown>) : null;
  }

  async insertEvidence(row: Record<string, unknown>): Promise<BusinessDecisionEvidenceItem> {
    const { data, error } = await table(this.supabase, "business_os_decision_evidence")
      .insert(row as never)
      .select("*")
      .single();
    return mapEvidence(requireRow(data as Record<string, unknown> | null, error, "Decision evidence insert"));
  }

  async listOptions(scope: Scope, decisionId?: string): Promise<BusinessDecisionOption[]> {
    let query = table(this.supabase, "business_os_decision_options")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("created_at", { ascending: true });
    if (decisionId) query = query.eq("decision_id", decisionId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list options: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapOption);
  }

  async getOption(scope: Scope, id: string): Promise<BusinessDecisionOption | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_options")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load option: ${error.message}`);
    return data ? mapOption(data as Record<string, unknown>) : null;
  }

  async getOptionBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessDecisionOption | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_options")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load option by source: ${error.message}`);
    return data ? mapOption(data as Record<string, unknown>) : null;
  }

  async insertOption(row: Record<string, unknown>): Promise<BusinessDecisionOption> {
    const { data, error } = await table(this.supabase, "business_os_decision_options")
      .insert(row as never)
      .select("*")
      .single();
    return mapOption(requireRow(data as Record<string, unknown> | null, error, "Decision option insert"));
  }

  async updateOption(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessDecisionOption> {
    const { data, error } = await table(this.supabase, "business_os_decision_options")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapOption(requireRow(data as Record<string, unknown> | null, error, "Decision option update"));
  }

  async listImpacts(scope: Scope, optionIds?: string[]): Promise<BusinessDecisionImpact[]> {
    let query = table(this.supabase, "business_os_decision_impacts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (optionIds?.length) query = query.in("option_id", optionIds);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list impacts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapImpact);
  }

  async getImpact(scope: Scope, optionId: string, dimension: string): Promise<BusinessDecisionImpact | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_impacts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("option_id", optionId)
      .eq("dimension", dimension)
      .maybeSingle();
    if (error) throw new Error(`Failed to load impact: ${error.message}`);
    return data ? mapImpact(data as Record<string, unknown>) : null;
  }

  async insertImpact(row: Record<string, unknown>): Promise<BusinessDecisionImpact> {
    const { data, error } = await table(this.supabase, "business_os_decision_impacts")
      .insert(row as never)
      .select("*")
      .single();
    return mapImpact(requireRow(data as Record<string, unknown> | null, error, "Decision impact insert"));
  }

  async updateImpact(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessDecisionImpact> {
    const { data, error } = await table(this.supabase, "business_os_decision_impacts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapImpact(requireRow(data as Record<string, unknown> | null, error, "Decision impact update"));
  }

  async listOutcomes(scope: Scope, decisionId?: string): Promise<BusinessDecisionOutcome[]> {
    let query = table(this.supabase, "business_os_decision_outcomes")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (decisionId) query = query.eq("decision_id", decisionId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list outcomes: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapOutcome);
  }

  async getOutcomeBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessDecisionOutcome | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_outcomes")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load outcome: ${error.message}`);
    return data ? mapOutcome(data as Record<string, unknown>) : null;
  }

  async insertOutcome(row: Record<string, unknown>): Promise<BusinessDecisionOutcome> {
    const { data, error } = await table(this.supabase, "business_os_decision_outcomes")
      .insert(row as never)
      .select("*")
      .single();
    return mapOutcome(requireRow(data as Record<string, unknown> | null, error, "Decision outcome insert"));
  }

  async updateOutcome(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessDecisionOutcome> {
    const { data, error } = await table(this.supabase, "business_os_decision_outcomes")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapOutcome(requireRow(data as Record<string, unknown> | null, error, "Decision outcome update"));
  }

  async listLessons(scope: Scope, decisionId?: string): Promise<BusinessDecisionLesson[]> {
    let query = table(this.supabase, "business_os_decision_lessons")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("created_at", { ascending: false });
    if (decisionId) query = query.eq("decision_id", decisionId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list lessons: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapLesson);
  }

  async getLessonBySourceRef(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessDecisionLesson | null> {
    const { data, error } = await table(this.supabase, "business_os_decision_lessons")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load lesson: ${error.message}`);
    return data ? mapLesson(data as Record<string, unknown>) : null;
  }

  async insertLesson(row: Record<string, unknown>): Promise<BusinessDecisionLesson> {
    const { data, error } = await table(this.supabase, "business_os_decision_lessons")
      .insert(row as never)
      .select("*")
      .single();
    return mapLesson(requireRow(data as Record<string, unknown> | null, error, "Decision lesson insert"));
  }

  async updateLesson(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessDecisionLesson> {
    const { data, error } = await table(this.supabase, "business_os_decision_lessons")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapLesson(requireRow(data as Record<string, unknown> | null, error, "Decision lesson update"));
  }

  async getSettings(scope: Scope): Promise<typeof BUSINESS_DECISION_DEFAULT_THRESHOLDS> {
    const { data, error } = await table(this.supabase, "business_os_decision_settings")
      .select("thresholds")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load decision settings: ${error.message}`);
    const thresholds = (data as { thresholds?: Record<string, unknown> } | null)?.thresholds ?? {};
    return { ...BUSINESS_DECISION_DEFAULT_THRESHOLDS, ...thresholds } as typeof BUSINESS_DECISION_DEFAULT_THRESHOLDS;
  }
}
