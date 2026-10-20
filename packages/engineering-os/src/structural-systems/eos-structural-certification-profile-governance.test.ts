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
  type D1lR1JurisdictionProfile,
  type D1lR1StandardProfile,
  createD1lR1Store,
  recordCertificationClaimManifest,
} from "./certification-claim-manifest";
import { type D1lR2LedgerRow, createD1lR2Store, evaluateCertificationEligibility } from "./certification-eligibility";
import {
  D1L_R3_ADMIN_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R3_ADMIN_EQUALS_PROFILE_AUTHORITY,
  D1L_R3_AI_CAN_CHANGE_SEVERITY,
  D1L_R3_AI_CAN_CREATE_JURISDICTION_PROFILE,
  D1L_R3_AI_CAN_CREATE_STANDARD_PROFILE,
  D1L_R3_AI_CAN_MARK_CERTIFIED,
  D1L_R3_AI_CAN_RESOLVE_CONFLICT,
  D1L_R3_AI_CAN_WAIVE_REQUIREMENT,
  D1L_R3_ARCHITECTURE_READY,
  D1L_R3_AUTOMATIC_PROFILE_CONFLICT_RESOLUTION_COUNT,
  D1L_R3_AUTOMATIC_STANDARD_UPDATE_RUNTIME_COUNT,
  D1L_R3_CALLER_CAN_DISABLE_MANDATORY_REQUIREMENT,
  D1L_R3_CALLER_CAN_DOWNGRADE_REQUIREMENTS,
  D1L_R3_CAN_MUTATE_R1_MANIFEST,
  D1L_R3_CANONICAL_DIGITAL_THREAD_REUSED,
  D1L_R3_CANONICAL_FINGERPRINT_REUSED,
  D1L_R3_CERTIFICATION_AUTHORITY_READY,
  D1L_R3_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1L_R3_CERTIFICATION_RUNTIME_READY,
  D1L_R3_CODE_CALCULATION_RUNTIME_COUNT,
  D1L_R3_CONSEQUENCE_CALCULATION_RUNTIME_COUNT,
  D1L_R3_D1G_CERTIFICATION_BLOCKER_PRESERVED,
  D1L_R3_D1K_HANDOFF_REUSES_D1K,
  D1L_R3_D1M_ABSORBED,
  D1L_R3_D1N_ABSORBED,
  D1L_R3_D2_D8_RUNTIME_COUNT,
  D1L_R3_D9_RUNTIME_COUNT,
  D1L_R3_DATABASE_SCHEMA_CHANGED,
  D1L_R3_DECISION_RUNTIME_COUNT,
  D1L_R3_ELIGIBILITY_MODEL_READY,
  D1L_R3_ELIGIBILITY_RUNTIME_COUNT,
  D1L_R3_FLOATING_JURISDICTION_ALLOWED,
  D1L_R3_FLOATING_STANDARD_ALLOWED,
  D1L_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1L_R3_ISSUANCE_RUNTIME_COUNT,
  D1L_R3_JURISDICTION_AUTO_UPGRADED,
  D1L_R3_JURISDICTION_INFERRED_FROM_IP_LOCATION,
  D1L_R3_JURISDICTION_INFERRED_FROM_USER_LOCATION,
  D1L_R3_JURISDICTION_PIN_REQUIRED,
  D1L_R3_LEGAL_ADJUDICATION_RUNTIME_COUNT,
  D1L_R3_MAPPING_RUNTIME_COUNT,
  D1L_R3_NEW_CONFORMANCE_RUNTIME_COUNT,
  D1L_R3_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT,
  D1L_R3_NEW_ENGINEERING_FORMULA_COUNT,
  D1L_R3_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT,
  D1L_R3_NEW_SOLVER_RUNTIME_COUNT,
  D1L_R3_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1L_R3_PARALLEL_ELIGIBILITY_ENGINE_CREATED,
  D1L_R3_PARALLEL_PROFILE_THREAD_CREATED,
  D1L_R3_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R3_PROFILE_SELECTED_EQUALS_CONFORMANT,
  D1L_R3_PROFILE_SUPERSESSION_PRESERVES_HISTORY,
  D1L_R3_PROJECT_OVERLAY_CAN_WEAKEN_MANDATORY,
  D1L_R3_R2_ELIGIBILITY_ENGINE_REUSED,
  D1L_R3_REEVALUATION_REQUIRED_AFTER_PROFILE_CHANGE,
  D1L_R3_REVOCATION_RUNTIME_COUNT,
  D1L_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1L_R3_STANDARD_AUTO_UPGRADED,
  D1L_R3_STANDARD_FAMILY_EQUALS_LATEST_EDITION,
  D1L_R3_STANDARD_PROFILE_RUNTIME_COUNT,
  D1L_R3_STANDARD_VERSION_PINNING_REQUIRED,
  D1L_R3_STRUCTURAL_PACK_COMPLETE,
  D1L_R3_UNKNOWN_JURISDICTION_AUTO_CREATED,
  D1L_R3_UNKNOWN_MAPPING_USES_GENERIC_FALLBACK,
  D1L_R3_UNKNOWN_STANDARD_AUTO_CREATED,
  D1L_R4_CANONICAL_PHASE,
  D1L_R4_CANONICAL_SCOPE,
  bindGovernedProfile,
  createD1lR3Store,
  evaluateUnderGovernedProfile,
  mutateStandardVersion,
  registerJurisdictionProfile,
  registerProfileMapping,
  registerProjectOverlay,
  registerRequirementSet,
  registerStandardProfile,
  resolveCertificationProfile,
  supersedeStandardProfile,
} from "./certification-profile-governance";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1G_CERTIFIED_SOLVER_STATUS } from "./roadmap-after-twin-closeout";

