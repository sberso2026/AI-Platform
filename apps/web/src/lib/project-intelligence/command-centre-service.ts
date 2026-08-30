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

export type CommandCentreStageTimings = {
  totalMs: number;
  stages: Record<string, number>;
};

export type ComposeProjectCommandCentreResult = {
  view: ProjectCommandCentreView;
  profile: CommandCentreStageTimings;
};

function withTimedLoad<T extends { load: (scope: never) => Promise<unknown> }>(
  name: string,
  source: T,
  timings: Record<string, number>,
): T {
  const original = source.load.bind(source);
  source.load = (async (scope: never) => {
    const started = Date.now();
    try {
      return await original(scope);
    } finally {
      timings[name] = Date.now() - started;
    }
  }) as T["load"];
  return source;
}

export async function composeProjectCommandCentre(
  context: CommerceHandlerContext,
  projectId: string,
): Promise<ComposeProjectCommandCentreResult> {
  const stages: Record<string, number> = {};
  const service = new ProjectCommandCentreService({
    core: withTimedLoad("core", new HostedProjectCoreSource(context.ctx, context.commerce), stages),
    controls: withTimedLoad("controls", new HostedProjectControlsSource(context.ctx), stages),
    knowledge: withTimedLoad("knowledge", new HostedProjectKnowledgeSource(context.ctx), stages),
    schedule: withTimedLoad("schedule", new HostedScheduleIntelligenceSource(context.ctx), stages),
    costProgress: withTimedLoad(
      "costProgress",
      new HostedCostProgressIntelligenceSource(context.ctx),
      stages,
    ),
    riskChange: withTimedLoad(
      "riskChange",
      new HostedRiskChangeIntelligenceSource(context.ctx, context.commerce),
      stages,
    ),
    queryDecision: withTimedLoad(
      "queryDecision",
      new HostedQueryDecisionIntelligenceSource(context.ctx, context.commerce),
      stages,
    ),
    forecast: withTimedLoad("forecast", new HostedForecastIntelligenceSource(context.ctx), stages),
  });
  const started = Date.now();
  const view = await service.compose({
    projectId,
    context: projectIntelligenceAccessContext(context),
  });
  return {
    view,
    profile: {
      totalMs: Date.now() - started,
      stages,
    },
  };
}
