/**
 * EOS-D1L-R2 deterministic certification eligibility and blocker evaluation.
 * Reads an exact R1 manifest. Does not issue certification or change that manifest.
 */

import { D1L_0_BLOCKER_CODES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1lR1Actor, D1lR1EvidencePin, D1lR1ManifestRecord, D1lR1Store } from "./certification-claim-manifest";
import { D1G_CERTIFIED_SOLVER_STATUS, D1G_CONFORMANCE_VALIDATED, D1G_ENGINEER_VALIDATED, D1G_LIVE_VALIDATED } from "./roadmap-after-twin-closeout";

export const D1L_R2_STATUS = "ELIGIBILITY_BLOCKER_EVALUATION_IMPLEMENTED" as const;
export const D1L_R2_MATURITY_STATE = "STRUCTURAL_CERTIFICATION_ELIGIBILITY_BLOCKER_EVALUATION_IMPLEMENTED" as const;
export const D1L_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1L_R2_ELIGIBILITY_BLOCKER_EVALUATION_CLOSEOUT.md" as const;
export const D1L_R2_ARCHITECTURE_READY = true as const;
export const D1L_R2_ELIGIBILITY_MODEL_READY = true as const;
export const D1L_R2_CERTIFICATION_RUNTIME_READY = false as const;
export const D1L_R2_CERTIFICATION_ELIGIBILITY_SATISFIED = false as const;
export const D1L_R2_CERTIFICATION_AUTHORITY_READY = false as const;
export const D1L_R2_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1L_R2_REQUIREMENT_SET_ID = "D1L-R2-REQUIREMENTS" as const;
export const D1L_R2_REQUIREMENT_SET_VERSION = "1" as const;
export const D1L_R2_BLOCKER_RULE_VERSION = "1" as const;
export const D1L_R2_R1_CLAIM_REQUIRED = true as const;
export const D1L_R2_R1_MANIFEST_REQUIRED = true as const;
export const D1L_R2_GLOBAL_PACK_ELIGIBILITY_FROM_SINGLE_CLAIM = false as const;
export const D1L_R2_HARD_BLOCKER_CAN_BE_OFFSET = false as const;
export const D1L_R2_WEIGHTED_SCORE_IMPLEMENTED = false as const;
export const D1L_R2_CONFIDENCE_SCORE_IMPLEMENTED = false as const;
export const D1L_R2_CALLER_CAN_OMIT_MANDATORY_DEPENDENCY = false as const;
export const D1L_R2_CALLER_CAN_DISABLE_MANDATORY_REQUIREMENT = false as const;
export const D1L_R2_AI_GENERATED_REQUIREMENTS_ALLOWED = false as const;
export const D1L_R2_FREEFORM_REQUIREMENTS_ALLOWED = false as const;
export const D1L_R2_UNKNOWN_REQUIREMENT_DEFAULTS_TO_PASS = false as const;
export const D1L_R2_UNRESOLVED_PROFILE_USES_GENERIC_FALLBACK = false as const;
export const D1L_R2_D1G_CERTIFICATION_BLOCKER_PRESERVED = true as const;
export const D1L_R2_D1G_BLOCKERS_APPLIED_ONLY_WHEN_REQUIRED = true as const;
export const D1L_R2_USES_EXACT_R1_D1K_EVIDENCE = true as const;
export const D1L_R2_STALE_REQUIRED_D1K_IS_HARD_BLOCKER = true as const;
export const D1L_R2_UNRESOLVED_D1K_CONFLICT_IS_HARD_BLOCKER = true as const;
export const D1L_R2_D1K_INCOMPATIBILITY_IS_HARD_BLOCKER = true as const;
export const D1L_R2_INDETERMINATE_D1K_HANDLED_CONSERVATIVELY = true as const;
export const D1L_R2_D1K_DISPOSITION_EQUALS_CERTIFICATION_APPROVAL = false as const;
export const D1L_R2_STANDARD_PIN_REQUIRED = true as const;
export const D1L_R2_FLOATING_STANDARD_ALLOWED = false as const;
export const D1L_R2_STANDARD_AUTO_UPGRADED = false as const;
export const D1L_R2_JURISDICTION_PIN_REQUIRED = true as const;
export const D1L_R2_FLOATING_JURISDICTION_ALLOWED = false as const;
export const D1L_R2_JURISDICTION_AUTO_UPGRADED = false as const;
export const D1L_R2_DETERMINISTIC_ENGINE_CAN_MARK_CLAIM_ELIGIBLE = true as const;
export const D1L_R2_CLAIM_ELIGIBLE_EQUALS_CERTIFIED = false as const;
export const D1L_R2_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED = false as const;
export const D1L_R2_ENGINEER_REVIEW_PASS_EQUALS_CERTIFIED = false as const;
export const D1L_R2_CONFORMANCE_PASS_EQUALS_CERTIFIED = false as const;
export const D1L_R2_SOLVER_EXECUTED_EQUALS_SOLVER_CERTIFIED = false as const;
export const D1L_R2_SOLVER_VALIDATED_EQUALS_SOLVER_CERTIFIED = false as const;
export const D1L_R2_RESULT_TIED_TO_MANIFEST_FINGERPRINT = true as const;
export const D1L_R2_REQUIREMENT_VERSION_PINNED = true as const;
export const D1L_R2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1L_R2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1L_R2_HISTORY_PRESERVED = true as const;
export const D1L_R2_REEVALUATION_REQUIRED_AFTER_EVIDENCE_CHANGE = true as const;
export const D1L_R2_CAN_MUTATE_R1_MANIFEST = false as const;
export const D1L_R2_ELIGIBILITY_RUNTIME_COUNT = 1 as const;
export const D1L_R2_BLOCKER_EVALUATION_RUNTIME_COUNT = 1 as const;
export const D1L_R2_REQUIREMENT_RESOLUTION_RUNTIME_COUNT = 1 as const;
export const D1L_R2_DECISION_RUNTIME_COUNT = 0 as const;
export const D1L_R2_ISSUANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R2_REVOCATION_RUNTIME_COUNT = 0 as const;
export const D1L_R2_NEW_CONFORMANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R2_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1L_R2_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1L_R2_NEW_SOLVER_RUNTIME_COUNT = 0 as const;
export const D1L_R2_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1L_R2_AI_IS_GOVERNING_ELIGIBILITY_ENGINE = false as const;
export const D1L_R2_AI_CAN_MARK_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_R2_AI_CAN_MARK_CERTIFIED = false as const;
export const D1L_R2_AI_CAN_WAIVE_HARD_BLOCKER = false as const;
export const D1L_R2_AI_CAN_INVENT_CERTIFICATION_EVIDENCE = false as const;
export const D1L_R2_ADMIN_CAN_OVERRIDE_HARD_BLOCKER = false as const;
export const D1L_R2_ADMIN_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R2_GENERIC_OVERRIDE_IMPLEMENTED = false as const;
export const D1L_R2_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1L_R2_D9_RUNTIME_COUNT = 0 as const;
export const D1L_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1L_R2_GLOBAL_DEPENDENCY_REASONING_IMPLEMENTED = false as const;
export const D1L_R2_D1M_ABSORBED = false as const;
export const D1L_R2_D1N_ABSORBED = false as const;
export const D1L_R2_DATABASE_SCHEMA_CHANGED = false as const;
export const D1L_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1L_R2_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1L_R3_CANONICAL_PHASE = "EOS-D1L-R3-STANDARDS-JURISDICTION-PROFILE-GOVERNANCE" as const;
export const D1L_R3_PHASE_TYPE = "STRUCTURAL_CERTIFICATION_STANDARDS_JURISDICTION_PROFILE_GOVERNANCE" as const;
export const D1L_R3_CANONICAL_SCOPE =
  "Govern the exact standards, editions, jurisdiction profiles, and applicable certification requirement mappings used by D1L. Do not issue certification, grant conformance, certify a solver, or start D2 through D9." as const;