const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const root = dirname(fileURLToPath(import.meta.url));

function evidence(overrides: Partial<D1lR1Evidence> = {}): D1lR1Evidence {
  return {
    ...scope,
    evidenceId: "ev-design",
    slot: "design",
    category: "SOURCE_ENGINEERING_EVIDENCE",
    sourceKind: "calculation",
    revision: "rev-1",
    sourceFingerprint: "fp-design",
    authority: "EVIDENCE_PRODUCER",
    provenanceRef: "prov-design",
    solverQualificationState: null,
    stale: false,
    upstreamDiagnostic: null,
    d1k: null,
    ...overrides,
  };
}

function standard(overrides: Partial<D1lR1StandardProfile> = {}): D1lR1StandardProfile {
  return { ...scope, profileId: "std-1", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2016", amendment: "A1", version: "2016-A1", fingerprint: "fp-std", ...overrides };
}

function jurisdiction(overrides: Partial<D1lR1JurisdictionProfile> = {}): D1lR1JurisdictionProfile {
  return { ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur", ...overrides };
}

function catalog(): D1lR1Catalog {
  return {
    targets: [{ ...scope, kind: "MEMBER", id: "member-1", revision: "rev-1" }],
    designStages: [{ ...scope, designStageId: "detailed-design", revision: "stage-1" }],
    standards: [standard(), standard({ profileId: "std-2", edition: "2020", amendment: "", version: "2020", fingerprint: "fp-std-2" })],
    jurisdictions: [jurisdiction(), jurisdiction({ profileId: "jur-2", jurisdictionId: "eu-eea", version: "jur-2025.1", fingerprint: "fp-jur-2" })],
    consequenceProfiles: [{ ...scope, profileId: "cc-1", revision: "cc-1", fingerprint: "fp-cc" }],
    evidence: [
      evidence(),
      evidence({ evidenceId: "ev-validation", slot: "validation", category: "VALIDATION_EVIDENCE", sourceFingerprint: "fp-validation", provenanceRef: "prov-validation" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", sourceFingerprint: "fp-review", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", sourceFingerprint: "fp-conformance", provenanceRef: "prov-conf" }),
    ],
  };
}

function claim(overrides: Partial<D1lR1ClaimInput> = {}): D1lR1ClaimInput {
  return {
    claimId: "claim-1",
    manifestId: "manifest-1",
    claimType: "DESIGN_CHECK_CLAIM",
    claimScope: "CHECK",
    structuralTargetKind: "MEMBER",
    structuralTargetId: "member-1",
    designStageId: "detailed-design",
    standardProfileId: "std-1",
    jurisdictionProfileId: "jur-1",
    consequenceProfileId: null,
    designEvidenceId: "ev-design",
    analysisEvidenceId: null,
    validationEvidenceId: "ev-validation",
    engineerReviewEvidenceId: "ev-review",
    conformanceEvidenceId: "ev-conformance",
    solverQualificationEvidenceId: null,
    crossDisciplineEvidenceId: null,
    authorityEvidenceId: null,
    crossDisciplineDependency: false,
    provenanceRef: "prov-claim",
    ...overrides,
  };
}

function actor(authority = "PROFILE_GOVERNANCE_AUTHORITY") {
  return { actorId: "governor-1", ...scope, authority };
}

function producer() {
  return actor("EVIDENCE_PRODUCER");
}

function ledger(): D1lR2LedgerRow[] {
  return [
    { evidenceId: "ev-validation", revision: "rev-1", sourceFingerprint: "fp-validation", authority: "EVIDENCE_PRODUCER", validationState: "SATISFIED" },
    { evidenceId: "ev-review", revision: "rev-1", sourceFingerprint: "fp-review", authority: "ENGINEER_REVIEWER", reviewState: "SATISFIED" },
    { evidenceId: "ev-conformance", revision: "rev-1", sourceFingerprint: "fp-conformance", authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" },
  ];
}

function governed(store = createD1lR3Store(() => "2026-10-21T00:00:00.000Z")) {
  const standardProfile = registerStandardProfile(store, actor(), standard(), {
    publisherAuthority: "STANDARDS_PUBLISHER",
    adoptionAuthority: "JURISDICTION_ADOPTER",
    maintainerAuthority: "EOS_PROFILE_MAINTAINER",
    provenanceRef: "prov-std",
  });
  const jurisdictionProfile = registerJurisdictionProfile(store, actor(), jurisdiction(), {
    country: "AU",
    region: "national",
    authority: "JURISDICTION_ADOPTER",
    provenanceRef: "prov-jur",
  });
  const requirementSet = registerRequirementSet(store, actor(), {
    requirementSetId: "req-design-check",
    version: "1",
    ...scope,
    claimType: "DESIGN_CHECK_CLAIM",
    claimScope: "CHECK",
    mandatory: ["DESIGN_EVIDENCE", "VALIDATION_EVIDENCE", "ENGINEER_REVIEW", "CONFORMANCE"],
    conditional: [{ requirementId: "CONSEQUENCE_PROFILE", when: "CONSEQUENCE_PROFILE_REQUIRED" }],
    advisory: ["GA_SECURITY_DEBT"],
    authority: "PROFILE_GOVERNANCE_AUTHORITY",
    provenanceRef: "prov-req",
  });
  const mapping = registerProfileMapping(store, actor(), {
    mappingId: "map-1",
    version: "1",
    ...scope,
    standardProfileId: standardProfile.profileId,
    jurisdictionProfileId: jurisdictionProfile.profileId,
    claimType: "DESIGN_CHECK_CLAIM",
    claimScope: "CHECK",
    requirementSetId: requirementSet.requirementSetId,
    authority: "PROFILE_GOVERNANCE_AUTHORITY",
    provenanceRef: "prov-map",
  });
  return { store, standardProfile, jurisdictionProfile, requirementSet, mapping };
}

function recorded() {
  const claims = createD1lR1Store(catalog(), () => "2026-10-21T00:00:00.000Z");
  const manifest = recordCertificationClaimManifest(claims, producer(), claim());
  return { claims, manifest, ...governed() };
}

describe("EOS-D1L-R3 standards and jurisdiction profile governance", () => {
  it("binds a canonical standard profile to the existing catalog fingerprint", () => {
    const { standardProfile } = governed();
    expect(standardProfile.profileId).toBe("std-1");
    expect(standardProfile.fingerprint).toBe("fp-std");
    expect(standardProfile.publisherAuthority).toBe("STANDARDS_PUBLISHER");
    expect(standardProfile.provenanceRef).toBe("prov-std");
    expect(standardProfile.status).toBe("ACTIVE");
    expect(D1L_R3_STANDARD_PROFILE_RUNTIME_COUNT).toBe(1);
  });

  it("keeps a standard family distinct from an edition", () => {
    const { standardProfile } = governed();
    expect(standardProfile.standardFamily).toBe("steel");
    expect(standardProfile.edition).not.toBe(standardProfile.standardFamily);
    expect(D1L_R3_STANDARD_FAMILY_EQUALS_LATEST_EDITION).toBe(false);
    expect(() => registerStandardProfile(createD1lR3Store(() => "t"), actor(), standard({ standardFamily: "2016", edition: "2016" }), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std",
    })).toThrow("STANDARD_FAMILY_NOT_EDITION");
  });

  it("requires an exact standard version and rejects a floating edition", () => {
    expect(D1L_R3_STANDARD_VERSION_PINNING_REQUIRED).toBe(true);
    expect(D1L_R3_FLOATING_STANDARD_ALLOWED).toBe(false);
    expect(() => registerStandardProfile(createD1lR3Store(() => "t"), actor(), standard({ edition: "latest" }), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std",
    })).toThrow("FLOATING_STANDARD_REJECTED");
  });

  it("does not auto-upgrade a standard edition", () => {
    expect(D1L_R3_STANDARD_AUTO_UPGRADED).toBe(false);
    expect(D1L_R3_AUTOMATIC_STANDARD_UPDATE_RUNTIME_COUNT).toBe(0);
    expect(() => registerStandardProfile(createD1lR3Store(() => "t"), actor(), standard(), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std", upgradeToLatest: true,
    })).toThrow("STANDARD_AUTO_UPGRADE_REJECTED");
  });

  it("keeps an amendment distinct from the base edition", () => {
    const store = createD1lR3Store(() => "t");
    const amended = registerStandardProfile(store, actor(), standard(), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std",
    });
    const base = registerStandardProfile(store, actor(), standard({ profileId: "std-base", amendment: "", version: "2016", fingerprint: "fp-base" }), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-base",
    });
    expect(amended.amendment).toBe("A1");
    expect(base.amendment).toBe("");
    expect(amended.fingerprint).not.toBe(base.fingerprint);
  });

  it("pins jurisdiction identity without inferring location", () => {
    const { jurisdictionProfile } = governed();
    expect(jurisdictionProfile.jurisdictionId).toBe("australia");
    expect(jurisdictionProfile.version).toBe("jur-2024.1");
    expect(jurisdictionProfile.fingerprint).toBe("fp-jur");
    expect(jurisdictionProfile.authority).toBe("JURISDICTION_ADOPTER");
    expect(jurisdictionProfile.provenanceRef).toBe("prov-jur");
    expect(D1L_R3_JURISDICTION_PIN_REQUIRED).toBe(true);
    expect(D1L_R3_JURISDICTION_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(D1L_R3_JURISDICTION_INFERRED_FROM_IP_LOCATION).toBe(false);
    expect(() => registerJurisdictionProfile(createD1lR3Store(() => "t"), actor(), jurisdiction(), {
      country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur", inferFromUserLocation: true,
    })).toThrow("JURISDICTION_LOCATION_INFERENCE_REJECTED");
    expect(() => registerJurisdictionProfile(createD1lR3Store(() => "t"), actor(), jurisdiction(), {
      country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur", inferFromIp: true,
    })).toThrow("JURISDICTION_IP_INFERENCE_REJECTED");
  });

  it("rejects a floating jurisdiction and does not auto-upgrade it", () => {
    expect(D1L_R3_FLOATING_JURISDICTION_ALLOWED).toBe(false);
    expect(D1L_R3_JURISDICTION_AUTO_UPGRADED).toBe(false);
    expect(() => registerJurisdictionProfile(createD1lR3Store(() => "t"), actor(), jurisdiction({ version: "latest" }), {
      country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur",
    })).toThrow("FLOATING_JURISDICTION_REJECTED");
    expect(() => registerJurisdictionProfile(createD1lR3Store(() => "t"), actor(), jurisdiction(), {
      country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur", upgradeToLatest: true,
    })).toThrow("JURISDICTION_AUTO_UPGRADE_REJECTED");
  });

  it("versions the standard jurisdiction mapping and requirement set", () => {
    const { mapping, requirementSet } = governed();
    expect(mapping.version).toBe("1");
    expect(mapping.authority).toBe("PROFILE_GOVERNANCE_AUTHORITY");
    expect(mapping.provenanceRef).toBe("prov-map");
    expect(mapping.fingerprint).toBe(fingerprintCanonical({
      mappingId: mapping.mappingId,
      version: mapping.version,
      standardProfileId: mapping.standardProfileId,
      jurisdictionProfileId: mapping.jurisdictionProfileId,
      claimType: mapping.claimType,
      claimScope: mapping.claimScope,
      requirementSetId: mapping.requirementSetId,
      authority: mapping.authority,
    }));
    expect(requirementSet.requirementSetId).toBe("req-design-check");
    expect(requirementSet.version).toBe("1");
    expect(requirementSet.fingerprint).toBeTruthy();
    expect(D1L_R3_MAPPING_RUNTIME_COUNT).toBe(1);
  });

  it("protects mandatory requirements and resolves conditional and advisory ones", () => {
    const { store, manifest, requirementSet } = recorded();
    expect(D1L_R3_CALLER_CAN_DOWNGRADE_REQUIREMENTS).toBe(false);
    expect(D1L_R3_CALLER_CAN_DISABLE_MANDATORY_REQUIREMENT).toBe(false);
    expect(() => registerRequirementSet(store, actor(), { ...requirementSet, requirementSetId: "req-weak", downgradeMandatory: true })).toThrow("REQUIREMENT_DOWNGRADE_REJECTED");
    expect(() => registerProjectOverlay(store, actor(), { overlayId: "ov-1", ...scope, claimType: "DESIGN_CHECK_CLAIM", addedRequirements: [], removedRequirements: ["ENGINEER_REVIEW"] }, requirementSet)).toThrow("OVERLAY_CANNOT_WEAKEN_MANDATORY");
    registerProjectOverlay(store, actor(), { overlayId: "ov-2", ...scope, claimType: "DESIGN_CHECK_CLAIM", addedRequirements: ["PROJECT_REVIEW"], removedRequirements: [] }, requirementSet);
    const resolved = resolveCertificationProfile(store, producer(), manifest);
    expect(resolved.applicableRequirements).toContain("ENGINEER_REVIEW");
    expect(resolved.applicableRequirements).toContain("PROJECT_REVIEW");
    expect(resolved.applicableRequirements).not.toContain("CONSEQUENCE_PROFILE");
    expect(requirementSet.advisory).toEqual(["GA_SECURITY_DEBT"]);
    expect(D1L_R3_PROJECT_OVERLAY_CAN_WEAKEN_MANDATORY).toBe(false);
  });

  it("includes a conditional requirement only when its governed trigger is present", () => {
    const claims = createD1lR1Store(catalog(), () => "t");
    claims.catalog.evidence[0] = evidence({ upstreamDiagnostic: "CONSEQUENCE_PROFILE_REQUIRED" });
    const manifest = recordCertificationClaimManifest(claims, producer(), claim({ designEvidenceId: "ev-design" }));
    const { store } = governed();
    const resolved = resolveCertificationProfile(store, producer(), manifest);
    expect(resolved.applicableRequirements).toContain("CONSEQUENCE_PROFILE");
    expect(D1L_R3_CONSEQUENCE_CALCULATION_RUNTIME_COUNT).toBe(0);
  });

  it("diagnoses unknown profiles and missing mappings without a generic fallback", () => {
    const { store, manifest } = recorded();
    const unknownStandard = { ...manifest, standardProfileId: "missing-std", standardFingerprint: "missing" };
    expect(resolveCertificationProfile(store, producer(), unknownStandard).status).toBe("UNKNOWN_STANDARD");
    expect(store.standards.some((row) => row.profileId === "missing-std")).toBe(false);
    const unknownJurisdiction = { ...manifest, jurisdictionProfileId: "missing-jur", jurisdictionFingerprint: "missing" };
    expect(resolveCertificationProfile(store, producer(), unknownJurisdiction).status).toBe("UNKNOWN_JURISDICTION");
    const unmapped = { ...manifest, claimType: "ANALYSIS_RESULT_CLAIM" as const };
    const missing = resolveCertificationProfile(store, producer(), unmapped);
    expect(missing.status).toBe("UNSUPPORTED_COMBINATION");
    expect(missing.applicableRequirements).toEqual([]);
    expect(D1L_R3_UNKNOWN_STANDARD_AUTO_CREATED).toBe(false);
    expect(D1L_R3_UNKNOWN_JURISDICTION_AUTO_CREATED).toBe(false);
    expect(D1L_R3_UNKNOWN_MAPPING_USES_GENERIC_FALLBACK).toBe(false);
  });

  it("reports a profile conflict and does not choose the weaker mapping", () => {
    const { store, manifest, requirementSet } = recorded();
    registerRequirementSet(store, actor(), { ...requirementSet, requirementSetId: "req-other", mandatory: ["DESIGN_EVIDENCE"] });
    registerProfileMapping(store, actor(), {
      mappingId: "map-2", version: "1", ...scope, standardProfileId: "std-1", jurisdictionProfileId: "jur-1", claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", requirementSetId: "req-other", authority: "PROFILE_GOVERNANCE_AUTHORITY", provenanceRef: "prov-map-2",
    });
    const resolved = resolveCertificationProfile(store, producer(), manifest);
    expect(resolved.status).toBe("PROFILE_CONFLICT");
    expect(resolved.mapping).toBeNull();
    expect(resolved.automaticResolutionCount).toBe(0);
    expect(D1L_R3_AUTOMATIC_PROFILE_CONFLICT_RESOLUTION_COUNT).toBe(0);
    expect(resolved.precedence).toEqual(["BASE_CERTIFICATION_ARCHITECTURE", "JURISDICTION_PROFILE", "STANDARD_PROFILE", "CONSEQUENCE_RELIABILITY_PROFILE", "PROJECT_CLIENT_OVERLAY"]);
  });

  it("preserves superseded profile history and the original R1 pins", () => {
    const { store, manifest, claims } = recorded();
    const before = fingerprintCanonical(manifest);
    const successor = supersedeStandardProfile(store, actor(), "std-1", standard({ profileId: "std-2", edition: "2020", amendment: "", version: "2020", fingerprint: "fp-std-2" }), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std-2",
    });
    const predecessor = store.standards.find((row) => row.profileId === "std-1");
    expect(predecessor?.status).toBe("SUPERSEDED");
    expect(predecessor?.fingerprint).toBe("fp-std");
    expect(successor.fingerprint).toBe("fp-std-2");
    expect(store.history.some((row) => row.recordId === "std-1" && row.action === "SUPERSEDED" && row.fingerprint === "fp-std")).toBe(true);
    expect(manifest.standardFingerprint).toBe("fp-std");
    expect(fingerprintCanonical(manifest)).toBe(before);
    expect(bindGovernedProfile(store, producer(), manifest).standard?.profileId).toBe("std-1");
    expect(bindGovernedProfile(store, producer(), manifest).successorRequiresReevaluation).toBe(true);
    expect(D1L_R3_PROFILE_SUPERSESSION_PRESERVES_HISTORY).toBe(true);
    expect(D1L_R3_CAN_MUTATE_R1_MANIFEST).toBe(false);
    expect(D1L_R3_REEVALUATION_REQUIRED_AFTER_PROFILE_CHANGE).toBe(true);
    expect(claims.records[0]?.standardVersion).toBe("2016-A1");
  });

  it("reuses R2 and keeps the prior eligibility result when the profile successor exists", () => {
    const { store, manifest, claims, mapping, requirementSet } = recorded();
    const results = createD1lR2Store(() => "2026-10-21T00:00:00.000Z");
    const first = evaluateUnderGovernedProfile(store, claims, results, producer(), manifest, ledger());
    expect(first.producer).toBe("D1L_R2_DETERMINISTIC_EVALUATOR");
    expect(first.requirementSetIdentity).toBe(requirementSet.requirementSetId);
    expect(first.requirementSetVersion).toBe(requirementSet.version);
    expect(first.mappingFingerprint).toBe(mapping.fingerprint);
    expect(first.standardFingerprint).toBe("fp-std");
    expect(first.jurisdictionFingerprint).toBe("fp-jur");
    expect(first.certificationAuthority).toBeNull();
    expect(first).not.toHaveProperty("certified");
    supersedeStandardProfile(store, actor(), "std-1", standard({ profileId: "std-2", edition: "2020", amendment: "", version: "2020", fingerprint: "fp-std-2" }), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std-2",
    });
    expect(results.results[0]?.eligibilityState).toBe(first.eligibilityState);
    expect(results.results[0]?.resultFingerprint).toBe(first.resultFingerprint);
    expect(evaluateCertificationEligibility).toBeTypeOf("function");
    expect(D1L_R3_R2_ELIGIBILITY_ENGINE_REUSED).toBe(true);
    expect(D1L_R3_PARALLEL_ELIGIBILITY_ENGINE_CREATED).toBe(false);
    expect(D1L_R3_ELIGIBILITY_RUNTIME_COUNT).toBe(1);
  });

  it("keeps profile governance separate from certification, admin, and AI authority", () => {
    const store = createD1lR3Store(() => "t");
    expect(() => registerStandardProfile(store, actor("ADMINISTRATOR"), standard(), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std",
    })).toThrow("UNAUTHORIZED");
    expect(() => registerStandardProfile(store, { ...actor(), actorId: "AI_ASSISTANT" }, standard(), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std",
    })).toThrow("UNAUTHORIZED");
    expect(() => registerJurisdictionProfile(store, actor("AI"), jurisdiction(), {
      country: "AU", region: "national", authority: "JURISDICTION_ADOPTER", provenanceRef: "prov-jur",
    })).toThrow("UNAUTHORIZED");
    expect(() => registerStandardProfile(store, actor(), standard(), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "CERTIFICATION_AUTHORITY", provenanceRef: "prov-std",
    })).toThrow("PROFILE_AUTHORITY_NOT_CERTIFIER");
    expect(D1L_R3_PROFILE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R3_ADMIN_EQUALS_PROFILE_AUTHORITY).toBe(false);
    expect(D1L_R3_ADMIN_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R3_AI_CAN_CREATE_STANDARD_PROFILE).toBe(false);
    expect(D1L_R3_AI_CAN_CREATE_JURISDICTION_PROFILE).toBe(false);
    expect(D1L_R3_AI_CAN_CHANGE_SEVERITY).toBe(false);
    expect(D1L_R3_AI_CAN_WAIVE_REQUIREMENT).toBe(false);
    expect(D1L_R3_AI_CAN_RESOLVE_CONFLICT).toBe(false);
    expect(D1L_R3_AI_CAN_MARK_CERTIFIED).toBe(false);
  });

  it("rejects profile tampering and cross-workspace mutation", () => {
    expect(() => mutateStandardVersion()).toThrow("PROFILE_TAMPER_REJECTED");
    const other = { ...actor(), workspaceId: "workspace-b" };
    expect(() => registerStandardProfile(createD1lR3Store(() => "t"), other, standard(), {
      publisherAuthority: "STANDARDS_PUBLISHER", adoptionAuthority: "JURISDICTION_ADOPTER", maintainerAuthority: "EOS_PROFILE_MAINTAINER", provenanceRef: "prov-std",
    })).toThrow("CROSS_PROJECT_OPERATION");
  });

  it("does not issue certification or start later discipline runtimes", () => {
    const { store, manifest } = recorded();
    const resolved = resolveCertificationProfile(store, producer(), manifest);
    expect(resolved.certificationAuthority).toBeNull();
    expect(resolved).not.toHaveProperty("certified");
    expect(D1L_R3_DECISION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_ISSUANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_REVOCATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_NEW_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_NEW_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1L_R3_CODE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_LEGAL_ADJUDICATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_D9_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R3_D1M_ABSORBED).toBe(false);
    expect(D1L_R3_D1N_ABSORBED).toBe(false);
    expect(D1L_R3_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1L_R3_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1L_R3_PROFILE_SELECTED_EQUALS_CONFORMANT).toBe(false);
    expect(D1L_R3_CERTIFICATION_RUNTIME_READY).toBe(false);
    expect(D1L_R3_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1L_R3_CERTIFICATION_AUTHORITY_READY).toBe(false);
    expect(D1L_R3_ARCHITECTURE_READY).toBe(true);
    expect(D1L_R3_ELIGIBILITY_MODEL_READY).toBe(true);
    expect(D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1L_R3_D1G_CERTIFICATION_BLOCKER_PRESERVED).toBe(true);
    expect(D1L_R3_D1K_HANDOFF_REUSES_D1K).toBe(true);
    expect(D1L_R3_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1L_R3_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1L_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1L_R3_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1L_R3_PARALLEL_PROFILE_THREAD_CREATED).toBe(false);
    expect(resolved.digitalThreadRefs).toEqual(["claim-1", "std-1", "jur-1", "map-1", "req-design-check"]);
    expect(D1L_R4_CANONICAL_PHASE).toBe("EOS-D1L-R4-CERTIFICATION-AUTHORITY-DECISION-RECORD");
    expect(D1L_R4_CANONICAL_SCOPE).toContain("exact eligible claim");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1L.R3.STANDARDS_JURISDICTION_PROFILE_GOVERNANCE");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
    const source = readFileSync(join(root, "certification-profile-governance.ts"), "utf8");
    expect(source).not.toContain("from \"@rtb/engineering-review\"");
    expect(scanAnalysisFormulaBypass(join(root, "certification-profile-governance.ts"), source)).toEqual([]);
    const closeout = readFileSync(join(root, "../../../../docs/architecture/engineering-os/EOS_D1L_R3_STANDARDS_JURISDICTION_PROFILE_GOVERNANCE_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(root, "closeout.md"), closeout)).toEqual([]);
    expect(() => registerRequirementSet(createD1lR3Store(() => "t"), actor(), {
      requirementSetId: "req-solver", version: "1", ...scope, claimType: "ANALYSIS_RESULT_CLAIM", claimScope: "CHECK", mandatory: ["SOLVER_CERTIFIED"], conditional: [], advisory: [], authority: "PROFILE_GOVERNANCE_AUTHORITY", provenanceRef: "prov-req",
    })).toThrow("SOLVER_CERTIFICATION_REJECTED");
  });

  it("does not let a profile governor evaluate eligibility", () => {
    const { store, manifest, claims } = recorded();
    const results = createD1lR2Store(() => "t");
    expect(() => evaluateUnderGovernedProfile(store, claims, results, actor(), manifest, ledger())).toThrow("UNAUTHORIZED");
  });
});
