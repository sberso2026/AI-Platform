/**
 * EOS-D1L-R5 evidence invalidation and supersession.
 * Records current reliance separately from the historical decision.
 */

import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1lR1Actor, D1lR1ManifestRecord, D1lR1Store } from "./certification-claim-manifest";
import type { D1lR2Result, D1lR2Store } from "./certification-eligibility";
import type { D1lR4Decision, D1lR4Store } from "./certification-decision";
import { D1G_CERTIFIED_SOLVER_STATUS } from "./roadmap-after-twin-closeout";

export const D1L_R5_STATUS = "EVIDENCE_INVALIDATION_SUPERSESSION_IMPLEMENTED" as const;
export const D1L_R5_MATURITY_STATE = "STRUCTURAL_CERTIFICATION_EVIDENCE_INVALIDATION_SUPERSESSION_IMPLEMENTED" as const;
export const D1L_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1L_R5_EVIDENCE_INVALIDATION_SUPERSESSION_CLOSEOUT.md" as const;
export const D1L_R5_ARCHITECTURE_READY = true as const;
export const D1L_R5_ELIGIBILITY_MODEL_READY = true as const;
export const D1L_R5_CERTIFICATION_RUNTIME_READY = false as const;
export const D1L_R5_CERTIFICATION_ELIGIBILITY_SATISFIED = false as const;
export const D1L_R5_CERTIFICATION_AUTHORITY_READY = true as const;
export const D1L_R5_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1L_R5_ELIGIBILITY_STALENESS_RUNTIME_COUNT = 1 as const;
export const D1L_R5_DECISION_STALENESS_RUNTIME_COUNT = 1 as const;
export const D1L_R5_CURRENTNESS_RUNTIME_COUNT = 1 as const;
export const D1L_R5_INVALIDATION_RUNTIME_COUNT = 1 as const;
export const D1L_R5_SUPERSESSION_RUNTIME_COUNT = 1 as const;
export const D1L_R5_REEVALUATION_RUNTIME_COUNT = 1 as const;
export const D1L_R5_ISSUANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R5_EXTERNAL_REVOCATION_RUNTIME_COUNT = 0 as const;
export const D1L_R5_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1L_R5_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1L_R5_CLAIM_CHANGE_REQUIRES_REEVALUATION = true as const;
export const D1L_R5_MANIFEST_CHANGE_REQUIRES_REEVALUATION = true as const;
export const D1L_R5_MAPPING_CHANGE_REQUIRES_REEVALUATION = true as const;
export const D1L_R5_SUPERSESSION_AUTO_CERTIFIES = false as const;
export const D1L_R5_R2_REUSED = true as const;
export const D1L_R5_PARALLEL_REEVALUATION_ENGINE_CREATED = false as const;
export const D1L_R5_R4_REUSED = true as const;
export const D1L_R5_PARALLEL_RECERTIFICATION_ENGINE_CREATED = false as const;
export const D1L_R5_D1K_CHANGE_REUSES_D1K = true as const;
export const D1L_R5_STALE_D1K_LEAVES_DECISION_CURRENT = false as const;
export const D1L_R5_HISTORICAL_DECISION_CAN_BE_REWRITTEN = false as const;
export const D1L_R5_CAN_MUTATE_R4_DECISION = false as const;
export const D1L_R5_CAN_MUTATE_R2_RESULT = false as const;
export const D1L_R5_CAN_MUTATE_R1_MANIFEST = false as const;
export const D1L_R5_CAN_MUTATE_R3_PROFILE = false as const;
export const D1L_R5_INVALIDATION_EQUALS_EXTERNAL_REVOCATION = false as const;
export const D1L_R5_SILENT_REPOINTING_ALLOWED = false as const;
export const D1L_R5_ADMIN_CAN_REACTIVATE = false as const;
export const D1L_R5_AI_CAN_WAIVE_REEVALUATION = false as const;
export const D1L_R5_AI_CAN_REACTIVATE = false as const;
export const D1L_R5_AI_CAN_RECERTIFY = false as const;
export const D1L_R5_D1G_CERTIFICATION_BLOCKER_PRESERVED = true as const;
export const D1L_R5_NEW_CONFORMANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R5_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1L_R5_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1L_R5_NEW_SOLVER_RUNTIME_COUNT = 0 as const;
export const D1L_R5_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1L_R5_CODE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1L_R5_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1L_R5_D9_RUNTIME_COUNT = 0 as const;
export const D1L_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1L_R5_D1M_ABSORBED = false as const;
export const D1L_R5_D1N_ABSORBED = false as const;
export const D1L_R5_DATABASE_SCHEMA_CHANGED = false as const;
export const D1L_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1L_R5_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1L_R5_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1L_R5_PARALLEL_THREAD_CREATED = false as const;
export const D1L_R6_CANONICAL_PHASE = "EOS-D1L-R6-STRUCTURAL-GLOBAL-CERTIFICATION-GATE-CLOSEOUT" as const;
export const D1L_R6_PHASE_TYPE = "STRUCTURAL_GLOBAL_CERTIFICATION_GATE_CLOSEOUT" as const;
export const D1L_R6_CANONICAL_SCOPE =
  "Close the bounded D1L track by verifying the certification-governance chain, canonicalizing readiness and remaining blockers, and preserving unresolved engineering debt. Do not fabricate certification eligibility." as const;

