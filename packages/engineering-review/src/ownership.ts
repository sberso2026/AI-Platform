import { failClosed } from "./errors";
import {
  asProjectId,
  asTenantId,
  asWorkspaceId,
  type ProjectId,
  type TenantId,
  type WorkspaceId,
} from "./ids";

/**
 * Persisted review objects always carry tenant, workspace, and project.
 * Workspace is never optional — unlike some Engineering Core rows.
 */
export type ReviewOwnership = {
  tenantId: TenantId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
};

export function createReviewOwnership(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): ReviewOwnership {
  if (!input.tenantId?.trim()) failClosed("tenant_required", "tenantId is required");
  if (!input.workspaceId?.trim()) failClosed("workspace_required", "workspaceId is required");
  if (!input.projectId?.trim()) failClosed("project_required", "projectId is required");
  return {
    tenantId: asTenantId(input.tenantId),
    workspaceId: asWorkspaceId(input.workspaceId),
    projectId: asProjectId(input.projectId),
  };
}

export function assertSameOwnership(
  left: ReviewOwnership,
  right: Pick<ReviewOwnership, "tenantId" | "workspaceId" | "projectId">,
  codePrefix = "ownership",
): void {
  if (left.tenantId !== right.tenantId) {
    failClosed("cross_tenant_rejected", "Cross-tenant review data is rejected", {
      codePrefix,
    });
  }
  if (left.workspaceId !== right.workspaceId) {
    failClosed("cross_workspace_rejected", "Cross-workspace review data is rejected", {
      codePrefix,
    });
  }
  if (left.projectId !== right.projectId) {
    failClosed("cross_project_rejected", "Cross-project review data is rejected", {
      codePrefix,
    });
  }
}

export function assertOwnershipImmutable(
  original: ReviewOwnership,
  next: ReviewOwnership,
): void {
  if (
    original.tenantId !== next.tenantId ||
    original.workspaceId !== next.workspaceId ||
    original.projectId !== next.projectId
  ) {
    failClosed(
      "ownership_immutable",
      "Review package ownership (tenant, workspace, project) cannot change after creation",
    );
  }
}
