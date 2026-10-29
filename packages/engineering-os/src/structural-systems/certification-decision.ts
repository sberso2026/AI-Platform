/**
 * EOS-D1L-R4 certification authority and decision record.
 * Records one human decision against an exact current eligible result.
 * Does not issue an external certificate or invalidate a prior decision.
 */

import { D1L_0_CLAIM_SCOPES, D1L_0_CLAIM_TYPES, STRUCTURAL_STANDARD_LIFECYCLES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import type { D1lR1Actor, D1lR1ManifestRecord, D1lR1Store } from "./certification-claim-manifest";
import { fingerprintStoredEligibilityResult, type D1lR2Result, type D1lR2Store } from "./certification-eligibility";
import type { D1lR3Store } from "./certification-profile-governance";
import { D1G_CERTIFIED_SOLVER_STATUS } from "./roadmap-after-twin-closeout";

export const D1L_R4_STATUS = "CERTIFICATION_AUTHORITY_DECISION_RECORD_IMPLEMENTED" as const;
export const D1L_R4_MATURITY_STATE = "STRUCTURAL_CERTIFICATION_AUTHORITY_DECISION_RECORD_IMPLEMENTED" as const;
export const D1L_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1L_R4_CERTIFICATION_AUTHORITY_DECISION_RECORD_CLOSEOUT.md" as const;
export const D1L_R4_ARCHITECTURE_READY = true as const;
export const D1L_R4_ELIGIBILITY_MODEL_READY = true as const;
export const D1L_R4_CERTIFICATION_RUNTIME_READY = false as const;
export const D1L_R4_CERTIFICATION_ELIGIBILITY_SATISFIED = false as const;
export const D1L_R4_CERTIFICATION_AUTHORITY_READY = true as const;
export const D1L_R4_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1L_R4_AUTHORITY_RUNTIME_COUNT = 1 as const;
export const D1L_R4_AUTHORITY_CHECK_RUNTIME_COUNT = 1 as const;
export const D1L_R4_DECISION_RUNTIME_COUNT = 1 as const;
export const D1L_R4_DECISION_RECORD_RUNTIME_COUNT = 1 as const;
export const D1L_R4_ISSUANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R4_REVOCATION_RUNTIME_COUNT = 0 as const;
export const D1L_R4_INVALIDATION_RUNTIME_COUNT = 0 as const;
export const D1L_R4_GLOBAL_AUTHORITY_FROM_ONE_SCOPE = false as const;
export const D1L_R4_AUTHORITY_INFERRED_FROM_GENERAL_ROLE = false as const;
export const D1L_R4_ADMIN_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_ADMIN_IMPLIES_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_ENGINEER_REVIEW_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_CLAIM_CREATOR_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_MANIFEST_CREATOR_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_AI_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_R4_POSITIVE_DECISION_REQUIRES_ELIGIBLE = true as const;
export const D1L_R4_STALE_ELIGIBILITY_CAN_SUPPORT_POSITIVE_DECISION = false as const;
export const D1L_R4_ELIGIBLE_AUTO_CERTIFIED = false as const;
export const D1L_R4_CLAIM_ELIGIBLE_EQUALS_CERTIFIED = false as const;
export const D1L_R4_AUTHORITY_CAN_OVERRIDE_HARD_BLOCKER = false as const;
export const D1L_R4_ADMIN_CAN_OVERRIDE_HARD_BLOCKER = false as const;
export const D1L_R4_AI_CAN_WAIVE_HARD_BLOCKER = false as const;
export const D1L_R4_GENERIC_OVERRIDE_IMPLEMENTED = false as const;
export const D1L_R4_R2_ELIGIBILITY_ENGINE_REUSED = true as const;
export const D1L_R4_PARALLEL_ELIGIBILITY_ENGINE_CREATED = false as const;
export const D1L_R4_R3_PROFILE_GOVERNANCE_REUSED = true as const;
export const D1L_R4_PARALLEL_PROFILE_SYSTEM_CREATED = false as const;
export const D1L_R4_CERTIFIER_CAN_SUBSTITUTE_PROFILE = false as const;
export const D1L_R4_DECISION_SCOPE_CAN_EXCEED_CLAIM = false as const;
export const D1L_R4_DECISION_EQUALS_EXTERNAL_CERTIFICATE = false as const;
export const D1L_R4_PARTIAL_DECISION_EQUALS_GLOBAL_CERTIFICATION = false as const;
export const D1L_R4_ONE_CLAIM_EQUALS_PACK_CERTIFIED = false as const;
export const D1L_R4_DECISION_EQUALS_PRODUCT_RELEASE = false as const;
export const D1L_R4_DECISION_EQUALS_PRODUCT_GA = false as const;
export const D1L_R4_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1L_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1L_R4_SILENT_REPOINTING_ALLOWED = false as const;
export const D1L_R4_REFERENCE_AUTO_UPGRADED = false as const;
export const D1L_R4_CAN_MUTATE_R1_CLAIM = false as const;
export const D1L_R4_CAN_MUTATE_R1_MANIFEST = false as const;
export const D1L_R4_CAN_MUTATE_R2_RESULT = false as const;
export const D1L_R4_CAN_MUTATE_R3_PROFILE = false as const;
export const D1L_R4_CAN_MUTATE_R3_REQUIREMENT_SET = false as const;
export const D1L_R4_DIRECT_CERTIFIED_INJECTION_ALLOWED = false as const;
export const D1L_R4_SYSTEM_CAN_AUTO_CERTIFY = false as const;
export const D1L_R4_NEW_CONFORMANCE_RUNTIME_COUNT = 0 as const;
export const D1L_R4_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1L_R4_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1L_R4_NEW_SOLVER_RUNTIME_COUNT = 0 as const;
export const D1L_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1L_R4_CODE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1L_R4_AI_CAN_GRANT_CERTIFICATION = false as const;
export const D1L_R4_AI_CAN_MARK_CERTIFIED = false as const;
export const D1L_R4_AI_CAN_RECORD_DECISION = false as const;
export const D1L_R4_AI_CAN_IMPERSONATE_AUTHORITY = false as const;
export const D1L_R4_D1G_CERTIFICATION_BLOCKER_PRESERVED = true as const;
export const D1L_R4_D1K_HANDOFF_REUSES_D1K = true as const;
export const D1L_R4_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1L_R4_CROSS_WORKSPACE_DECISION_ALLOWED = false as const;
export const D1L_R4_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1L_R4_D9_RUNTIME_COUNT = 0 as const;
export const D1L_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1L_R4_D1M_ABSORBED = false as const;
export const D1L_R4_D1N_ABSORBED = false as const;
export const D1L_R4_DATABASE_SCHEMA_CHANGED = false as const;
export const D1L_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1L_R4_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1L_R4_CONFIDENCE_SCORE_IMPLEMENTED = false as const;
export const D1L_R4_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1L_R4_PARALLEL_THREAD_CREATED = false as const;
export const D1L_R5_CANONICAL_PHASE = "EOS-D1L-R5-EVIDENCE-INVALIDATION-SUPERSESSION" as const;
export const D1L_R5_PHASE_TYPE = "STRUCTURAL_CERTIFICATION_EVIDENCE_INVALIDATION_SUPERSESSION" as const;
export const D1L_R5_CANONICAL_SCOPE =
  "Govern what happens when certification-relevant evidence, eligibility, profiles, authority, or dependencies change after an eligibility result or certification decision has been recorded. Do not rewrite historical certification decisions." as const;

const DECISIONS = ["CERTIFIED", "CERTIFICATION_DENIED"] as const;
const FLOATING = new Set(["latest", "current", "newest", "latest eligibility result"]);

export type D1lR4Authority = {
  authorityId: string;
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  claimTypes: string[];
  claimScopes: string[];
  standardProfileId: string;
  jurisdictionProfileId: string;
  version: string;
  evidenceRef: string;
  provenanceRef: string;
  validUntil: string | null;
  status: (typeof STRUCTURAL_STANDARD_LIFECYCLES)[number];
  fingerprint: string;
};

export type D1lR4Decision = {
  decisionId: string;
  claimId: string;
  claimFingerprint: string;
  claimScope: string;
  manifestId: string;
  manifestFingerprint: string;
  eligibilityResultId: string;
  eligibilityFingerprint: string;
  standardProfileFingerprint: string;
  jurisdictionProfileFingerprint: string;
  requirementSetIdentity: string;
  requirementSetVersion: string;
  requirementSetFingerprint: string;
  mappingFingerprint: string;
  certificationAuthorityIdentity: string;
  certificationAuthorityFingerprint: string;
  decision: (typeof DECISIONS)[number];
  decisionScope: string;
  decisionEvidenceRef: string;
  provenanceRef: string;
  decidedAt: string;
  decisionFingerprint: string;
  externalCertificateIssued: false;
  certificationAuthority: null;
  digitalThreadRefs: string[];
};

export type D1lR4Store = {
  now: () => string;
  authorities: D1lR4Authority[];
  decisions: D1lR4Decision[];
  history: Array<{ historyId: string; recordId: string; fingerprint: string; action: "RECORDED" | "SUPERSEDED" }>;
};

export type D1lR4DecisionInput = {
  claimId: string;
  manifestId: string;
  eligibilityResultId: string;
  expectedEligibilityFingerprint: string;
  decision: string;
  decisionScope: string;
  decisionEvidenceRef: string;
  provenanceRef: string;
  standardFingerprint?: string;
  jurisdictionFingerprint?: string;
  requirementSetVersion?: string;
  mappingFingerprint?: string;
  authorityId?: string;
  authorityFingerprint?: string;
  claimedActorId?: string;
  certified?: boolean;
  forceCertified?: boolean;
  overrideEligibility?: boolean;
  skipEligibility?: boolean;
  ignoreBlockers?: boolean;
  waiveHardBlocker?: boolean;
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedActor(actor: D1lR1Actor): boolean {
  return /^AI(?:\b|_)/i.test(actor.actorId) || /^AI(?:\b|_)/i.test(actor.authority) || /LLM/i.test(actor.authority) || actor.authority === "ADMINISTRATOR" || actor.authority === "SYSTEM" || actor.authority === "PROFILE_GOVERNANCE_AUTHORITY" || actor.authority === "ENGINEER_REVIEWER" || actor.authority === "EVIDENCE_PRODUCER" || actor.authority === "CONFORMANCE_AUTHORITY";
}

export function createD1lR4Store(now: () => string): D1lR4Store {
  return { now, authorities: [], decisions: [], history: [] };
}

export function registerCertificationAuthority(store: D1lR4Store, actor: D1lR1Actor, input: Omit<D1lR4Authority, "fingerprint" | "status"> & { status?: D1lR4Authority["status"]; forActorId?: string }): D1lR4Authority {
  if (actor.authority !== "CERTIFICATION_AUTHORITY" || blockedActor(actor)) fail("UNAUTHORIZED");
  if (input.forActorId != null && input.forActorId !== actor.actorId) fail("AUTHORITY_SPOOFING_REJECTED");
  if (input.actorId !== actor.actorId) fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.tenantId !== input.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== input.workspaceId || actor.projectId !== input.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!input.evidenceRef.trim() || FLOATING.has(input.evidenceRef.trim().toLowerCase())) fail("AUTHORITY_EVIDENCE_REQUIRED");
  if (!input.provenanceRef.trim() || FLOATING.has(input.provenanceRef.trim().toLowerCase())) fail("INVALID_PROVENANCE");
  if (!input.version.trim() || FLOATING.has(input.version.trim().toLowerCase())) fail("AUTHORITY_VERSION_REQUIRED");
  if (input.claimTypes.length === 0 || input.claimTypes.some((claimType) => !(D1L_0_CLAIM_TYPES as readonly string[]).includes(claimType))) fail("AUTHORITY_SCOPE_INVALID");
  if (input.claimScopes.length === 0 || input.claimScopes.some((claimScope) => !(D1L_0_CLAIM_SCOPES as readonly string[]).includes(claimScope))) fail("AUTHORITY_SCOPE_INVALID");
  const solverStatus: string = D1G_CERTIFIED_SOLVER_STATUS;
  if (solverStatus !== "NOT_CERTIFIED") fail("D1G_BLOCKER_REDEFINED");
  const fingerprint = fingerprintCanonical({
    authorityId: input.authorityId,
    actorId: input.actorId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    claimTypes: input.claimTypes,
    claimScopes: input.claimScopes,
    standardProfileId: input.standardProfileId,
    jurisdictionProfileId: input.jurisdictionProfileId,
    version: input.version,
    evidenceRef: input.evidenceRef,
  });
  const record: D1lR4Authority = { ...input, status: input.status ?? "ACTIVE", fingerprint };
  store.authorities.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, recordId: record.authorityId, fingerprint, action: "RECORDED" });
  return record;
}