export const D1L_R2_BLOCKER_CODES = [
  ...D1L_0_BLOCKER_CODES,
  "MISSING_VALIDATION",
  "FAILED_VALIDATION",
  "INDETERMINATE_D1K_INTERFACE",
  "MISSING_CONSEQUENCE_PROFILE",
] as const;
export type D1lR2BlockerCode = (typeof D1L_R2_BLOCKER_CODES)[number];
export const D1L_R2_ELIGIBILITY_STATES = ["BLOCKED", "PENDING", "INELIGIBLE", "ELIGIBLE", "INDETERMINATE", "STALE"] as const;
export type D1lR2EligibilityState = (typeof D1L_R2_ELIGIBILITY_STATES)[number];

const REQUIREMENT_IDS = [
  "DESIGN_EVIDENCE",
  "ANALYSIS_EVIDENCE",
  "VALIDATION_EVIDENCE",
  "ENGINEER_REVIEW",
  "CONFORMANCE",
  "SOLVER_QUALIFICATION",
  "D1G_LIVE_VALIDATION",
  "D1G_ENGINEER_VALIDATION",
  "D1G_CONFORMANCE",
  "D1G_CERTIFIED_SOLVER",
  "D1K_EVIDENCE",
  "STANDARD_PROFILE",
  "JURISDICTION_PROFILE",
  "CONSEQUENCE_PROFILE",
  "C10_REVIEW",
  "D1F_ORCHESTRATOR_REVIEW",
  "D1H_ENGINEER_VALIDATION",
  "D1I_ENGINEER_VALIDATION",
  "D1I_CONFORMANCE",
  "D1J_ENGINEER_VALIDATION",
  "D1J_CONFORMANCE",
  "D1J_PARAMETER_SEMANTICS",
] as const;

