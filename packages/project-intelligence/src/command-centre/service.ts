import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { evaluateProjectHealthDimensions } from "../project-health/evaluator";
import { classifyOverallProjectHealth } from "../project-health/overall";
import {
  emptyControlsSnapshot,
  emptyKnowledgeSnapshot,
} from "../project-health/in-memory-sources";
import type { ProjectHealthEvidenceReference } from "../project-health/types";
import type { ProjectControlsSnapshot } from "../project-health/source-contracts";
import { CommandCentreError, commandCentreCoreFailed, commandCentreForbidden } from "./errors";
import { asPublishedPosture } from "../schedule-intelligence/interpreter";
import { interpretScheduleIntelligence } from "../schedule-intelligence/service";
import type { ScheduleIntelligenceSourceSnapshot } from "../schedule-intelligence/types";
import {
  asCostPosture,
  asProgressBand,
  asProgressTrend,
} from "../cost-progress-intelligence/interpreter";
import { interpretCostProgressIntelligence } from "../cost-progress-intelligence/service";
import type { CostProgressSourceSnapshot } from "../cost-progress-intelligence/types";
import { assertCommandCentreOwnershipLocks, PI_AI_REQUIRED } from "./ownership";
import {
  buildAttentionItems,
  projectControlsSection,
  projectKnowledgeSection,
  projectQualitySection,
  projectRegisterSection,
} from "./attention";
import type {
  CommandCentreControlsLoad,
  CommandCentreKnowledgeLoad,
  CommandCentreSourceBundle,
} from "./ports";
import type {
  CommandCentreAvailability,
  CommandCentreControlsAvailability,
  ProjectCommandCentreView,
} from "./types";

export type ComposeCommandCentreInput = {
  projectId: string;
  context: AccessContext;
  generatedAt?: string;
};

const STALE_MS = 45 * 24 * 60 * 60 * 1000;

function isStale(timestamp: string | undefined, generatedAt: string): boolean {
  if (!timestamp) return false;
  const then = Date.parse(timestamp);
  const now = Date.parse(generatedAt);
  return Number.isFinite(then) && Number.isFinite(now) && now - then > STALE_MS;
}

function controlsAvailabilityFromOutput(
  output: { published?: boolean; publishedAt?: string; assessedAt?: string } | null,
  reported: CommandCentreAvailability,
  generatedAt: string,
): CommandCentreAvailability {
  if (reported === "error" || reported === "unavailable" || reported === "forbidden") return reported;
  if (!output) return "no_data";
  if (isStale(output.publishedAt ?? output.assessedAt, generatedAt)) return "stale";
  return reported === "ok" || reported === "no_data" || reported === "stale" ? reported : "ok";
}

async function isolateControls(
  load: () => Promise<CommandCentreControlsLoad>,
): Promise<CommandCentreControlsLoad> {
  try {
    return await load();
  } catch {
    const unavailable: CommandCentreControlsAvailability = {
      schedule: "error",
      cost: "error",
      progress: "error",
      change: "error",
      forecast: "error",
    };
    return { snapshot: emptyControlsSnapshot(), availability: unavailable };
  }
}

async function isolateKnowledge(
  load: () => Promise<CommandCentreKnowledgeLoad>,
): Promise<CommandCentreKnowledgeLoad> {
  try {
    return await load();
  } catch {
    return { snapshot: emptyKnowledgeSnapshot(), availability: "error" };
  }
}

function isFailedAvailability(value: CommandCentreAvailability): boolean {
  return value === "error" || value === "unavailable" || value === "forbidden";
}

function maskFailedControls(load: CommandCentreControlsLoad): CommandCentreControlsLoad {
  const snapshot = {
    ...load.snapshot,
    schedule: isFailedAvailability(load.availability.schedule) ? null : load.snapshot.schedule,
    cost: isFailedAvailability(load.availability.cost) ? null : load.snapshot.cost,
    progress: isFailedAvailability(load.availability.progress) ? null : load.snapshot.progress,
    change: isFailedAvailability(load.availability.change) ? null : load.snapshot.change,
    forecast: isFailedAvailability(load.availability.forecast) ? null : load.snapshot.forecast,
  };
  return { snapshot, availability: load.availability };
}

