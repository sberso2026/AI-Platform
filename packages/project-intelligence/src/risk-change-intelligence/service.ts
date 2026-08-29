import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { CommandCentreError, commandCentreForbidden } from "../command-centre/errors";
import type { CommandCentreAvailability } from "../command-centre/types";
import { buildChangeAttention, buildRiskAttention } from "./attention";
import {
  changeStateEvidence,
  classifyChangeHealth,
  classifyRiskHealth,
  interpretChangeDataQuality,
  interpretChangeImplications,
  interpretChangePortfolio,
  interpretLinkedSignals,
  interpretRiskDataQuality,
  interpretRiskMatrix,
  interpretRiskPortfolio,
  QUALITY_BOUNDARY,
  riskEvidence,
  UNSUPPORTED_CHANGE_IMPACTS,
} from "./interpreter";
import { assertRiskChangeIntelligenceOwnershipLocks, PI_AI_REQUIRED } from "./ownership";
import type { RiskChangeIntelligencePort } from "./ports";
import type {
  ChangeSourceSlice,
  ProjectRiskChangeIntelligence,
  RiskChangeSourceSnapshot,
  RiskSourceSlice,
} from "./types";

export type ComposeRiskChangeIntelligenceInput = {
  projectId: string;
  context: AccessContext;
  generatedAt?: string;
};

function emptyRiskSlice(availability: CommandCentreAvailability): RiskSourceSlice {
  return { availability, bound: false, items: [], actions: [] };
}

function emptyChangeSlice(availability: CommandCentreAvailability): ChangeSourceSlice {
  return { availability, latest: null, history: [], evidence: [] };
}

function unavailableSnapshot(availability: CommandCentreAvailability): RiskChangeSourceSnapshot {
  return {
    risk: emptyRiskSlice(availability),
    change: emptyChangeSlice(availability),
  };
}

export function interpretRiskChangeIntelligence(input: {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  snapshot: RiskChangeSourceSnapshot;
  generatedAt: string;
}): ProjectRiskChangeIntelligence {
  const matrix = interpretRiskMatrix(input.snapshot.risk.items);
  const riskHealth = classifyRiskHealth(input.snapshot.risk);
  const changeHealth = classifyChangeHealth(input.snapshot.change.latest, input.snapshot.change.availability);
  const riskQuality = interpretRiskDataQuality({
    slice: input.snapshot.risk,
    matrix,
    generatedAt: input.generatedAt,
  });
  const changeQuality = interpretChangeDataQuality({
    slice: input.snapshot.change,
    generatedAt: input.generatedAt,
  });
  const riskAttention = buildRiskAttention({
    slice: input.snapshot.risk,
    health: riskHealth,
    freshness: riskQuality.freshness,
    generatedAt: input.generatedAt,
  });
  const changeAttention = buildChangeAttention({
    slice: input.snapshot.change,
    health: changeHealth,
    freshness: changeQuality.freshness,
    generatedAt: input.generatedAt,
  });

  return {
    projectId: input.projectId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    risk: {
      availability: input.snapshot.risk.availability,
      health: riskHealth,
      attentionItems: riskAttention,
      portfolio: interpretRiskPortfolio({
        items: input.snapshot.risk.items,
        actions: input.snapshot.risk.actions,
        generatedAt: input.generatedAt,
        matrix,
      }),
      matrix,
      dataQuality: riskQuality,
      evidenceReferences: input.snapshot.risk.items.slice(0, 12).map(riskEvidence),
      trend: "unavailable",
    },
    change: {
      availability: input.snapshot.change.availability,
      health: changeHealth,
      attentionItems: changeAttention,
      portfolio: interpretChangePortfolio({
        slice: input.snapshot.change,
        generatedAt: input.generatedAt,
      }),
      implications: interpretChangeImplications(input.snapshot.change.latest),
      dataQuality: changeQuality,
      evidenceReferences: [
        ...(input.snapshot.change.latest ? [changeStateEvidence(input.snapshot.change.latest)] : []),
        ...input.snapshot.change.evidence.map((row) => ({
          sourceDomain: "project_controls" as const,
          entityType: "change_evidence",
          entityId: row.evidenceId,
          sourceTimestamp: row.recordedAt,
          storesCanonicalCopy: false as const,
        })),
      ],
    },
    linkedSignals: interpretLinkedSignals(input.snapshot),
    qualityBoundary: QUALITY_BOUNDARY,
    unsupportedImpacts: UNSUPPORTED_CHANGE_IMPACTS,
    generatedAt: input.generatedAt,
    readOnly: true,
    persisted: false,
    aiRequired: PI_AI_REQUIRED,
    mutatesRisk: false,
    mutatesChange: false,
  };
}

export class ProjectRiskChangeIntelligenceService {
  constructor(private readonly source: RiskChangeIntelligencePort) {}

  async compose(input: ComposeRiskChangeIntelligenceInput): Promise<ProjectRiskChangeIntelligence> {
    assertRiskChangeIntelligenceOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);
    if (
      this.source.invokesControlsEngine ||
      this.source.storesRiskRegister ||
      this.source.mutatesRisk ||
      this.source.mutatesChange ||
      this.source.computesChangeImpact ||
      this.source.computesIndependentRiskScore
    ) {
      throw new Error("Risk & Change Intelligence must not own a register or invoke a controls engine");
    }

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const generatedAt = input.generatedAt ?? new Date().toISOString();

    let snapshot: RiskChangeSourceSnapshot;
    try {
      snapshot = await this.source.load({ tenantId, workspaceId, projectId: input.projectId });
    } catch (error) {
      if (error instanceof CommandCentreError) throw error;
      snapshot = unavailableSnapshot("error");
    }

    if (snapshot.risk.availability === "forbidden" || snapshot.change.availability === "forbidden") {
      throw riskChangeForbidden(input.projectId, "risk_change_forbidden");
    }

    return interpretRiskChangeIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot,
      generatedAt,
    });
  }
}

export function riskChangeForbidden(projectId: string, reason: string): CommandCentreError {
  return commandCentreForbidden(projectId, reason);
}