export const D1L_R2_REQUIREMENT_SET_FINGERPRINT = fingerprintCanonical({
  id: D1L_R2_REQUIREMENT_SET_ID,
  version: D1L_R2_REQUIREMENT_SET_VERSION,
  requirements: REQUIREMENT_IDS,
  blockerCodes: D1L_R2_BLOCKER_CODES,
});

export type D1lR2LedgerRow = {
  evidenceId: string;
  revision: string;
  sourceFingerprint: string | null;
  authority: string;
  reviewState?: "PENDING" | "FAILED" | "SATISFIED";
  conformanceState?: "PENDING" | "FAILED" | "SATISFIED";
  validationState?: "PENDING" | "FAILED" | "SATISFIED";
  d1kCompatibility?: "MATCHING" | "INCOMPATIBLE" | "INDETERMINATE";
  d1kConflict?: "NONE" | "UNRESOLVED";
  d1kDispositionRecorded?: boolean;
};

export type D1lR2EvaluationInput = {
  claimId: string;
  manifestId: string;
  expectedManifestFingerprint: string;
  ledger: D1lR2LedgerRow[];
  disabledRequirements?: string[];
  requirementSetId?: string;
  overrideEligibility?: boolean;
  waiveHardBlocker?: boolean;
  upgradeStandard?: boolean;
  upgradeJurisdiction?: boolean;
  freeformRequirement?: string;
};

export type D1lR2Condition = {
  code: D1lR2BlockerCode | "R3_PROFILE_GOVERNANCE_DEFERRED" | "GA_SECURITY_DEBT";
  severity: "HARD_BLOCKER" | "ADVISORY" | "PENDING";
  requirementId: string;
};

export type D1lR2Result = {
  eligibilityResultId: string;
  claimId: string;
  claimFingerprint: string;
  manifestId: string;
  manifestFingerprint: string;
  requirementSetIdentity: typeof D1L_R2_REQUIREMENT_SET_ID;
  requirementSetVersion: typeof D1L_R2_REQUIREMENT_SET_VERSION;
  requirementSetFingerprint: string;
  evaluatedRequirements: string[];
  hardBlockers: D1lR2Condition[];
  advisories: D1lR2Condition[];
  pendingConditions: D1lR2Condition[];
  eligibilityState: D1lR2EligibilityState;
  evidenceFingerprints: Array<{ evidenceId: string; sourceFingerprint: string | null }>;
  provenanceRef: string;
  producer: "D1L_R2_DETERMINISTIC_EVALUATOR";
  resultFingerprint: string;
  evaluatedAt: string;
  humanReviewRequired: true;
  certificationAuthority: null;
  recordStatus: "CURRENT" | "SUPERSEDED";
};

