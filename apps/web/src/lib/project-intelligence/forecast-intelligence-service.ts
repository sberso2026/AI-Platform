import {
  commandCentreForbidden,
  ProjectForecastIntelligenceService,
  type ProjectForecastIntelligence,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { projectIntelligenceAccessContext } from "./access";
import { HostedProjectCoreSource } from "./hosted-core-source";
import { HostedForecastIntelligenceSource } from "./hosted-forecast-source";

export async function composeProjectForecastIntelligence(
  context: CommerceHandlerContext,
  projectId: string,
): Promise<ProjectForecastIntelligence> {
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

  const service = new ProjectForecastIntelligenceService(new HostedForecastIntelligenceSource(context.ctx));
  return service.compose({
    projectId,
    context: access,
  });
}