export function supersedeCertificationAuthority(store: D1lR4Store, actor: D1lR1Actor, predecessorId: string, input: Omit<D1lR4Authority, "fingerprint" | "status" | "actorId">): D1lR4Authority {
  const predecessor = store.authorities.find((row) => row.authorityId === predecessorId && row.status === "ACTIVE");
  if (!predecessor) fail("AUTHORITY_NOT_FOUND");
  const created = registerCertificationAuthority(store, actor, { ...input, actorId: actor.actorId });
  predecessor.status = "SUPERSEDED";
  store.history.push({ historyId: `hist-${store.history.length + 1}`, recordId: predecessor.authorityId, fingerprint: predecessor.fingerprint, action: "SUPERSEDED" });
  return created;
}

export function checkCertificationAuthority(store: D1lR4Store, actor: D1lR1Actor, manifest: D1lR1ManifestRecord, assurance: { aal?: string | null; amr?: Array<string | { method?: string }> | null }, expected?: { authorityId?: string; authorityFingerprint?: string }): D1lR4Authority {
  if (actor.authority !== "CERTIFICATION_AUTHORITY" || blockedActor(actor)) fail("UNAUTHORIZED");
  if (resolveAuthAssuranceLevel(assurance) !== "aal2") fail("AAL2_REQUIRED");
  if (actor.tenantId !== manifest.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== manifest.workspaceId || actor.projectId !== manifest.projectId) fail("CROSS_PROJECT_OPERATION");
  const authority = store.authorities.find((row) => row.actorId === actor.actorId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId && row.status === "ACTIVE");
  if (!authority) fail("CERTIFICATION_AUTHORITY_NOT_FOUND");
  if (expected?.authorityId != null && expected.authorityId !== authority.authorityId) fail("AUTHORITY_SPOOFING_REJECTED");
  if (expected?.authorityFingerprint != null && expected.authorityFingerprint !== authority.fingerprint) fail("AUTHORITY_FINGERPRINT_MISMATCH");
  if (authority.validUntil != null && authority.validUntil < store.now()) fail("AUTHORITY_EXPIRED");
  if (!authority.claimTypes.includes(manifest.claimType) || !authority.claimScopes.includes(manifest.claimScope)) fail("AUTHORITY_SCOPE_MISMATCH");
  if (authority.standardProfileId !== manifest.standardProfileId || authority.jurisdictionProfileId !== manifest.jurisdictionProfileId) fail("AUTHORITY_SCOPE_MISMATCH");
  return authority;
}

