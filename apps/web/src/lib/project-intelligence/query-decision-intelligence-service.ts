import {
  commandCentreForbidden,
  ProjectQueryDecisionIntelligenceService,
  type ProjectQueryDecisionIntelligence,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { projectIntelligenceAccessContext } from "./access";
import { HostedProjectCoreSource } from "./hosted-core-source";
import { HostedQueryDecisionIntelligenceSource } from "./hosted-query-decision-source";

export async function composeProjectQueryDecisionIntelligence(
  context: CommerceHandlerContext,
  projectId: string,
): Promise<ProjectQueryDecisionIntelligence> {
  const access = projectIntelligenceAccessContext(context);
  const scope = {
    tenantId: access.tenantId!,
    workspaceId: access.workspaceId!,
    projectId,
  };
  const core = await new HostedProjectCoreSource(context.ctx, context.commerce).load(scope);
  if (core.identity.tenantId !== scope.tenantId) {
    throw commandCentreForbidden(projectId, "cross_tenant");
  }
  if (core.identity.workspaceId && core.identity.workspaceId !== scope.workspaceId) {
    throw commandCentreForbidden(projectId, "cross_workspace");
  }

  const service = new ProjectQueryDecisionIntelligenceService(
    new HostedQueryDecisionIntelligenceSource(context.ctx, context.commerce),
  );
  return service.compose({
    projectId,
    context: access,
  });
}
