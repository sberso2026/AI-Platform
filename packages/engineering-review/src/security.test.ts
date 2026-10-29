import { describe, expect, it } from "vitest";
import { createReviewFinding } from "./finding";
import { createFindingEvidence } from "./evidence";
import { createReviewOwnership } from "./ownership";
import { expectCode } from "./expect-code";

const OWNER = {
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
};

describe("security invariants", () => {
  it("requires tenant, workspace, and project", () => {
    expectCode(
      () => createReviewOwnership({ tenantId: "", workspaceId: "w", projectId: "p" }),
      "tenant_required",
    );
    expectCode(
      () => createReviewOwnership({ tenantId: "t", workspaceId: "", projectId: "p" }),
      "workspace_required",
    );
    expectCode(
      () => createReviewOwnership({ tenantId: "t", workspaceId: "w", projectId: "" }),
      "project_required",
    );
  });

  it("rejects cross-tenant evidence", () => {
    const findingOwner = createReviewOwnership(OWNER);
    expectCode(
      () =>
        createFindingEvidence(
          {
            documentId: "doc-1",
            tenantId: "other-tenant",
            workspaceId: OWNER.workspaceId,
            projectId: OWNER.projectId,
            span: "x",
            sourceType: "extracted_text",
          },
          findingOwner,
        ),
      "cross_tenant_rejected",
    );
  });

  it("rejects cross-workspace evidence", () => {
    const findingOwner = createReviewOwnership(OWNER);
    expectCode(
      () =>
        createFindingEvidence(
          {
            documentId: "doc-1",
            tenantId: OWNER.tenantId,
            workspaceId: "other-workspace",
            projectId: OWNER.projectId,
            span: "x",
            sourceType: "extracted_text",
          },
          findingOwner,
        ),
      "cross_workspace_rejected",
    );
  });

  it("rejects attaching foreign evidence through finding construction", () => {
    expectCode(
      () =>
        createReviewFinding({
          id: "f-x",
          ...OWNER,
          reviewPackageId: "pkg-1",
          reviewRunId: "run-1",
          category: "other_observation",
          title: "x",
          description: "x",
          severity: "minor",
          confidence: { score: 0.5 },
          evidence: [
            {
              documentId: "doc-1",
              tenantId: OWNER.tenantId,
              workspaceId: "ws-foreign",
              projectId: OWNER.projectId,
              span: "x",
              sourceType: "extracted_text",
            },
          ],
          reasoningSummary: "x",
          recommendedAction: "x",
          provenance: { origin: "detector" },
        }),
      "cross_workspace_rejected",
    );
  });
});
