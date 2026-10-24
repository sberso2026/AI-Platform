import type { SupabaseClient } from "@rtb/database";
import type { AssuranceListFilter, AssuranceConditionStore } from "./memory-store";
import type {
  AssuranceEvaluationRun,
  AssuranceReviewCitation,
  AssuranceRuleSetting,
  EngineeringAssuranceCondition,
} from "./types";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

export function toAssuranceRow(condition: EngineeringAssuranceCondition): Record<string, unknown> {
  return {
    id: condition.id,
    tenant_id: condition.tenantId,
    workspace_id: condition.workspaceId,
    project_id: condition.projectId ?? null,
    fingerprint: condition.fingerprint,
    rule_id: condition.ruleId,
    rule_version: condition.ruleVersion,
    condition_code: condition.conditionCode,
    condition_type: condition.conditionType,
    assurance_domain: condition.assuranceDomain,
    root_object_type: condition.rootObjectType,
    root_object_id: condition.rootObjectId,
    related_object_type: condition.relatedObjectType ?? null,
    related_object_id: condition.relatedObjectId ?? null,
    discipline: condition.discipline ?? null,
    lifecycle_stage: condition.lifecycleStage ?? null,
    status: condition.status,
    materiality: condition.materiality,
    detected_at: condition.detectedAt,
    last_evaluated_at: condition.lastEvaluatedAt,
    resolved_at: condition.resolvedAt ?? null,
    resolution_source: condition.resolutionSource ?? null,
    explanation: condition.explanation,
    would_resolve_if: condition.wouldResolveIf,
    evidence_path: condition.evidencePath,
    digital_thread_path: condition.digitalThreadPath,
    related_objects: condition.relatedObjects,
    priority_factors: condition.priorityFactors,
    required_by_at: condition.requiredByAt ?? null,
    owner_id: condition.ownerId ?? null,
    disposition: condition.disposition ?? null,
    disposition_by: condition.dispositionBy ?? null,
    disposition_at: condition.dispositionAt ?? null,
    disposition_rationale: condition.dispositionRationale ?? null,
    review_package_id: condition.reviewPackageId ?? null,
    issue_id: condition.issueId ?? null,
  };
}

export function fromAssuranceRow(row: Record<string, unknown>): EngineeringAssuranceCondition {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: (row.project_id as string | null) ?? null,
    fingerprint: String(row.fingerprint),
    ruleId: String(row.rule_id),
    ruleVersion: String(row.rule_version),
    conditionCode: String(row.condition_code),
    conditionType: row.condition_type as EngineeringAssuranceCondition["conditionType"],
    assuranceDomain: row.assurance_domain as EngineeringAssuranceCondition["assuranceDomain"],
    rootObjectType: String(row.root_object_type),
    rootObjectId: String(row.root_object_id),
    relatedObjectType: (row.related_object_type as string | null) ?? null,
    relatedObjectId: (row.related_object_id as string | null) ?? null,
    discipline: (row.discipline as string | null) ?? null,
    lifecycleStage: (row.lifecycle_stage as string | null) ?? null,
    status: row.status as EngineeringAssuranceCondition["status"],
    materiality: row.materiality as EngineeringAssuranceCondition["materiality"],
    detectedAt: String(row.detected_at),
    lastEvaluatedAt: String(row.last_evaluated_at),
    resolvedAt: (row.resolved_at as string | null) ?? null,
    resolutionSource: (row.resolution_source as EngineeringAssuranceCondition["resolutionSource"]) ?? null,
    explanation: String(row.explanation ?? ""),
    wouldResolveIf: String(row.would_resolve_if ?? ""),
    evidencePath: Array.isArray(row.evidence_path) ? (row.evidence_path as EngineeringAssuranceCondition["evidencePath"]) : [],
    digitalThreadPath: String(row.digital_thread_path ?? ""),
    relatedObjects: Array.isArray(row.related_objects)
      ? (row.related_objects as EngineeringAssuranceCondition["relatedObjects"])
      : [],
    priorityFactors: (row.priority_factors as EngineeringAssuranceCondition["priorityFactors"]) ?? {
      materiality: "UNASSESSED",
      objectCriticality: "UNASSESSED",
      overdue: false,
      ageDays: 0,
    },
    requiredByAt: (row.required_by_at as string | null) ?? null,
    ownerId: (row.owner_id as string | null) ?? null,
    disposition: (row.disposition as EngineeringAssuranceCondition["disposition"]) ?? null,
    dispositionBy: (row.disposition_by as string | null) ?? null,
    dispositionAt: (row.disposition_at as string | null) ?? null,
    dispositionRationale: (row.disposition_rationale as string | null) ?? null,
    reviewPackageId: (row.review_package_id as string | null) ?? null,
    issueId: (row.issue_id as string | null) ?? null,
    automaticDefect: false,
    automaticCompliance: false,
    automaticConfirmedImpact: false,
  };
}

