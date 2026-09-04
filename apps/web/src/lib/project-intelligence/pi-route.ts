import type { CommerceHandlerContext } from "../commerce/engineering-api";
import { lifecycleErrorResponse } from "../lifecycle-api";

export function piProjectScopeResponse(
  context: CommerceHandlerContext,
  projectId: string | undefined,
) {
  if (!context.ctx.workspaceId) {
    return lifecycleErrorResponse(
      "workspace_not_assigned",
      "An assigned workspace is required",
      403,
      context.correlationId,
    );
  }
  if (!projectId?.trim()) {
    return lifecycleErrorResponse(
      "project_required",
      "A project is required.",
      400,
      context.correlationId,
    );
  }
  return null;
}
