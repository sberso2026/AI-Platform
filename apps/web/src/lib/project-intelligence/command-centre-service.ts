import { ProjectCommandCentreService, type ProjectCommandCentreView } from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { projectIntelligenceAccessContext } from "./access";
import { HostedProjectCoreSource } from "./hosted-core-source";
import { HostedProjectControlsSource } from "./hosted-controls-source";
import { HostedProjectKnowledgeSource } from "./hosted-knowledge-source";
import { HostedScheduleIntelligenceSource } from "./hosted-schedule-source";

export async function composeProjectCommandCentre(
  context: CommerceHandlerContext,
  projectId: string,
): Promise<ProjectCommandCentreView> {
  const service = new ProjectCommandCentreService({
    core: new HostedProjectCoreSource(context.ctx, context.commerce),
    controls: new HostedProjectControlsSource(context.ctx),
    knowledge: new HostedProjectKnowledgeSource(context.ctx),
    schedule: new HostedScheduleIntelligenceSource(context.ctx),
  });
  return service.compose({
    projectId,
    context: projectIntelligenceAccessContext(context),
  });
}
