import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";

export function requireInspectionIntelligenceAccess(context: CommerceHandlerContext): void {
  if (!context.decision.allowed) {
    throw new Error("inspection_intelligence_access_denied");
  }
  if (!context.ctx.workspaceId) {
    throw new Error("workspace_required");
  }
  if (!context.ctx.tenantId || !context.ctx.userId) {
    throw new Error("inspection_intelligence_unauthenticated");
  }
}

export function transitionAuthAction(
  context: CommerceHandlerContext,
): "inspection.write" | "inspection.review" | "inspection.approve" | "inspection.admin" {
  if (context.ctx.roleSlug === "owner" || context.ctx.roleSlug === "admin") {
    return "inspection.approve";
  }
  return "inspection.write";
}
