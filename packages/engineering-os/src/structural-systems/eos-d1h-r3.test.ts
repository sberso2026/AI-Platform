import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CANONICAL_INTERNAL_UNITS } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  aggregateMemberRatingsToSystem,
  averageConditionRatings,
  conditionStateProvenance,
  convertConditionRatingScheme,
  correctConditionRating,
  correctConditionState,
  correctEngineeringInterpretation,
  createD1hR3Store,
  D1H_R3_AUTOMATIC_RATING_ENGINE_COUNT,
  D1H_R3_COMPLETENESS_STATES,
  D1H_R3_CONDITION_STATE_RUNTIME_COUNT,
  D1H_R3_DIGITAL_TWIN_RUNTIME_COUNT,
  D1H_R3_EXISTING_RATING_SCHEME_INVENTORY,
  D1H_R3_MATURITY_STATE,
  D1H_R3_NEW_ENGINEERING_FORMULA_COUNT,
  D1H_R3_SEVERITY_RUNTIME_COUNT,
  D1H_R4_REQUIRED_R3_CONTRACTS,
  digitalTwinReference,
  evaluateStructuralCondition,
  PRODUCTION_DEFAULT_RATING_SCHEME_ID,
  promoteAiDraftInterpretation,
  recordConditionRating,
  recordConditionScopedValidation,
  recordConditionState,
  recordEngineeringInterpretation,
  registerConditionRatingScheme,
  retireConditionRatingScheme,
  selectGoodRatingFromNoFindings,
  selectRatingFromDefectCount,
  selectRatingFromMeasurement,
  type D1hR3ConditionStateInput,
  type D1hR3RatingInput,
  type D1hR3SchemeInput,
} from "./inspection-condition";
import {
  bindStructuralInspectionTarget,
  createD1hR1Store,
  invalidateStructuralInspectionRecord,
  recordStructuralInspectionContext,
  recordStructuralInspectionCoverage,
  recordStructuralInspectionEvidence,
  type D1hR1CatalogObject,
  type D1hR1EvidenceInput,
  type D1hR1GovernedCatalog,
  type D1hR1TargetInput,
} from "./inspection-evidence";
import {
  correctInspectionMeasurement,
  correctStructuralFinding,
  createD1hR2Store,
  recordHumanValidation,
  recordInspectionMeasurement,
  recordStructuralFinding,
  withdrawHumanValidation,
  type D1hR2FindingInput,
  type D1hR2MeasurementInput,
} from "./inspection-finding";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "inspection-condition.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1H_R3_CONDITION_STATE_RATING_INTERPRETATION.md");

function object(kind: D1hR1CatalogObject["kind"], id: string, overrides: Partial<D1hR1CatalogObject> = {}): D1hR1CatalogObject {
  return { kind, id, structuralSystemId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "1", lifecycle: "CURRENT", ...overrides };
}

