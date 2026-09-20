/**
 * Review security schema verification. Fail closed when Core workspace RLS
 * or Review tables are missing. Does not edit historical migrations.
 */
export const REQUIRED_REVIEW_SECURITY_FUNCTIONS = [
  "engineering_core_workspace_member",
  "engineering_review_workspace_allowed",
] as const;

export const REQUIRED_REVIEW_TABLES = [
  "engineering_projects",
  "engineering_documents",
  "engineering_review_packages",
  "engineering_review_runs",
  "engineering_review_findings",
  "engineering_review_evidence",
  "engineering_review_dispositions",
] as const;

export type ReviewSecuritySchemaStatus = {
  ok: boolean;
  coreWorkspaceRls: boolean;
  reviewTables: boolean;
  missing: string[];
};

export function interpretReviewSecuritySchemaStatus(
  input: Record<string, unknown> | null | undefined,
): ReviewSecuritySchemaStatus {
  const missing: string[] = [];
  const coreWorkspaceRls = input?.core_workspace_member === true && input?.projects_policy_workspace === true && input?.documents_policy_workspace === true;
  const reviewTables = input?.review_tables_ready === true;
  if (input?.core_workspace_member !== true) missing.push("engineering_core_workspace_member");
  if (input?.projects_policy_workspace !== true) missing.push("eng_projects_workspace_rls");
  if (input?.documents_policy_workspace !== true) missing.push("eng_documents_workspace_rls");
  if (input?.review_tables_ready !== true) missing.push("engineering_review_tables");
  return {
    ok: missing.length === 0 && coreWorkspaceRls && reviewTables,
    coreWorkspaceRls,
    reviewTables,
    missing,
  };
}
