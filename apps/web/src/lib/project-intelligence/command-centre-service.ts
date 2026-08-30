import { ProjectCommandCentreService, type ProjectCommandCentreView } from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { projectIntelligenceAccessContext } from "./access";
import { HostedProjectCoreSource } from "./hosted-core-source";
import { HostedProjectControlsSource } from "./hosted-controls-source";
import { HostedProjectKnowledgeSource } from "./hosted-knowledge-source";
import { HostedScheduleIntelligenceSource } from "./hosted-schedule-source";
import { HostedCostProgressIntelligenceSource } from "./hosted-cost-progress-source";
import { HostedRiskChangeIntelligenceSource } from "./hosted-risk-change-source";
import { HostedQueryDecisionIntelligenceSource } from "./hosted-query-decision-source";
import { HostedForecastIntelligenceSource } from "./hosted-forecast-source";

export async function composeProjectCommandCentre(
  context: CommerceHandlerContext,
  projectId: string,
): Promise<ProjectCommandCentreView> {
  const service = new ProjectCommandCentreService({
    core: new HostedProjectCoreSource(context.ctx, context.commerce),
    controls: new HostedProjectControlsSource(context.ctx),
    knowledge: new HostedProjectKnowledgeSource(context.ctx),
    schedule: new HostedScheduleIntelligenceSource(context.ctx),
    costProgress: new HostedCostProgressIntelligenceSource(context.ctx),
    riskChange: new HostedRiskChangeIntelligenceSource(context.ctx, context.commerce),
    queryDecision: new HostedQueryDecisionIntelligenceSource(context.ctx, context.commerce),
    forecast: new HostedForecastIntelligenceSource(context.ctx),
  });
  return service.compose({
    projectId,
    context: projectIntelligenceAccessContext(context),
  });
}