function catalog(): D1hR1GovernedCatalog {
  return {
    objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-1"), object("MEMBER", "mem-2")],
    sessions: [{ inspectionSessionId: "ses-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1" }],
    artifacts: [{ artifactId: "art-photo", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-photo" }],
    analysisResults: [],
  };
}

function provenance(version = "1") {
  return { tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", actorOrSystem: "engineer-1", timestamp: "2026-10-18T00:00:00.000Z", authority: "HUMAN", version, fingerprint: "pending" };
}

function location(id = "loc-1") {
  return { locationId: id, locationKind: "MEMBER_STATION_OR_RANGE" as const, description: "explicit station", explicit: true as const, aiSuggested: false, confirmed: true, inferredBy: null };
}

function evidenceInput(overrides: Partial<D1hR1EvidenceInput> = {}): D1hR1EvidenceInput {
  return { evidenceId: "ev-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", sourceClass: "PHOTO", sourceArtifactId: "art-photo", analysisResultId: null, priorEvidenceId: null, derivedFromEvidenceId: null, capturedAt: "2026-10-18T02:00:00.000Z", capturedBy: "inspector-1", location: location(), methodRef: "photo", unit: null, authority: "HUMAN_OBSERVATION", modelIdentity: null, modelVersion: null, executionFingerprint: null, provenance: provenance(), version: "1", recordedAt: "2026-10-18T02:00:00.000Z", explicitNegativeObservation: false, negativeScopeStatement: null, ...overrides };
}

function targetInput(id: string, extras: Partial<D1hR1TargetInput> = {}): D1hR1TargetInput {
  return { targetId: id, targetKind: "MEMBER", structuralSystemId: "sys-1", memberId: id, connectionId: null, supportId: null, foundationIdentity: null, parentTargetKind: null, parentTargetId: null, regionRef: null, candidateOnly: false, inferredBy: null, ...extras };
}

function prepared() {
  const r1 = createD1hR1Store();
  const source = catalog();
  recordStructuralInspectionContext(r1, source, { inspectionContextId: "ctx-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: "ses-1", purpose: "ROUTINE", scopeStatement: "member scope", inspectedAt: "2026-10-18T00:00:00.000Z", coverageScopeRef: "scope-1", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: provenance(), version: "1", status: "RECORDED", declaredTargetIds: ["mem-1"], recordedAt: "2026-10-18T01:00:00.000Z" });
  bindStructuralInspectionTarget(r1, source, "ctx-1", targetInput("mem-1"));
  recordStructuralInspectionCoverage(r1, { coverageId: "cov-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-10-18T01:30:00.000Z" });
  recordStructuralInspectionEvidence(r1, source, evidenceInput());
  return { r1, r2: createD1hR2Store(), r3: createD1hR3Store(), source };
}

function findingInput(overrides: Partial<D1hR2FindingInput> = {}): D1hR2FindingInput {
  return { findingId: "find-1", inspectionContextId: "ctx-1", targetId: "mem-1", findingType: "CRACKING", location: location(), supportingEvidenceIds: ["ev-1"], origin: "HUMAN_RECORDED", authority: "HUMAN", createdAt: "2026-10-18T03:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "1", modelIdentity: null, modelVersion: null, executionFingerprint: null, ...overrides };
}

function measurementInput(overrides: Partial<D1hR2MeasurementInput> = {}): D1hR2MeasurementInput {
  return { measurementId: "meas-1", inspectionContextId: "ctx-1", targetId: "mem-1", evidenceId: "ev-1", findingId: "find-1", quantity: "length", value: 0.002, unit: CANONICAL_INTERNAL_UNITS.length, dimensionless: false, location: location(), methodRef: "gauge", sourceType: "INSTRUMENT_MEASURED", instrumentRef: "gauge-1", measuredAt: "2026-10-18T04:00:00.000Z", uncertainty: null, accuracy: null, calibrationBasis: null, modelIdentity: null, modelVersion: null, authority: "HUMAN", provenance: provenance(), version: "1", ...overrides };
}

const validators = [{ validatorId: "rev-1", role: "ENGINEER_REVIEWER" as const, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authorized: true }];

function schemeInput(overrides: Partial<D1hR3SchemeInput> = {}): D1hR3SchemeInput {
  return {
    ratingSchemeId: "TEST_CONDITION_SCHEME_V1",
    schemeVersion: "1",
    profileRef: "test-profile",
    schemeAuthority: "HUMAN",
    applicability: { projectId: "project-1", assetOwnerRef: null, clientRef: null, inspectionStandardRef: "test-standard", assetClass: null, targetKinds: ["MEMBER"] },
    ratingValueDefinitions: [
      { code: "1", label: "test label one", descriptionRef: null, explicitOrder: 1 },
      { code: "2", label: "test label two", descriptionRef: null, explicitOrder: 2 },
    ],
    provenance: provenance(),
    status: "TEST_ONLY",
    ...overrides,
  };
}

function interpretationInput(overrides: Record<string, unknown> = {}) {
  return {
    interpretationId: "int-1",
    inspectionContextId: "ctx-1",
    targetId: "mem-1",
    supportingEvidenceIds: ["ev-1"],
    supportingFindingIds: ["find-1"],
    supportingMeasurementIds: ["meas-1"],
    supportingValidationIds: ["val-find"],
    authorId: "engineer-1",
    reviewerId: null,
    statement: "Observed crack is recorded for the declared member scope.",
    basisRefs: ["inspection-note:n1"],
    limitations: "visible face only",
    assumptions: "no hidden face",
    createdAt: "2026-10-18T06:00:00.000Z",
    authority: "HUMAN" as const,
    provenance: provenance(),
    version: "1",
    ...overrides,
  };
}

function ratingInput(overrides: Partial<D1hR3RatingInput> = {}): D1hR3RatingInput {
  return { ratingId: "rate-1", inspectionContextId: "ctx-1", targetId: "mem-1", ratingSchemeId: "TEST_CONDITION_SCHEME_V1", schemeVersion: "1", ratingValueCode: "2", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], limitations: "visible face only", assessedAt: "2026-10-18T07:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1", imported: false, ...overrides };
}

function stateInput(overrides: Partial<D1hR3ConditionStateInput> = {}): D1hR3ConditionStateInput {
  return { conditionStateId: "state-1", inspectionContextId: "ctx-1", targetId: "mem-1", assessmentScope: "member-face", ratingId: "rate-1", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingEvidenceIds: ["ev-1"], relevantValidationIds: ["val-find"], coverageIds: ["cov-1"], authority: "HUMAN", status: "CURRENT", limitations: "visible face only", createdAt: "2026-10-18T08:00:00.000Z", createdBy: "engineer-1", provenance: provenance(), version: "1", ...overrides };
}

function governed(bundle = prepared()) {
  recordStructuralFinding(bundle.r1, bundle.r2, findingInput());
  recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput());
  recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: "val-find", inspectionContextId: "ctx-1", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-1", scopeStatement: "classification only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-10-18T05:00:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
  registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput());
  return bundle;
}

describe("EOS-D1H-R3 condition state rating interpretation", () => {
  it("records a governed condition state from R1 and R2 records without an adequacy claim", () => {
    const bundle = governed();
    const interpretation = recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput());
    const rating = recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    const state = recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput());
    expect(state.recordKind).toBe("CONDITION_STATE");
    expect(state.ratingValueCode).toBe("2");
    expect(state.structuralAdequacy).toBe(false);
    expect(state.capacityChanged).toBe(false);
    expect(rating.numericQuantity).toBe(false);
    expect(interpretation.governs).toBe(true);
    expect(bundle.r3.schemes[0]?.productionDefault).toBe(false);
    expect(PRODUCTION_DEFAULT_RATING_SCHEME_ID).toBeNull();
    expect(D1H_R3_CONDITION_STATE_RUNTIME_COUNT).toBe(1);
    expect(D1H_R3_MATURITY_STATE).toBe("STRUCTURAL_CONDITION_STATE_RATING_INTERPRETATION_RUNTIME_IMPLEMENTED");
    expect(D1H_R3_EXISTING_RATING_SCHEME_INVENTORY).toContain("structural_ordinal_1_5");
  });

  it("does not select a good rating from absent findings, measurements, or defect counts", () => {
    const bundle = prepared();
    registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput());
    expect(selectGoodRatingFromNoFindings).toThrow(/NO_FINDING_AUTO_SELECTS_GOOD_RATING/);
    expect(selectRatingFromMeasurement).toThrow(/MEASUREMENT_AUTO_SELECTS_RATING/);
    expect(selectRatingFromDefectCount).toThrow(/DEFECT_COUNT_AUTO_SELECTS_RATING/);
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput());
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-2", findingType: "CORROSION", location: location("loc-2") }));
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ findingId: "find-1" }));
    const result = evaluateStructuralCondition(bundle.r1, bundle.r2, bundle.r3, { inspectionContextId: "ctx-1", declaredConditionStateIds: [], declaredRatingIds: [], declaredInterpretationIds: [] });
    expect(result.ratingIds).toEqual([]);
    expect(result.goodCondition).toBe(false);
    expect(D1H_R3_AUTOMATIC_RATING_ENGINE_COUNT).toBe(0);
  });

  it("requires a versioned scheme and refuses cross-scheme translation, averaging, and numeric quantity treatment", () => {
    const bundle = governed();
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput());
    expect(() => recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput({ ratingSchemeId: "", schemeVersion: "" }))).toThrow(/RATING_SCHEME_REQUIRED/);
    expect(() => registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput({ ratingSchemeId: "TEST_OTHER", schemeVersion: "" }))).toThrow(/RATING_SCHEME_VERSION_REQUIRED/);
    registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput({ ratingSchemeId: "TEST_SCHEME_B", schemeVersion: "1", profileRef: "other-profile", ratingValueDefinitions: [{ code: "2", label: "test label two", descriptionRef: null, explicitOrder: 1 }] }));
    const left = recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    const right = recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput({ ratingId: "rate-b", ratingSchemeId: "TEST_SCHEME_B" }));
    expect(left.ratingValueCode).toBe(right.ratingValueCode);
    expect(left.fingerprint).not.toBe(right.fingerprint);
    expect(averageConditionRatings).toThrow(/RATING_AVERAGE_REJECTED/);
    expect(convertConditionRatingScheme).toThrow(/CROSS_SCHEME_CONVERSION_REJECTED/);
    expect(left.numericQuantity).toBe(false);
    expect(() => registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput({ ratingSchemeId: "TEST_SPOOF", status: "GOVERNED" }))).toThrow(/TEST_SCHEME_NOT_PRODUCTION/);
    expect(() => registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", { ...schemeInput({ ratingSchemeId: "SCHEME_AI" }), schemeAuthority: "AI" })).toThrow(/AI_AUTHORITY_REJECTED/);
  });

  it("does not aggregate member ratings into a system rating", () => {
    const bundle = governed();
    bindStructuralInspectionTarget(bundle.r1, bundle.source, "ctx-1", targetInput("mem-2"));
    recordStructuralInspectionCoverage(bundle.r1, { coverageId: "cov-2", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-2", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "other face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-10-18T01:40:00.000Z" });
    recordStructuralInspectionEvidence(bundle.r1, bundle.source, evidenceInput({ evidenceId: "ev-2", targetId: "mem-2", location: location("loc-2") }));
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-2", targetId: "mem-2", supportingEvidenceIds: ["ev-2"], location: location("loc-2") }));
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput());
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput({ interpretationId: "int-2", targetId: "mem-2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: [] }));
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput({ ratingId: "rate-2", targetId: "mem-2", interpretationId: "int-2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: [], ratingValueCode: "1" }));
    recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput());
    recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput({ conditionStateId: "state-2", targetId: "mem-2", ratingId: "rate-2", interpretationId: "int-2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: [], coverageIds: ["cov-2"], relevantValidationIds: [] }));
    expect(aggregateMemberRatingsToSystem).toThrow(/SYSTEM_RATING_AGGREGATION_REJECTED/);
    expect(bundle.r3.conditionStates.filter((row) => row.targetKind === "STRUCTURAL_SYSTEM")).toEqual([]);
  });

  it("keeps an AI draft interpretation non-governing and scopes condition validation", () => {
    const bundle = governed();
    const draft = recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput({ interpretationId: "int-ai", authority: "AI_DRAFT", basisRefs: ["model-note:n1"] }));
    expect(draft.governs).toBe(false);
    expect(promoteAiDraftInterpretation).toThrow(/AI_DRAFT_AUTO_PROMOTED_REJECTED/);
    const human = recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput());
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    expect(() => recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput({ interpretationId: "int-ai" }))).toThrow(/AI_INTERPRETATION_CANNOT_GOVERN/);
    const validation = recordConditionScopedValidation(bundle.r1, bundle.r3, validators, { validationId: "val-rate", inspectionContextId: "ctx-1", subjectType: "CONDITION_RATING", subjectId: "rate-1", scopeStatement: "rating label only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-10-18T09:00:00.000Z", decision: "CONFIRMED", limitations: "label only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
    expect(validation.structuralAdequacy).toBe(false);
    expect(validation.assetSafe).toBe(false);
    expect(validation.independenceClaimed).toBe(false);
    expect(human.capacityAssessment).toBe(false);
    expect(() => recordConditionScopedValidation(bundle.r1, bundle.r3, [], { validationId: "val-no", inspectionContextId: "ctx-1", subjectType: "CONDITION_STATE", subjectId: "missing", scopeStatement: "scope", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-10-18T09:00:00.000Z", decision: "CONFIRMED", limitations: "none", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null })).toThrow(/VALIDATOR_UNAUTHORIZED/);
  });

  it("preserves mixed input validation state and rejects cross-scope bindings", () => {
    const bundle = governed();
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput({ supportingMeasurementIds: ["meas-1"] }));
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    const state = recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput());
    expect(state.inputValidation.find((row) => row.subjectId === "find-1")?.validationState).toBe("HUMAN_CONFIRMED");
    expect(state.inputValidation.find((row) => row.subjectId === "meas-1")?.validationState).toBe("UNVALIDATED");
    expect(state.allInputsValidated).toBe(false);
    expect(state.inputValidation.every((row) => row.promoted === false)).toBe(true);
    expect(() => recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput({ ratingId: "rate-other", provenance: { ...provenance(), projectId: "project-2" } }))).toThrow(/CROSS_PROJECT_BINDING_REJECTED/);
    expect(() => recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput({ ratingId: "rate-tenant", provenance: { ...provenance(), tenantId: "tenant-2" } }))).toThrow(/CROSS_TENANT_BINDING_REJECTED/);
    expect(() => recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput({ conditionStateId: "state-mismatch", supportingFindingIds: ["missing"] }))).toThrow(/FINDING_UNKNOWN|TARGET_MISMATCH/);
  });

  it("keeps corrected history and propagates upstream invalidation without deleting subjects", () => {
    const bundle = governed();
    const interpretation = recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput());
    const rating = recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    const state = recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput());
    const interpretationSnapshot = JSON.stringify(interpretation);
    const ratingSnapshot = JSON.stringify(rating);
    const stateSnapshot = JSON.stringify(state);
    correctEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, "int-1", interpretationInput({ interpretationId: "int-2", version: "2", statement: "Corrected observation statement." }));
    expect(JSON.stringify(bundle.r3.interpretations[0])).toBe(interpretationSnapshot);
    expect(bundle.r3.states.some((row) => row.subjectId === "rate-1" && row.effective === "STALE")).toBe(true);
    correctConditionRating(bundle.r1, bundle.r2, bundle.r3, "rate-1", ratingInput({ ratingId: "rate-2", version: "2", interpretationId: "int-2", ratingValueCode: "1" }));
    expect(JSON.stringify(bundle.r3.ratings[0])).toBe(ratingSnapshot);
    correctConditionState(bundle.r1, bundle.r2, bundle.r3, "state-1", stateInput({ conditionStateId: "state-2", version: "2", ratingId: "rate-2", interpretationId: "int-2" }));
    expect(JSON.stringify(bundle.r3.conditionStates[0])).toBe(stateSnapshot);
    const before = bundle.r3.conditionStates.length;
    withdrawHumanValidation(bundle.r2, "val-find", "2026-10-18T10:00:00.000Z");
    expect(bundle.r3.conditionStates.length).toBe(before);
    correctStructuralFinding(bundle.r1, bundle.r2, "find-1", findingInput({ findingId: "find-1b", version: "2", findingType: "CORROSION" }), "FINDING_CLASSIFICATION_CORRECTED");
    correctInspectionMeasurement(bundle.r1, bundle.r2, "meas-1", measurementInput({ measurementId: "meas-1b", version: "2", value: 0.004, findingId: "find-1b" }), "MEASUREMENT_CORRECTED");
    retireConditionRatingScheme(bundle.r3, "TEST_CONDITION_SCHEME_V1", "1", "2026-10-18T11:00:00.000Z");
    invalidateStructuralInspectionRecord(bundle.r1, "TARGET_REVISION", "TARGET", "mem-1", "2026-10-18T12:00:00.000Z");
    invalidateStructuralInspectionRecord(bundle.r1, "COVERAGE_CORRECTION", "COVERAGE", "cov-1", "2026-10-18T12:00:00.000Z");
    const result = evaluateStructuralCondition(bundle.r1, bundle.r2, bundle.r3, { inspectionContextId: "ctx-1", declaredConditionStateIds: ["state-1"], declaredRatingIds: ["rate-1"], declaredInterpretationIds: ["int-1"] });
    expect(result.completeness).toBe("STALE");
    expect(bundle.r3.invalidations.some((row) => row.deletesSubject === false)).toBe(true);
    expect(bundle.r3.conditionStates.length).toBe(before);
  });

  it("changes fingerprints, repeats them, and traces provenance", () => {
    const bundle = governed();
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretationInput());
    const rating = recordConditionRating(bundle.r1, bundle.r2, bundle.r3, ratingInput());
    const state = recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput());
    const other = governed();
    registerConditionRatingScheme(other.r1, other.r3, "ctx-1", schemeInput({ schemeVersion: "2" }));
    recordEngineeringInterpretation(other.r1, other.r2, other.r3, interpretationInput({ statement: "Different statement." }));
    expect(recordConditionRating(other.r1, other.r2, other.r3, ratingInput({ schemeVersion: "2", ratingValueCode: "1" })).fingerprint).not.toBe(rating.fingerprint);
    expect(recordConditionState(other.r1, other.r2, other.r3, stateInput({ limitations: "different limitation" })).fingerprint).not.toBe(state.fingerprint);
    expect(conditionStateProvenance(bundle.r1, bundle.r2, bundle.r3, "state-1")).toEqual(expect.arrayContaining(["context:ctx-1", "coverage:cov-1", "evidence:ev-1", "finding:find-1", "measurement:meas-1", "validation:val-find", "interpretation:int-1", "rating:rate-1", "scheme:TEST_CONDITION_SCHEME_V1@1", "condition:state-1"]));
    const left = evaluateStructuralCondition(bundle.r1, bundle.r2, bundle.r3, { inspectionContextId: "ctx-1", declaredConditionStateIds: ["state-1"], declaredRatingIds: ["rate-1"], declaredInterpretationIds: ["int-1"] });
    const again = governed();
    recordEngineeringInterpretation(again.r1, again.r2, again.r3, interpretationInput());
    recordConditionRating(again.r1, again.r2, again.r3, ratingInput());
    recordConditionState(again.r1, again.r2, again.r3, stateInput());
    expect(evaluateStructuralCondition(again.r1, again.r2, again.r3, { inspectionContextId: "ctx-1", declaredConditionStateIds: ["state-1"], declaredRatingIds: ["rate-1"], declaredInterpretationIds: ["int-1"] })).toEqual(left);
    expect(digitalTwinReference(bundle.r3, "state-1").copiedEvidence).toBe(false);
    expect(resultHasNoStructuralFinding(left)).toBe(true);
  });

  it("keeps condition runtime inside its boundary and updates the capability manifest", () => {
    const bundle = governed();
    expect(() => recordConditionState(bundle.r1, bundle.r2, bundle.r3, { ...stateInput(), safe: true } as D1hR3ConditionStateInput)).toThrow(/SCOPE_REJECTED:safe/);
    expect(() => recordConditionRating(bundle.r1, bundle.r2, bundle.r3, { ...ratingInput(), repairDesign: true } as D1hR3RatingInput)).toThrow(/SCOPE_REJECTED:repairDesign/);
    const unrated = recordConditionState(bundle.r1, bundle.r2, bundle.r3, stateInput({ conditionStateId: "state-draft", status: "UNRATED", ratingId: null, interpretationId: null, assessmentBasisRef: "pending-review" }));
    expect(unrated.ratingValueCode).toBeNull();
    expect(unrated.goodCondition).toBe(false);
    expect(D1H_R3_SEVERITY_RUNTIME_COUNT).toBe(0);
    expect(D1H_R3_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1H_R3_DIGITAL_TWIN_RUNTIME_COUNT).toBe(0);
    expect(D1H_R3_COMPLETENESS_STATES).toContain("COMPLETE_FOR_DECLARED_CONDITION_SCOPE");
    expect(D1H_R4_REQUIRED_R3_CONTRACTS).toContain("conditionStateIdentity");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_STATE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_RATING")?.implementationState).toBe("IMPLEMENTED_PROFILE_BOUND");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_ENGINEERING_INTERPRETATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CAPACITY_ASSESSMENT")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_REPAIR_DESIGN")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(sourcePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(scanAnalysisFormulaBypass(sourcePath, sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(`${sourceText}\n${doc}`).not.toMatch(/capacity reduction\s*=|section property\s*=|remaining life\s*=|corrosion rate\s*=|fatigue damage\s*=|condition score\s*=|safe if|unsafe if/i);
  });
});

function resultHasNoStructuralFinding(result: { runtimeDiagnostics: readonly { structuralFinding: false }[] }): boolean {
  return !("findings" in result) && result.runtimeDiagnostics.every((row) => row.structuralFinding === false);
}
