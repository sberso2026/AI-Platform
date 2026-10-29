import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  type D1lR1Catalog,
  type D1lR1ClaimInput,
  type D1lR1Evidence,
  createD1lR1Store,
  recordCertificationClaimManifest,
} from "./certification-claim-manifest";
import { fingerprintStoredEligibilityResult, type D1lR2LedgerRow, createD1lR2Store, evaluateCertificationEligibility } from "./certification-eligibility";
import {
  D1L_R4_ADMIN_CAN_OVERRIDE_HARD_BLOCKER,
  D1L_R4_ADMIN_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R4_AI_CAN_GRANT_CERTIFICATION,
  D1L_R4_AI_CAN_IMPERSONATE_AUTHORITY,
  D1L_R4_AI_CAN_MARK_CERTIFIED,
  D1L_R4_AI_CAN_RECORD_DECISION,
  D1L_R4_AI_CAN_WAIVE_HARD_BLOCKER,
  D1L_R4_AI_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R4_AUTHORITY_CAN_OVERRIDE_HARD_BLOCKER,
  D1L_R4_AUTHORITY_CHECK_RUNTIME_COUNT,
  D1L_R4_AUTHORITY_INFERRED_FROM_GENERAL_ROLE,
  D1L_R4_AUTHORITY_RUNTIME_COUNT,
  D1L_R4_CAN_MUTATE_R1_CLAIM,
  D1L_R4_CAN_MUTATE_R1_MANIFEST,
  D1L_R4_CAN_MUTATE_R2_RESULT,
  D1L_R4_CAN_MUTATE_R3_PROFILE,
  D1L_R4_CAN_MUTATE_R3_REQUIREMENT_SET,
  D1L_R4_CANONICAL_DIGITAL_THREAD_REUSED,
  D1L_R4_CANONICAL_FINGERPRINT_REUSED,
  D1L_R4_CERTIFICATION_AUTHORITY_READY,
  D1L_R4_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1L_R4_CERTIFICATION_RUNTIME_READY,
  D1L_R4_CLAIM_CREATOR_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R4_CLAIM_ELIGIBLE_EQUALS_CERTIFIED,
  D1L_R4_CODE_CALCULATION_RUNTIME_COUNT,
  D1L_R4_CROSS_WORKSPACE_DECISION_ALLOWED,
  D1L_R4_D1G_CERTIFICATION_BLOCKER_PRESERVED,
  D1L_R4_D1K_HANDOFF_REUSES_D1K,
  D1L_R4_D1M_ABSORBED,
  D1L_R4_D1N_ABSORBED,
  D1L_R4_D2_D8_RUNTIME_COUNT,
  D1L_R4_D9_RUNTIME_COUNT,
  D1L_R4_DATABASE_SCHEMA_CHANGED,
  D1L_R4_DECISION_EQUALS_EXTERNAL_CERTIFICATE,
  D1L_R4_DECISION_EQUALS_PRODUCT_GA,
  D1L_R4_DECISION_EQUALS_PRODUCT_RELEASE,
  D1L_R4_DECISION_RECORD_RUNTIME_COUNT,
  D1L_R4_DECISION_RUNTIME_COUNT,
  D1L_R4_DECISION_SCOPE_CAN_EXCEED_CLAIM,
  D1L_R4_DIRECT_CERTIFIED_INJECTION_ALLOWED,
  D1L_R4_ELIGIBLE_AUTO_CERTIFIED,
  D1L_R4_ENGINEER_REVIEW_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R4_GENERIC_OVERRIDE_IMPLEMENTED,
  D1L_R4_GLOBAL_AUTHORITY_FROM_ONE_SCOPE,
  D1L_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1L_R4_INVALIDATION_RUNTIME_COUNT,
  D1L_R4_ISSUANCE_RUNTIME_COUNT,
  D1L_R4_MANIFEST_CREATOR_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R4_NEW_CONFORMANCE_RUNTIME_COUNT,
  D1L_R4_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT,
  D1L_R4_NEW_ENGINEERING_FORMULA_COUNT,
  D1L_R4_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT,
  D1L_R4_NEW_SOLVER_RUNTIME_COUNT,
  D1L_R4_ONE_CLAIM_EQUALS_PACK_CERTIFIED,
  D1L_R4_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1L_R4_PARALLEL_ELIGIBILITY_ENGINE_CREATED,
  D1L_R4_PARALLEL_PROFILE_SYSTEM_CREATED,
  D1L_R4_PARALLEL_THREAD_CREATED,
  D1L_R4_PARTIAL_DECISION_EQUALS_GLOBAL_CERTIFICATION,
  D1L_R4_POSITIVE_DECISION_REQUIRES_ELIGIBLE,
  D1L_R4_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R4_R2_ELIGIBILITY_ENGINE_REUSED,
  D1L_R4_R3_PROFILE_GOVERNANCE_REUSED,
  D1L_R4_REFERENCE_AUTO_UPGRADED,
  D1L_R4_REVOCATION_RUNTIME_COUNT,
  D1L_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1L_R4_SILENT_REPOINTING_ALLOWED,
  D1L_R4_STALE_ELIGIBILITY_CAN_SUPPORT_POSITIVE_DECISION,
  D1L_R4_STRUCTURAL_PACK_COMPLETE,
  D1L_R4_SYSTEM_CAN_AUTO_CERTIFY,
  D1L_R5_CANONICAL_PHASE,
  D1L_R5_CANONICAL_SCOPE,
  createD1lR4Store,
  invalidateCertificationDecision,
  issueCertificationCertificate,
  recordCertificationDecision,
  registerCertificationAuthority,
  repointCertificationDecision,
  supersedeCertificationAuthority,
} from "./certification-decision";
import { createD1lR3Store, evaluateUnderGovernedProfile, registerJurisdictionProfile, registerProfileMapping, registerRequirementSet, registerStandardProfile } from "./certification-profile-governance";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1G_CERTIFIED_SOLVER_STATUS } from "./roadmap-after-twin-closeout";