export class SupabaseAssuranceStore implements AssuranceConditionStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(tenantId: string, workspaceId: string, filter?: AssuranceListFilter): Promise<EngineeringAssuranceCondition[]> {
    let query = db(this.supabase)
      .from("engineering_assurance_conditions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("detected_at", { ascending: false })
      .limit(500);
    if (filter?.status) query = query.eq("status", filter.status);
    if (filter?.conditionType) query = query.eq("condition_type", filter.conditionType);
    if (filter?.discipline) query = query.eq("discipline", filter.discipline);
    if (filter?.materiality) query = query.eq("materiality", filter.materiality);
    if (filter?.rootObjectType) query = query.eq("root_object_type", filter.rootObjectType);
    if (filter?.rootObjectId) query = query.eq("root_object_id", filter.rootObjectId);
    if (filter?.ruleId) query = query.eq("rule_id", filter.ruleId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list assurance conditions: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(fromAssuranceRow);
  }

  async get(tenantId: string, workspaceId: string, id: string): Promise<EngineeringAssuranceCondition | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_conditions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to get assurance condition: ${error.message}`);
    return data ? fromAssuranceRow(data as Record<string, unknown>) : null;
  }

  async upsertMany(conditions: EngineeringAssuranceCondition[]): Promise<void> {
    if (!conditions.length) return;
    const { error } = await db(this.supabase)
      .from("engineering_assurance_conditions")
      .upsert(conditions.map(toAssuranceRow), { onConflict: "tenant_id,workspace_id,fingerprint" });
    if (error) throw new Error(`Failed to upsert assurance conditions: ${error.message}`);
  }

  async listSettings(tenantId: string, workspaceId: string): Promise<AssuranceRuleSetting[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_rule_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`Failed to list assurance rule settings: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(fromSettingRow);
  }

  async upsertSetting(setting: AssuranceRuleSetting): Promise<AssuranceRuleSetting> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_rule_settings")
      .upsert(
        {
          id: setting.id ?? undefined,
          tenant_id: setting.tenantId,
          workspace_id: setting.workspaceId,
          rule_id: setting.ruleId,
          rule_version: setting.ruleVersion,
          enabled: setting.enabled,
          configured_by: setting.configuredBy ?? null,
          configured_at: setting.configuredAt,
        },
        { onConflict: "tenant_id,workspace_id,rule_id,rule_version" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`Failed to upsert assurance rule setting: ${error.message}`);
    return fromSettingRow(data as Record<string, unknown>);
  }

