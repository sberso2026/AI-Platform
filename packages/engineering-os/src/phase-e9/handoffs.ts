/**
 * E8 / E7 handoffs from intelligence results — always human-gated.
 */

import type { EngineeringMemoryCaptureService } from "../phase-e7/capture";
import type { EngineeringActionProposalService } from "../phase-e8/proposal-service";
import type { AskActionKind } from "../phase-e8/ask-bridge";
import { buildProposalInputFromAsk } from "../phase-e8/ask-bridge";
import type { EngineeringIntelligenceResultEnvelope } from "./contracts";

export function mapIntelligenceToAskActionKind(
  envelope: EngineeringIntelligenceResultEnvelope,
): AskActionKind | null {
  switch (envelope.authorityStatus) {
    case "RISK_SIGNAL":
      return "add_risk";
    case "ASSURANCE_FINDING":
      return "assign_review";
    case "ADVISORY":
      if (envelope.capabilityId.includes("decision")) return "prepare_decision";
      return "create_action";
    default:
      return "create_action";
  }
}

/** Create E8 proposal from intelligence — never auto-executes. */
export async function proposeActionFromIntelligence(input: {
  envelope: EngineeringIntelligenceResultEnvelope;
  proposalService: EngineeringActionProposalService;
  tenantId: string;
  userId: string;
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
}): Promise<{ proposalId: string } | { blockedReason: string }> {
  const kind = mapIntelligenceToAskActionKind(input.envelope);
  if (!kind) return { blockedReason: "no_eligible_action_kind" };

  const created = await input.proposalService.create(
    buildProposalInputFromAsk({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      kind,
      title: `From ${input.envelope.capabilityId}`,
      description: String(input.envelope.result.summary ?? ""),
      objectType: input.objectType,
      objectId: input.objectId,
      evidenceRefs: input.envelope.evidenceRefs,
      askQuery: String(input.envelope.result.summary ?? ""),
    }),
  );
  return { proposalId: created.proposalId };
}

/**
 * Approved/reviewed intelligence outcomes may become memory candidates.
 * Raw transient predictions must not automatically become organisational knowledge.
 */
export async function emitMemoryFromIntelligenceOutcome(input: {
  envelope: EngineeringIntelligenceResultEnvelope;
  capture: EngineeringMemoryCaptureService;
  tenantId: string;
  userId: string;
  projectId?: string | null;
  reviewed: boolean;
}): Promise<{ emitted: boolean; reason?: string }> {
  if (input.envelope.authorityStatus === "PREDICTION" || input.envelope.authorityStatus === "SCENARIO") {
    return { emitted: false, reason: "transient_prediction_or_scenario_not_auto_memory" };
  }
  if (!input.reviewed) {
    return { emitted: false, reason: "intelligence_outcome_requires_review_before_memory" };
  }

  const { record, blockedReason } = await input.capture.capture({
    tenantId: input.tenantId,
    projectId: input.projectId,
    subject: {
      objectType: "PROJECT",
      objectId: input.projectId ?? input.envelope.capabilityId,
      tenantId: input.tenantId,
      projectId: input.projectId,
      authority: "ENGINEERING_OS",
      provenance: {
        sourceType: "intelligence",
        sourceId: input.envelope.capabilityId,
        mechanism: "SYSTEM",
        timestamp: input.envelope.generatedAt,
      },
    },
    summary: String(input.envelope.result.summary ?? input.envelope.capabilityId),
    evidenceRefs: input.envelope.evidenceRefs,
    sourceType: "engineering_conclusion",
    sourceId: `${input.envelope.capabilityId}:${input.envelope.generatedAt}`,
    authorityStatus: "REVIEWED",
    createdBy: input.userId,
    memoryClass: "PROJECT_MEMORY",
    eventType: "engineering.intelligence.reviewed",
  });

  if (!record) return { emitted: false, reason: blockedReason ?? "capture_blocked" };
  return { emitted: true };
}
