import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { CommandCentreError, commandCentreForbidden } from "../command-centre/errors";
import type { CommandCentreAvailability } from "../command-centre/types";
import { buildActionAttention, buildDecisionAttention, buildQueryAttention } from "./attention";
import {
  actionEvidence,
  classifyActionHealth,
  classifyDecisionHealth,
  classifyQueryHealth,
  decisionEvidence,
  interpretActionDataQuality,
  interpretActionPortfolio,
  interpretDecisionDataQuality,
  interpretDecisionPortfolio,
  interpretLinkedSignals,
  interpretQueryDataQuality,
  interpretQueryPortfolio,
  queryEvidence,
} from "./interpreter";
import { assertQueryDecisionIntelligenceOwnershipLocks, PI_AI_REQUIRED } from "./ownership";
import type { QueryDecisionIntelligencePort } from "./ports";
import type {
  ActionSourceSlice,
  DecisionSourceSlice,
  ProjectQueryDecisionIntelligence,
  QueryDecisionSourceSnapshot,
  QuerySourceSlice,
} from "./types";
import { PI_CANONICAL_RFI_MODEL, PI_CANONICAL_TQ_MODEL } from "./types";

export type ComposeQueryDecisionIntelligenceInput = {
  projectId: string;
  context: AccessContext;
  generatedAt?: string;
};

function emptyQuerySlice(availability: CommandCentreAvailability): QuerySourceSlice {
  return { availability, bound: false, items: [] };
}
function emptyDecisionSlice(availability: CommandCentreAvailability): DecisionSourceSlice {
  return { availability, bound: false, items: [] };
}
function emptyActionSlice(availability: CommandCentreAvailability): ActionSourceSlice {
  return { availability, bound: false, items: [] };
}

function unavailableSnapshot(availability: CommandCentreAvailability): QueryDecisionSourceSnapshot {
  return {
    query: emptyQuerySlice(availability),
    decision: emptyDecisionSlice(availability),
    action: emptyActionSlice(availability),
  };
}

export function interpretQueryDecisionIntelligence(input: {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  snapshot: QueryDecisionSourceSnapshot;
  generatedAt: string;
}): ProjectQueryDecisionIntelligence {
  const queryHealth = classifyQueryHealth(input.snapshot.query, input.generatedAt);
  const decisionHealth = classifyDecisionHealth(input.snapshot.decision, input.generatedAt);
  const actionHealth = classifyActionHealth(input.snapshot.action, input.generatedAt);
  const queryQuality = interpretQueryDataQuality(input.snapshot.query, input.generatedAt);
  const decisionQuality = interpretDecisionDataQuality(input.snapshot.decision, input.generatedAt);
  const actionQuality = interpretActionDataQuality(input.snapshot.action, input.generatedAt);
  const linkedSignals = interpretLinkedSignals({ ...input.snapshot, generatedAt: input.generatedAt });
  const queryAttention = [...buildQueryAttention({
    slice: input.snapshot.query,
    health: queryHealth,
    freshness: queryQuality.freshness,
    generatedAt: input.generatedAt,
  })];
  const decisionAttention = [...buildDecisionAttention({
    slice: input.snapshot.decision,
    health: decisionHealth,
    freshness: decisionQuality.freshness,
    generatedAt: input.generatedAt,
  })];

  for (const signal of linkedSignals) {
    if (signal.reasonCode === "query_linked_to_overdue_action") {
      queryAttention.push({
        id: `query-attention:${signal.id}`,
        severity: "red",
        reasonCode: signal.reasonCode,
        explanation: signal.explanation,
        evidenceReference: signal.fromEvidence,
        canonicalQueryId: signal.fromEvidence.entityId,
        asOf: input.generatedAt,
      });
    }
    if (signal.reasonCode === "decision_linked_to_overdue_action") {
      decisionAttention.push({
        id: `decision-attention:${signal.id}`,
        severity: "red",
        reasonCode: signal.reasonCode,
        explanation: signal.explanation,
        evidenceReference: signal.fromEvidence,
        canonicalDecisionId: signal.fromEvidence.entityId,
        asOf: input.generatedAt,
      });
    }
  }

  return {
    projectId: input.projectId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    query: {
      availability: input.snapshot.query.availability,
      health: queryHealth,
      attentionItems: queryAttention,
      portfolio: interpretQueryPortfolio(input.snapshot.query.items, input.generatedAt),
      dataQuality: queryQuality,
      evidenceReferences: input.snapshot.query.items.slice(0, 12).map(queryEvidence),
      canonicalModel: PI_CANONICAL_TQ_MODEL,
      rfiModel: PI_CANONICAL_RFI_MODEL,
    },
    decision: {
      availability: input.snapshot.decision.availability,
      health: decisionHealth,
      attentionItems: decisionAttention,
      portfolio: interpretDecisionPortfolio(input.snapshot.decision.items, input.generatedAt),
      dataQuality: decisionQuality,
      evidenceReferences: input.snapshot.decision.items.slice(0, 12).map(decisionEvidence),
    },
    action: {
      availability: input.snapshot.action.availability,
      health: actionHealth,
      attentionItems: buildActionAttention({
        slice: input.snapshot.action,
        health: actionHealth,
        freshness: actionQuality.freshness,
        generatedAt: input.generatedAt,
      }),
      portfolio: interpretActionPortfolio(input.snapshot.action.items, input.generatedAt),
      dataQuality: actionQuality,
      evidenceReferences: input.snapshot.action.items.slice(0, 12).map(actionEvidence),
    },
    linkedSignals,
    generatedAt: input.generatedAt,
    readOnly: true,
    persisted: false,
    aiRequired: PI_AI_REQUIRED,
    mutatesQuery: false,
    mutatesDecision: false,
    mutatesAction: false,
  };
}

export class ProjectQueryDecisionIntelligenceService {
  constructor(private readonly source: QueryDecisionIntelligencePort) {}

  async compose(input: ComposeQueryDecisionIntelligenceInput): Promise<ProjectQueryDecisionIntelligence> {
    assertQueryDecisionIntelligenceOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);
    if (
      this.source.storesQueryRegister ||
      this.source.storesDecisionRegister ||
      this.source.storesActionRegister ||
      this.source.mutatesQuery ||
      this.source.mutatesDecision ||
      this.source.mutatesAction
    ) {
      throw new Error("Query & Decision Intelligence must not store or mutate canonical registers");
    }

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const generatedAt = input.generatedAt ?? new Date().toISOString();

    let snapshot: QueryDecisionSourceSnapshot;
    try {
      snapshot = await this.source.load({ tenantId, workspaceId, projectId: input.projectId });
    } catch (error) {
      if (error instanceof CommandCentreError) throw error;
      snapshot = unavailableSnapshot("error");
    }

    if (
      snapshot.query.availability === "forbidden" ||
      snapshot.decision.availability === "forbidden" ||
      snapshot.action.availability === "forbidden"
    ) {
      throw queryDecisionForbidden(input.projectId, "query_decision_forbidden");
    }

    return interpretQueryDecisionIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot,
      generatedAt,
    });
  }
}

export function queryDecisionForbidden(projectId: string, reason: string): CommandCentreError {
  return commandCentreForbidden(projectId, reason);
}