export type D1lR2Store = {
  now: () => string;
  results: D1lR2Result[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedActor(authority: string): boolean {
  return /^AI(?:\b|_)/i.test(authority) || /LLM/i.test(authority) || authority === "ADMINISTRATOR" || authority === "CERTIFICATION_AUTHORITY" || authority === "SYSTEM";
}

function hard(code: D1lR2BlockerCode, requirementId: string): D1lR2Condition {
  return { code, severity: "HARD_BLOCKER", requirementId };
}

function pending(code: D1lR2BlockerCode, requirementId: string): D1lR2Condition {
  return { code, severity: "PENDING", requirementId };
}

function ledgerFor(ledger: D1lR2LedgerRow[], pin: D1lR1EvidencePin): D1lR2LedgerRow | "MISMATCH" | null {
  const row = ledger.find((item) => item.evidenceId === pin.evidenceId);
  if (!row) return null;
  if (row.revision !== pin.revision || row.sourceFingerprint !== pin.sourceFingerprint) return "MISMATCH";
  return row;
}

function solverRequired(manifest: D1lR1ManifestRecord): boolean {
  return manifest.claimType === "ANALYSIS_RESULT_CLAIM" || manifest.solverQualificationEvidence != null;
}

export function resolveCertificationRequirements(manifest: D1lR1ManifestRecord): string[] {
  const requirements = ["STANDARD_PROFILE", "JURISDICTION_PROFILE"];
  if (manifest.claimType === "DESIGN_CHECK_CLAIM") requirements.push("DESIGN_EVIDENCE", "VALIDATION_EVIDENCE", "ENGINEER_REVIEW", "CONFORMANCE");
  if (manifest.claimType === "ANALYSIS_RESULT_CLAIM") requirements.push("ANALYSIS_EVIDENCE", "VALIDATION_EVIDENCE", "ENGINEER_REVIEW", "SOLVER_QUALIFICATION");
  if (manifest.claimType === "OPTIMIZATION_STUDY_EVIDENCE_CLAIM") requirements.push("DESIGN_EVIDENCE", "D1J_ENGINEER_VALIDATION", "D1J_CONFORMANCE");
  if (solverRequired(manifest)) requirements.push("D1G_LIVE_VALIDATION", "D1G_ENGINEER_VALIDATION", "D1G_CONFORMANCE", "D1G_CERTIFIED_SOLVER");
  if (manifest.crossDisciplineEvidence) requirements.push("D1K_EVIDENCE");
  const diagnostics = [
    manifest.designEvidence?.upstreamDiagnostic,
    manifest.analysisEvidence?.upstreamDiagnostic,
    manifest.validationEvidence?.upstreamDiagnostic,
    manifest.engineerReviewEvidence?.upstreamDiagnostic,
    manifest.conformanceEvidence?.upstreamDiagnostic,
  ];
  if (diagnostics.includes("C10_REVIEW_PENDING")) requirements.push("C10_REVIEW");
  if (manifest.claimScope === "STRUCTURAL_SYSTEM" && diagnostics.includes("D1F_ORCHESTRATOR_REVIEW_PENDING")) requirements.push("D1F_ORCHESTRATOR_REVIEW");
  if (diagnostics.includes("D1H_ENGINEER_VALIDATION_PENDING")) requirements.push("D1H_ENGINEER_VALIDATION");
  if (diagnostics.includes("D1I_ENGINEER_VALIDATION_PENDING")) requirements.push("D1I_ENGINEER_VALIDATION");
  if (diagnostics.includes("D1I_CONFORMANCE_PENDING")) requirements.push("D1I_CONFORMANCE");
  if (diagnostics.includes("PARAMETER_SEMANTICS_NOT_AVAILABLE")) requirements.push("D1J_PARAMETER_SEMANTICS");
  if (diagnostics.includes("CONSEQUENCE_PROFILE_REQUIRED")) requirements.push("CONSEQUENCE_PROFILE");
  return requirements;
}

export function createD1lR2Store(now: () => string): D1lR2Store {
  return { now, results: [] };
}

export function evaluateCertificationEligibility(claims: D1lR1Store, results: D1lR2Store, actor: D1lR1Actor, input: D1lR2EvaluationInput): D1lR2Result {
  if (!actor.actorId.trim() || actor.authority !== "EVIDENCE_PRODUCER" || blockedActor(actor.actorId) || blockedActor(actor.authority)) fail("UNAUTHORIZED");
  if (input.overrideEligibility || input.waiveHardBlocker) fail("ELIGIBILITY_OVERRIDE_REJECTED");
  if (input.disabledRequirements && input.disabledRequirements.length > 0) fail("REQUIREMENT_DISABLE_REJECTED");
  if (input.freeformRequirement) fail("FREEFORM_REQUIREMENT_REJECTED");
  if (input.upgradeStandard) fail("STANDARD_VERSION_AUTO_UPGRADE_REJECTED");
  if (input.upgradeJurisdiction) fail("JURISDICTION_PROFILE_AUTO_UPGRADE_REJECTED");
  if (input.requirementSetId != null && input.requirementSetId !== D1L_R2_REQUIREMENT_SET_ID) fail("UNKNOWN_REQUIREMENT_RULE");
  const manifest = claims.records.find((row) => row.manifestId === input.manifestId);
  if (!manifest || manifest.recordStatus !== "CURRENT") fail("MANIFEST_NOT_FOUND");
  if (manifest.claimId !== input.claimId) fail("CLAIM_MANIFEST_MISMATCH");
  if (actor.tenantId !== manifest.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== manifest.workspaceId || actor.projectId !== manifest.projectId) fail("CROSS_PROJECT_OPERATION");
  if (manifest.manifestFingerprint !== input.expectedManifestFingerprint) fail("FINGERPRINT_MISMATCH");
  const before = fingerprintCanonical(manifest);
  const requirements = resolveCertificationRequirements(manifest);
  const hardBlockers: D1lR2Condition[] = [];
  const pendingConditions: D1lR2Condition[] = [];
  const pins = [manifest.designEvidence, manifest.analysisEvidence, manifest.validationEvidence, manifest.engineerReviewEvidence, manifest.conformanceEvidence, manifest.solverQualificationEvidence, manifest.crossDisciplineEvidence, manifest.authorityEvidence].filter((pin): pin is D1lR1EvidencePin => pin != null);
  const mismatched = pins.some((pin) => ledgerFor(input.ledger, pin) === "MISMATCH");
  if (!manifest.standardEdition.trim() || !manifest.standardVersion.trim() || !manifest.standardFingerprint.trim() || /^(latest|current)$/i.test(manifest.standardEdition) || /^(latest|current)$/i.test(manifest.standardVersion)) {
    hardBlockers.push(hard("MISSING_STANDARDS_PROFILE", "STANDARD_PROFILE"));
  }
  if (!manifest.jurisdictionVersion.trim() || !manifest.jurisdictionFingerprint.trim() || /^(latest|current)$/i.test(manifest.jurisdictionVersion)) {
    hardBlockers.push(hard("MISSING_JURISDICTION_PROFILE", "JURISDICTION_PROFILE"));
  }
  if (requirements.includes("CONSEQUENCE_PROFILE") && !("profileId" in manifest.consequenceReliabilityProfile)) hardBlockers.push(hard("MISSING_CONSEQUENCE_PROFILE", "CONSEQUENCE_PROFILE"));
  if (requirements.includes("DESIGN_EVIDENCE") && !manifest.designEvidence) hardBlockers.push(hard("MISSING_EVIDENCE", "DESIGN_EVIDENCE"));
  if (requirements.includes("ANALYSIS_EVIDENCE") && !manifest.analysisEvidence) hardBlockers.push(hard("MISSING_EVIDENCE", "ANALYSIS_EVIDENCE"));
  if (requirements.includes("SOLVER_QUALIFICATION") && !manifest.solverQualificationEvidence) hardBlockers.push(hard("UNQUALIFIED_SOLVER", "SOLVER_QUALIFICATION"));
  if (requirements.includes("D1K_EVIDENCE") && !manifest.crossDisciplineEvidence) hardBlockers.push(hard("UNRESOLVED_D1K_INTERFACE", "D1K_EVIDENCE"));
  for (const pin of pins) {
    if (pin.stale && pin.slot !== "crossDiscipline") hardBlockers.push(hard("STALE_EVIDENCE", pin.slot));
    if (pin.authority === "ADMINISTRATOR" || /^AI(?:\b|_)/i.test(pin.authority)) hardBlockers.push(hard("INSUFFICIENT_AUTHORITY", pin.slot));
    const row = ledgerFor(input.ledger, pin);
    if (row === "MISMATCH") hardBlockers.push(hard("INVALID_EVIDENCE", pin.slot));
  }
  const review = manifest.engineerReviewEvidence;
  const reviewRow = review ? ledgerFor(input.ledger, review) : null;
  if (requirements.includes("ENGINEER_REVIEW")) {
    if (!review) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "ENGINEER_REVIEW"));
    else if (reviewRow && reviewRow !== "MISMATCH") {
      if (reviewRow.reviewState === "FAILED") hardBlockers.push(hard("FAILED_ENGINEER_REVIEW", "ENGINEER_REVIEW"));
      else if (reviewRow.reviewState !== "SATISFIED" || reviewRow.authority !== "ENGINEER_REVIEWER") pendingConditions.push(pending("PENDING_ENGINEER_REVIEW", "ENGINEER_REVIEW"));
    } else if (reviewRow !== "MISMATCH") pendingConditions.push(pending("PENDING_ENGINEER_REVIEW", "ENGINEER_REVIEW"));
  }
  const conformance = manifest.conformanceEvidence;
  const conformanceRow = conformance ? ledgerFor(input.ledger, conformance) : null;
  if (requirements.includes("CONFORMANCE")) {
    if (!conformance) hardBlockers.push(hard("MISSING_CONFORMANCE", "CONFORMANCE"));
    else if (conformanceRow && conformanceRow !== "MISMATCH") {
      if (conformanceRow.conformanceState === "FAILED") hardBlockers.push(hard("FAILED_CONFORMANCE", "CONFORMANCE"));
      else if (conformanceRow.conformanceState !== "SATISFIED" || conformanceRow.authority !== "CONFORMANCE_AUTHORITY") pendingConditions.push(pending("MISSING_CONFORMANCE", "CONFORMANCE"));
    } else if (conformanceRow !== "MISMATCH") hardBlockers.push(hard("MISSING_CONFORMANCE", "CONFORMANCE"));
  }
  const validation = manifest.validationEvidence;
  const validationRow = validation ? ledgerFor(input.ledger, validation) : null;
  if (requirements.includes("VALIDATION_EVIDENCE")) {
    if (!validation) hardBlockers.push(hard("MISSING_VALIDATION", "VALIDATION_EVIDENCE"));
    else if (validationRow && validationRow !== "MISMATCH") {
      if (validationRow.validationState === "FAILED") hardBlockers.push(hard("FAILED_VALIDATION", "VALIDATION_EVIDENCE"));
      else if (validationRow.validationState !== "SATISFIED") pendingConditions.push(pending("MISSING_VALIDATION", "VALIDATION_EVIDENCE"));
    } else if (validationRow !== "MISMATCH") hardBlockers.push(hard("MISSING_VALIDATION", "VALIDATION_EVIDENCE"));
  }
  if (solverRequired(manifest)) {
    if (!D1G_LIVE_VALIDATED) hardBlockers.push(hard("MISSING_VALIDATION", "D1G_LIVE_VALIDATION"));
    if (!D1G_ENGINEER_VALIDATED) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "D1G_ENGINEER_VALIDATION"));
    if (!D1G_CONFORMANCE_VALIDATED) hardBlockers.push(hard("MISSING_CONFORMANCE", "D1G_CONFORMANCE"));
    const solverStatus: string = D1G_CERTIFIED_SOLVER_STATUS;
    if (solverStatus !== "CERTIFIED") hardBlockers.push(hard("UNQUALIFIED_SOLVER", "D1G_CERTIFIED_SOLVER"));
    if (manifest.solverQualificationEvidence?.solverQualificationState === "CERTIFIED") hardBlockers.push(hard("UNQUALIFIED_SOLVER", "SOLVER_QUALIFICATION"));
  }
  if (requirements.includes("C10_REVIEW")) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "C10_REVIEW"));
  if (requirements.includes("D1F_ORCHESTRATOR_REVIEW")) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "D1F_ORCHESTRATOR_REVIEW"));
  if (requirements.includes("D1H_ENGINEER_VALIDATION")) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "D1H_ENGINEER_VALIDATION"));
  if (requirements.includes("D1I_ENGINEER_VALIDATION")) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "D1I_ENGINEER_VALIDATION"));
  if (requirements.includes("D1I_CONFORMANCE")) hardBlockers.push(hard("MISSING_CONFORMANCE", "D1I_CONFORMANCE"));
  if (requirements.includes("D1J_ENGINEER_VALIDATION")) hardBlockers.push(hard("PENDING_ENGINEER_REVIEW", "D1J_ENGINEER_VALIDATION"));
  if (requirements.includes("D1J_CONFORMANCE")) hardBlockers.push(hard("MISSING_CONFORMANCE", "D1J_CONFORMANCE"));
  if (requirements.includes("D1J_PARAMETER_SEMANTICS")) hardBlockers.push(hard("UNRESOLVED_PARAMETER_SEMANTICS", "D1J_PARAMETER_SEMANTICS"));
  const d1k = manifest.crossDisciplineEvidence;
  let indeterminate = false;
  if (d1k) {
    if (d1k.stale) hardBlockers.push(hard("STALE_D1K_INTERFACE", "D1K_EVIDENCE"));
    const row = ledgerFor(input.ledger, d1k);
    if (row && row !== "MISMATCH") {
      if (row.d1kConflict === "UNRESOLVED") hardBlockers.push(hard("UNRESOLVED_D1K_INTERFACE", "D1K_EVIDENCE"));
      if (row.d1kCompatibility === "INCOMPATIBLE") hardBlockers.push(hard("INCOMPATIBLE_D1K_INTERFACE", "D1K_EVIDENCE"));
      if (row.d1kCompatibility === "INDETERMINATE" || row.d1kCompatibility == null) indeterminate = true;
    } else if (row !== "MISMATCH") indeterminate = true;
  }
  if (mismatched) {
    for (const prior of results.results) if (prior.manifestId === manifest.manifestId && prior.recordStatus === "CURRENT") prior.recordStatus = "SUPERSEDED";
  }
  const advisories: D1lR2Condition[] = [
    { code: "R3_PROFILE_GOVERNANCE_DEFERRED", severity: "ADVISORY", requirementId: "STANDARD_PROFILE" },
    { code: "GA_SECURITY_DEBT", severity: "ADVISORY", requirementId: "RELEASE_GOVERNANCE" },
  ];
  let eligibilityState: D1lR2EligibilityState = "ELIGIBLE";
  if (mismatched) eligibilityState = "STALE";
  else if (hardBlockers.length > 0) eligibilityState = "BLOCKED";
  else if (pendingConditions.length > 0) eligibilityState = "PENDING";
  else if (indeterminate) eligibilityState = "INDETERMINATE";
  const evidenceFingerprints = pins.map((pin) => ({ evidenceId: pin.evidenceId, sourceFingerprint: pin.sourceFingerprint }));
  const stable = {
    claimId: manifest.claimId,
    claimFingerprint: manifest.claimFingerprint,
    manifestId: manifest.manifestId,
    manifestFingerprint: manifest.manifestFingerprint,
    requirementSetIdentity: D1L_R2_REQUIREMENT_SET_ID,
    requirementSetVersion: D1L_R2_REQUIREMENT_SET_VERSION,
    requirementSetFingerprint: D1L_R2_REQUIREMENT_SET_FINGERPRINT,
    evaluatedRequirements: requirements,
    hardBlockers,
    advisories,
    pendingConditions,
    eligibilityState,
    evidenceFingerprints,
  };
  const resultFingerprint = fingerprintCanonical(stable);
  const existing = results.results.find((row) => row.manifestFingerprint === manifest.manifestFingerprint && row.resultFingerprint === resultFingerprint && row.recordStatus === "CURRENT");
  if (existing) return existing;
  for (const prior of results.results) if (prior.claimId === manifest.claimId && prior.recordStatus === "CURRENT") prior.recordStatus = "SUPERSEDED";
  const result: D1lR2Result = {
    eligibilityResultId: `eligibility-${results.results.length + 1}`,
    ...stable,
    provenanceRef: manifest.provenanceRef,
    producer: "D1L_R2_DETERMINISTIC_EVALUATOR",
    resultFingerprint,
    evaluatedAt: results.now(),
    humanReviewRequired: true,
    certificationAuthority: null,
    recordStatus: "CURRENT",
  };
  results.results.push(result);
  if (fingerprintCanonical(manifest) !== before) fail("R1_MANIFEST_MUTATED");
  return result;
}
