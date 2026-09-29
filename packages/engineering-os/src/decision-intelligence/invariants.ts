/**
 * EOS-A2 decision / assumption invariants (application layer).
 * Database triggers remain the last line of defence.
 */

export const DECISION_APPROVAL_ACTIONS = [
  "submitted",
  "endorsed",
  "approved",
  "rejected",
  "withdrawn",
  "superseded",
] as const;
export type DecisionApprovalAction = (typeof DECISION_APPROVAL_ACTIONS)[number];

export const ASSUMPTION_VALIDATION_STATUSES = [
  "unvalidated",
  "partially_validated",
  "validated",
  "invalidated",
  "accepted_risk",
] as const;
export type AssumptionValidationStatus = (typeof ASSUMPTION_VALIDATION_STATUSES)[number];

export const ASSUMPTION_MATERIALITY = ["low", "medium", "high", "critical"] as const;
export type AssumptionMateriality = (typeof ASSUMPTION_MATERIALITY)[number];

export const ALTERNATIVE_STATUSES = [
  "draft",
  "considered",
  "selected",
  "rejected",
  "withdrawn",
] as const;
export type AlternativeStatus = (typeof ALTERNATIVE_STATUSES)[number];

export function assertHumanApprovalActor(actorKind: string, actorId?: string | null) {
  if (actorKind !== "human") {
    throw new Error("Autonomous AI approval is forbidden; actor_kind must be human");
  }
  if (!actorId) {
    throw new Error("Decision approval requires an authorized human actor");
  }
}

export function assertApprovalAction(action: string): asserts action is DecisionApprovalAction {
  if (!(DECISION_APPROVAL_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(`Unknown decision approval action: ${action}`);
  }
}

export function assertAssumptionConfidence(confidence?: number | null) {
  if (confidence == null) return;
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new Error("Assumption confidence must be between 0 and 1");
  }
}

export function assertAssumptionValidationStatus(
  status: string,
): asserts status is AssumptionValidationStatus {
  if (!(ASSUMPTION_VALIDATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Unknown assumption validation_status: ${status}`);
  }
}

export function assertAssumptionMateriality(
  materiality: string,
): asserts materiality is AssumptionMateriality {
  if (!(ASSUMPTION_MATERIALITY as readonly string[]).includes(materiality)) {
    throw new Error(`Unknown assumption materiality: ${materiality}`);
  }
}

export function assertSingleSelectedAlternative(
  alternatives: readonly { id: string; is_selected?: boolean }[],
  selectedAlternativeId?: string | null,
) {
  const flagged = alternatives.filter((row) => row.is_selected);
  if (flagged.length > 1) {
    throw new Error("A decision may select at most one alternative");
  }
  if (selectedAlternativeId && flagged.length === 1 && flagged[0].id !== selectedAlternativeId) {
    throw new Error("selected_alternative_id does not match is_selected alternative");
  }
}

export function assertSupersessionPair(input: {
  decisionId: string;
  supersedesDecisionId: string;
  tenantId: string;
  workspaceId?: string | null;
  prior: { id: string; tenant_id: string; workspace_id?: string | null; supersedes_decision_id?: string | null };
}) {
  if (input.decisionId === input.supersedesDecisionId) {
    throw new Error("decision cannot supersede itself");
  }
  if (input.prior.tenant_id !== input.tenantId) {
    throw new Error("superseded decision must share tenant");
  }
  if ((input.prior.workspace_id ?? null) !== (input.workspaceId ?? null)) {
    throw new Error("superseded decision must share workspace");
  }
}

export function detectSupersessionCycle(
  decisionId: string,
  chain: readonly { id: string; supersedes_decision_id?: string | null }[],
): boolean {
  const byId = new Map(chain.map((row) => [row.id, row.supersedes_decision_id ?? null]));
  let walk = byId.get(decisionId) ?? null;
  const seen = new Set<string>([decisionId]);
  let hops = 0;
  while (walk && hops < 64) {
    if (seen.has(walk)) return true;
    seen.add(walk);
    walk = byId.get(walk) ?? null;
    hops += 1;
  }
  return hops >= 64;
}
