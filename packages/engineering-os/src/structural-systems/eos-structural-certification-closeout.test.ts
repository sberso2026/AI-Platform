import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D1L_0_ARCHITECTURE_READY,
  D1L_0_C10_DEBT_CLASSIFICATION,
  D1L_0_CERTIFICATION_AUTHORITY_READY,
  D1L_0_CERTIFICATION_CONFIDENCE_SCORE_IMPLEMENTED,
  D1L_0_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1L_0_CERTIFICATION_RUNTIME_READY,
  D1L_0_D1F_DEBT_CLASSIFICATION,
  D1L_0_D1G_CERTIFIED_SOLVER_BLOCKER,
  D1L_0_D1G_CONFORMANCE_BLOCKER,
  D1L_0_D1G_ENGINEER_VALIDATION_BLOCKER,
  D1L_0_D1G_LIVE_VALIDATION_BLOCKER,
  D1L_0_D1H_DEBT_CLASSIFICATION,
  D1L_0_D1I_DEBT_CLASSIFICATION,
  D1L_0_D1J_DEBT_CLASSIFICATION,
  D1L_0_ELIGIBILITY_MODEL_READY,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { type D1lR1Catalog, type D1lR1ClaimInput, type D1lR1Evidence, createD1lR1Store, recordCertificationClaimManifest } from "./certification-claim-manifest";