export const D1L_R5_INVALIDATION_REASONS = [
  "CLAIM_CHANGED",
  "MANIFEST_CHANGED",
  "EVIDENCE_CHANGED",
  "EVIDENCE_STALE",
  "VALIDATION_CHANGED",
  "REVIEW_CHANGED",
  "CONFORMANCE_CHANGED",
  "SOLVER_QUALIFICATION_CHANGED",
  "D1K_CHANGED",
  "D1K_STALE",
  "STANDARD_PROFILE_CHANGED",
  "JURISDICTION_PROFILE_CHANGED",
  "REQUIREMENT_SET_CHANGED",
  "MAPPING_CHANGED",
] as const;

export type D1lR5Reason = (typeof D1L_R5_INVALIDATION_REASONS)[number];
export type D1lR5Currentness = "CURRENT" | "STALE" | "INVALIDATED" | "SUPERSEDED";

export type D1lR5CurrentnessRecord = {
  claimId: string;
  decisionId: string;
  eligibilityResultId: string;
  currentness: D1lR5Currentness;
  reasons: D1lR5Reason[];
  reevaluationRequired: boolean;
  historicalDecision: D1lR4Decision["decision"];
  currentnessFingerprint: string;
};

export type D1lR5InvalidationEvent = {
  eventId: string;
  claimId: string;
  eligibilityResultId: string;
  decisionId: string;
  reason: D1lR5Reason;
  oldFingerprint: string;
  newFingerprint: string;
  provenanceRef: string;
  recordedAt: string;
  currentness: "INVALIDATED";
  eventFingerprint: string;
};

export type D1lR5Supersession = {
  supersessionId: string;
  claimId: string;
  predecessorManifestId: string;
  successorManifestId: string;
  predecessorDecisionId: string;
  successorDecisionId: string | null;
  lineage: string[];
  autoCertified: false;
  fingerprint: string;
};

export type D1lR5ReevaluationRequirement = {
  requirementId: string;
  claimId: string;
  decisionId: string;
  reasons: D1lR5Reason[];
  evaluator: "R2";
  provenanceRef: string;
  fingerprint: string;
};

export type D1lR5Store = {
  now: () => string;
  currentness: D1lR5CurrentnessRecord[];
  invalidations: D1lR5InvalidationEvent[];
  supersessions: D1lR5Supersession[];
  reevaluations: D1lR5ReevaluationRequirement[];
};

function fail(code: string): never {
  throw new Error(code);
}

function aiActor(actor: D1lR1Actor): boolean {
  return /^AI(?:\b|_)/i.test(actor.actorId) || /^AI(?:\b|_)/i.test(actor.authority) || /LLM/i.test(actor.authority);
}

