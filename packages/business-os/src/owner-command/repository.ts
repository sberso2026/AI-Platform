import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessAction,
  BusinessActionStatus,
  BusinessDecision,
  BusinessDecisionStatus,
  BusinessKpi,
  BusinessRecommendation,
  BusinessRecommendationStatus,
  BusinessSignal,
  BusinessSignalStatus,
} from "@rtb/types";
import { deriveKpiStatus } from "./health";
import { mapAction, mapDecision, mapKpi, mapRecommendation, mapSignal } from "./mappers";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

export class OwnerCommandRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listKpis(scope: Scope): Promise<BusinessKpi[]> {
    const { data, error } = await table(this.supabase, "business_os_kpis")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("category");
    if (error) throw new Error(`Failed to list KPIs: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapKpi);
  }

  async upsertKpi(
    scope: Scope,
    input: Partial<BusinessKpi> & { key: string; name: string; createdBy?: string },
  ): Promise<BusinessKpi> {
    const existing = (await this.listKpis(scope)).find((k) => k.key === input.key);
    const merged = {
      ...existing,
      ...input,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
    };
    const status = deriveKpiStatus({
      value: merged.value ?? null,
      direction: merged.direction ?? "higher_is_better",
      warningThreshold: merged.warningThreshold ?? null,
      criticalThreshold: merged.criticalThreshold ?? null,
      target: merged.target ?? null,
    });
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      key: input.key,
      name: input.name,
      description: input.description ?? null,
      category: input.category ?? existing?.category ?? "general",
      unit: input.unit ?? existing?.unit ?? "count",
      value: input.value !== undefined ? input.value : (existing?.value ?? null),
      target: input.target !== undefined ? input.target : (existing?.target ?? null),
      warning_threshold:
        input.warningThreshold !== undefined
          ? input.warningThreshold
          : (existing?.warningThreshold ?? null),
      critical_threshold:
        input.criticalThreshold !== undefined
          ? input.criticalThreshold
          : (existing?.criticalThreshold ?? null),
      direction: input.direction ?? existing?.direction ?? "higher_is_better",
      status,
      measured_at:
        input.measuredAt !== undefined
          ? input.measuredAt
          : (existing?.measuredAt ?? new Date().toISOString()),
      source_type: input.sourceType ?? existing?.sourceType ?? "manual",
      source_ref: input.sourceRef ?? existing?.sourceRef ?? null,
      provenance: (input.provenance ?? existing?.provenance ?? {}) as Json,
      is_demo: input.isDemo ?? existing?.isDemo ?? false,
      created_by: input.createdBy ?? null,
    };
    const query = existing
      ? table(this.supabase, "business_os_kpis").update(payload as never).eq("id", existing.id).select("*").single()
      : table(this.supabase, "business_os_kpis").insert(payload as never).select("*").single();
    const { data, error } = await query;
    return mapKpi(requireRow(data as Record<string, unknown> | null, error, "KPI upsert"));
  }

  async listSignals(scope: Scope): Promise<BusinessSignal[]> {
    const { data, error } = await table(this.supabase, "business_os_signals")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("detected_at", { ascending: false });
    if (error) throw new Error(`Failed to list signals: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapSignal);
  }

  async insertSignal(
    scope: Scope,
    input: Omit<BusinessSignal, "id" | "tenantId" | "workspaceId" | "createdAt" | "updatedAt"> & {
      createdBy?: string;
    },
  ): Promise<BusinessSignal> {
    const { data, error } = await table(this.supabase, "business_os_signals")
      .insert({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        type: input.type,
        severity: input.severity,
        title: input.title,
        summary: input.summary,
        source_type: input.sourceType,
        source_ref: input.sourceRef ?? null,
        kpi_id: input.kpiId ?? null,
        evidence: input.evidence as unknown as Json,
        provenance: input.provenance as Json,
        detected_at: input.detectedAt,
        status: input.status,
        business_impact: input.businessImpact ?? null,
        is_demo: input.isDemo,
        created_by: input.createdBy ?? null,
      } as never)
      .select("*")
      .single();
    return mapSignal(requireRow(data as Record<string, unknown> | null, error, "Signal insert"));
  }

  async updateSignalStatus(
    scope: Scope,
    id: string,
    status: BusinessSignalStatus,
  ): Promise<BusinessSignal> {
    const { data, error } = await table(this.supabase, "business_os_signals")
      .update({ status } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapSignal(requireRow(data as Record<string, unknown> | null, error, "Signal update"));
  }

  async listRecommendations(scope: Scope): Promise<BusinessRecommendation[]> {
    const { data, error } = await table(this.supabase, "business_os_recommendations")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list recommendations: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRecommendation);
  }

  async insertRecommendation(
    scope: Scope,
    input: Omit<BusinessRecommendation, "id" | "tenantId" | "workspaceId" | "createdAt" | "updatedAt" | "advisoryOnly"> & {
      createdBy?: string;
    },
  ): Promise<BusinessRecommendation> {
    const { data, error } = await table(this.supabase, "business_os_recommendations")
      .insert({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        signal_id: input.signalId ?? null,
        title: input.title,
        recommendation_text: input.recommendationText,
        rationale_summary: input.rationaleSummary,
        expected_impact: input.expectedImpact ?? null,
        confidence: input.confidence,
        evidence_refs: input.evidenceRefs as unknown as Json,
        status: input.status,
        generated_by: input.generatedBy,
        advisory_only: true,
        is_demo: input.isDemo,
        created_by: input.createdBy ?? null,
      } as never)
      .select("*")
      .single();
    return mapRecommendation(
      requireRow(data as Record<string, unknown> | null, error, "Recommendation insert"),
    );
  }

  async updateRecommendationStatus(
    scope: Scope,
    id: string,
    status: BusinessRecommendationStatus,
  ): Promise<BusinessRecommendation> {
    const { data, error } = await table(this.supabase, "business_os_recommendations")
      .update({ status } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapRecommendation(
      requireRow(data as Record<string, unknown> | null, error, "Recommendation update"),
    );
  }

  async listDecisions(scope: Scope): Promise<BusinessDecision[]> {
    const { data, error } = await table(this.supabase, "business_os_decisions")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list decisions: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapDecision);
  }

  async insertDecision(
    scope: Scope,
    input: Omit<BusinessDecision, "id" | "tenantId" | "workspaceId" | "createdAt" | "updatedAt"> & {
      createdBy?: string;
    },
  ): Promise<BusinessDecision> {
    const { data, error } = await table(this.supabase, "business_os_decisions")
      .insert({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        recommendation_id: input.recommendationId ?? null,
        statement: input.statement,
        context: input.context ?? null,
        owner_id: input.ownerId ?? null,
        status: input.status,
        decision: input.decision ?? null,
        rationale: input.rationale ?? null,
        decided_at: input.decidedAt ?? null,
        review_at: input.reviewAt ?? null,
        is_demo: input.isDemo,
        created_by: input.createdBy ?? null,
      } as never)
      .select("*")
      .single();
    return mapDecision(requireRow(data as Record<string, unknown> | null, error, "Decision insert"));
  }

  async updateDecision(
    scope: Scope,
    id: string,
    patch: {
      status: BusinessDecisionStatus;
      decision?: BusinessDecision["decision"];
      rationale?: string;
      ownerId?: string | null;
      reviewAt?: string | null;
    },
  ): Promise<BusinessDecision> {
    const decided =
      patch.status === "pending" ? null : new Date().toISOString();
    const { data, error } = await table(this.supabase, "business_os_decisions")
      .update({
        status: patch.status,
        decision: patch.decision ?? null,
        rationale: patch.rationale ?? null,
        owner_id: patch.ownerId ?? null,
        review_at: patch.reviewAt ?? null,
        decided_at: decided,
      } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapDecision(requireRow(data as Record<string, unknown> | null, error, "Decision update"));
  }

  async listActions(scope: Scope): Promise<BusinessAction[]> {
    const { data, error } = await table(this.supabase, "business_os_actions")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("due_date", { ascending: true, nullsFirst: false });
    if (error) throw new Error(`Failed to list actions: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapAction);
  }

  async insertAction(
    scope: Scope,
    input: Omit<BusinessAction, "id" | "tenantId" | "workspaceId" | "createdAt" | "updatedAt"> & {
      createdBy?: string;
    },
  ): Promise<BusinessAction> {
    const { data, error } = await table(this.supabase, "business_os_actions")
      .insert({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        decision_id: input.decisionId ?? null,
        title: input.title,
        owner_id: input.ownerId ?? null,
        due_date: input.dueDate ?? null,
        priority: input.priority,
        status: input.status,
        completion_evidence: input.completionEvidence as Json,
        completed_at: input.completedAt ?? null,
        is_demo: input.isDemo,
        created_by: input.createdBy ?? null,
      } as never)
      .select("*")
      .single();
    return mapAction(requireRow(data as Record<string, unknown> | null, error, "Action insert"));
  }

  async updateAction(
    scope: Scope,
    id: string,
    patch: {
      status: BusinessActionStatus;
      completionEvidence?: Record<string, unknown>;
      ownerId?: string | null;
      dueDate?: string | null;
    },
  ): Promise<BusinessAction> {
    const completedAt = patch.status === "completed" ? new Date().toISOString() : null;
    const { data, error } = await table(this.supabase, "business_os_actions")
      .update({
        status: patch.status,
        completion_evidence: (patch.completionEvidence ?? {}) as Json,
        owner_id: patch.ownerId ?? null,
        due_date: patch.dueDate ?? null,
        completed_at: completedAt,
      } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapAction(requireRow(data as Record<string, unknown> | null, error, "Action update"));
  }
}
