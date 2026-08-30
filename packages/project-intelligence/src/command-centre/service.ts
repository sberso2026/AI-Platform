import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { evaluateProjectHealthDimensions } from "../project-health/evaluator";
import { classifyOverallProjectHealth } from "../project-health/overall";
import {
  emptyControlsSnapshot,
  emptyKnowledgeSnapshot,
} from "../project-health/in-memory-sources";
import type { ProjectHealthEvidenceReference } from "../project-health/types";
import type {
  CanonicalRegisterItemRef,
  ProjectControlsSnapshot,
  ProjectCoreSnapshot,
} from "../project-health/source-contracts";
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
import { asChangeStatusContext } from "../risk-change-intelligence/interpreter";
import { interpretRiskChangeIntelligence } from "../risk-change-intelligence/service";
import type {
  CanonicalRiskActionRef,
  CanonicalRiskRef,
  ChangeSourceSlice,
  RiskChangeSourceSnapshot,
  RiskSourceSlice,
} from "../risk-change-intelligence/types";
import { interpretQueryDecisionIntelligence } from "../query-decision-intelligence/service";
import type {
  ActionSourceSlice,
  CanonicalActionRef,
  CanonicalDecisionRef,
  CanonicalQueryRef,
  DecisionSourceSlice,
  QueryDecisionSourceSnapshot,
  QuerySourceSlice,
} from "../query-decision-intelligence/types";
import { asForecastPosture } from "../forecast-intelligence/interpreter";
import { interpretForecastIntelligence } from "../forecast-intelligence/service";
import type {
  ForecastIntelligenceSourceSnapshot,
  PublishedCurrentPostureRef,
  PublishedForecastStateRef,
} from "../forecast-intelligence/types";
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

function toCanonicalRiskRef(item: CanonicalRegisterItemRef): CanonicalRiskRef {
  return {
    id: item.id,
    status: item.status,
    open: item.open,
    priority: item.priority,
    score: item.score,
    probability: item.probability,
    consequence: item.consequence,
    residualScore: item.residualScore,
    category: item.category,
    ownerId: item.ownerId,
    assignedTo: item.assignedTo,
    dueAt: item.dueAt,
    updatedAt: item.sourceTimestamp,
    matrixId: item.matrixId,
    matrixScale: "probability_1_5_consequence_1_5",
    storesCanonicalCopy: false,
  };
}

function toCanonicalRiskActionRef(item: CanonicalRegisterItemRef): CanonicalRiskActionRef {
  return {
    id: item.id,
    open: item.open,
    dueAt: item.dueAt,
    originatingObjectType: item.originatingObjectType,
    originatingObjectId: item.originatingObjectId,
    updatedAt: item.sourceTimestamp,
    storesCanonicalCopy: false,
  };
}

function snapshotFromCoreRisks(
  core: ProjectCoreSnapshot,
  availability: CommandCentreAvailability,
): RiskSourceSlice {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return { availability, bound: false, items: [], actions: [] };
  }
  if (!core.risks.bound) {
    return { availability: "no_data", bound: false, items: [], actions: [] };
  }
  return {
    availability: "ok",
    bound: true,
    completeness: core.risks.completeness ?? "complete",
    items: core.risks.items.map(toCanonicalRiskRef),
    actions: core.actions.bound ? core.actions.items.map(toCanonicalRiskActionRef) : [],
    sourceTimestamp: core.risks.sourceTimestamp,
  };
}

