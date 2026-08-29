import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { CommandCentreError, commandCentreForbidden } from "../command-centre/errors";
import type { CommandCentreAvailability } from "../command-centre/types";
import { buildCostAttention, buildProgressAttention } from "./attention";
import {
  classifyCostHealth,
  classifyProgressHealth,
  costStateEvidence,
  interpretConsistency,
  interpretCostDataQuality,
  interpretCostMetrics,
  interpretCostMoney,
  interpretProgressDataQuality,
  interpretProgressMetrics,
  progressAssessmentEvidence,
  UNSUPPORTED_EARNED_VALUE,
} from "./interpreter";
import { assertCostProgressIntelligenceOwnershipLocks, PI_AI_REQUIRED } from "./ownership";
import type { CostProgressIntelligencePort } from "./ports";
import type {
  CostProgressSourceSnapshot,
  CostSourceSlice,
  ProgressSourceSlice,
  ProjectCostProgressIntelligence,
} from "./types";

export type ComposeCostProgressIntelligenceInput = {
  projectId: string;
  context: AccessContext;
  generatedAt?: string;
};

function emptySlice(availability: CommandCentreAvailability): CostSourceSlice {
  return { availability, latest: null, history: [], evidence: [] };
}

function emptyProgressSlice(availability: CommandCentreAvailability): ProgressSourceSlice {
  return { availability, latest: null, history: [], evidence: [] };
}

function unavailableSnapshot(availability: CommandCentreAvailability): CostProgressSourceSnapshot {
  return {
    cost: emptySlice(availability),
    progress: emptyProgressSlice(availability),
  };
}

export function interpretCostProgressIntelligence(input: {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  snapshot: CostProgressSourceSnapshot;
  generatedAt: string;
}): ProjectCostProgressIntelligence {
  const costHealth = classifyCostHealth(input.snapshot.cost.latest, input.snapshot.cost.availability);
  const progressHealth = classifyProgressHealth(
    input.snapshot.progress.latest,
    input.snapshot.progress.availability,
  );
  const costQuality = interpretCostDataQuality({
    slice: input.snapshot.cost,
    generatedAt: input.generatedAt,
  });
  const progressQuality = interpretProgressDataQuality({
    slice: input.snapshot.progress,
    generatedAt: input.generatedAt,
  });
  const money = interpretCostMoney(input.snapshot.cost);
  const costAttention = buildCostAttention({
    slice: input.snapshot.cost,
    health: costHealth,
    freshness: costQuality.freshness,
    generatedAt: input.generatedAt,
  });
  const progressAttention = buildProgressAttention({
    slice: input.snapshot.progress,
    health: progressHealth,
    freshness: progressQuality.freshness,
    generatedAt: input.generatedAt,
  });
  const consistency = interpretConsistency({
    cost: input.snapshot.cost,
    progress: input.snapshot.progress,
    costHealth,
    progressHealth,
  });

  return {
    projectId: input.projectId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    cost: {
      availability: input.snapshot.cost.availability,
      health: costHealth,
      attentionItems: costAttention,
      dataQuality: costQuality,
      money,
      metrics: interpretCostMetrics(input.snapshot.cost.latest, money),
      evidenceReferences: [
        ...(input.snapshot.cost.latest ? [costStateEvidence(input.snapshot.cost.latest)] : []),
        ...input.snapshot.cost.evidence.map((row) => ({
          sourceDomain: "project_controls" as const,
          entityType: "cost_evidence",
          entityId: row.evidenceId,
          sourceTimestamp: row.recordedAt,
          storesCanonicalCopy: false as const,
        })),
      ],
    },
    progress: {
      availability: input.snapshot.progress.availability,
      health: progressHealth,
      attentionItems: progressAttention,
      dataQuality: progressQuality,
      metrics: interpretProgressMetrics(input.snapshot.progress.latest),
      evidenceReferences: [
        ...(input.snapshot.progress.latest
          ? [progressAssessmentEvidence(input.snapshot.progress.latest)]
          : []),
        ...input.snapshot.progress.evidence.map((row) => ({
          sourceDomain: "project_controls" as const,
          entityType: "progress_evidence",
          entityId: row.evidenceId,
          sourceTimestamp: row.recordedAt,
          storesCanonicalCopy: false as const,
        })),
      ],
    },
    consistency,
    earnedValue: UNSUPPORTED_EARNED_VALUE,
    generatedAt: input.generatedAt,
    readOnly: true,
    persisted: false,
    aiRequired: PI_AI_REQUIRED,
    mutatesCost: false,
    mutatesProgress: false,
  };
}

export class ProjectCostProgressIntelligenceService {
  constructor(private readonly source: CostProgressIntelligencePort) {}

  async compose(input: ComposeCostProgressIntelligenceInput): Promise<ProjectCostProgressIntelligence> {
    assertCostProgressIntelligenceOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);
    if (
      this.source.invokesControlsEngine ||
      this.source.computesEarnedValue ||
      this.source.computesForecast ||
      this.source.computesPhysicalProgress
    ) {
      throw new Error("Cost & Progress Intelligence must not invoke a Project Controls engine");
    }

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const generatedAt = input.generatedAt ?? new Date().toISOString();

    let snapshot: CostProgressSourceSnapshot;
    try {
      snapshot = await this.source.load({ tenantId, workspaceId, projectId: input.projectId });
    } catch (error) {
      if (error instanceof CommandCentreError) throw error;
      snapshot = unavailableSnapshot("error");
    }

    if (snapshot.cost.availability === "forbidden" || snapshot.progress.availability === "forbidden") {
      throw costProgressForbidden(input.projectId, "cost_progress_forbidden");
    }

    return interpretCostProgressIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot,
      generatedAt,
    });
  }
}

export function costProgressForbidden(projectId: string, reason: string): CommandCentreError {
  return commandCentreForbidden(projectId, reason);
}
