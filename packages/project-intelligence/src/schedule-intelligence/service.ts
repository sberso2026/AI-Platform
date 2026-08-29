import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { CommandCentreError, commandCentreForbidden } from "../command-centre/errors";
import type { CommandCentreAvailability } from "../command-centre/types";
import { buildScheduleAttention } from "./attention";
import {
  assessmentEvidence,
  classifyScheduleHealth,
  interpretDataQuality,
  interpretForecast,
  interpretTrend,
  projectMilestones,
} from "./interpreter";
import { assertScheduleIntelligenceOwnershipLocks, PI_AI_REQUIRED } from "./ownership";
import type { ScheduleIntelligencePort } from "./ports";
import type { ProjectScheduleIntelligence, ScheduleIntelligenceSourceSnapshot } from "./types";

export type ComposeScheduleIntelligenceInput = {
  projectId: string;
  context: AccessContext;
  generatedAt?: string;
};

function unavailableSnapshot(availability: CommandCentreAvailability): ScheduleIntelligenceSourceSnapshot {
  return {
    availability,
    latest: null,
    history: [],
    evidence: [],
    priorEvidence: [],
  };
}

export function interpretScheduleIntelligence(input: {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  snapshot: ScheduleIntelligenceSourceSnapshot;
  generatedAt: string;
}): ProjectScheduleIntelligence {
  const health = classifyScheduleHealth(input.snapshot.latest, input.snapshot.availability);
  const dataQuality = interpretDataQuality({
    availability: input.snapshot.availability,
    latest: input.snapshot.latest,
    generatedAt: input.generatedAt,
  });
  const trend = interpretTrend(input.snapshot);
  const milestones = projectMilestones(input.snapshot.evidence, input.snapshot.latest);
  const attentionItems = buildScheduleAttention({
    snapshot: input.snapshot,
    health,
    trend,
    freshness: dataQuality.freshness,
    generatedAt: input.generatedAt,
  });
  const evidenceReferences = [
    ...(input.snapshot.latest ? [assessmentEvidence(input.snapshot.latest)] : []),
    ...milestones.map((row) => row.evidenceReference),
  ];

  return {
    projectId: input.projectId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    availability: input.snapshot.availability,
    health,
    attentionItems,
    milestones,
    trend,
    dataQuality,
    forecast: interpretForecast(input.snapshot.latest),
    criticalPath: {
      published: false,
      state: "unknown",
      limitation: "critical_path_not_published",
    },
    float: {
      published: false,
      state: "unknown",
      limitation: "float_not_published",
    },
    evidenceReferences,
    generatedAt: input.generatedAt,
    readOnly: true,
    persisted: false,
    aiRequired: PI_AI_REQUIRED,
    mutatesSchedule: false,
  };
}

export class ProjectScheduleIntelligenceService {
  constructor(private readonly source: ScheduleIntelligencePort) {}

  async compose(input: ComposeScheduleIntelligenceInput): Promise<ProjectScheduleIntelligence> {
    assertScheduleIntelligenceOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);
    if (this.source.invokesControlsEngine || this.source.computesCriticalPath || this.source.computesFloat) {
      throw new Error("Schedule Intelligence must not invoke a Project Controls engine");
    }

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const generatedAt = input.generatedAt ?? new Date().toISOString();

    let snapshot: ScheduleIntelligenceSourceSnapshot;
    try {
      snapshot = await this.source.load({ tenantId, workspaceId, projectId: input.projectId });
    } catch (error) {
      if (error instanceof CommandCentreError) throw error;
      snapshot = unavailableSnapshot("error");
    }

    if (snapshot.availability === "forbidden") {
      throw scheduleForbidden(input.projectId, "schedule_forbidden");
    }

    return interpretScheduleIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot,
      generatedAt,
    });
  }
}

export function scheduleForbidden(projectId: string, reason: string): CommandCentreError {
  return commandCentreForbidden(projectId, reason);
}