import { type D1lR2LedgerRow, createD1lR2Store, evaluateCertificationEligibility } from "./certification-eligibility";
import { createD1lR4Store, issueCertificationCertificate, recordCertificationDecision, registerCertificationAuthority } from "./certification-decision";
import {
  D1L_R6_ADMIN_CAN_OVERRIDE_HARD_BLOCKER,
  D1L_R6_ADMIN_CAN_REACTIVATE,
  D1L_R6_ADMIN_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R6_AI_CAN_GRANT_CERTIFICATION,
  D1L_R6_AI_CAN_MARK_CERTIFIED,
  D1L_R6_AI_CAN_REACTIVATE,
  D1L_R6_AI_CAN_RECERTIFY,
  D1L_R6_AI_CAN_REWRITE_HISTORY,
  D1L_R6_AI_CAN_WAIVE_HARD_BLOCKER,
  D1L_R6_AI_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R6_ARCHITECTURE_READY,
  D1L_R6_CANONICAL_DIGITAL_THREAD_REUSED,
  D1L_R6_CANONICAL_FINGERPRINT_REUSED,
  D1L_R6_CANONICAL_NEXT_PHASE,
  D1L_R6_CAPABILITY_MATRIX,
  D1L_R6_CERTIFICATION_AUTHORITY_READY,
  D1L_R6_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1L_R6_CERTIFICATION_RUNTIME_READY,
  D1L_R6_CLAIM_ELIGIBLE_EQUALS_CERTIFIED,
  D1L_R6_CODE_CALCULATION_RUNTIME_COUNT,
  D1L_R6_CONFIDENCE_SCORE_IMPLEMENTED,
  D1L_R6_CONSEQUENCE_CALCULATION_RUNTIME_COUNT,
  D1L_R6_D1G_BLOCKER_PRESERVED,
  D1L_R6_D1K_INTELLIGENCE_READY,
  D1L_R6_D1K_INTERNAL_INTEGRATION_READY,
  D1L_R6_D1M_ABSORBED,
  D1L_R6_D1M_CURRENT_STATUS,
  D1L_R6_D1N_ABSORBED,
  D1L_R6_D1N_CURRENT_STATUS,
  D1L_R6_D2_D8_RUNTIME_COUNT,
  D1L_R6_D9_RUNTIME_COUNT,
  D1L_R6_DATABASE_SCHEMA_CHANGED,
  D1L_R6_DECISION_EQUALS_PRODUCT_GA,
  D1L_R6_ELIGIBILITY_MODEL_READY,
  D1L_R6_ENGINEER_REVIEW_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R6_EXTERNAL_REVOCATION_RUNTIME_COUNT,
  D1L_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1L_R6_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1L_R6_HISTORICAL_ARCHITECTURE_RUNTIME_READY_PRESERVED,
  D1L_R6_HISTORICAL_D1L_STATUS_PRESERVED,
  D1L_R6_HISTORICAL_ELIGIBILITY_MODEL_READY_PRESERVED,
  D1L_R6_HISTORY_END_TO_END_PRESERVED,
  D1L_R6_INVALIDATION_EQUALS_EXTERNAL_REVOCATION,
  D1L_R6_ISSUANCE_RUNTIME_COUNT,
  D1L_R6_LIMITATION_LEDGER,
  D1L_R6_LIMITATION_LEDGER_COMPLETE,
  D1L_R6_MATURITY_STATE,
  D1L_R6_NEW_CONFORMANCE_RUNTIME_COUNT,
  D1L_R6_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT,
  D1L_R6_NEW_ENGINEERING_FORMULA_COUNT,
  D1L_R6_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT,
  D1L_R6_NEW_SOLVER_RUNTIME_COUNT,
  D1L_R6_PARALLEL_DIGITAL_THREAD_CREATED,
  D1L_R6_POSITIVE_DECISION_EQUALS_EXTERNAL_CERTIFICATE,
  D1L_R6_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R6_READY_FOR_NEXT_PHASE,
  D1L_R6_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1L_R6_STRUCTURAL_PACK_COMPLETE,
  D1L_R6_TRACK_COMPLETE,
  D1L_R6_TRACK_COMPLETE_EQUALS_ALL_STRUCTURAL_CLAIMS_CERTIFIED,
  D1L_R6_TRACK_COMPLETE_EQUALS_PACK_COMPLETE,
  D1L_R6_TRACK_STATUS,
  D1L_R6_WEIGHTED_SCORE_IMPLEMENTED,
} from "./certification-gate-closeout";
import {
  assessDecisionCurrentness,
  assessEligibilityCurrentness,
  createD1lR5Store,
  detectCertificationChanges,
  reactivateCertificationDecision,
  recordCertificationInvalidation,
  recordCertificationSupersession,
  recordReevaluationRequirement,
  revokeExternalCertificate,
} from "./certification-lifecycle";
import { createD1lR3Store, evaluateUnderGovernedProfile, registerJurisdictionProfile, registerProfileMapping, registerRequirementSet, registerStandardProfile } from "./certification-profile-governance";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1G_CERTIFIED_SOLVER_STATUS, D1L_CURRENT_STATUS } from "./roadmap-after-twin-closeout";

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
      evidence({ evidenceId: "ev-design-2", sourceFingerprint: "fp-design-2", provenanceRef: "prov-design-2" }),
      evidence({ evidenceId: "ev-validation", slot: "validation", category: "VALIDATION_EVIDENCE", sourceFingerprint: "fp-validation", provenanceRef: "prov-validation" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", sourceFingerprint: "fp-review", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", sourceFingerprint: "fp-conformance", provenanceRef: "prov-conf" }),
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
  registerCertificationAuthority(decisions, certifier(), { authorityId: "auth-1", actorId: "certifier-1", ...scope, claimTypes: ["DESIGN_CHECK_CLAIM"], claimScopes: ["CHECK"], standardProfileId: "std-1", jurisdictionProfileId: "jur-1", version: "1", evidenceRef: "auth-evidence-1", provenanceRef: "prov-auth", validUntil: null });
  return { rows, claims, manifest, profileStore, results, eligibility, decisions };
}

