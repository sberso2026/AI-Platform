import type { SupabaseClient } from "@rtb/database";
import type { PreIssueReviewRecord } from "./types";
import type { PreIssueReviewStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function fromRow(row: Record<string, unknown>): PreIssueReviewRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    workPlanId: String(row.work_plan_id),
    reviewPackageId: String(row.review_package_id),
    reviewRunId: String(row.review_run_id),
    policyCode: String(row.policy_code),
    policyVersion: String(row.policy_version),
    snapshot: row.snapshot as PreIssueReviewRecord["snapshot"],
    targetArtifactId: String(row.target_artifact_id),
    targetArtifactHash: String(row.target_artifact_hash),
    targetLineageKind: row.target_lineage_kind as PreIssueReviewRecord["targetLineageKind"],
    reviewingGeneratedDraft: Boolean(row.reviewing_generated_draft),
    resultState: row.result_state as PreIssueReviewRecord["resultState"],
    staleness: row.staleness as PreIssueReviewRecord["staleness"],
    deterministicReview: "available",
    semanticAiReview: row.semantic_ai_review as PreIssueReviewRecord["semanticAiReview"],
    conditions: (row.conditions ?? []) as PreIssueReviewRecord["conditions"],
    passedChecks: (row.passed_checks ?? []) as PreIssueReviewRecord["passedChecks"],
    notEvaluated: (row.not_evaluated ?? []) as PreIssueReviewRecord["notEvaluated"],
    engineeringApproved: false,
    designApproved: false,
    codeCompliant: false,
    ifcReady: false,
    automaticFindings: false,
    binaryDuplication: "NO",
    performance: row.performance as PreIssueReviewRecord["performance"],
    createdAt: String(row.created_at),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

export class SupabasePreIssueStore implements PreIssueReviewStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(row: PreIssueReviewRecord) {
    const payload = {
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      project_id: row.projectId,
      work_plan_id: row.workPlanId,
      review_package_id: row.reviewPackageId,
      review_run_id: row.reviewRunId,
      policy_code: row.policyCode,
      policy_version: row.policyVersion,
      snapshot: row.snapshot,
      target_artifact_id: row.targetArtifactId,
      target_artifact_hash: row.targetArtifactHash,
      target_lineage_kind: row.targetLineageKind,
      reviewing_generated_draft: row.reviewingGeneratedDraft,
      result_state: row.resultState,
      staleness: row.staleness,
      semantic_ai_review: row.semanticAiReview,
      conditions: row.conditions,
      passed_checks: row.passedChecks,
      not_evaluated: row.notEvaluated,
      performance: row.performance,
      created_at: row.createdAt,
      created_by: row.createdBy,
    };
    const { error } = await db(this.supabase).from("engineering_pre_issue_reviews").upsert(payload);
    if (error) throw new Error(error.message);
    return row;
  }

  async get(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_pre_issue_reviews").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async listByPlan(workspaceId: string, workPlanId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_pre_issue_reviews")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("work_plan_id", workPlanId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => fromRow(row));
  }
}