const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const root = dirname(fileURLToPath(import.meta.url));

function evidence(overrides: Partial<D1lR1Evidence> = {}): D1lR1Evidence {
  return { ...scope, evidenceId: "ev-design", slot: "design", category: "SOURCE_ENGINEERING_EVIDENCE", sourceKind: "calculation", revision: "rev-1", sourceFingerprint: "fp-design", authority: "EVIDENCE_PRODUCER", provenanceRef: "prov-design", solverQualificationState: null, stale: false, upstreamDiagnostic: null, d1k: null, ...overrides };
}

function catalog(): D1lR1Catalog {
  return {
    targets: [{ ...scope, kind: "MEMBER", id: "member-1", revision: "rev-1" }],
    designStages: [{ ...scope, designStageId: "detailed-design", revision: "stage-1" }],
    standards: [{ ...scope, profileId: "std-1", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2016", amendment: "A1", version: "2016-A1", fingerprint: "fp-std" }],
    jurisdictions: [{ ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur" }],
    consequenceProfiles: [],
    evidence: [
      evidence(),
      evidence({ evidenceId: "ev-validation", slot: "validation", category: "VALIDATION_EVIDENCE", sourceFingerprint: "fp-validation", provenanceRef: "prov-validation" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", sourceFingerprint: "fp-review", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", sourceFingerprint: "fp-conformance", provenanceRef: "prov-conf" }),
      evidence({ evidenceId: "ev-d1k", slot: "crossDiscipline", category: "CROSS_DISCIPLINE_EVIDENCE", sourceKind: "model", sourceFingerprint: "fp-d1k", provenanceRef: "prov-d1k", d1k: { interfaceId: "iface-1", sourceRevision: "src-rev-1", r1Fingerprint: "fp-r1", r2Fingerprint: "fp-r2", r3EvidenceId: "r3-1", r4EvidenceId: "r4-1" } }),
    ],
  };
}

function claim(overrides: Partial<D1lR1ClaimInput> = {}): D1lR1ClaimInput {
  return { claimId: "claim-1", manifestId: "manifest-1", claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", structuralTargetKind: "MEMBER", structuralTargetId: "member-1", designStageId: "detailed-design", standardProfileId: "std-1", jurisdictionProfileId: "jur-1", consequenceProfileId: null, designEvidenceId: "ev-design", analysisEvidenceId: null, validationEvidenceId: "ev-validation", engineerReviewEvidenceId: "ev-review", conformanceEvidenceId: "ev-conformance", solverQualificationEvidenceId: null, crossDisciplineEvidenceId: null, authorityEvidenceId: null, crossDisciplineDependency: false, provenanceRef: "prov-claim", ...overrides };
}

function producer() {
  return { actorId: "creator-1", ...scope, authority: "EVIDENCE_PRODUCER" };
}

function certifier() {
  return { actorId: "certifier-1", ...scope, authority: "CERTIFICATION_AUTHORITY" };
}

function ledger(overrides: Partial<D1lR2LedgerRow>[] = []): D1lR2LedgerRow[] {
  const rows: D1lR2LedgerRow[] = [
    { evidenceId: "ev-validation", revision: "rev-1", sourceFingerprint: "fp-validation", authority: "EVIDENCE_PRODUCER", validationState: "SATISFIED" },
    { evidenceId: "ev-review", revision: "rev-1", sourceFingerprint: "fp-review", authority: "ENGINEER_REVIEWER", reviewState: "SATISFIED" },
    { evidenceId: "ev-conformance", revision: "rev-1", sourceFingerprint: "fp-conformance", authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" },
  ];
  return overrides.length > 0 ? overrides as D1lR2LedgerRow[] : rows;
}

function profiles() {
  const store = createD1lR3Store(() => "2026-10-21T00:00:00.000Z");
  const governor = { actorId: "governor-1", ...scope, authority: "PROFILE_GOVERNANCE_AUTHORITY" };
  registerStandardProfile(store, governor, catalog().standards[0]!, { publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std" });
  registerJurisdictionProfile(store, governor, catalog().jurisdictions[0]!, { country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur" });
  registerRequirementSet(store, governor, { requirementSetId: "req-design-check", version: "1", ...scope, claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", mandatory: ["DESIGN_EVIDENCE", "VALIDATION_EVIDENCE", "ENGINEER_REVIEW", "CONFORMANCE"], conditional: [], advisory: ["GA_SECURITY_DEBT"], authority: "PROFILE_GOVERNANCE_AUTHORITY", provenanceRef: "prov-req" });
  registerProfileMapping(store, governor, { mappingId: "map-1", version: "1", ...scope, standardProfileId: "std-1", jurisdictionProfileId: "jur-1", claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", requirementSetId: "req-design-check", authority: "PROFILE_GOVERNANCE_AUTHORITY", provenanceRef: "prov-map" });
  return store;
}

function ready(rows?: D1lR2LedgerRow[], claimOverrides: Partial<D1lR1ClaimInput> = {}) {
  const claims = createD1lR1Store(catalog(), () => "2026-10-21T00:00:00.000Z");
  const manifest = recordCertificationClaimManifest(claims, producer(), claim(claimOverrides));
  const profileStore = profiles();
  const results = createD1lR2Store(() => "2026-10-21T00:00:00.000Z");
  const eligibility = evaluateUnderGovernedProfile(profileStore, claims, results, producer(), manifest, rows ?? ledger());
  const decisions = createD1lR4Store(() => "2026-10-21T00:00:00.000Z");
  const authority = registerCertificationAuthority(decisions, certifier(), { authorityId: "auth-1", actorId: "certifier-1", ...scope, claimTypes: ["DESIGN_CHECK_CLAIM"], claimScopes: ["CHECK"], standardProfileId: "std-1", jurisdictionProfileId: "jur-1", version: "1", evidenceRef: "auth-evidence-1", provenanceRef: "prov-auth", validUntil: null });
  return { claims, manifest, profileStore, results, eligibility, decisions, authority };
}

function decide(env = ready(), overrides: Record<string, unknown> = {}) {
  return recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, certifier(), {
    claimId: env.manifest.claimId,
    manifestId: env.manifest.manifestId,
    eligibilityResultId: env.eligibility.eligibilityResultId,
    expectedEligibilityFingerprint: env.eligibility.resultFingerprint,
    decision: "CERTIFIED",
    decisionScope: env.manifest.claimScope,
    decisionEvidenceRef: "decision-evidence-1",
    provenanceRef: "prov-decision",
    aal: "aal2",
    ...overrides,
  });
}

describe("EOS-D1L-R4 certification authority and decision record", () => {
  it("records one positive decision against the exact eligible chain", () => {
    const env = ready();
    expect(env.decisions.decisions).toHaveLength(0);
    const decision = decide(env);
    expect(decision.decision).toBe("CERTIFIED");
    expect(decision.claimFingerprint).toBe(env.manifest.claimFingerprint);
    expect(decision.manifestFingerprint).toBe(env.manifest.manifestFingerprint);
    expect(decision.eligibilityFingerprint).toBe(env.eligibility.resultFingerprint);
    expect(decision.standardProfileFingerprint).toBe("fp-std");
    expect(decision.jurisdictionProfileFingerprint).toBe("fp-jur");
    expect(decision.requirementSetIdentity).toBe("req-design-check");
    expect(decision.requirementSetVersion).toBe("1");
    expect(decision.requirementSetFingerprint).toBe(env.eligibility.requirementSetFingerprint);
    expect(decision.mappingFingerprint).toBe(env.eligibility.mappingFingerprint);
    expect(decision.certificationAuthorityIdentity).toBe("auth-1");
    expect(decision.certificationAuthorityFingerprint).toBe(env.authority.fingerprint);
    expect(decision.decisionScope).toBe("CHECK");
    expect(decision.provenanceRef).toBe("prov-decision");
    expect(decision.externalCertificateIssued).toBe(false);
    expect(decision.certificationAuthority).toBeNull();
    expect(decision).not.toHaveProperty("certified");
    expect(decision).not.toHaveProperty("score");
    expect(decision.decisionFingerprint).toBe(fingerprintCanonical({
      claimId: decision.claimId,
      claimFingerprint: decision.claimFingerprint,
      claimScope: decision.claimScope,
      manifestId: decision.manifestId,
      manifestFingerprint: decision.manifestFingerprint,
      eligibilityResultId: decision.eligibilityResultId,
      eligibilityFingerprint: decision.eligibilityFingerprint,
      standardProfileFingerprint: decision.standardProfileFingerprint,
      jurisdictionProfileFingerprint: decision.jurisdictionProfileFingerprint,
      requirementSetIdentity: decision.requirementSetIdentity,
      requirementSetVersion: decision.requirementSetVersion,
      requirementSetFingerprint: decision.requirementSetFingerprint,
      mappingFingerprint: decision.mappingFingerprint,
      certificationAuthorityIdentity: decision.certificationAuthorityIdentity,
      certificationAuthorityFingerprint: decision.certificationAuthorityFingerprint,
      decision: decision.decision,
      decisionScope: decision.decisionScope,
      decisionEvidenceRef: decision.decisionEvidenceRef,
    }));
    expect(decide(env).decisionId).toBe(decision.decisionId);
    expect(env.manifest.certificationAuthority).toBeNull();
    expect(env.eligibility.eligibilityState).toBe("ELIGIBLE");
    expect(D1L_R4_ELIGIBLE_AUTO_CERTIFIED).toBe(false);
    expect(D1L_R4_CLAIM_ELIGIBLE_EQUALS_CERTIFIED).toBe(false);
  });

  it("keeps certification authority scoped, evidenced, and separate from other roles", () => {
    const env = ready();
    expect(env.authority.evidenceRef).toBe("auth-evidence-1");
    expect(env.authority.provenanceRef).toBe("prov-auth");
    expect(env.authority.fingerprint).toBeTruthy();
    expect(env.authority.claimScopes).toEqual(["CHECK"]);
    expect(D1L_R4_GLOBAL_AUTHORITY_FROM_ONE_SCOPE).toBe(false);
    expect(D1L_R4_AUTHORITY_INFERRED_FROM_GENERAL_ROLE).toBe(false);
    expect(D1L_R4_ADMIN_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R4_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R4_ENGINEER_REVIEW_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R4_CLAIM_CREATOR_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R4_MANIFEST_CREATOR_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R4_AI_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    const input = { authorityId: "auth-x", actorId: "certifier-1", ...scope, claimTypes: ["DESIGN_CHECK_CLAIM"], claimScopes: ["CHECK"], standardProfileId: "std-1", jurisdictionProfileId: "jur-1", version: "1", evidenceRef: "auth-evidence-1", provenanceRef: "prov-auth", validUntil: null };
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), { ...certifier(), authority: "ADMINISTRATOR" }, input)).toThrow("UNAUTHORIZED");
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), { ...certifier(), authority: "PROFILE_GOVERNANCE_AUTHORITY" }, input)).toThrow("UNAUTHORIZED");
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), { ...certifier(), authority: "ENGINEER_REVIEWER" }, input)).toThrow("UNAUTHORIZED");
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), producer(), { ...input, actorId: "creator-1" })).toThrow("UNAUTHORIZED");
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), { actorId: "AI_ASSISTANT", ...scope, authority: "CERTIFICATION_AUTHORITY" }, { ...input, actorId: "AI_ASSISTANT" })).toThrow("UNAUTHORIZED");
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), certifier(), { ...input, evidenceRef: "" })).toThrow("AUTHORITY_EVIDENCE_REQUIRED");
    expect(() => registerCertificationAuthority(createD1lR4Store(() => "t"), certifier(), { ...input, forActorId: "other-person" })).toThrow("AUTHORITY_SPOOFING_REJECTED");
    expect(() => decide(env, { aal: "aal1" })).toThrow("AAL2_REQUIRED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { ...certifier(), authority: "ADMINISTRATOR" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" })).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "creator-1", ...scope, authority: "EVIDENCE_PRODUCER" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" })).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "reviewer-1", ...scope, authority: "ENGINEER_REVIEWER" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" })).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "AI_ASSISTANT", ...scope, authority: "AI" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" })).toThrow("UNAUTHORIZED");
  });

  it("rejects the wrong scope, workspace, expiry, and profile substitution", () => {
    const narrow = ready();
    narrow.authority.claimScopes = ["MEMBER"];
    expect(() => decide(narrow)).toThrow("AUTHORITY_SCOPE_MISMATCH");
    const foreign = ready();
    expect(() => recordCertificationDecision(foreign.decisions, foreign.claims, foreign.results, foreign.profileStore, { ...certifier(), workspaceId: "workspace-b" }, { claimId: foreign.manifest.claimId, manifestId: foreign.manifest.manifestId, eligibilityResultId: foreign.eligibility.eligibilityResultId, expectedEligibilityFingerprint: foreign.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" })).toThrow("CROSS_PROJECT_OPERATION");
    const expired = ready();
    expired.authority.validUntil = "2020-01-01T00:00:00.000Z";
    expect(() => decide(expired)).toThrow("AUTHORITY_EXPIRED");
    expired.authority.validUntil = null;
    expired.authority.status = "WITHDRAWN";
    expect(() => decide(expired)).toThrow("CERTIFICATION_AUTHORITY_NOT_FOUND");
    expect(() => decide(ready(), { standardFingerprint: "fp-easier" })).toThrow("PROFILE_SUBSTITUTION_REJECTED");
    expect(() => decide(ready(), { jurisdictionFingerprint: "fp-other" })).toThrow("PROFILE_SUBSTITUTION_REJECTED");
    expect(() => decide(ready(), { requirementSetVersion: "0" })).toThrow("PROFILE_SUBSTITUTION_REJECTED");
    expect(() => decide(ready(), { mappingFingerprint: "fp-weaker" })).toThrow("PROFILE_SUBSTITUTION_REJECTED");
    expect(() => decide(ready(), { decisionScope: "PROJECT_CLAIM" })).toThrow("DECISION_SCOPE_EXCEEDS_CLAIM");
    expect(D1L_R4_DECISION_SCOPE_CAN_EXCEED_CLAIM).toBe(false);
    expect(D1L_R4_CROSS_WORKSPACE_DECISION_ALLOWED).toBe(false);
  });

  it("rejects positive certification unless the exact current result is eligible", () => {
    const blocked = ready([]);
    expect(blocked.eligibility.eligibilityState).toBe("BLOCKED");
    expect(() => decide(blocked)).toThrow("POSITIVE_DECISION_REQUIRES_ELIGIBLE");
    const pending = ready([{ evidenceId: "ev-validation", revision: "rev-1", sourceFingerprint: "fp-validation", authority: "EVIDENCE_PRODUCER", validationState: "SATISFIED" }, { evidenceId: "ev-review", revision: "rev-1", sourceFingerprint: "fp-review", authority: "ENGINEER_REVIEWER", reviewState: "PENDING" }, { evidenceId: "ev-conformance", revision: "rev-1", sourceFingerprint: "fp-conformance", authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" }]);
    expect(pending.eligibility.eligibilityState).toBe("PENDING");
    expect(() => decide(pending)).toThrow("POSITIVE_DECISION_REQUIRES_ELIGIBLE");
    const indeterminate = ready([{ evidenceId: "ev-validation", revision: "rev-1", sourceFingerprint: "fp-validation", authority: "EVIDENCE_PRODUCER", validationState: "SATISFIED" }, { evidenceId: "ev-review", revision: "rev-1", sourceFingerprint: "fp-review", authority: "ENGINEER_REVIEWER", reviewState: "SATISFIED" }, { evidenceId: "ev-conformance", revision: "rev-1", sourceFingerprint: "fp-conformance", authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" }, { evidenceId: "ev-d1k", revision: "rev-1", sourceFingerprint: "fp-d1k", authority: "EVIDENCE_PRODUCER", d1kCompatibility: "INDETERMINATE" }], { crossDisciplineDependency: true, crossDisciplineEvidenceId: "ev-d1k" });
    expect(indeterminate.eligibility.eligibilityState).toBe("INDETERMINATE");
    expect(() => decide(indeterminate)).toThrow("POSITIVE_DECISION_REQUIRES_ELIGIBLE");
    const stale = ready([
      { evidenceId: "ev-validation", revision: "rev-1", sourceFingerprint: "fp-wrong", authority: "EVIDENCE_PRODUCER", validationState: "SATISFIED" },
      { evidenceId: "ev-review", revision: "rev-1", sourceFingerprint: "fp-review", authority: "ENGINEER_REVIEWER", reviewState: "SATISFIED" },
      { evidenceId: "ev-conformance", revision: "rev-1", sourceFingerprint: "fp-conformance", authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" },
    ]);
    expect(stale.eligibility.eligibilityState).toBe("STALE");
    expect(() => decide(stale)).toThrow("POSITIVE_DECISION_REQUIRES_ELIGIBLE");
    const ineligibleEnv = ready();
    const ineligible = { ...ineligibleEnv.eligibility, eligibilityResultId: "eligibility-ineligible", eligibilityState: "INELIGIBLE" as const };
    ineligible.resultFingerprint = fingerprintStoredEligibilityResult(ineligible);
    ineligibleEnv.results.results.push(ineligible);
    expect(() => decide(ineligibleEnv, { eligibilityResultId: ineligible.eligibilityResultId, expectedEligibilityFingerprint: ineligible.resultFingerprint })).toThrow("POSITIVE_DECISION_REQUIRES_ELIGIBLE");
    expect(() => decide(ready(), { expectedEligibilityFingerprint: "latest eligibility result" })).toThrow("FLOATING_ELIGIBILITY_REJECTED");
    expect(() => decide(ready(), { claimId: "missing-claim" })).toThrow("R1_MANIFEST_REQUIRED");
    expect(() => decide(ready(), { eligibilityResultId: "missing-result" })).toThrow("R2_ELIGIBILITY_REQUIRED");
    expect(D1L_R4_POSITIVE_DECISION_REQUIRES_ELIGIBLE).toBe(true);
    expect(D1L_R4_STALE_ELIGIBILITY_CAN_SUPPORT_POSITIVE_DECISION).toBe(false);
  });

  it("rejects waivers, injection, spoofing, repointing, issuance, and invalidation", () => {
    const env = ready();
    expect(() => decide(env, { waiveHardBlocker: true })).toThrow("CERTIFICATION_OVERRIDE_REJECTED");
    expect(() => decide(env, { overrideEligibility: true })).toThrow("CERTIFICATION_OVERRIDE_REJECTED");
    expect(() => decide(env, { certified: true })).toThrow("CERTIFICATION_OVERRIDE_REJECTED");
    expect(() => decide(env, { forceCertified: true })).toThrow("CERTIFICATION_OVERRIDE_REJECTED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "admin-1", ...scope, authority: "ADMINISTRATOR" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2", waiveHardBlocker: true })).toThrow("CERTIFICATION_OVERRIDE_REJECTED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "AI_ASSISTANT", ...scope, authority: "AI" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2", ignoreBlockers: true })).toThrow("CERTIFICATION_OVERRIDE_REJECTED");
    expect(() => decide(env, { claimedActorId: "other-certifier" })).toThrow("AUTHORITY_SPOOFING_REJECTED");
    expect(() => decide(env, { authorityId: "auth-other" })).toThrow("AUTHORITY_SPOOFING_REJECTED");
    expect(() => decide(env, { authorityFingerprint: "forged" })).toThrow("AUTHORITY_FINGERPRINT_MISMATCH");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "system-1", ...scope, authority: "SYSTEM" }, { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" })).toThrow("UNAUTHORIZED");
    expect(() => repointCertificationDecision()).toThrow("SILENT_DECISION_REPOINTING_REJECTED");
    expect(() => invalidateCertificationDecision()).toThrow("DECISION_INVALIDATION_NOT_IN_R4");
    expect(() => issueCertificationCertificate()).toThrow("CERTIFICATE_ISSUANCE_NOT_IN_R4");
    const tampered = ready();
    tampered.eligibility.eligibilityState = "BLOCKED";
    expect(() => decide(tampered)).toThrow("ELIGIBILITY_INTEGRITY_REJECTED");
    expect(D1L_R4_AUTHORITY_CAN_OVERRIDE_HARD_BLOCKER).toBe(false);
    expect(D1L_R4_ADMIN_CAN_OVERRIDE_HARD_BLOCKER).toBe(false);
    expect(D1L_R4_AI_CAN_WAIVE_HARD_BLOCKER).toBe(false);
    expect(D1L_R4_GENERIC_OVERRIDE_IMPLEMENTED).toBe(false);
    expect(D1L_R4_DIRECT_CERTIFIED_INJECTION_ALLOWED).toBe(false);
    expect(D1L_R4_SYSTEM_CAN_AUTO_CERTIFY).toBe(false);
    expect(D1L_R4_SILENT_REPOINTING_ALLOWED).toBe(false);
    expect(D1L_R4_REFERENCE_AUTO_UPGRADED).toBe(false);
  });

  it("preserves history and does not mutate the claim, manifest, eligibility result, or profile", () => {
    const env = ready();
    const manifestBefore = fingerprintCanonical(env.manifest);
    const eligibilityBefore = fingerprintCanonical(env.eligibility);
    const profileBefore = fingerprintCanonical(env.profileStore.standards);
    const decision = decide(env);
    expect(fingerprintCanonical(env.manifest)).toBe(manifestBefore);
    expect(fingerprintCanonical(env.eligibility)).toBe(eligibilityBefore);
    expect(fingerprintCanonical(env.profileStore.standards)).toBe(profileBefore);
    expect(env.claims.records[0]?.claimFingerprint).toBe(env.manifest.claimFingerprint);
    expect(env.eligibility.recordStatus).toBe("CURRENT");
    const successor = supersedeCertificationAuthority(env.decisions, certifier(), "auth-1", { authorityId: "auth-2", ...scope, claimTypes: ["DESIGN_CHECK_CLAIM"], claimScopes: ["CHECK"], standardProfileId: "std-1", jurisdictionProfileId: "jur-1", version: "2", evidenceRef: "auth-evidence-2", provenanceRef: "prov-auth-2", validUntil: null });
    expect(env.decisions.authorities.find((row) => row.authorityId === "auth-1")?.fingerprint).toBe(decision.certificationAuthorityFingerprint);
    expect(successor.authorityId).toBe("auth-2");
    expect(decision.certificationAuthorityIdentity).toBe("auth-1");
    expect(env.decisions.history.some((row) => row.recordId === decision.decisionId && row.action === "RECORDED")).toBe(true);
    expect(D1L_R4_CAN_MUTATE_R1_CLAIM).toBe(false);
    expect(D1L_R4_CAN_MUTATE_R1_MANIFEST).toBe(false);
    expect(D1L_R4_CAN_MUTATE_R2_RESULT).toBe(false);
    expect(D1L_R4_CAN_MUTATE_R3_PROFILE).toBe(false);
    expect(D1L_R4_CAN_MUTATE_R3_REQUIREMENT_SET).toBe(false);
    expect(decision.digitalThreadRefs).toEqual(["claim-1", "manifest-1", decision.eligibilityResultId, "auth-1"]);
  });

  it("does not issue a certificate, certify the pack, or start later runtimes", () => {
    const decision = decide();
    expect(decision.externalCertificateIssued).toBe(false);
    expect(decision).not.toHaveProperty("certificateNumber");
    expect(D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1L_R4_DECISION_EQUALS_EXTERNAL_CERTIFICATE).toBe(false);
    expect(D1L_R4_PARTIAL_DECISION_EQUALS_GLOBAL_CERTIFICATION).toBe(false);
    expect(D1L_R4_ONE_CLAIM_EQUALS_PACK_CERTIFIED).toBe(false);
    expect(D1L_R4_DECISION_EQUALS_PRODUCT_RELEASE).toBe(false);
    expect(D1L_R4_DECISION_EQUALS_PRODUCT_GA).toBe(false);
    expect(D1L_R4_ISSUANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_REVOCATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_INVALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_NEW_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_NEW_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1L_R4_CODE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_D9_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R4_D1M_ABSORBED).toBe(false);
    expect(D1L_R4_D1N_ABSORBED).toBe(false);
    expect(D1L_R4_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1L_R4_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1L_R4_CERTIFICATION_RUNTIME_READY).toBe(false);
    expect(D1L_R4_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1L_R4_CERTIFICATION_AUTHORITY_READY).toBe(true);
    expect(D1L_R4_AUTHORITY_RUNTIME_COUNT).toBe(1);
    expect(D1L_R4_AUTHORITY_CHECK_RUNTIME_COUNT).toBe(1);
    expect(D1L_R4_DECISION_RUNTIME_COUNT).toBe(1);
    expect(D1L_R4_DECISION_RECORD_RUNTIME_COUNT).toBe(1);
    expect(D1L_R4_R2_ELIGIBILITY_ENGINE_REUSED).toBe(true);
    expect(D1L_R4_PARALLEL_ELIGIBILITY_ENGINE_CREATED).toBe(false);
    expect(D1L_R4_R3_PROFILE_GOVERNANCE_REUSED).toBe(true);
    expect(D1L_R4_PARALLEL_PROFILE_SYSTEM_CREATED).toBe(false);
    expect(D1L_R4_D1G_CERTIFICATION_BLOCKER_PRESERVED).toBe(true);
    expect(D1L_R4_D1K_HANDOFF_REUSES_D1K).toBe(true);
    expect(D1L_R4_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1L_R4_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1L_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1L_R4_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1L_R4_PARALLEL_THREAD_CREATED).toBe(false);
    expect(D1L_R4_AI_CAN_GRANT_CERTIFICATION).toBe(false);
    expect(D1L_R4_AI_CAN_MARK_CERTIFIED).toBe(false);
    expect(D1L_R4_AI_CAN_RECORD_DECISION).toBe(false);
    expect(D1L_R4_AI_CAN_IMPERSONATE_AUTHORITY).toBe(false);
    expect(D1L_R5_CANONICAL_PHASE).toBe("EOS-D1L-R5-EVIDENCE-INVALIDATION-SUPERSESSION");
    expect(D1L_R5_CANONICAL_SCOPE).toContain("historical certification decisions");
    expect(evaluateCertificationEligibility).toBeTypeOf("function");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1L.R4.CERTIFICATION_AUTHORITY_DECISION_RECORD");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
    const source = readFileSync(join(root, "certification-decision.ts"), "utf8");
    expect(source).not.toContain(["from", '"@rtb/engineering-review"'].join(" "));
    expect(scanAnalysisFormulaBypass(join(root, "certification-decision.ts"), source)).toEqual([]);
    const closeout = readFileSync(join(root, "../../../../docs/architecture/engineering-os/EOS_D1L_R4_CERTIFICATION_AUTHORITY_DECISION_RECORD_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(root, "closeout.md"), closeout)).toEqual([]);
  });
});
