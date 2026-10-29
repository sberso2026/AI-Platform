import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { type D1lR1Catalog, type D1lR1ClaimInput, type D1lR1Evidence, createD1lR1Store, recordCertificationClaimManifest } from "./certification-claim-manifest";
import { type D1lR2LedgerRow, createD1lR2Store, evaluateCertificationEligibility } from "./certification-eligibility";
import { createD1lR4Store, recordCertificationDecision, registerCertificationAuthority, supersedeCertificationAuthority } from "./certification-decision";
import {
  D1L_R5_ADMIN_CAN_REACTIVATE,
  D1L_R5_AI_CAN_REACTIVATE,
  D1L_R5_AI_CAN_RECERTIFY,
  D1L_R5_AI_CAN_WAIVE_REEVALUATION,
  D1L_R5_CAN_MUTATE_R1_MANIFEST,
  D1L_R5_CAN_MUTATE_R2_RESULT,
  D1L_R5_CAN_MUTATE_R3_PROFILE,
  D1L_R5_CAN_MUTATE_R4_DECISION,
  D1L_R5_CANONICAL_DIGITAL_THREAD_REUSED,
  D1L_R5_CANONICAL_FINGERPRINT_REUSED,
  D1L_R5_CERTIFICATION_AUTHORITY_READY,
  D1L_R5_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1L_R5_CERTIFICATION_RUNTIME_READY,
  D1L_R5_CODE_CALCULATION_RUNTIME_COUNT,
  D1L_R5_CURRENTNESS_RUNTIME_COUNT,
  D1L_R5_D1G_CERTIFICATION_BLOCKER_PRESERVED,
  D1L_R5_D1K_CHANGE_REUSES_D1K,
  D1L_R5_D1M_ABSORBED,
  D1L_R5_D1N_ABSORBED,
  D1L_R5_D2_D8_RUNTIME_COUNT,
  D1L_R5_D9_RUNTIME_COUNT,
  D1L_R5_DATABASE_SCHEMA_CHANGED,
  D1L_R5_DECISION_STALENESS_RUNTIME_COUNT,
  D1L_R5_ELIGIBILITY_STALENESS_RUNTIME_COUNT,
  D1L_R5_EXTERNAL_REVOCATION_RUNTIME_COUNT,
  D1L_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1L_R5_HISTORICAL_DECISION_CAN_BE_REWRITTEN,
  D1L_R5_INVALIDATION_EQUALS_EXTERNAL_REVOCATION,
  D1L_R5_INVALIDATION_RUNTIME_COUNT,
  D1L_R5_ISSUANCE_RUNTIME_COUNT,
  D1L_R5_MANIFEST_CHANGE_REQUIRES_REEVALUATION,
  D1L_R5_MAPPING_CHANGE_REQUIRES_REEVALUATION,
  D1L_R5_NEW_CONFORMANCE_RUNTIME_COUNT,
  D1L_R5_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT,
  D1L_R5_NEW_ENGINEERING_FORMULA_COUNT,
  D1L_R5_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT,
  D1L_R5_NEW_SOLVER_RUNTIME_COUNT,
  D1L_R5_PARALLEL_RECERTIFICATION_ENGINE_CREATED,
  D1L_R5_PARALLEL_REEVALUATION_ENGINE_CREATED,
  D1L_R5_PARALLEL_THREAD_CREATED,
  D1L_R5_R2_REUSED,
  D1L_R5_R4_REUSED,
  D1L_R5_REEVALUATION_RUNTIME_COUNT,
  D1L_R5_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1L_R5_SILENT_REPOINTING_ALLOWED,
  D1L_R5_STALE_D1K_LEAVES_DECISION_CURRENT,
  D1L_R5_STRUCTURAL_PACK_COMPLETE,
  D1L_R5_SUPERSESSION_AUTO_CERTIFIES,
  D1L_R5_SUPERSESSION_RUNTIME_COUNT,
  D1L_R6_CANONICAL_PHASE,
  D1L_R6_CANONICAL_SCOPE,
  assessDecisionCurrentness,
  assessEligibilityCurrentness,
  createD1lR5Store,
  detectCertificationChanges,
  reactivateCertificationDecision,
  recordCertificationInvalidation,
  recordCertificationSupersession,
  recordReevaluationRequirement,
  repointCertificationSupersession,
  revokeExternalCertificate,
} from "./certification-lifecycle";
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
    standards: [
      { ...scope, profileId: "std-1", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2016", amendment: "A1", version: "2016-A1", fingerprint: "fp-std" },
      { ...scope, profileId: "std-2", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2020", amendment: "", version: "2020", fingerprint: "fp-std-2" },
    ],
    jurisdictions: [
      { ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur" },
      { ...scope, profileId: "jur-2", jurisdictionId: "eu-eea", version: "jur-2025.1", fingerprint: "fp-jur-2" },
    ],
    consequenceProfiles: [],
    evidence: [
      evidence(),
      evidence({ evidenceId: "ev-design-2", sourceFingerprint: "fp-design-2", provenanceRef: "prov-design-2" }),
      evidence({ evidenceId: "ev-validation", slot: "validation", category: "VALIDATION_EVIDENCE", sourceFingerprint: "fp-validation", provenanceRef: "prov-validation" }),
      evidence({ evidenceId: "ev-validation-2", slot: "validation", category: "VALIDATION_EVIDENCE", sourceFingerprint: "fp-validation-2", provenanceRef: "prov-validation-2" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", sourceFingerprint: "fp-review", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-review-2", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", sourceFingerprint: "fp-review-2", provenanceRef: "prov-review-2" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", sourceFingerprint: "fp-conformance", provenanceRef: "prov-conf" }),
      evidence({ evidenceId: "ev-conformance-2", slot: "conformance", category: "CONFORMANCE_EVIDENCE", sourceFingerprint: "fp-conformance-2", provenanceRef: "prov-conf-2" }),
      evidence({ evidenceId: "ev-solver", slot: "solver", category: "SOLVER_QUALIFICATION_EVIDENCE", sourceKind: "solver_output", sourceFingerprint: "fp-solver", solverQualificationState: "NOT_CERTIFIED", provenanceRef: "prov-solver" }),
      evidence({ evidenceId: "ev-d1k", slot: "crossDiscipline", category: "CROSS_DISCIPLINE_EVIDENCE", sourceKind: "model", sourceFingerprint: "fp-d1k", provenanceRef: "prov-d1k", d1k: { interfaceId: "iface-1", sourceRevision: "src-rev-1", r1Fingerprint: "fp-r1", r2Fingerprint: "fp-r2", r3EvidenceId: "r3-1", r4EvidenceId: "r4-1" } }),
      evidence({ evidenceId: "ev-d1k-2", slot: "crossDiscipline", category: "CROSS_DISCIPLINE_EVIDENCE", sourceKind: "model", sourceFingerprint: "fp-d1k-2", provenanceRef: "prov-d1k-2", stale: true, d1k: { interfaceId: "iface-1", sourceRevision: "src-rev-2", r1Fingerprint: "fp-r1b", r2Fingerprint: "fp-r2b", r3EvidenceId: "r3-2", r4EvidenceId: "r4-2" } }),
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

function ledger(): D1lR2LedgerRow[] {
  return [
    { evidenceId: "ev-validation", revision: "rev-1", sourceFingerprint: "fp-validation", authority: "EVIDENCE_PRODUCER", validationState: "SATISFIED" },
    { evidenceId: "ev-review", revision: "rev-1", sourceFingerprint: "fp-review", authority: "ENGINEER_REVIEWER", reviewState: "SATISFIED" },
    { evidenceId: "ev-conformance", revision: "rev-1", sourceFingerprint: "fp-conformance", authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" },
  ];
}

function opened() {
  const rows = catalog();
  const claims = createD1lR1Store(rows, () => "2026-10-21T00:00:00.000Z");
  const manifest = recordCertificationClaimManifest(claims, producer(), claim());
  const profileStore = createD1lR3Store(() => "2026-10-21T00:00:00.000Z");
  const governor = { actorId: "governor-1", ...scope, authority: "PROFILE_GOVERNANCE_AUTHORITY" };
  registerStandardProfile(profileStore, governor, rows.standards[0]!, { publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std" });
  registerJurisdictionProfile(profileStore, governor, rows.jurisdictions[0]!, { country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur" });
  registerRequirementSet(profileStore, governor, { requirementSetId: "req-design-check", version: "1", ...scope, claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", mandatory: ["DESIGN_EVIDENCE"], conditional: [], advisory: [], authority: "PROFILE_GOVERNANCE_AUTHORITY", provenanceRef: "prov-req" });
  registerProfileMapping(profileStore, governor, { mappingId: "map-1", version: "1", ...scope, standardProfileId: "std-1", jurisdictionProfileId: "jur-1", claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", requirementSetId: "req-design-check", authority: "PROFILE_GOVERNANCE_AUTHORITY", provenanceRef: "prov-map" });
  const results = createD1lR2Store(() => "2026-10-21T00:00:00.000Z");
  const eligibility = evaluateUnderGovernedProfile(profileStore, claims, results, producer(), manifest, ledger());
  const decisions = createD1lR4Store(() => "2026-10-21T00:00:00.000Z");
  registerCertificationAuthority(decisions, certifier(), { authorityId: "auth-1", actorId: "certifier-1", ...scope, claimTypes: ["DESIGN_CHECK_CLAIM"], claimScopes: ["CHECK", "MEMBER"], standardProfileId: "std-1", jurisdictionProfileId: "jur-1", version: "1", evidenceRef: "auth-evidence-1", provenanceRef: "prov-auth", validUntil: null });
  const decision = recordCertificationDecision(decisions, claims, results, profileStore, certifier(), { claimId: manifest.claimId, manifestId: manifest.manifestId, eligibilityResultId: eligibility.eligibilityResultId, expectedEligibilityFingerprint: eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" });
  const lifecycle = createD1lR5Store(() => "2026-10-21T00:00:00.000Z");
  return { rows, claims, manifest, profileStore, results, eligibility, decisions, decision, lifecycle };
}

function succeed(env: ReturnType<typeof opened>, overrides: Partial<D1lR1ClaimInput>) {
  const next = env.claims.records.length + 1;
  return recordCertificationClaimManifest(env.claims, producer(), claim({ claimId: `claim-${next}`, manifestId: `manifest-${next}`, predecessorManifestId: env.claims.records.find((row) => row.recordStatus === "CURRENT")?.manifestId, ...overrides }));
}

describe("EOS-D1L-R5 evidence invalidation and supersession", () => {
  it("keeps a matching decision current and does not rewrite it", () => {
    const env = opened();
    const before = fingerprintCanonical(env.decision);
    const current = assessDecisionCurrentness(env.claims, env.results, env.decisions, env.lifecycle, producer(), env.decision.decisionId);
    expect(current.currentness).toBe("CURRENT");
    expect(current.reevaluationRequired).toBe(false);
    expect(current.historicalDecision).toBe("CERTIFIED");
    expect(env.decision.decision).toBe("CERTIFIED");
    expect(fingerprintCanonical(env.decision)).toBe(before);
    expect(env.eligibility.eligibilityState).toBe("ELIGIBLE");
  });

  it("detects governed dependency changes and requires reevaluation", () => {
    const design = opened();
    succeed(design, { designEvidenceId: "ev-design-2" });
    expect(detectCertificationChanges(design.claims, design.results, design.decision)).toEqual(expect.arrayContaining(["MANIFEST_CHANGED", "EVIDENCE_CHANGED"]));
    const validation = opened();
    succeed(validation, { validationEvidenceId: "ev-validation-2" });
    expect(detectCertificationChanges(validation.claims, validation.results, validation.decision)).toContain("VALIDATION_CHANGED");
    const review = opened();
    succeed(review, { engineerReviewEvidenceId: "ev-review-2" });
    expect(detectCertificationChanges(review.claims, review.results, review.decision)).toContain("REVIEW_CHANGED");
    const conformance = opened();
    succeed(conformance, { conformanceEvidenceId: "ev-conformance-2" });
    expect(detectCertificationChanges(conformance.claims, conformance.results, conformance.decision)).toContain("CONFORMANCE_CHANGED");
    const solver = opened();
    succeed(solver, { solverQualificationEvidenceId: "ev-solver" });
    expect(detectCertificationChanges(solver.claims, solver.results, solver.decision)).toContain("SOLVER_QUALIFICATION_CHANGED");
    const d1k = opened();
    succeed(d1k, { crossDisciplineDependency: true, crossDisciplineEvidenceId: "ev-d1k-2" });
    const d1kReasons = detectCertificationChanges(d1k.claims, d1k.results, d1k.decision);
    expect(d1kReasons).toEqual(expect.arrayContaining(["D1K_CHANGED", "D1K_STALE"]));
    expect(assessDecisionCurrentness(d1k.claims, d1k.results, d1k.decisions, d1k.lifecycle, producer(), d1k.decision.decisionId).currentness).not.toBe("CURRENT");
    const standard = opened();
    succeed(standard, { standardProfileId: "std-2" });
    expect(detectCertificationChanges(standard.claims, standard.results, standard.decision)).toContain("STANDARD_PROFILE_CHANGED");
    const jurisdiction = opened();
    succeed(jurisdiction, { jurisdictionProfileId: "jur-2" });
    expect(detectCertificationChanges(jurisdiction.claims, jurisdiction.results, jurisdiction.decision)).toContain("JURISDICTION_PROFILE_CHANGED");
    const scopeChange = opened();
    succeed(scopeChange, { claimScope: "MEMBER" });
    expect(detectCertificationChanges(scopeChange.claims, scopeChange.results, scopeChange.decision)).toContain("CLAIM_CHANGED");
    const mapped = opened();
    const successor = succeed(mapped, { designEvidenceId: "ev-design-2" });
    mapped.results.results.push({ ...mapped.eligibility, eligibilityResultId: "eligibility-next", manifestId: successor.manifestId, requirementSetFingerprint: "fp-req-2", mappingFingerprint: "fp-map-2", recordStatus: "CURRENT" });
    expect(detectCertificationChanges(mapped.claims, mapped.results, mapped.decision)).toEqual(expect.arrayContaining(["REQUIREMENT_SET_CHANGED", "MAPPING_CHANGED"]));
    expect(D1L_R5_MANIFEST_CHANGE_REQUIRES_REEVALUATION).toBe(true);
    expect(D1L_R5_MAPPING_CHANGE_REQUIRES_REEVALUATION).toBe(true);
    expect(D1L_R5_STALE_D1K_LEAVES_DECISION_CURRENT).toBe(false);
    expect(D1L_R5_D1K_CHANGE_REUSES_D1K).toBe(true);
  });

  it("invalidates current reliance without changing the historical decision", () => {
    const env = opened();
    const successor = succeed(env, { designEvidenceId: "ev-design-2" });
    const decisionBefore = fingerprintCanonical(env.decision);
    const eligibilityBefore = fingerprintCanonical(env.eligibility);
    const manifestBefore = fingerprintCanonical(env.manifest);
    const profileBefore = fingerprintCanonical(env.profileStore.standards);
    const stale = assessEligibilityCurrentness(env.claims, env.results, env.decision);
    expect(stale.currentness).toBe("STALE");
    expect(env.eligibility.eligibilityState).toBe("ELIGIBLE");
    const event = recordCertificationInvalidation(env.claims, env.results, env.decisions, env.lifecycle, producer(), { decisionId: env.decision.decisionId, provenanceRef: "prov-invalidation" });
    expect(event.reason).toBe("CLAIM_CHANGED");
    expect(event.currentness).toBe("INVALIDATED");
    expect(event.eventFingerprint).toBe(fingerprintCanonical({ claimId: event.claimId, eligibilityResultId: event.eligibilityResultId, decisionId: event.decisionId, reason: event.reason, oldFingerprint: event.oldFingerprint, newFingerprint: event.newFingerprint, provenanceRef: event.provenanceRef, currentness: event.currentness }));
    expect(event.oldFingerprint).toBe(env.decision.manifestFingerprint);
    expect(event.newFingerprint).toBe(successor.manifestFingerprint);
    const current = assessDecisionCurrentness(env.claims, env.results, env.decisions, env.lifecycle, producer(), env.decision.decisionId);
    expect(current.currentness).toBe("INVALIDATED");
    expect(current.historicalDecision).toBe("CERTIFIED");
    expect(env.decision.decision).toBe("CERTIFIED");
    expect(fingerprintCanonical(env.decision)).toBe(decisionBefore);
    expect(fingerprintCanonical(env.eligibility)).toBe(eligibilityBefore);
    expect(fingerprintCanonical(env.manifest)).toBe(manifestBefore);
    expect(fingerprintCanonical(env.profileStore.standards)).toBe(profileBefore);
    expect(() => recordCertificationInvalidation(env.claims, env.results, env.decisions, env.lifecycle, producer(), { decisionId: env.decision.decisionId, provenanceRef: "prov-invalidation", reason: "INVENTED_REASON" })).toThrow("UNKNOWN_INVALIDATION_REASON");
    expect(() => recordCertificationInvalidation(env.claims, env.results, env.decisions, env.lifecycle, { actorId: "AI_ASSISTANT", ...scope, authority: "AI" }, { decisionId: env.decision.decisionId, provenanceRef: "prov-invalidation" })).toThrow("AI_INVALIDATION_REJECTED");
    const requirement = recordReevaluationRequirement(env.claims, env.results, env.decisions, env.lifecycle, producer(), { decisionId: env.decision.decisionId, provenanceRef: "prov-reevaluation" });
    expect(requirement.evaluator).toBe("R2");
    expect(requirement.reasons).toContain("MANIFEST_CHANGED");
    expect(env.results.results.some((row) => row.manifestId === successor.manifestId && row.eligibilityState === "ELIGIBLE")).toBe(false);
  });

  it("records supersession lineage without certifying the successor", () => {
    const env = opened();
    const successor = succeed(env, { designEvidenceId: "ev-design-2" });
    const link = recordCertificationSupersession(env.claims, env.decisions, env.lifecycle, producer(), { predecessorDecisionId: env.decision.decisionId, successorManifestId: successor.manifestId });
    expect(link.autoCertified).toBe(false);
    expect(link.successorDecisionId).toBeNull();
    expect(link.lineage).toContain(env.decision.decisionId);
    expect(link.lineage).toContain(successor.manifestId);
    expect(env.decision.decision).toBe("CERTIFIED");
    expect(assessDecisionCurrentness(env.claims, env.results, env.decisions, env.lifecycle, producer(), env.decision.decisionId).currentness).toBe("SUPERSEDED");
    expect(() => recordCertificationSupersession(env.claims, env.decisions, env.lifecycle, producer(), { predecessorDecisionId: env.decision.decisionId, successorManifestId: successor.manifestId, autoCertify: true })).toThrow("SUPERSESSION_AUTO_CERTIFICATION_REJECTED");
    const other = recordCertificationClaimManifest(env.claims, producer(), claim({ claimId: "claim-unrelated", manifestId: "manifest-unrelated" }));
    expect(() => recordCertificationSupersession(env.claims, env.decisions, env.lifecycle, producer(), { predecessorDecisionId: env.decision.decisionId, successorManifestId: other.manifestId })).toThrow("SUPERSESSION_SPOOFING_REJECTED");
    expect(() => recordCertificationSupersession(env.claims, env.decisions, env.lifecycle, { ...producer(), workspaceId: "workspace-b" }, { predecessorDecisionId: env.decision.decisionId, successorManifestId: successor.manifestId })).toThrow("CROSS_PROJECT_OPERATION");
    expect(D1L_R5_SUPERSESSION_AUTO_CERTIFIES).toBe(false);
  });

  it("preserves authority history and rejects reactivation", () => {
    const env = opened();
    const authorityFingerprint = env.decision.certificationAuthorityFingerprint;
    supersedeCertificationAuthority(env.decisions, certifier(), "auth-1", { authorityId: "auth-2", ...scope, claimTypes: ["DESIGN_CHECK_CLAIM"], claimScopes: ["CHECK", "MEMBER"], standardProfileId: "std-1", jurisdictionProfileId: "jur-1", version: "2", evidenceRef: "auth-evidence-2", provenanceRef: "prov-auth-2", validUntil: null });
    expect(env.decision.certificationAuthorityFingerprint).toBe(authorityFingerprint);
    expect(env.decision.decision).toBe("CERTIFIED");
    expect(assessDecisionCurrentness(env.claims, env.results, env.decisions, env.lifecycle, producer(), env.decision.decisionId).currentness).toBe("CURRENT");
    expect(() => reactivateCertificationDecision()).toThrow("REACTIVATION_REJECTED");
    expect(() => recordCertificationInvalidation(env.claims, env.results, env.decisions, env.lifecycle, producer(), { decisionId: env.decision.decisionId, provenanceRef: "prov-invalidation", markCurrent: true })).toThrow("REACTIVATION_REJECTED");
    expect(() => recordCertificationInvalidation(env.claims, env.results, env.decisions, env.lifecycle, { actorId: "admin-1", ...scope, authority: "ADMINISTRATOR" }, { decisionId: env.decision.decisionId, provenanceRef: "prov-invalidation", clearInvalidation: true })).toThrow("REACTIVATION_REJECTED");
    expect(() => recordReevaluationRequirement(env.claims, env.results, env.decisions, env.lifecycle, { actorId: "AI_ASSISTANT", ...scope, authority: "AI" }, { decisionId: env.decision.decisionId, provenanceRef: "prov-reevaluation", waive: true })).toThrow("REEVALUATION_WAIVER_REJECTED");
    expect(() => repointCertificationSupersession()).toThrow("SILENT_SUPERSESSION_REPOINTING_REJECTED");
    expect(() => revokeExternalCertificate()).toThrow("EXTERNAL_REVOCATION_NOT_IN_R5");
    expect(evaluateCertificationEligibility).toBeTypeOf("function");
    expect(recordCertificationDecision).toBeTypeOf("function");
  });

  it("does not issue, revoke, or complete the structural pack", () => {
    expect(D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1L_R5_HISTORICAL_DECISION_CAN_BE_REWRITTEN).toBe(false);
    expect(D1L_R5_CAN_MUTATE_R4_DECISION).toBe(false);
    expect(D1L_R5_CAN_MUTATE_R2_RESULT).toBe(false);
    expect(D1L_R5_CAN_MUTATE_R1_MANIFEST).toBe(false);
    expect(D1L_R5_CAN_MUTATE_R3_PROFILE).toBe(false);
    expect(D1L_R5_INVALIDATION_EQUALS_EXTERNAL_REVOCATION).toBe(false);
    expect(D1L_R5_EXTERNAL_REVOCATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_ISSUANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_ELIGIBILITY_STALENESS_RUNTIME_COUNT).toBe(1);
    expect(D1L_R5_DECISION_STALENESS_RUNTIME_COUNT).toBe(1);
    expect(D1L_R5_CURRENTNESS_RUNTIME_COUNT).toBe(1);
    expect(D1L_R5_INVALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D1L_R5_SUPERSESSION_RUNTIME_COUNT).toBe(1);
    expect(D1L_R5_REEVALUATION_RUNTIME_COUNT).toBe(1);
    expect(D1L_R5_R2_REUSED).toBe(true);
    expect(D1L_R5_PARALLEL_REEVALUATION_ENGINE_CREATED).toBe(false);
    expect(D1L_R5_R4_REUSED).toBe(true);
    expect(D1L_R5_PARALLEL_RECERTIFICATION_ENGINE_CREATED).toBe(false);
    expect(D1L_R5_ADMIN_CAN_REACTIVATE).toBe(false);
    expect(D1L_R5_AI_CAN_WAIVE_REEVALUATION).toBe(false);
    expect(D1L_R5_AI_CAN_REACTIVATE).toBe(false);
    expect(D1L_R5_AI_CAN_RECERTIFY).toBe(false);
    expect(D1L_R5_SILENT_REPOINTING_ALLOWED).toBe(false);
    expect(D1L_R5_NEW_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_NEW_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1L_R5_CODE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_D9_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R5_D1M_ABSORBED).toBe(false);
    expect(D1L_R5_D1N_ABSORBED).toBe(false);
    expect(D1L_R5_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1L_R5_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1L_R5_CERTIFICATION_RUNTIME_READY).toBe(false);
    expect(D1L_R5_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1L_R5_CERTIFICATION_AUTHORITY_READY).toBe(true);
    expect(D1L_R5_D1G_CERTIFICATION_BLOCKER_PRESERVED).toBe(true);
    expect(D1L_R5_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1L_R5_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1L_R5_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1L_R5_PARALLEL_THREAD_CREATED).toBe(false);
    expect(D1L_R6_CANONICAL_PHASE).toBe("EOS-D1L-R6-STRUCTURAL-GLOBAL-CERTIFICATION-GATE-CLOSEOUT");
    expect(D1L_R6_CANONICAL_SCOPE).toContain("unresolved engineering debt");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1L.R5.EVIDENCE_INVALIDATION_SUPERSESSION");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
    const source = readFileSync(join(root, "certification-lifecycle.ts"), "utf8");
    expect(source).not.toContain(["from", '"@rtb/engineering-review"'].join(" "));
    expect(scanAnalysisFormulaBypass(join(root, "certification-lifecycle.ts"), source)).toEqual([]);
    const closeout = readFileSync(join(root, "../../../../docs/architecture/engineering-os/EOS_D1L_R5_EVIDENCE_INVALIDATION_SUPERSESSION_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(root, "closeout.md"), closeout)).toEqual([]);
  });
});