function maskFailedKnowledge(load: CommandCentreKnowledgeLoad): CommandCentreKnowledgeLoad {
  if (!isFailedAvailability(load.availability)) return load;
  return { snapshot: emptyKnowledgeSnapshot(), availability: load.availability };
}

function collectEvidence(viewSections: Array<{ evidenceReferences: readonly ProjectHealthEvidenceReference[] }>): ProjectHealthEvidenceReference[] {
  const seen = new Set<string>();
  const refs: ProjectHealthEvidenceReference[] = [];
  for (const section of viewSections) {
    for (const ref of section.evidenceReferences) {
      const key = `${ref.sourceDomain}:${ref.entityType}:${ref.entityId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push(ref);
    }
  }
  return refs;
}

function snapshotFromControlsSchedule(
  output: ProjectControlsSnapshot["schedule"],
  availability: CommandCentreAvailability,
): ScheduleIntelligenceSourceSnapshot {
  if (!output) {
    return {
      availability: availability === "ok" ? "no_data" : availability,
      latest: null,
      history: [],
      evidence: [],
      priorEvidence: [],
    };
  }
  const latest = {
    assessmentId: output.assessmentId,
    stateId: output.assessmentId,
    projectId: output.projectId,
    published: output.published,
    abstained: output.abstained,
    posture: asPublishedPosture(output.posture),
    assessedAt: output.assessedAt,
    publishedAt: output.publishedAt,
    version: typeof output.version === "number" ? output.version : undefined,
    storesCanonicalCopy: false as const,
  };
  return {
    availability,
    latest,
    history: [latest],
    evidence: [],
    priorEvidence: [],
  };
}

function snapshotFromControlsCost(
  output: ProjectControlsSnapshot["cost"],
  availability: CommandCentreAvailability,
): CostProgressSourceSnapshot["cost"] {
  if (!output) {
    return {
      availability: availability === "ok" ? "no_data" : availability,
      latest: null,
      history: [],
      evidence: [],
    };
  }
  const latest = {
    stateId: output.assessmentId,
    projectId: output.projectId,
    published: output.published,
    abstained: output.abstained,
    posture: asCostPosture(output.posture),
    assessedAt: output.assessedAt,
    publishedAt: output.publishedAt,
    version: typeof output.version === "number" ? output.version : undefined,
    storesCanonicalCopy: false as const,
  };
  return {
    availability,
    latest,
    history: [latest],
    evidence: [],
  };
}

function snapshotFromControlsProgress(
  output: ProjectControlsSnapshot["progress"],
  availability: CommandCentreAvailability,
): CostProgressSourceSnapshot["progress"] {
  if (!output) {
    return {
      availability: availability === "ok" ? "no_data" : availability,
      latest: null,
      history: [],
      evidence: [],
    };
  }
  const latest = {
    assessmentId: output.assessmentId,
    stateId: output.assessmentId,
    projectId: output.projectId,
    published: output.published,
    abstained: output.abstained,
    band: asProgressBand(output.posture),
    trendDirection: asProgressTrend(output.posture),
    assessedAt: output.assessedAt,
    publishedAt: output.publishedAt,
    version: typeof output.version === "number" ? output.version : undefined,
    storesCanonicalCopy: false as const,
  };
  return {
    availability,
    latest,
    history: [latest],
    evidence: [],
  };
}

export class ProjectCommandCentreService {
  constructor(private readonly sources: CommandCentreSourceBundle) {}

  async compose(input: ComposeCommandCentreInput): Promise<ProjectCommandCentreView> {
    assertCommandCentreOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const generatedAt = input.generatedAt ?? new Date().toISOString();
    const scope = { tenantId, workspaceId, projectId: input.projectId };

    if (this.sources.controls.invokesControlsEngine) {
      throw new Error("Command Centre must not invoke a Project Controls engine");
    }

    let coreLoad;
    try {
      coreLoad = await this.sources.core.load(scope);
    } catch (error) {
      if (error instanceof CommandCentreError) throw error;
      throw commandCentreCoreFailed(input.projectId, error instanceof Error ? error.message : "unknown");
    }

    if (coreLoad.identity.tenantId !== tenantId) {
      throw commandCentreForbidden(input.projectId, "cross_tenant");
    }
    if (coreLoad.identity.workspaceId && coreLoad.identity.workspaceId !== workspaceId) {
      throw commandCentreForbidden(input.projectId, "cross_workspace");
    }

    const [controlsRaw, knowledgeRaw] = await Promise.all([
      isolateControls(() => this.sources.controls.load(scope)),
      isolateKnowledge(() => this.sources.knowledge.load(scope)),
    ]);
    const controlsLoad = maskFailedControls(controlsRaw);
    const knowledgeLoad = maskFailedKnowledge(knowledgeRaw);

    let scheduleSnapshot: ScheduleIntelligenceSourceSnapshot | undefined;
    if (this.sources.schedule) {
      if (this.sources.schedule.invokesControlsEngine || this.sources.schedule.computesCriticalPath || this.sources.schedule.computesFloat) {
        throw new Error("Command Centre must not invoke a Project Controls engine");
      }
      try {
        scheduleSnapshot = await this.sources.schedule.load(scope);
      } catch (error) {
        if (error instanceof CommandCentreError && error.code === "project_forbidden") {
          scheduleSnapshot = snapshotFromControlsSchedule(null, "forbidden");
        } else {
          scheduleSnapshot = snapshotFromControlsSchedule(null, "error");
        }
      }
    }

    let costProgressSnapshot: CostProgressSourceSnapshot | undefined;
    if (this.sources.costProgress) {
      if (
        this.sources.costProgress.invokesControlsEngine ||
        this.sources.costProgress.computesEarnedValue ||
        this.sources.costProgress.computesForecast ||
        this.sources.costProgress.computesPhysicalProgress
      ) {
        throw new Error("Command Centre must not invoke a Project Controls engine");
      }
      try {
        costProgressSnapshot = await this.sources.costProgress.load(scope);
      } catch (error) {
        if (error instanceof CommandCentreError && error.code === "project_forbidden") {
          costProgressSnapshot = {
            cost: snapshotFromControlsCost(null, "forbidden"),
            progress: snapshotFromControlsProgress(null, "forbidden"),
          };
        } else {
          costProgressSnapshot = {
            cost: snapshotFromControlsCost(null, "error"),
            progress: snapshotFromControlsProgress(null, "error"),
          };
        }
      }
    }

    const dimensions = evaluateProjectHealthDimensions({
      core: coreLoad.snapshot,
      controls: controlsLoad.snapshot,
      knowledge: knowledgeLoad.snapshot,
      evaluatedAt: generatedAt,
    });
    const overall = classifyOverallProjectHealth(dimensions);
    const attentionItems = buildAttentionItems({
      dimensions,
      core: coreLoad.snapshot,
      controls: controlsLoad.snapshot,
      generatedAt,
    });

    const scheduleAvailability = controlsAvailabilityFromOutput(
      controlsLoad.snapshot.schedule,
      controlsLoad.availability.schedule,
      generatedAt,
    );
    const costAvailability = controlsAvailabilityFromOutput(
      controlsLoad.snapshot.cost,
      controlsLoad.availability.cost,
      generatedAt,
    );
    const progressAvailability = controlsAvailabilityFromOutput(
      controlsLoad.snapshot.progress,
      controlsLoad.availability.progress,
      generatedAt,
    );
    const changeAvailability = controlsAvailabilityFromOutput(
      controlsLoad.snapshot.change,
      controlsLoad.availability.change,
      generatedAt,
    );
    const forecastAvailability = controlsAvailabilityFromOutput(
      controlsLoad.snapshot.forecast,
      controlsLoad.availability.forecast,
      generatedAt,
    );

    const schedule = projectControlsSection({
      title: "Schedule",
      entityType: "schedule_assessment",
      availability: scheduleAvailability,
      output: controlsLoad.snapshot.schedule,
      noDataSummary: "Schedule UNKNOWN — no published schedule state.",
    });
    const resolvedScheduleSnapshot =
      scheduleSnapshot ?? snapshotFromControlsSchedule(controlsLoad.snapshot.schedule, scheduleAvailability);
    const scheduleIntelligence = interpretScheduleIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot: resolvedScheduleSnapshot,
      generatedAt,
    });
    const resolvedCostProgressSnapshot: CostProgressSourceSnapshot = costProgressSnapshot ?? {
      cost: snapshotFromControlsCost(controlsLoad.snapshot.cost, costAvailability),
      progress: snapshotFromControlsProgress(controlsLoad.snapshot.progress, progressAvailability),
    };
    const costProgressIntelligence = interpretCostProgressIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot: resolvedCostProgressSnapshot,
      generatedAt,
    });
    const cost = projectControlsSection({
      title: "Cost",
      entityType: "cost_state",
      availability: costAvailability,
      output: controlsLoad.snapshot.cost,
      noDataSummary: "Cost UNKNOWN — no published cost state.",
    });
    const progress = projectControlsSection({
      title: "Progress",
      entityType: "progress_assessment",
      availability: progressAvailability,
      output: controlsLoad.snapshot.progress,
      noDataSummary: "Progress UNKNOWN — no published progress state.",
    });
    const change = projectControlsSection({
      title: "Change",
      entityType: "change_state",
      availability: changeAvailability,
      output: controlsLoad.snapshot.change,
      noDataSummary: "Change UNKNOWN — no published change state.",
    });
    const forecast = projectControlsSection({
      title: "Forecast",
      entityType: "forecast_state",
      availability: forecastAvailability === "no_data" ? "no_data" : forecastAvailability,
      output: controlsLoad.snapshot.forecast,
      noDataSummary: "Forecast unavailable — no published forecast output.",
    });

    const risk = projectRegisterSection({
      title: "Risk",
      availability: coreLoad.snapshot.risks.bound ? "ok" : "no_data",
      bound: coreLoad.snapshot.risks,
    });
    const decisionsActions = projectRegisterSection({
      title: "Decisions & Actions",
      availability:
        coreLoad.snapshot.decisions.bound || coreLoad.snapshot.actions.bound ? "ok" : "no_data",
      bound: coreLoad.snapshot.actions.bound ? coreLoad.snapshot.actions : coreLoad.snapshot.decisions,
      extraCounts: {
        openDecisions: coreLoad.snapshot.decisions.bound
          ? coreLoad.snapshot.decisions.items.filter((item) => item.open).length
          : 0,
        openActions: coreLoad.snapshot.actions.bound
          ? coreLoad.snapshot.actions.items.filter((item) => item.open).length
          : 0,
      },
    });
    const quality = projectQualitySection({
      availability:
        knowledgeLoad.availability === "error" || knowledgeLoad.availability === "unavailable"
          ? knowledgeLoad.availability
          : "ok",
      issues: coreLoad.snapshot.issues,
      knowledge: knowledgeLoad.snapshot,
    });
    const knowledge = projectKnowledgeSection({
      availability: knowledgeLoad.availability,
      knowledge: knowledgeLoad.snapshot,
    });

    const limitations = [
      ...overall.unknownDimensions.map((dimension) => `dimension_unknown:${dimension}`),
      ...(controlsLoad.snapshot.forecast ? [] : ["project_controls_forecast_absent"]),
      "forecast_is_not_a_health_dimension",
      "command_centre_is_read_only",
      ...(PI_AI_REQUIRED ? ["ai_required"] : ["ai_not_required"]),
    ];

    const evidenceReferences = collectEvidence([
      ...dimensions,
      schedule,
      cost,
      progress,
      risk,
      quality,
      change,
      decisionsActions,
      forecast,
      knowledge,
    ]);

    return {
      project: coreLoad.identity,
      overallHealth: overall.classification,
      healthDimensions: dimensions,
      attentionItems,
      schedule,
      cost,
      progress,
      risk,
      quality,
      change,
      decisionsActions,
      forecast,
      knowledge,
      scheduleIntelligence,
      costProgressIntelligence,
      limitations,
      evidenceReferences,
      generatedAt,
      readOnly: true,
      persisted: false,
      aiRequired: false,
      canonicalMutation: false,
    };
  }
}