export function recordCertificationDecision(decisions: D1lR4Store, claims: D1lR1Store, results: D1lR2Store, profiles: D1lR3Store, actor: D1lR1Actor, input: D1lR4DecisionInput): D1lR4Decision {
  if (input.certified === true || input.forceCertified || input.overrideEligibility || input.skipEligibility || input.ignoreBlockers || input.waiveHardBlocker) fail("CERTIFICATION_OVERRIDE_REJECTED");
  if (input.claimedActorId != null && input.claimedActorId !== actor.actorId) fail("AUTHORITY_SPOOFING_REJECTED");
  if (!(DECISIONS as readonly string[]).includes(input.decision)) fail("DECISION_INVALID");
  if (FLOATING.has(input.expectedEligibilityFingerprint.trim().toLowerCase())) fail("FLOATING_ELIGIBILITY_REJECTED");
  const manifest = claims.records.find((row) => row.claimId === input.claimId && row.manifestId === input.manifestId && row.recordStatus === "CURRENT");
  if (!manifest) fail("R1_MANIFEST_REQUIRED");
  const beforeManifest = fingerprintCanonical(manifest);
  const eligibility = results.results.find((row) => row.eligibilityResultId === input.eligibilityResultId && row.claimId === manifest.claimId && row.manifestId === manifest.manifestId);
  if (!eligibility) fail("R2_ELIGIBILITY_REQUIRED");
  const beforeEligibility = fingerprintCanonical(eligibility);
  if (fingerprintStoredEligibilityResult(eligibility) !== eligibility.resultFingerprint) fail("ELIGIBILITY_INTEGRITY_REJECTED");
  if (input.expectedEligibilityFingerprint !== eligibility.resultFingerprint) fail("ELIGIBILITY_FINGERPRINT_MISMATCH");
  if (!eligibility.standardFingerprint || !eligibility.jurisdictionFingerprint || !eligibility.mappingFingerprint) fail("PROFILE_CONTEXT_REQUIRED");
  if (input.standardFingerprint != null && input.standardFingerprint !== eligibility.standardFingerprint) fail("PROFILE_SUBSTITUTION_REJECTED");
  if (input.jurisdictionFingerprint != null && input.jurisdictionFingerprint !== eligibility.jurisdictionFingerprint) fail("PROFILE_SUBSTITUTION_REJECTED");
  if (input.requirementSetVersion != null && input.requirementSetVersion !== eligibility.requirementSetVersion) fail("PROFILE_SUBSTITUTION_REJECTED");
  if (input.mappingFingerprint != null && input.mappingFingerprint !== eligibility.mappingFingerprint) fail("PROFILE_SUBSTITUTION_REJECTED");
  if (input.decisionScope !== manifest.claimScope) fail("DECISION_SCOPE_EXCEEDS_CLAIM");
  const authority = checkCertificationAuthority(decisions, actor, manifest, { aal: input.aal, amr: input.amr }, { authorityId: input.authorityId, authorityFingerprint: input.authorityFingerprint });
  const beforeProfile = fingerprintCanonical(profiles.standards);
  if (input.decision === "CERTIFIED") {
    if (eligibility.eligibilityState !== "ELIGIBLE" || eligibility.recordStatus !== "CURRENT") fail("POSITIVE_DECISION_REQUIRES_ELIGIBLE");
    if (eligibility.claimFingerprint !== manifest.claimFingerprint || eligibility.manifestFingerprint !== manifest.manifestFingerprint) fail("STALE_ELIGIBILITY_REJECTED");
  }
  if (!input.decisionEvidenceRef.trim() || !input.provenanceRef.trim()) fail("INVALID_PROVENANCE");
  const stable = {
    claimId: manifest.claimId,
    claimFingerprint: manifest.claimFingerprint,
    claimScope: manifest.claimScope,
    manifestId: manifest.manifestId,
    manifestFingerprint: manifest.manifestFingerprint,
    eligibilityResultId: eligibility.eligibilityResultId,
    eligibilityFingerprint: eligibility.resultFingerprint,
    standardProfileFingerprint: eligibility.standardFingerprint,
    jurisdictionProfileFingerprint: eligibility.jurisdictionFingerprint,
    requirementSetIdentity: eligibility.requirementSetIdentity,
    requirementSetVersion: eligibility.requirementSetVersion,
    requirementSetFingerprint: eligibility.requirementSetFingerprint,
    mappingFingerprint: eligibility.mappingFingerprint,
    certificationAuthorityIdentity: authority.authorityId,
    certificationAuthorityFingerprint: authority.fingerprint,
    decision: input.decision,
    decisionScope: manifest.claimScope,
    decisionEvidenceRef: input.decisionEvidenceRef,
  };
  const decisionFingerprint = fingerprintCanonical(stable);
  const existing = decisions.decisions.find((row) => row.decisionFingerprint === decisionFingerprint);
  if (existing) return existing;
  if (decisions.decisions.some((row) => row.claimId === manifest.claimId && row.manifestId === manifest.manifestId)) fail("DECISION_ALREADY_RECORDED");
  const record: D1lR4Decision = {
    decisionId: `decision-${decisions.decisions.length + 1}`,
    ...stable,
    decision: input.decision as D1lR4Decision["decision"],
    provenanceRef: input.provenanceRef,
    decidedAt: decisions.now(),
    decisionFingerprint,
    externalCertificateIssued: false,
    certificationAuthority: null,
    digitalThreadRefs: [manifest.claimId, manifest.manifestId, eligibility.eligibilityResultId, authority.authorityId],
  };
  decisions.decisions.push(record);
  decisions.history.push({ historyId: `hist-${decisions.history.length + 1}`, recordId: record.decisionId, fingerprint: decisionFingerprint, action: "RECORDED" });
  if (fingerprintCanonical(manifest) !== beforeManifest) fail("R1_MANIFEST_MUTATED");
  if (fingerprintCanonical(eligibility) !== beforeEligibility) fail("R2_RESULT_MUTATED");
  if (fingerprintCanonical(profiles.standards) !== beforeProfile) fail("R3_PROFILE_MUTATED");
  return record;
}

export function repointCertificationDecision(): never {
  fail("SILENT_DECISION_REPOINTING_REJECTED");
}

export function invalidateCertificationDecision(): never {
  fail("DECISION_INVALIDATION_NOT_IN_R4");
}

export function issueCertificationCertificate(): never {
  fail("CERTIFICATE_ISSUANCE_NOT_IN_R4");
}
