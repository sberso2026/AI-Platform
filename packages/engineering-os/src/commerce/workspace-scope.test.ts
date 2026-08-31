import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { isRecordInWorkspace, workspaceScopeId } from "./workspace-scope";

describe("workspaceScopeId", () => {
  it("returns the commerce workspace and never falls back to tenant-wide", () => {
    const scoped = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    });
    expect(workspaceScopeId(scoped)).toBe("workspace-a");

    const unscoped = createTestCommerceExecutionContext({ tenantId: "tenant-a" });
    expect(workspaceScopeId(unscoped)).toBeNull();
  });
});

describe("isRecordInWorkspace", () => {
  it("denies foreign-workspace records for a workspace-scoped engineer", () => {
    const engineerA = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    });
    expect(isRecordInWorkspace("workspace-a", engineerA)).toBe(true);
    expect(isRecordInWorkspace("workspace-b", engineerA)).toBe(false);
  });
});
