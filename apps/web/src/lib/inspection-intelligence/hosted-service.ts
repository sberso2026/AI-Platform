import { AuditService } from "@rtb/platform-core";
import {
  createHostedInspectionRepository,
  type HostedInspectionContext,
  type InspectionDbClient,
} from "@rtb/inspection-intelligence/server";
import type { AuthContext } from "@/lib/kernel";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { requireInspectionIntelligenceAccess, transitionAuthAction } from "./access";

export function hostedInspectionContext(
  context: CommerceHandlerContext,
  projectId?: string,
): HostedInspectionContext {
  requireInspectionIntelligenceAccess(context);
  return {
    tenantId: context.ctx.tenantId,
    workspaceId: context.ctx.workspaceId!,
    actorUserId: context.ctx.userId,
    projectId,
  };
}

export function createHostedInspectionFromRequest(context: CommerceHandlerContext, projectId?: string) {
  const audit = new AuditService(context.ctx.supabase);
  return createHostedInspectionRepository(
    hostedInspectionContext(context, projectId),
    context.ctx.supabase as unknown as InspectionDbClient,
    {
      async log(input) {
        await audit.log({
          tenantId: context.ctx.tenantId,
          workspaceId: context.ctx.workspaceId,
          userId: context.ctx.userId,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          metadata: input.metadata,
        });
      },
    },
  );
}

export { transitionAuthAction };
export type { AuthContext };
