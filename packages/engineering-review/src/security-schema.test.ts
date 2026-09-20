import { describe, expect, it } from "vitest";
import { interpretReviewSecuritySchemaStatus } from "./security-schema";

describe("Review security schema status", () => {
  it("fails closed when Core workspace RLS is absent", () => {
    const status = interpretReviewSecuritySchemaStatus({
      core_workspace_member: false,
      projects_policy_workspace: false,
      documents_policy_workspace: false,
      review_tables_ready: true,
    });
    expect(status.ok).toBe(false);
    expect(status.missing).toContain("engineering_core_workspace_member");
  });

  it("passes only when Core workspace policies and Review tables are present", () => {
    const status = interpretReviewSecuritySchemaStatus({
      core_workspace_member: true,
      projects_policy_workspace: true,
      documents_policy_workspace: true,
      review_tables_ready: true,
    });
    expect(status.ok).toBe(true);
    expect(status.missing).toEqual([]);
  });
});