function snapshotFromControlsChange(
  output: ProjectControlsSnapshot["change"],
  availability: CommandCentreAvailability,
): ChangeSourceSlice {
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
    statusContext: asChangeStatusContext(output.posture),
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

function currentStatesFromControls(snapshot: ProjectControlsSnapshot): PublishedCurrentPostureRef[] {
  const states: PublishedCurrentPostureRef[] = [];
  if (snapshot.schedule) {
    states.push({
      domain: "schedule",
      posture: snapshot.schedule.posture,
      published: snapshot.schedule.published,
      assessmentId: snapshot.schedule.assessmentId,
      publishedAt: snapshot.schedule.publishedAt,
    });
  }
  if (snapshot.cost) {
    states.push({
      domain: "cost",
      posture: snapshot.cost.posture,
      published: snapshot.cost.published,
      assessmentId: snapshot.cost.assessmentId,
      publishedAt: snapshot.cost.publishedAt,
    });
  }
  if (snapshot.progress) {
    states.push({
      domain: "progress",
      posture: snapshot.progress.posture,
      published: snapshot.progress.published,
      assessmentId: snapshot.progress.assessmentId,
      publishedAt: snapshot.progress.publishedAt,
    });
  }
  if (snapshot.change) {
    states.push({
      domain: "change",
      posture: snapshot.change.posture,
      published: snapshot.change.published,
      assessmentId: snapshot.change.assessmentId,
      publishedAt: snapshot.change.publishedAt,
    });
  }
  return states;
}

function snapshotFromControlsForecast(
  output: ProjectControlsSnapshot["forecast"],
  availability: CommandCentreAvailability,
  currentStates: readonly PublishedCurrentPostureRef[] = [],
): ForecastIntelligenceSourceSnapshot {
  if (!output) {
    return {
      availability: availability === "ok" ? "no_data" : availability,
      latest: null,
      history: [],
      evidence: [],
      currentStates,
    };
  }
  const latest: PublishedForecastStateRef = {
    stateId: output.assessmentId,
    projectId: output.projectId,
    published: output.published,
    abstained: output.abstained,
    posture: asForecastPosture(output.posture),
    assessedAt: output.assessedAt,
    publishedAt: output.publishedAt,
    version: typeof output.version === "number" ? output.version : undefined,
    contributingContributors: [],
    limitations: ["advisory_qualitative_forecast_only"],
    completionDatePredicted: false,
    costForecastComputed: false,
    scenarioIdPublished: false,
    storesCanonicalCopy: false,
  };
  return {
    availability,
    latest,
    history: [latest],
    evidence: [],
    currentStates,
  };
}

function snapshotFromCoreAndControls(
  core: ProjectCoreSnapshot,
  output: ProjectControlsSnapshot["change"],
  riskAvailability: CommandCentreAvailability,
  changeAvailability: CommandCentreAvailability,
): RiskChangeSourceSnapshot {
  return {
    risk: snapshotFromCoreRisks(core, riskAvailability),
    change: snapshotFromControlsChange(output, changeAvailability),
  };
}

function toCanonicalQueryRef(item: CanonicalRegisterItemRef): CanonicalQueryRef {
  return {
    id: item.id,
    number: item.number,
    status: item.status,
    open: item.open,
    priority: item.priority,
    ownerId: item.ownerId,
    assignedTo: item.assignedTo,
    raisedBy: item.raisedBy,
    requesterId: item.requesterId,
    responderId: item.responderId,
    dueAt: item.dueAt,
    responseDue: item.responseDue,
    createdAt: item.createdAt,
    closedAt: item.closedAt,
    updatedAt: item.sourceTimestamp,
    disciplineId: item.disciplineId,
    storesCanonicalCopy: false,
  };
}

function toCanonicalDecisionRef(item: CanonicalRegisterItemRef): CanonicalDecisionRef {
  return {
    id: item.id,
    number: item.number,
    status: item.status,
    open: item.open,
    priority: item.priority,
    ownerId: item.ownerId,
    assignedTo: item.assignedTo,
    raisedBy: item.raisedBy,
    approvalStatus: item.approvalStatus,
    reviewStatus: item.reviewStatus,
    dueAt: item.dueAt,
    createdAt: item.createdAt,
    decisionDate: item.decisionDate,
    closedAt: item.closedAt,
    updatedAt: item.sourceTimestamp,
    storesCanonicalCopy: false,
  };
}

function toCanonicalActionRef(item: CanonicalRegisterItemRef): CanonicalActionRef {
  return {
    id: item.id,
    number: item.number,
    status: item.status,
    open: item.open,
    priority: item.priority,
    ownerId: item.ownerId,
    assignedTo: item.assignedTo,
    dueAt: item.dueAt,
    createdAt: item.createdAt,
    closedAt: item.closedAt,
    updatedAt: item.sourceTimestamp,
    originatingObjectType: item.originatingObjectType,
    originatingObjectId: item.originatingObjectId,
    storesCanonicalCopy: false,
  };
}

function sliceFromBound<T>(
  bound: ProjectCoreSnapshot["decisions"],
  availability: CommandCentreAvailability,
  map: (item: CanonicalRegisterItemRef) => T,
): { availability: CommandCentreAvailability; bound: boolean; completeness?: "complete" | "unknown"; items: T[]; sourceTimestamp?: string } {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return { availability, bound: false, items: [] };
  }
  if (!bound.bound) {
    return { availability: "no_data", bound: false, items: [] };
  }
  return {
    availability: "ok",
    bound: true,
    completeness: bound.completeness ?? "complete",
    items: bound.items.map(map),
    sourceTimestamp: bound.sourceTimestamp,
  };
}

