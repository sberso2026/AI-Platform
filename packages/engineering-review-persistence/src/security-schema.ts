import {
  interpretReviewSecuritySchemaStatus,
  type ReviewSecuritySchemaStatus,
} from "@rtb/engineering-review";
import type { ReviewSqlClient } from "./client";

export async function loadReviewSecuritySchemaStatus(
  client: ReviewSqlClient,
): Promise<ReviewSecuritySchemaStatus> {
  const { data, error } = await client.rpc("engineering_review_security_schema_status");
  if (error || data == null) {
    return interpretReviewSecuritySchemaStatus({
      core_workspace_member: false,
      projects_policy_workspace: false,
      documents_policy_workspace: false,
      review_tables_ready: false,
    });
  }
  return interpretReviewSecuritySchemaStatus(data as Record<string, unknown>);
}

export async function assertReviewSecuritySchemaOrThrow(client: ReviewSqlClient): Promise<void> {
  const status = await loadReviewSecuritySchemaStatus(client);
  if (!status.ok) {
    throw new Error(
      `Review security schema is not deployed: ${status.missing.join(", ") || "unknown"}. Apply additive Core RLS and Review migrations before serving /review.`,
    );
  }
}
