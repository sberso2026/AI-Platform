import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { evaluateProjectHealthDimensions } from "./evaluator";
import { classifyOverallProjectHealth } from "./overall";
import { SCHEMA_CHANGED, assertProjectHealthOwnershipLocks } from "./ownership";
import type { ProjectHealthSourceBundle } from "./source-contracts";
import type { ProjectHealthAssessment } from "./types";

export type EvaluateProjectHealthInput = {
  projectId: string;
  context: AccessContext;
  evaluatedAt?: string;
};

export class ProjectHealthEvaluator {
  constructor(private readonly sources: ProjectHealthSourceBundle) {}

  async evaluateProjectHealth(input: EvaluateProjectHealthInput): Promise<ProjectHealthAssessment> {
    assertProjectHealthOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
    const scope = { tenantId, workspaceId, projectId: input.projectId };

    const [core, controls, knowledge] = await Promise.all([
      this.sources.core.load(scope),
      this.sources.controls.load(scope),
      this.sources.knowledge.load(scope),
    ]);

    if (
      controls.invokedScheduleEngine ||
      controls.invokedCostEngine ||
      controls.invokedProgressEngine ||
      controls.invokedChangeEngine ||
      controls.invokedForecastEngine ||
      controls.invokedEarnedValueEngine
    ) {
      throw new Error("Project Health must not invoke a Project Controls engine");
    }

    const limitations: string[] = [];
    if (!core.project) limitations.push("canonical_project_unbound");
    if (!controls.forecast) limitations.push("project_controls_forecast_absent");
    else if (!controls.forecast.published) limitations.push("project_controls_forecast_unpublished");
    limitations.push("forecast_is_not_a_health_dimension");
    if (SCHEMA_CHANGED) limitations.push("schema_changed");

    const dimensions = evaluateProjectHealthDimensions({ core, controls, knowledge, evaluatedAt });
    const overall = classifyOverallProjectHealth(dimensions);

    for (const dimension of overall.unknownDimensions) {
      limitations.push(`dimension_unknown:${dimension}`);
    }

    return {
      projectId: input.projectId,
      tenantId,
      workspaceId,
      evaluatedAt,
      dimensions,
      overall,
      limitations,
      readOnly: true,
      persisted: false,
    };
  }
}
