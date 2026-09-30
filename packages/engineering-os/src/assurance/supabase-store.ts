import type { SupabaseClient } from "@rtb/database";
import type { AssuranceListFilter, AssuranceConditionStore } from "./memory-store";
import type { EngineeringAssuranceCondition } from "./types";

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
}
