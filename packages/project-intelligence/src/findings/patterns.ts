/**
 * Phase 8E — Pattern Intelligence (part of Findings; not a new module).
 */
import { FindingsIntelligenceError } from "./errors";

export type FindingsPatternSummary = {
  kind:
    | "recurring_category"
    | "recurring_asset"
    | "recurring_document_source"
    | "recurring_discipline"
    | "recurring_project_phase"
    | "repeated_root_cause_signal"
    | "emerging_risk_pattern";
  key: string;
  contributingFindingIds: readonly string[];
  confidence: number;
  abstained: boolean;
  abstentionReason: string | null;
  mayMutateEngineeringCore: false;
  causalClaimAllowed: false;
  humanAcknowledged: false;
};

export const FINDINGS_PATTERN_MIN_EVIDENCE = 3;

export function analyzeFindingsPattern(input: {
  kind: FindingsPatternSummary["kind"];
  key: string;
  contributingFindingIds: readonly string[];
  tenantId: string;
  workspaceId: string;
  projectId?: string;
}): FindingsPatternSummary {
  if (!input.tenantId.trim() || !input.workspaceId.trim()) {
    throw new FindingsIntelligenceError("findings_scope_required", "Scope required for patterns", 400);
  }
  const count = input.contributingFindingIds.length;
  if (count < FINDINGS_PATTERN_MIN_EVIDENCE) {
    return {
      kind: input.kind,
      key: input.key,
      contributingFindingIds: input.contributingFindingIds,
      confidence: 0,
      abstained: true,
      abstentionReason: `Below minimum evidence threshold (${FINDINGS_PATTERN_MIN_EVIDENCE})`,
      mayMutateEngineeringCore: false,
      causalClaimAllowed: false,
      humanAcknowledged: false,
    };
  }
  return {
    kind: input.kind,
    key: input.key,
    contributingFindingIds: input.contributingFindingIds,
    confidence: Math.min(0.9, 0.4 + count * 0.1),
    abstained: false,
    abstentionReason: null,
    mayMutateEngineeringCore: false,
    causalClaimAllowed: false,
    humanAcknowledged: false,
  };
}

export function acknowledgeFindingsPattern(input: {
  pattern: FindingsPatternSummary;
  actorUserId: string;
}): Omit<FindingsPatternSummary, "humanAcknowledged"> & {
  humanAcknowledged: true;
  acknowledgedBy: string;
} {
  if (!input.actorUserId.trim()) {
    throw new FindingsIntelligenceError("findings_actor_required", "Acknowledgement requires human", 400);
  }
  if (input.pattern.mayMutateEngineeringCore !== false) {
    throw new FindingsIntelligenceError(
      "findings_pattern_core_forbidden",
      "Patterns must not mutate Engineering Core",
      403,
    );
  }
  return {
    kind: input.pattern.kind,
    key: input.pattern.key,
    contributingFindingIds: input.pattern.contributingFindingIds,
    confidence: input.pattern.confidence,
    abstained: input.pattern.abstained,
    abstentionReason: input.pattern.abstentionReason,
    mayMutateEngineeringCore: false,
    causalClaimAllowed: false,
    humanAcknowledged: true,
    acknowledgedBy: input.actorUserId,
  };
}