function snapshotFromCoreQueryDecision(
  core: ProjectCoreSnapshot,
  availability: CommandCentreAvailability,
): QueryDecisionSourceSnapshot {
  return {
    query: sliceFromBound(core.technicalQueries, availability, toCanonicalQueryRef) as QuerySourceSlice,
    decision: sliceFromBound(core.decisions, availability, toCanonicalDecisionRef) as DecisionSourceSlice,
    action: sliceFromBound(core.actions, availability, toCanonicalActionRef) as ActionSourceSlice,
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

    let riskChangeSnapshot: RiskChangeSourceSnapshot | undefined;
    if (this.sources.riskChange) {
      if (
        this.sources.riskChange.invokesControlsEngine ||
        this.sources.riskChange.storesRiskRegister ||
        this.sources.riskChange.mutatesRisk ||
        this.sources.riskChange.mutatesChange ||
        this.sources.riskChange.computesChangeImpact ||
        this.sources.riskChange.computesIndependentRiskScore
      ) {
        throw new Error("Command Centre must not own a risk register or invoke a Project Controls engine");
      }
      try {
        riskChangeSnapshot = await this.sources.riskChange.load(scope);
      } catch {
        riskChangeSnapshot = undefined;
      }
    }

    let queryDecisionSnapshot: QueryDecisionSourceSnapshot | undefined;
    if (this.sources.queryDecision) {
      if (
        this.sources.queryDecision.storesQueryRegister ||
        this.sources.queryDecision.storesDecisionRegister ||
        this.sources.queryDecision.storesActionRegister ||
        this.sources.queryDecision.mutatesQuery ||
        this.sources.queryDecision.mutatesDecision ||
        this.sources.queryDecision.mutatesAction
      ) {
        throw new Error("Command Centre must not store or mutate canonical query, decision, or action registers");
      }
      try {
        queryDecisionSnapshot = await this.sources.queryDecision.load(scope);
      } catch {
        queryDecisionSnapshot = undefined;
      }
    }

    let forecastSnapshot: ForecastIntelligenceSourceSnapshot | undefined;
    if (this.sources.forecast) {
      if (
        this.sources.forecast.invokesControlsEngine ||
        this.sources.forecast.computesForecast ||
        this.sources.forecast.computesCompletionDate ||
        this.sources.forecast.computesCostForecast ||
        this.sources.forecast.computesMonteCarlo
      ) {
        throw new Error("Command Centre must not invoke a Project Controls forecast engine");
      }
      try {
        forecastSnapshot = await this.sources.forecast.load(scope);
      } catch {
        forecastSnapshot = undefined;
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
    const resolvedRiskChangeSnapshot: RiskChangeSourceSnapshot =
      riskChangeSnapshot ??
      snapshotFromCoreAndControls(
        coreLoad.snapshot,
        controlsLoad.snapshot.change,
        coreLoad.snapshot.risks.bound ? "ok" : "no_data",
        changeAvailability,
      );
    const riskChangeIntelligence = interpretRiskChangeIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot: resolvedRiskChangeSnapshot,
      generatedAt,
    });
    const resolvedQueryDecisionSnapshot =
      queryDecisionSnapshot ?? snapshotFromCoreQueryDecision(coreLoad.snapshot, "ok");
    const queryDecisionIntelligence = interpretQueryDecisionIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot: resolvedQueryDecisionSnapshot,
      generatedAt,
    });
    const resolvedForecastSnapshot =
      forecastSnapshot ??
      snapshotFromControlsForecast(
        controlsLoad.snapshot.forecast,
        forecastAvailability,
        currentStatesFromControls(controlsLoad.snapshot),
      );
    const forecastIntelligence = interpretForecastIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot: resolvedForecastSnapshot,
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
      riskChangeIntelligence,
      queryDecisionIntelligence,
      forecastIntelligence,
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