describe("EOS-D1L-R6 structural certification gate closeout", () => {
  it("runs the claim, eligibility, and decision chain without equating eligible to certified", () => {
    const env = opened();
    expect(env.manifest.claimFingerprint).toBeTruthy();
    expect(env.manifest.manifestFingerprint).toBeTruthy();
    expect(env.manifest.standardFingerprint).toBe("fp-std");
    expect(env.manifest.jurisdictionFingerprint).toBe("fp-jur");
    expect(env.eligibility.eligibilityState).toBe("ELIGIBLE");
    expect(env.eligibility.certificationAuthority).toBeNull();
    expect(env.decisions.decisions).toHaveLength(0);
    expect(evaluateCertificationEligibility).toBeTypeOf("function");
    const decisionInput = { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED" as const, decisionScope: "CHECK" as const, decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" };
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, producer(), decisionInput)).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "admin-1", ...scope, authority: "ADMINISTRATOR" }, decisionInput)).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, { actorId: "AI_ASSISTANT", ...scope, authority: "AI" }, decisionInput)).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, certifier(), { ...decisionInput, decisionScope: "MEMBER" })).toThrow("DECISION_SCOPE_EXCEEDS_CLAIM");
    const decision = recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, certifier(), decisionInput);
    expect(decision.decision).toBe("CERTIFIED");
    expect(decision.externalCertificateIssued).toBe(false);
    expect(decision.claimFingerprint).toBe(env.manifest.claimFingerprint);
    expect(decision.manifestFingerprint).toBe(env.manifest.manifestFingerprint);
    expect(decision.eligibilityFingerprint).toBe(env.eligibility.resultFingerprint);
    expect(() => issueCertificationCertificate()).toThrow("CERTIFICATE_ISSUANCE_NOT_IN_R4");
  });

  it("keeps the historical decision when evidence changes and requires the same R2 and R4 path again", () => {
    const env = opened();
    const decision = recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, certifier(), { claimId: env.manifest.claimId, manifestId: env.manifest.manifestId, eligibilityResultId: env.eligibility.eligibilityResultId, expectedEligibilityFingerprint: env.eligibility.resultFingerprint, decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-1", provenanceRef: "prov-decision", aal: "aal2" });
    const decisionFingerprint = fingerprintCanonical(decision);
    const eligibilityFingerprint = fingerprintCanonical(env.eligibility);
    const storedManifestFingerprint = env.manifest.manifestFingerprint;
    const storedDesignFingerprint = env.manifest.designEvidence?.sourceFingerprint;
    const profileFingerprint = fingerprintCanonical(env.profileStore.standards);
    const successor = recordCertificationClaimManifest(env.claims, producer(), claim({ claimId: "claim-2", manifestId: "manifest-2", designEvidenceId: "ev-design-2", predecessorManifestId: env.manifest.manifestId }));
    const lifecycle = createD1lR5Store(() => "2026-10-21T00:00:00.000Z");
    expect(detectCertificationChanges(env.claims, env.results, decision)).toEqual(expect.arrayContaining(["EVIDENCE_CHANGED", "MANIFEST_CHANGED"]));
    expect(assessEligibilityCurrentness(env.claims, env.results, decision).currentness).toBe("STALE");
    expect(env.eligibility.eligibilityState).toBe("ELIGIBLE");
    const event = recordCertificationInvalidation(env.claims, env.results, env.decisions, lifecycle, producer(), { decisionId: decision.decisionId, provenanceRef: "prov-invalidation" });
    expect(event.currentness).toBe("INVALIDATED");
    expect(event.oldFingerprint).toBe(decision.manifestFingerprint);
    expect(event.newFingerprint).toBe(successor.manifestFingerprint);
    const current = assessDecisionCurrentness(env.claims, env.results, env.decisions, lifecycle, producer(), decision.decisionId);
    expect(current.currentness).toBe("INVALIDATED");
    expect(current.historicalDecision).toBe("CERTIFIED");
    expect(current.reevaluationRequired).toBe(true);
    expect(decision.decision).toBe("CERTIFIED");
    expect(fingerprintCanonical(decision)).toBe(decisionFingerprint);
    expect(fingerprintCanonical(env.eligibility)).toBe(eligibilityFingerprint);
    expect(env.manifest.manifestFingerprint).toBe(storedManifestFingerprint);
    expect(env.manifest.designEvidence?.sourceFingerprint).toBe(storedDesignFingerprint);
    expect(env.manifest.recordStatus).toBe("SUPERSEDED");
    expect(fingerprintCanonical(env.profileStore.standards)).toBe(profileFingerprint);
    const link = recordCertificationSupersession(env.claims, env.decisions, lifecycle, producer(), { predecessorDecisionId: decision.decisionId, successorManifestId: successor.manifestId });
    expect(link.lineage).toContain(env.manifest.manifestId);
    expect(link.lineage).toContain(successor.manifestId);
    expect(link.successorDecisionId).toBeNull();
    expect(link.autoCertified).toBe(false);
    const requirement = recordReevaluationRequirement(env.claims, env.results, env.decisions, lifecycle, producer(), { decisionId: decision.decisionId, provenanceRef: "prov-reevaluation" });
    expect(requirement.evaluator).toBe("R2");
    expect(env.results.results.some((row) => row.manifestId === successor.manifestId)).toBe(false);
    expect(() => recordCertificationDecision(env.decisions, env.claims, env.results, env.profileStore, certifier(), { claimId: successor.claimId, manifestId: successor.manifestId, eligibilityResultId: "missing", expectedEligibilityFingerprint: "missing", decision: "CERTIFIED", decisionScope: "CHECK", decisionEvidenceRef: "decision-evidence-2", provenanceRef: "prov-decision-2", aal: "aal2" })).toThrow("R2_ELIGIBILITY_REQUIRED");
    expect(() => recordCertificationSupersession(env.claims, env.decisions, lifecycle, producer(), { predecessorDecisionId: decision.decisionId, successorManifestId: successor.manifestId, autoCertify: true })).toThrow("SUPERSESSION_AUTO_CERTIFICATION_REJECTED");
    expect(() => reactivateCertificationDecision()).toThrow("REACTIVATION_REJECTED");
    expect(() => revokeExternalCertificate()).toThrow("EXTERNAL_REVOCATION_NOT_IN_R5");
    expect(assessDecisionCurrentness(env.claims, env.results, env.decisions, lifecycle, producer(), decision.decisionId).currentness).toBe("SUPERSEDED");
  });

  it("closes the governance track without satisfying eligibility or naming D1M", () => {
    expect(D1L_0_ARCHITECTURE_READY).toBe(true);
    expect(D1L_0_ELIGIBILITY_MODEL_READY).toBe(false);
    expect(D1L_0_CERTIFICATION_RUNTIME_READY).toBe(false);
    expect(D1L_0_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1L_0_CERTIFICATION_AUTHORITY_READY).toBe(false);
    expect(D1L_CURRENT_STATUS).toBe("NOT_STARTED");
    expect(D1L_R6_HISTORICAL_D1L_STATUS_PRESERVED).toBe("NOT_STARTED");
    expect(D1L_R6_HISTORICAL_ELIGIBILITY_MODEL_READY_PRESERVED).toBe(false);
    expect(D1L_R6_HISTORICAL_ARCHITECTURE_RUNTIME_READY_PRESERVED).toBe(false);
    expect(D1L_R6_TRACK_COMPLETE).toBe(true);
    expect(D1L_R6_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1L_R6_MATURITY_STATE).toBe("STRUCTURAL_GLOBAL_CERTIFICATION_GOVERNANCE_BOUNDED_RUNTIME_IMPLEMENTED");
    expect(D1L_R6_ARCHITECTURE_READY).toBe(true);
    expect(D1L_R6_ELIGIBILITY_MODEL_READY).toBe(true);
    expect(D1L_R6_CERTIFICATION_RUNTIME_READY).toBe(true);
    expect(D1L_R6_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1L_R6_CERTIFICATION_AUTHORITY_READY).toBe(true);
    expect(D1L_R6_TRACK_COMPLETE_EQUALS_ALL_STRUCTURAL_CLAIMS_CERTIFIED).toBe(false);
    expect(D1L_R6_TRACK_COMPLETE_EQUALS_PACK_COMPLETE).toBe(false);
    expect(D1L_R6_CLAIM_ELIGIBLE_EQUALS_CERTIFIED).toBe(false);
    expect(D1L_R6_POSITIVE_DECISION_EQUALS_EXTERNAL_CERTIFICATE).toBe(false);
    expect(D1L_R6_INVALIDATION_EQUALS_EXTERNAL_REVOCATION).toBe(false);
    expect(D1L_R6_DECISION_EQUALS_PRODUCT_GA).toBe(false);
    expect(D1L_R6_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1L_0_D1G_LIVE_VALIDATION_BLOCKER).toBe(true);
    expect(D1L_0_D1G_ENGINEER_VALIDATION_BLOCKER).toBe(true);
    expect(D1L_0_D1G_CONFORMANCE_BLOCKER).toBe(true);
    expect(D1L_0_D1G_CERTIFIED_SOLVER_BLOCKER).toBe(true);
    expect(D1L_0_C10_DEBT_CLASSIFICATION).toContain("not closed");
    expect(D1L_0_D1F_DEBT_CLASSIFICATION).toContain("not closed");
    expect(D1L_0_D1H_DEBT_CLASSIFICATION).toContain("pending");
    expect(D1L_0_D1I_DEBT_CLASSIFICATION).toContain("pending");
    expect(D1L_0_D1J_DEBT_CLASSIFICATION).toContain("NOT_AVAILABLE");
    expect(D1L_R6_D1K_INTERNAL_INTEGRATION_READY).toBe(false);
    expect(D1L_R6_D1K_INTELLIGENCE_READY).toBe(false);
    expect(D1L_R6_ISSUANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_EXTERNAL_REVOCATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1L_R6_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
    expect(D1L_R6_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1L_R6_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1L_R6_HISTORY_END_TO_END_PRESERVED).toBe(true);
    expect(D1L_R6_ADMIN_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R6_ADMIN_CAN_OVERRIDE_HARD_BLOCKER).toBe(false);
    expect(D1L_R6_ADMIN_CAN_REACTIVATE).toBe(false);
    expect(D1L_R6_AI_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R6_AI_CAN_GRANT_CERTIFICATION).toBe(false);
    expect(D1L_R6_AI_CAN_MARK_CERTIFIED).toBe(false);
    expect(D1L_R6_AI_CAN_WAIVE_HARD_BLOCKER).toBe(false);
    expect(D1L_R6_AI_CAN_REACTIVATE).toBe(false);
    expect(D1L_R6_AI_CAN_RECERTIFY).toBe(false);
    expect(D1L_R6_AI_CAN_REWRITE_HISTORY).toBe(false);
    expect(D1L_R6_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R6_ENGINEER_REVIEW_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_0_CERTIFICATION_CONFIDENCE_SCORE_IMPLEMENTED).toBe(false);
    expect(D1L_R6_CONFIDENCE_SCORE_IMPLEMENTED).toBe(false);
    expect(D1L_R6_WEIGHTED_SCORE_IMPLEMENTED).toBe(false);
    expect(D1L_R6_NEW_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_NEW_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1L_R6_CODE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_CONSEQUENCE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_D9_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R6_D1M_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1L_R6_D1M_ABSORBED).toBe(false);
    expect(D1L_R6_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1L_R6_D1N_ABSORBED).toBe(false);
    expect(D1L_R6_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1L_R6_LIMITATION_LEDGER_COMPLETE).toBe(true);
    expect(D1L_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1L_R6_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1L_R6_CANONICAL_NEXT_PHASE).toBe("NOT_CANONICALIZED");
    expect(D1L_R6_READY_FOR_NEXT_PHASE).toBe(false);
    expect(D1L_R6_CAPABILITY_MATRIX).toContain("External certificate issuance not implemented");
    expect(D1L_R6_LIMITATION_LEDGER).toContain("D1G certification blockers remain");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1L.R6.STRUCTURAL_GLOBAL_CERTIFICATION_GATE_CLOSEOUT");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
    const source = readFileSync(join(root, "certification-gate-closeout.ts"), "utf8");
    expect(source).not.toContain("from \"@rtb/engineering-review\"");
    expect(scanAnalysisFormulaBypass(join(root, "certification-gate-closeout.ts"), source)).toEqual([]);
    const closeout = readFileSync(join(root, "../../../../docs/architecture/engineering-os/EOS_D1L_R6_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(root, "closeout.md"), closeout)).toEqual([]);
    expect(readFileSync(join(root, "../../../../docs/architecture/engineering-os/EOS_D1L_0_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE.md"), "utf8")).toContain("certification");
  });
});
