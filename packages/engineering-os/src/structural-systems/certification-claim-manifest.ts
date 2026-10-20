/**
 * EOS-D1L-R1 certification claim and exact evidence-manifest foundation.
 * In-memory records only. No eligibility evaluation, blocker clearance, or certification decision.
 */

import type { EosEvidenceSourceKind, StructuralObjectKind } from "@rtb/types";
import {
  D1L_0_CLAIM_SCOPES,
  D1L_0_CLAIM_TYPES,
  EOS_EVIDENCE_SOURCE_KINDS,
  EOS_JURISDICTION_PROFILE_IDS,
  STRUCTURAL_OBJECT_KINDS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D1L_R1_STATUS = "CERTIFICATION_CLAIM_MANIFEST_FOUNDATION_IMPLEMENTED" as const;
export const D1L_R1_MATURITY_STATE = "STRUCTURAL_CERTIFICATION_CLAIM_EVIDENCE_MANIFEST_FOUNDATION_IMPLEMENTED" as const;
export const D1L_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1L_R1_CERTIFICATION_CLAIM_EVIDENCE_MANIFEST_FOUNDATION_CLOSEOUT.md" as const;
export const D1L_R1_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1L_0_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE.md" as const;
export const D1L_R1_PARENT_D1K_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1K_R5_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_CLOSEOUT.md" as const;
export const D1L_R1_ARCHITECTURE_READY = true as const;
export const D1L_R1_ELIGIBILITY_MODEL_READY = false as const;
export const D1L_R1_CERTIFICATION_RUNTIME_READY = false as const;
export const D1L_R1_CERTIFICATION_ELIGIBILITY_SATISFIED = false as const;
export const D1L_R1_CERTIFICATION_AUTHORITY_READY = false as const;
export const D1L_R1_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1L_R1_FREEFORM_CLAIM_TYPE_ALLOWED = false as const;
export const D1L_R1_D1A_STRUCTURAL_IDENTITY_REUSED = true as const;
export const D1L_R1_PARALLEL_STRUCTURAL_IDENTITY_CREATED = false as const;
export const D1L_R1_CROSS_WORKSPACE_EVIDENCE_ALLOWED = false as const;
export const D1L_R1_PARTIAL_CLAIM_EQUALS_GLOBAL_CERTIFICATION_CLAIM = false as const;
export const D1L_R1_FLOATING_ENGINEERING_EVIDENCE_ALLOWED = false as const;
export const D1L_R1_FLOATING_STANDARD_PROFILE_ALLOWED = false as const;
export const D1L_R1_FLOATING_JURISDICTION_PROFILE_ALLOWED = false as const;
export const D1L_R1_FLOATING_D1K_EVIDENCE_ALLOWED = false as const;
export const D1L_R1_JURISDICTION_INFERRED_FROM_CONTEXT = false as const;
export const D1L_R1_EXACT_EVIDENCE_REVISION_PINNING_IMPLEMENTED = true as const;
export const D1L_R1_DESIGN_EVIDENCE_RECORDED_EQUALS_DESIGN_VALIDATED = false as const;
export const D1L_R1_ANALYSIS_EVIDENCE_RECORDED_EQUALS_ANALYSIS_VALIDATED = false as const;
export const D1L_R1_ENGINEER_REVIEW_PRESENT_EQUALS_ENGINEER_VALIDATED = false as const;
export const D1L_R1_ENGINEER_VALIDATED_EQUALS_CERTIFIED = false as const;
export const D1L_R1_CONFORMANCE_PRESENT_EQUALS_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_R1_MANIFEST_VALID_EQUALS_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_R1_D1K_HANDOFF_REUSES_D1K = true as const;
export const D1L_R1_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1L_R1_STALE_D1K_EVIDENCE_AUTO_REPLACED = false as const;
export const D1L_R1_D1G_CERTIFICATION_BLOCKER_PRESERVED = true as const;
export const D1L_R1_D1G_BLOCKER_EVALUATION_RUNTIME_COUNT = 0 as const;
export const D1L_R1_SOLVER_EVIDENCE_STATE_PRESERVED = true as const;
export const D1L_R1_SOLVER_EVIDENCE_AUTO_PROMOTED = false as const;
export const D1L_R1_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1L_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1L_R1_MANIFEST_CREATOR_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R1_SILENT_EVIDENCE_REPOINTING_ALLOWED = false as const;
export const D1L_R1_EVIDENCE_REVISION_AUTO_UPGRADED = false as const;
export const D1L_R1_STANDARD_VERSION_AUTO_UPGRADED = false as const;
export const D1L_R1_JURISDICTION_PROFILE_AUTO_UPGRADED = false as const;
export const D1L_R1_CLAIM_RECORDED_EQUALS_CERTIFIED = false as const;
export const D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE = false as const;
export const D1L_R1_MANIFEST_RECORDED_EQUALS_CERTIFIED = false as const;
export const D1L_R1_MANIFEST_RECORDED_EQUALS_ELIGIBLE = false as const;
export const D1L_R1_EVIDENCE_RECORDING_CAN_CLEAR_BLOCKER = false as const;
export const D1L_R1_CERTIFICATION_CLAIM_RUNTIME_COUNT = 1 as const;
export const D1L_R1_CERTIFICATION_EVIDENCE_MANIFEST_RUNTIME_COUNT = 1 as const;
export const D1L_R1_EXACT_EVIDENCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1L_R1_DEPENDENCY_FINGERPRINT_RUNTIME_COUNT = 1 as const;
export const D1L_R1_CERTIFICATION_ELIGIBILITY_RUNTIME_COUNT = 0 as const;
export const D1L_R1_CERTIFICATION_BLOCKER_EVALUATION_RUNTIME_COUNT = 0 as const;
export const D1L_R1_CERTIFICATION_DECISION_RUNTIME_COUNT = 0 as const;
export const D1L_R1_CERTIFICATION_ISSUANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R1_CERTIFICATION_REVOCATION_RUNTIME_COUNT = 0 as const;
export const D1L_R1_CERTIFICATION_CONFIDENCE_SCORE_IMPLEMENTED = false as const;
export const D1L_R1_CALLER_CAN_DISABLE_MANDATORY_REQUIREMENT = false as const;
export const D1L_R1_AI_CAN_INVENT_CERTIFICATION_EVIDENCE = false as const;
export const D1L_R1_AI_CAN_INVENT_STANDARD_PROFILE = false as const;
export const D1L_R1_AI_CAN_INVENT_JURISDICTION_PROFILE = false as const;
export const D1L_R1_AI_CAN_MARK_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_R1_AI_CAN_MARK_CERTIFIED = false as const;
export const D1L_R1_AI_CAN_CLEAR_CERTIFICATION_BLOCKER = false as const;
export const D1L_R1_ADMIN_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R1_AI_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R1_NEW_SOLVER_RUNTIME_COUNT = 0 as const;
export const D1L_R1_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1L_R1_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1L_R1_D9_RUNTIME_COUNT = 0 as const;
export const D1L_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1L_R1_D1M_ABSORBED = false as const;
export const D1L_R1_D1N_ABSORBED = false as const;
export const D1L_R1_DATABASE_SCHEMA_CHANGED = false as const;
export const D1L_R1_CANONICAL_EVIDENCE_MODEL_REUSED = true as const;
export const D1L_R1_PARALLEL_EVIDENCE_SYSTEM_CREATED = false as const;
export const D1L_R1_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1L_R1_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1L_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1L_R1_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1L_R2_CANONICAL_PHASE = "EOS-D1L-R2-ELIGIBILITY-BLOCKER-EVALUATION" as const;
export const D1L_R2_PHASE_TYPE = "STRUCTURAL_CERTIFICATION_ELIGIBILITY_BLOCKER_EVALUATION" as const;
export const D1L_R2_CANONICAL_SCOPE =
  "Evaluate the exact R1 certification claim and evidence manifest against governed certification requirements and blocker rules. Do not issue certification, grant conformance, certify a solver, or start D2 through D9." as const;

const SLOT_CATEGORY = {
  design: "SOURCE_ENGINEERING_EVIDENCE",
  analysis: "SOURCE_ENGINEERING_EVIDENCE",
  validation: "VALIDATION_EVIDENCE",
  engineerReview: "ENGINEER_REVIEW_EVIDENCE",
  conformance: "CONFORMANCE_EVIDENCE",
  solver: "SOLVER_QUALIFICATION_EVIDENCE",
  crossDiscipline: "CROSS_DISCIPLINE_EVIDENCE",
  authority: "CERTIFICATION_AUTHORITY_EVIDENCE",
} as const;

const FLOATING = new Set([
  "latest",
  "current",
  "latest standard",
  "current jurisdiction rules",
  "latest analysis",
  "current model",
  "latest review",
  "current conformance result",
  "latest d1k",
  "latest interface",
  "current interface",
]);

export type D1lR1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1lR1Scope = { tenantId: string; workspaceId: string; projectId: string };

export type D1lR1Target = D1lR1Scope & {
  kind: string;
  id: string;
  revision: string;
};

export type D1lR1DesignStage = D1lR1Scope & {
  designStageId: string;
  revision: string;
};

export type D1lR1StandardProfile = D1lR1Scope & {
  profileId: string;
  standardFamily: string;
  standardCode: string;
  edition: string;
  amendment: string;
  version: string;
  fingerprint: string;
};

export type D1lR1JurisdictionProfile = D1lR1Scope & {
  profileId: string;
  jurisdictionId: string;
  version: string;
  fingerprint: string;
};

export type D1lR1ConsequenceProfile = D1lR1Scope & {
  profileId: string;
  revision: string;
  fingerprint: string | null;
};

export type D1lR1D1kPin = {
  interfaceId: string;
  sourceRevision: string;
  r1Fingerprint: string;
  r2Fingerprint: string;
  r3EvidenceId: string;
  r4EvidenceId: string;
};

export type D1lR1Evidence = D1lR1Scope & {
  evidenceId: string;
  slot: "design" | "analysis" | "validation" | "engineerReview" | "conformance" | "solver" | "crossDiscipline" | "authority";
  category: string;
  sourceKind: string;
  revision: string;
  sourceFingerprint: string | null;
  authority: string;
  provenanceRef: string;
  solverQualificationState: string | null;
  stale: boolean;
  upstreamDiagnostic: string | null;
  d1k: D1lR1D1kPin | null;
};

export type D1lR1Catalog = {
  targets: D1lR1Target[];
  designStages: D1lR1DesignStage[];
  standards: D1lR1StandardProfile[];
  jurisdictions: D1lR1JurisdictionProfile[];
  consequenceProfiles: D1lR1ConsequenceProfile[];
  evidence: D1lR1Evidence[];
};

export type D1lR1ClaimInput = {
  claimId: string;
  manifestId: string;
  claimType: string;
  claimScope: string;
  structuralTargetKind: string;
  structuralTargetId: string;
  designStageId: string;
  standardProfileId: string;
  jurisdictionProfileId: string;
  consequenceProfileId: string | null;
  designEvidenceId: string | null;
  analysisEvidenceId: string | null;
  validationEvidenceId: string | null;
  engineerReviewEvidenceId: string | null;
  conformanceEvidenceId: string | null;
  solverQualificationEvidenceId: string | null;
  crossDisciplineEvidenceId: string | null;
  authorityEvidenceId: string | null;
  crossDisciplineDependency: boolean;
  provenanceRef: string;
  predecessorManifestId?: string | null;
  globalStructuralCertification?: boolean;
  inferJurisdiction?: boolean;
  promoteSolverToCertified?: boolean;
  waiveRequirement?: boolean;
  clearBlockers?: boolean;
  eligible?: boolean;
  certified?: boolean;
  approved?: boolean;
  certificationReady?: boolean;
  upgradeEvidenceToLatest?: boolean;
  upgradeStandardToLatest?: boolean;
  upgradeJurisdictionToLatest?: boolean;
  expectedManifestFingerprint?: string;
};

export type D1lR1EvidencePin = {
  slot: D1lR1Evidence["slot"];
  evidenceId: string;
  revision: string;
  sourceFingerprint: string | null;
  category: string;
  sourceKind: EosEvidenceSourceKind;
  authority: string;
  provenanceRef: string;
  solverQualificationState: string | null;
  stale: boolean;
  upstreamDiagnostic: string | null;
  d1k: D1lR1D1kPin | null;
};

export type D1lR1ManifestRecord = {
  claimId: string;
  manifestId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  claimType: (typeof D1L_0_CLAIM_TYPES)[number];
  claimScope: (typeof D1L_0_CLAIM_SCOPES)[number];
  structuralTargetKind: StructuralObjectKind;
  structuralTargetId: string;
  structuralTargetRevision: string;
  designStageId: string;
  designStageRevision: string;
  standardProfileId: string;
  standardFamily: string;
  standardCode: string;
  standardEdition: string;
  standardAmendment: string;
  standardVersion: string;
  standardFingerprint: string;
  jurisdictionProfileId: string;
  jurisdictionId: string;
  jurisdictionVersion: string;
  jurisdictionFingerprint: string;
  consequenceReliabilityProfile: { profileId: string; revision: string; fingerprint: string | null } | { status: "NOT_AVAILABLE" };
  designEvidence: D1lR1EvidencePin | null;
  analysisEvidence: D1lR1EvidencePin | null;
  validationEvidence: D1lR1EvidencePin | null;
  engineerReviewEvidence: D1lR1EvidencePin | null;
  conformanceEvidence: D1lR1EvidencePin | null;
  solverQualificationEvidence: D1lR1EvidencePin | null;
  crossDisciplineEvidence: D1lR1EvidencePin | null;
  authorityEvidence: D1lR1EvidencePin | null;
  dependencyFingerprints: Array<{ slot: string; evidenceId: string; revision: string; sourceFingerprint: string | null }>;
  dependencyFingerprint: string;
  provenanceRef: string;
  createdBy: string;
  assembledBy: string;
  creatorAuthority: "EVIDENCE_PRODUCER";
  certificationAuthority: null;
  structurallyValid: true;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorManifestId: string | null;
  claimFingerprint: string;
  manifestFingerprint: string;
  digitalThreadRefs: string[];
};

export type D1lR1History = {
  historyId: string;
  manifestId: string;
  action: "RECORDED" | "SUPERSEDED";
  manifestFingerprint: string;
  recordedAt: string;
};

export type D1lR1Store = {
  catalog: D1lR1Catalog;
  now: () => string;
  records: D1lR1ManifestRecord[];
  history: D1lR1History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}

function blockedAuthority(value: string): boolean {
  const authority = value.trim();
  return !authority || /^AI(?:\b|_)/i.test(authority) || /LLM/i.test(authority) || /OPTIMIZER/i.test(authority) || /^SYSTEM$/i.test(authority);
}

function assertRecorder(actor: D1lR1Actor): void {
  if (!actor.actorId.trim() || actor.authority !== "EVIDENCE_PRODUCER" || blockedAuthority(actor.actorId)) fail("UNAUTHORIZED");
}

function assertScope(actor: D1lR1Actor, row: D1lR1Scope): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertPinned(value: string, emptyCode: string, floatingCode: string): string {
  if (!value.trim()) fail(emptyCode);
  if (floating(value)) fail(floatingCode);
  return value;
}

function rejectPromotion(input: D1lR1ClaimInput): void {
  if (input.globalStructuralCertification) fail("PARTIAL_CLAIM_NOT_GLOBAL");
  if (input.inferJurisdiction) fail("JURISDICTION_INFERENCE_REJECTED");
  if (input.promoteSolverToCertified) fail("SOLVER_EVIDENCE_PROMOTION_REJECTED");
  if (input.waiveRequirement) fail("REQUIREMENT_WAIVER_REJECTED");
  if (input.clearBlockers) fail("BLOCKER_CLEARANCE_REJECTED");
  if (input.eligible || input.certified || input.approved || input.certificationReady) fail("CERTIFICATION_STATUS_REJECTED");
  if (input.upgradeEvidenceToLatest) fail("EVIDENCE_REVISION_AUTO_UPGRADE_REJECTED");
  if (input.upgradeStandardToLatest) fail("STANDARD_VERSION_AUTO_UPGRADE_REJECTED");
  if (input.upgradeJurisdictionToLatest) fail("JURISDICTION_PROFILE_AUTO_UPGRADE_REJECTED");
}

function pinEvidence(store: D1lR1Store, actor: D1lR1Actor, evidenceId: string | null, slot: D1lR1Evidence["slot"]): D1lR1EvidencePin | null {
  if (evidenceId == null) return null;
  assertPinned(evidenceId, "EVIDENCE_REFERENCE_REQUIRED", "FLOATING_EVIDENCE_REJECTED");
  const evidence = store.catalog.evidence.find((row) => row.evidenceId === evidenceId);
  if (!evidence) fail("EVIDENCE_NOT_FOUND");
  assertScope(actor, evidence);
  if (evidence.slot !== slot || evidence.category !== SLOT_CATEGORY[slot]) fail("EVIDENCE_SLOT_MISMATCH");
  if (!(EOS_EVIDENCE_SOURCE_KINDS as readonly string[]).includes(evidence.sourceKind)) fail("EVIDENCE_REFERENCE_INVALID");
  assertPinned(evidence.revision, "EVIDENCE_REVISION_REQUIRED", "FLOATING_EVIDENCE_REJECTED");
  if (evidence.sourceFingerprint != null && floating(evidence.sourceFingerprint)) fail("FLOATING_EVIDENCE_REJECTED");
  if (!evidence.provenanceRef.trim() || blockedAuthority(evidence.provenanceRef) || blockedAuthority(evidence.authority)) fail("EVIDENCE_AUTHORITY_INVALID");
  if (slot === "crossDiscipline") {
    const d1k = evidence.d1k;
    if (!d1k) fail("D1K_EVIDENCE_REQUIRED");
    assertPinned(d1k.interfaceId, "D1K_EVIDENCE_REQUIRED", "FLOATING_D1K_EVIDENCE_REJECTED");
    assertPinned(d1k.sourceRevision, "D1K_EVIDENCE_REQUIRED", "FLOATING_D1K_EVIDENCE_REJECTED");
    assertPinned(d1k.r1Fingerprint, "D1K_EVIDENCE_REQUIRED", "FLOATING_D1K_EVIDENCE_REJECTED");
    assertPinned(d1k.r2Fingerprint, "D1K_EVIDENCE_REQUIRED", "FLOATING_D1K_EVIDENCE_REJECTED");
  }
  return {
    slot,
    evidenceId: evidence.evidenceId,
    revision: evidence.revision,
    sourceFingerprint: evidence.sourceFingerprint,
    category: evidence.category,
    sourceKind: evidence.sourceKind as EosEvidenceSourceKind,
    authority: evidence.authority,
    provenanceRef: evidence.provenanceRef,
    solverQualificationState: evidence.solverQualificationState,
    stale: evidence.stale,
    upstreamDiagnostic: evidence.upstreamDiagnostic,
    d1k: evidence.d1k,
  };
}

export function createD1lR1Store(catalog: D1lR1Catalog, now: () => string): D1lR1Store {
  return { catalog, now, records: [], history: [] };
}

export function recordCertificationClaimManifest(store: D1lR1Store, actor: D1lR1Actor, input: D1lR1ClaimInput): D1lR1ManifestRecord {
  assertRecorder(actor);
  rejectPromotion(input);
  assertPinned(input.claimId, "CLAIM_IDENTITY_REQUIRED", "CLAIM_IDENTITY_REQUIRED");
  assertPinned(input.manifestId, "MANIFEST_IDENTITY_REQUIRED", "MANIFEST_IDENTITY_REQUIRED");
  assertPinned(input.provenanceRef, "INVALID_PROVENANCE", "INVALID_PROVENANCE");
  if (blockedAuthority(input.provenanceRef)) fail("INVALID_PROVENANCE");
  if (!(D1L_0_CLAIM_TYPES as readonly string[]).includes(input.claimType)) fail("UNSUPPORTED_CLAIM_TYPE");
  if (!(D1L_0_CLAIM_SCOPES as readonly string[]).includes(input.claimScope)) fail("CLAIM_SCOPE_REQUIRED");
  if (!(STRUCTURAL_OBJECT_KINDS as readonly string[]).includes(input.structuralTargetKind)) fail("STRUCTURAL_TARGET_INVALID");
  const target = store.catalog.targets.find((row) => row.kind === input.structuralTargetKind && row.id === input.structuralTargetId);
  if (!target) fail("STRUCTURAL_TARGET_NOT_FOUND");
  assertScope(actor, target);
  assertPinned(target.revision, "EVIDENCE_REVISION_REQUIRED", "FLOATING_EVIDENCE_REJECTED");
  const designStage = store.catalog.designStages.find((row) => row.designStageId === input.designStageId);
  if (!designStage) fail("DESIGN_STAGE_NOT_FOUND");
  assertScope(actor, designStage);
  assertPinned(designStage.revision, "DESIGN_STAGE_REVISION_REQUIRED", "FLOATING_EVIDENCE_REJECTED");
  const standard = store.catalog.standards.find((row) => row.profileId === input.standardProfileId);
  if (!standard) fail("STANDARD_PROFILE_NOT_FOUND");
  assertScope(actor, standard);
  assertPinned(standard.edition, "STANDARD_VERSION_REQUIRED", "FLOATING_STANDARD_REJECTED");
  assertPinned(standard.version, "STANDARD_VERSION_REQUIRED", "FLOATING_STANDARD_REJECTED");
  assertPinned(standard.fingerprint, "STANDARD_VERSION_REQUIRED", "FLOATING_STANDARD_REJECTED");
  const jurisdiction = store.catalog.jurisdictions.find((row) => row.profileId === input.jurisdictionProfileId);
  if (!jurisdiction) fail("JURISDICTION_PROFILE_NOT_FOUND");
  assertScope(actor, jurisdiction);
  if (!(EOS_JURISDICTION_PROFILE_IDS as readonly string[]).includes(jurisdiction.jurisdictionId)) fail("JURISDICTION_PROFILE_INVALID");
  assertPinned(jurisdiction.version, "JURISDICTION_VERSION_REQUIRED", "FLOATING_JURISDICTION_REJECTED");
  assertPinned(jurisdiction.fingerprint, "JURISDICTION_VERSION_REQUIRED", "FLOATING_JURISDICTION_REJECTED");
  let consequence: D1lR1ManifestRecord["consequenceReliabilityProfile"] = { status: "NOT_AVAILABLE" };
  if (input.consequenceProfileId) {
    const profile = store.catalog.consequenceProfiles.find((row) => row.profileId === input.consequenceProfileId);
    if (!profile) fail("CONSEQUENCE_PROFILE_NOT_FOUND");
    assertScope(actor, profile);
    assertPinned(profile.revision, "CONSEQUENCE_PROFILE_REVISION_REQUIRED", "FLOATING_EVIDENCE_REJECTED");
    consequence = { profileId: profile.profileId, revision: profile.revision, fingerprint: profile.fingerprint };
  }
  if (input.crossDisciplineDependency && !input.crossDisciplineEvidenceId) fail("D1K_EVIDENCE_REQUIRED");
  if (!input.crossDisciplineDependency && input.crossDisciplineEvidenceId) fail("D1K_EVIDENCE_NOT_DECLARED");
  const designEvidence = pinEvidence(store, actor, input.designEvidenceId, "design");
  const analysisEvidence = pinEvidence(store, actor, input.analysisEvidenceId, "analysis");
  const validationEvidence = pinEvidence(store, actor, input.validationEvidenceId, "validation");
  const engineerReviewEvidence = pinEvidence(store, actor, input.engineerReviewEvidenceId, "engineerReview");
  const conformanceEvidence = pinEvidence(store, actor, input.conformanceEvidenceId, "conformance");
  const solverQualificationEvidence = pinEvidence(store, actor, input.solverQualificationEvidenceId, "solver");
  const crossDisciplineEvidence = pinEvidence(store, actor, input.crossDisciplineEvidenceId, "crossDiscipline");
  const authorityEvidence = pinEvidence(store, actor, input.authorityEvidenceId, "authority");
  const pins = [designEvidence, analysisEvidence, validationEvidence, engineerReviewEvidence, conformanceEvidence, solverQualificationEvidence, crossDisciplineEvidence, authorityEvidence];
  const dependencyFingerprints = pins.flatMap((pin) => pin ? [{ slot: pin.slot, evidenceId: pin.evidenceId, revision: pin.revision, sourceFingerprint: pin.sourceFingerprint }] : []);
  const claimFingerprint = fingerprintCanonical({
    claimId: input.claimId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    claimType: input.claimType,
    claimScope: input.claimScope,
    structuralTargetKind: target.kind,
    structuralTargetId: target.id,
    structuralTargetRevision: target.revision,
    designStageId: designStage.designStageId,
    designStageRevision: designStage.revision,
    standardFingerprint: standard.fingerprint,
    jurisdictionFingerprint: jurisdiction.fingerprint,
    consequence,
  });
  const predecessor = input.predecessorManifestId
    ? store.records.find((row) => row.manifestId === input.predecessorManifestId)
    : null;
  if (input.predecessorManifestId && !predecessor) fail("MANIFEST_NOT_FOUND");
  if (predecessor) {
    assertScope(actor, predecessor);
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const manifestFingerprint = fingerprintCanonical({
    claimFingerprint,
    manifestId: input.manifestId,
    standardFingerprint: standard.fingerprint,
    jurisdictionFingerprint: jurisdiction.fingerprint,
    consequence,
    dependencyFingerprints,
    provenanceRef: input.provenanceRef,
    predecessorManifestId: input.predecessorManifestId ?? null,
  });
  if (predecessor && predecessor.manifestFingerprint === manifestFingerprint) fail("EVIDENCE_REVISION_UNCHANGED");
  if (input.expectedManifestFingerprint != null && input.expectedManifestFingerprint !== manifestFingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.records.find((row) => row.claimId === input.claimId);
  if (existing) {
    if (existing.manifestFingerprint === manifestFingerprint) return existing;
    fail("CLAIM_IDENTITY_CONFLICT");
  }
  const record: D1lR1ManifestRecord = {
    claimId: input.claimId,
    manifestId: input.manifestId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    claimType: input.claimType as D1lR1ManifestRecord["claimType"],
    claimScope: input.claimScope as D1lR1ManifestRecord["claimScope"],
    structuralTargetKind: target.kind as StructuralObjectKind,
    structuralTargetId: target.id,
    structuralTargetRevision: target.revision,
    designStageId: designStage.designStageId,
    designStageRevision: designStage.revision,
    standardProfileId: standard.profileId,
    standardFamily: standard.standardFamily,
    standardCode: standard.standardCode,
    standardEdition: standard.edition,
    standardAmendment: standard.amendment,
    standardVersion: standard.version,
    standardFingerprint: standard.fingerprint,
    jurisdictionProfileId: jurisdiction.profileId,
    jurisdictionId: jurisdiction.jurisdictionId,
    jurisdictionVersion: jurisdiction.version,
    jurisdictionFingerprint: jurisdiction.fingerprint,
    consequenceReliabilityProfile: consequence,
    designEvidence,
    analysisEvidence,
    validationEvidence,
    engineerReviewEvidence,
    conformanceEvidence,
    solverQualificationEvidence,
    crossDisciplineEvidence,
    authorityEvidence,
    dependencyFingerprints,
    dependencyFingerprint: fingerprintCanonical(dependencyFingerprints),
    provenanceRef: input.provenanceRef,
    createdBy: actor.actorId,
    assembledBy: actor.actorId,
    creatorAuthority: "EVIDENCE_PRODUCER",
    certificationAuthority: null,
    structurallyValid: true,
    recordStatus: "CURRENT",
    predecessorManifestId: input.predecessorManifestId ?? null,
    claimFingerprint,
    manifestFingerprint,
    digitalThreadRefs: [target.id, ...dependencyFingerprints.map((row) => row.evidenceId)],
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    store.history.push({
      historyId: `hist-${store.history.length + 1}`,
      manifestId: predecessor.manifestId,
      action: "SUPERSEDED",
      manifestFingerprint: predecessor.manifestFingerprint,
      recordedAt: store.now(),
    });
  }
  store.records.push(record);
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    manifestId: record.manifestId,
    action: "RECORDED",
    manifestFingerprint: record.manifestFingerprint,
    recordedAt: store.now(),
  });
  return record;
}

export function replaceCertificationEvidence(): never {
  fail("SILENT_EVIDENCE_REPOINTING_REJECTED");
}