function assertScope(actor: D1lR1Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function pinFingerprint(manifest: D1lR1ManifestRecord, slot: "designEvidence" | "analysisEvidence" | "validationEvidence" | "engineerReviewEvidence" | "conformanceEvidence" | "solverQualificationEvidence" | "crossDisciplineEvidence"): string | null {
  return manifest[slot]?.sourceFingerprint ?? null;
}

function reachesManifest(claims: D1lR1Store, start: D1lR1ManifestRecord, targetManifestId: string): boolean {
  const seen = new Set<string>();
  let cursor: D1lR1ManifestRecord | undefined = start;
  while (cursor && !seen.has(cursor.manifestId)) {
    if (cursor.manifestId === targetManifestId) return true;
    seen.add(cursor.manifestId);
    const predecessorId: string | null = cursor.predecessorManifestId;
    cursor = predecessorId ? claims.records.find((row) => row.manifestId === predecessorId) : undefined;
  }
  return false;
}

function currentManifest(claims: D1lR1Store, decision: D1lR4Decision): D1lR1ManifestRecord | undefined {
  const historical = claims.records.find((row) => row.manifestId === decision.manifestId);
  if (!historical) return undefined;
  if (historical.recordStatus === "CURRENT") return historical;
  return claims.records.find((row) => row.recordStatus === "CURRENT" && reachesManifest(claims, row, historical.manifestId));
}

export function createD1lR5Store(now: () => string): D1lR5Store {
  return { now, currentness: [], invalidations: [], supersessions: [], reevaluations: [] };
}

export function detectCertificationChanges(claims: D1lR1Store, results: D1lR2Store, decision: D1lR4Decision): D1lR5Reason[] {
  const historical = claims.records.find((row) => row.manifestId === decision.manifestId);
  const current = currentManifest(claims, decision);
  if (!historical || !current) fail("R1_MANIFEST_REQUIRED");
  const reasons: D1lR5Reason[] = [];
  if (current.claimFingerprint !== decision.claimFingerprint || current.claimScope !== decision.claimScope) reasons.push("CLAIM_CHANGED");
  if (current.manifestFingerprint !== decision.manifestFingerprint) reasons.push("MANIFEST_CHANGED");
  if (pinFingerprint(current, "designEvidence") !== pinFingerprint(historical, "designEvidence") || pinFingerprint(current, "analysisEvidence") !== pinFingerprint(historical, "analysisEvidence")) reasons.push("EVIDENCE_CHANGED");
  if (current.designEvidence?.stale || current.analysisEvidence?.stale) reasons.push("EVIDENCE_STALE");
  if (pinFingerprint(current, "validationEvidence") !== pinFingerprint(historical, "validationEvidence")) reasons.push("VALIDATION_CHANGED");
  if (pinFingerprint(current, "engineerReviewEvidence") !== pinFingerprint(historical, "engineerReviewEvidence")) reasons.push("REVIEW_CHANGED");
  if (pinFingerprint(current, "conformanceEvidence") !== pinFingerprint(historical, "conformanceEvidence")) reasons.push("CONFORMANCE_CHANGED");
  if (pinFingerprint(current, "solverQualificationEvidence") !== pinFingerprint(historical, "solverQualificationEvidence") || current.solverQualificationEvidence?.solverQualificationState !== historical.solverQualificationEvidence?.solverQualificationState) reasons.push("SOLVER_QUALIFICATION_CHANGED");
  if (current.crossDisciplineEvidence?.stale) reasons.push("D1K_STALE");
  if (pinFingerprint(current, "crossDisciplineEvidence") !== pinFingerprint(historical, "crossDisciplineEvidence")) reasons.push("D1K_CHANGED");
  if (current.standardFingerprint !== decision.standardProfileFingerprint) reasons.push("STANDARD_PROFILE_CHANGED");
  if (current.jurisdictionFingerprint !== decision.jurisdictionProfileFingerprint) reasons.push("JURISDICTION_PROFILE_CHANGED");
  const successorEligibility = results.results.find((row) => row.manifestId === current.manifestId && row.recordStatus === "CURRENT" && row.eligibilityResultId !== decision.eligibilityResultId);
  if (successorEligibility && successorEligibility.requirementSetFingerprint !== decision.requirementSetFingerprint) reasons.push("REQUIREMENT_SET_CHANGED");
  if (successorEligibility && successorEligibility.mappingFingerprint !== decision.mappingFingerprint) reasons.push("MAPPING_CHANGED");
  return reasons;
}

function currentnessFor(decision: D1lR4Decision, eligibility: D1lR2Result, reasons: D1lR5Reason[], currentness: D1lR5Currentness): D1lR5CurrentnessRecord {
  const stable = { claimId: decision.claimId, decisionId: decision.decisionId, eligibilityResultId: eligibility.eligibilityResultId, currentness, reasons, historicalDecision: decision.decision };
  return { ...stable, reevaluationRequired: reasons.length > 0, currentnessFingerprint: fingerprintCanonical(stable) };
}

export function assessEligibilityCurrentness(claims: D1lR1Store, results: D1lR2Store, decision: D1lR4Decision): D1lR5CurrentnessRecord {
  const eligibility = results.results.find((row) => row.eligibilityResultId === decision.eligibilityResultId);
  if (!eligibility) fail("R2_ELIGIBILITY_REQUIRED");
  const before = fingerprintCanonical(eligibility);
  const reasons = detectCertificationChanges(claims, results, decision);
  const record = currentnessFor(decision, eligibility, reasons, reasons.length > 0 ? "STALE" : "CURRENT");
  if (fingerprintCanonical(eligibility) !== before) fail("R2_RESULT_MUTATED");
  return record;
}

export function assessDecisionCurrentness(claims: D1lR1Store, results: D1lR2Store, decisions: D1lR4Store, lifecycle: D1lR5Store, actor: D1lR1Actor, decisionId: string): D1lR5CurrentnessRecord {
  const decision = decisions.decisions.find((row) => row.decisionId === decisionId);
  if (!decision) fail("DECISION_REQUIRED");
  const manifest = claims.records.find((row) => row.manifestId === decision.manifestId);
  if (!manifest) fail("R1_MANIFEST_REQUIRED");
  assertScope(actor, manifest);
  const beforeDecision = fingerprintCanonical(decision);
  const beforeManifest = fingerprintCanonical(manifest);
  const assessment = assessEligibilityCurrentness(claims, results, decision);
  const superseded = lifecycle.supersessions.some((row) => row.predecessorDecisionId === decision.decisionId);
  const invalidated = lifecycle.invalidations.some((row) => row.decisionId === decision.decisionId);
  const currentness: D1lR5Currentness = superseded ? "SUPERSEDED" : invalidated ? "INVALIDATED" : assessment.currentness;
  const record = { ...assessment, currentness, reevaluationRequired: currentness !== "CURRENT" };
  record.currentnessFingerprint = fingerprintCanonical({ claimId: record.claimId, decisionId: record.decisionId, eligibilityResultId: record.eligibilityResultId, currentness: record.currentness, reasons: record.reasons, historicalDecision: record.historicalDecision });
  lifecycle.currentness.push(record);
  if (fingerprintCanonical(decision) !== beforeDecision || decision.decision !== record.historicalDecision) fail("R4_DECISION_MUTATED");
  if (fingerprintCanonical(manifest) !== beforeManifest) fail("R1_MANIFEST_MUTATED");
  return record;
}

export function recordCertificationInvalidation(claims: D1lR1Store, results: D1lR2Store, decisions: D1lR4Store, lifecycle: D1lR5Store, actor: D1lR1Actor, input: { decisionId: string; provenanceRef: string; reason?: string; markCurrent?: boolean; clearInvalidation?: boolean; restoreCertification?: boolean; waiveReevaluation?: boolean }): D1lR5InvalidationEvent {
  if (input.markCurrent || input.clearInvalidation || input.restoreCertification || input.waiveReevaluation) fail("REACTIVATION_REJECTED");
  if (aiActor(actor)) fail("AI_INVALIDATION_REJECTED");
  if (actor.authority === "ADMINISTRATOR") fail("UNAUTHORIZED");
  if (input.reason != null && !(D1L_R5_INVALIDATION_REASONS as readonly string[]).includes(input.reason)) fail("UNKNOWN_INVALIDATION_REASON");
  const decision = decisions.decisions.find((row) => row.decisionId === input.decisionId);
  if (!decision) fail("DECISION_REQUIRED");
  const manifest = claims.records.find((row) => row.manifestId === decision.manifestId);
  if (!manifest) fail("R1_MANIFEST_REQUIRED");
  assertScope(actor, manifest);
  const before = fingerprintCanonical(decision);
  const detected = detectCertificationChanges(claims, results, decision);
  if (detected.length === 0) fail("INVALIDATION_NOT_DETERMINISTIC");
  const reason = (input.reason ?? detected[0]) as D1lR5Reason;
  if (!detected.includes(reason)) fail("INVALIDATION_REASON_MISMATCH");
  const current = currentManifest(claims, decision);
  const eventBody = { claimId: decision.claimId, eligibilityResultId: decision.eligibilityResultId, decisionId: decision.decisionId, reason, oldFingerprint: decision.manifestFingerprint, newFingerprint: current?.manifestFingerprint ?? decision.manifestFingerprint, provenanceRef: input.provenanceRef, currentness: "INVALIDATED" as const };
  const eventFingerprint = fingerprintCanonical(eventBody);
  const event: D1lR5InvalidationEvent = { eventId: `invalidation-${lifecycle.invalidations.length + 1}`, ...eventBody, recordedAt: lifecycle.now(), eventFingerprint };
  lifecycle.invalidations.push(event);
  if (fingerprintCanonical(decision) !== before) fail("R4_DECISION_MUTATED");
  return event;
}

export function recordCertificationSupersession(claims: D1lR1Store, decisions: D1lR4Store, lifecycle: D1lR5Store, actor: D1lR1Actor, input: { predecessorDecisionId: string; successorManifestId: string; successorDecisionId?: string | null; autoCertify?: boolean }): D1lR5Supersession {
  if (input.autoCertify) fail("SUPERSESSION_AUTO_CERTIFICATION_REJECTED");
  if (aiActor(actor)) fail("UNAUTHORIZED");
  const decision = decisions.decisions.find((row) => row.decisionId === input.predecessorDecisionId);
  if (!decision) fail("DECISION_REQUIRED");
  const predecessor = claims.records.find((row) => row.manifestId === decision.manifestId);
  const successor = claims.records.find((row) => row.manifestId === input.successorManifestId);
  if (!predecessor || !successor) fail("R1_MANIFEST_REQUIRED");
  assertScope(actor, predecessor);
  if (successor.tenantId !== predecessor.tenantId || successor.workspaceId !== predecessor.workspaceId || successor.projectId !== predecessor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!reachesManifest(claims, successor, predecessor.manifestId)) fail("SUPERSESSION_SPOOFING_REJECTED");
  if (successor.manifestId === predecessor.manifestId) fail("SUPERSESSION_NOT_DISTINCT");
  if (input.successorDecisionId) {
    const successorDecision = decisions.decisions.find((row) => row.decisionId === input.successorDecisionId);
    if (!successorDecision || successorDecision.manifestId !== successor.manifestId) fail("SUPERSESSION_SPOOFING_REJECTED");
  }
  const before = fingerprintCanonical(decision);
  const lineage = [predecessor.manifestId, decision.eligibilityResultId, decision.decisionId, successor.manifestId, input.successorDecisionId ?? "DECISION_NOT_RECORDED"];
  const fingerprint = fingerprintCanonical({ claimId: decision.claimId, predecessorManifestId: predecessor.manifestId, successorManifestId: successor.manifestId, predecessorDecisionId: decision.decisionId, successorDecisionId: input.successorDecisionId ?? null });
  const record: D1lR5Supersession = { supersessionId: `supersession-${lifecycle.supersessions.length + 1}`, claimId: decision.claimId, predecessorManifestId: predecessor.manifestId, successorManifestId: successor.manifestId, predecessorDecisionId: decision.decisionId, successorDecisionId: input.successorDecisionId ?? null, lineage, autoCertified: false, fingerprint };
  lifecycle.supersessions.push(record);
  if (fingerprintCanonical(decision) !== before) fail("R4_DECISION_MUTATED");
  return record;
}

export function recordReevaluationRequirement(claims: D1lR1Store, results: D1lR2Store, decisions: D1lR4Store, lifecycle: D1lR5Store, actor: D1lR1Actor, input: { decisionId: string; provenanceRef: string; waive?: boolean }): D1lR5ReevaluationRequirement {
  if (input.waive || aiActor(actor)) fail("REEVALUATION_WAIVER_REJECTED");
  const decision = decisions.decisions.find((row) => row.decisionId === input.decisionId);
  if (!decision) fail("DECISION_REQUIRED");
  const manifest = claims.records.find((row) => row.manifestId === decision.manifestId);
  if (!manifest) fail("R1_MANIFEST_REQUIRED");
  assertScope(actor, manifest);
  const reasons = detectCertificationChanges(claims, results, decision);
  if (reasons.length === 0) fail("REEVALUATION_NOT_REQUIRED");
  const solverStatus: string = D1G_CERTIFIED_SOLVER_STATUS;
  if (solverStatus !== "NOT_CERTIFIED") fail("D1G_BLOCKER_REDEFINED");
  const fingerprint = fingerprintCanonical({ claimId: decision.claimId, decisionId: decision.decisionId, reasons, evaluator: "R2" });
  const record: D1lR5ReevaluationRequirement = { requirementId: `reevaluation-${lifecycle.reevaluations.length + 1}`, claimId: decision.claimId, decisionId: decision.decisionId, reasons, evaluator: "R2", provenanceRef: input.provenanceRef, fingerprint };
  lifecycle.reevaluations.push(record);
  return record;
}

export function reactivateCertificationDecision(): never {
  fail("REACTIVATION_REJECTED");
}

export function repointCertificationSupersession(): never {
  fail("SILENT_SUPERSESSION_REPOINTING_REJECTED");
}

export function revokeExternalCertificate(): never {
  fail("EXTERNAL_REVOCATION_NOT_IN_R5");
}