  async deleteSetting(
    tenantId: string,
    workspaceId: string,
    ruleId: string,
    ruleVersion: string,
  ): Promise<AssuranceRuleSetting | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_rule_settings")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("rule_id", ruleId)
      .eq("rule_version", ruleVersion)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Failed to restore assurance rule default: ${error.message}`);
    return data ? fromSettingRow(data as Record<string, unknown>) : null;
  }

  async listCitations(
    tenantId: string,
    workspaceId: string,
    filter?: { conditionId?: string; reviewPackageId?: string },
  ): Promise<AssuranceReviewCitation[]> {
    let query = db(this.supabase)
      .from("engineering_assurance_review_citations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (filter?.conditionId) query = query.eq("condition_id", filter.conditionId);
    if (filter?.reviewPackageId) query = query.eq("review_package_id", filter.reviewPackageId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list assurance review citations: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(fromCitationRow);
  }

  async insertCitation(citation: AssuranceReviewCitation): Promise<AssuranceReviewCitation> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_review_citations")
      .upsert(
        {
          id: citation.id,
          tenant_id: citation.tenantId,
          workspace_id: citation.workspaceId,
          condition_id: citation.conditionId,
          review_package_id: citation.reviewPackageId,
          created_by: citation.createdBy ?? null,
          created_at: citation.createdAt,
        },
        { onConflict: "tenant_id,workspace_id,condition_id,review_package_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`Failed to cite review package: ${error.message}`);
    return fromCitationRow(data as Record<string, unknown>);
  }

  async insertEvaluationRun(run: AssuranceEvaluationRun): Promise<AssuranceEvaluationRun> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_evaluation_runs")
      .insert({
        tenant_id: run.tenantId,
        workspace_id: run.workspaceId,
        started_at: run.startedAt,
        completed_at: run.completedAt,
        triggered_by: run.triggeredBy ?? null,
        completeness: run.completeness,
        truncated: run.truncated,
        link_count: run.linkCount,
        link_limit: run.linkLimit,
        objects_evaluated: run.objectsEvaluated,
        rules_evaluated: run.rulesEvaluated,
        conditions_detected: run.conditionsDetected,
        conditions_resolved: run.conditionsResolved,
        conditions_created: run.conditionsCreated,
        remaining_scope_unknown: run.remainingScopeUnknown,
        ruleset_fingerprint: run.rulesetFingerprint,
        failure_reason: run.failureReason ?? null,
        reason: run.reason ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(`Failed to record assurance evaluation run: ${error.message}`);
    return fromRunRow(data as Record<string, unknown>);
  }

  async latestEvaluationRun(tenantId: string, workspaceId: string): Promise<AssuranceEvaluationRun | null> {
    const { data, error } = await db(this.supabase)
      .from("engineering_assurance_evaluation_runs")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Failed to load assurance evaluation run: ${error.message}`);
    return data ? fromRunRow(data as Record<string, unknown>) : null;
  }
}

function fromSettingRow(row: Record<string, unknown>): AssuranceRuleSetting {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    ruleId: String(row.rule_id),
    ruleVersion: String(row.rule_version),
    enabled: Boolean(row.enabled),
    configuredBy: (row.configured_by as string | null) ?? null,
    configuredAt: String(row.configured_at),
  };
}

function fromCitationRow(row: Record<string, unknown>): AssuranceReviewCitation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    conditionId: String(row.condition_id),
    reviewPackageId: String(row.review_package_id),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

function fromRunRow(row: Record<string, unknown>): AssuranceEvaluationRun {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    startedAt: String(row.started_at),
    completedAt: String(row.completed_at),
    triggeredBy: (row.triggered_by as string | null) ?? null,
    completeness: row.completeness as AssuranceEvaluationRun["completeness"],
    truncated: Boolean(row.truncated),
    linkCount: Number(row.link_count ?? 0),
    linkLimit: Number(row.link_limit ?? 0),
    objectsEvaluated: Number(row.objects_evaluated ?? 0),
    rulesEvaluated: Number(row.rules_evaluated ?? 0),
    conditionsDetected: Number(row.conditions_detected ?? 0),
    conditionsResolved: Number(row.conditions_resolved ?? 0),
    conditionsCreated: Number(row.conditions_created ?? 0),
    remainingScopeUnknown: Boolean(row.remaining_scope_unknown),
    rulesetFingerprint: String(row.ruleset_fingerprint ?? ""),
    failureReason: (row.failure_reason as string | null) ?? null,
    reason: (row.reason as string | null) ?? null,
  };
}
