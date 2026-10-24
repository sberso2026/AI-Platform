import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CANONICAL_INTERNAL_UNITS } from "@rtb/types";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  bindStructuralInspectionTarget,
  createD1hR1Store,
  invalidateStructuralInspectionRecord,
  recordExplicitNegativeObservation,
  recordStructuralInspectionContext,
  recordStructuralInspectionCoverage,
  recordStructuralInspectionEvidence,
  type D1hR1CatalogObject,
  type D1hR1EvidenceInput,
  type D1hR1GovernedCatalog,
  type D1hR1TargetInput,
} from "./inspection-evidence";
import {
  AI_FINDING_AUTHORITY,
  D1H_R2_AI_CANDIDATE_GOVERNS,
  D1H_R2_COMPLETENESS_STATES,
  D1H_R2_CONDITION_RATING_RUNTIME_COUNT,
  D1H_R2_CONDITION_STATE_RUNTIME_COUNT,
  D1H_R2_ENGINEERING_INTERPRETATION_RUNTIME_COUNT,
  D1H_R2_FINDING_VALIDATION_STATES,
  D1H_R2_HUMAN_VALIDATION_RUNTIME_COUNT,
  D1H_R2_MATURITY_STATE,
  D1H_R2_MEASUREMENT_RUNTIME_COUNT,
  D1H_R2_MEASUREMENT_VALIDATION_STATES,
  D1H_R2_NEW_ENGINEERING_FORMULA_COUNT,
  D1H_R2_SEVERITY_RUNTIME_COUNT,
  D1H_R2_STRUCTURAL_FINDING_RUNTIME_COUNT,
  D1H_R2_VALIDATION_DECISION_STATES,
  D1H_R3_REQUIRED_R2_CONTRACTS,
  correctInspectionMeasurement,
  correctStructuralFinding,
  createD1hR2Store,
  evaluateStructuralFindingMeasurementValidation,
  promoteAiCandidateFinding,
  recordHumanValidation,
  recordInspectionMeasurement,
  recordStructuralFinding,
  structuralFindingProvenance,
  withdrawHumanValidation,
  type D1hR2FindingInput,
  type D1hR2MeasurementInput,
  type D1hR2ValidationInput,
} from "./inspection-finding";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "inspection-finding.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1H_R2_STRUCTURAL_FINDING_MEASUREMENT_VALIDATION_FOUNDATION.md");

function object(kind: D1hR1CatalogObject["kind"], id: string, overrides: Partial<D1hR1CatalogObject> = {}): D1hR1CatalogObject {
  return { kind, id, structuralSystemId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "1", lifecycle: "CURRENT", ...overrides };
}

function catalog(): D1hR1GovernedCatalog {
  return {
    objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-1"), object("MEMBER", "mem-2"), object("CONNECTION", "conn-1"), object("SUPPORT", "sup-1"), object("FOUNDATION", "fnd-1")],
    sessions: [{ inspectionSessionId: "ses-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1" }],
    artifacts: [{ artifactId: "art-photo", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-photo" }, { artifactId: "art-photo-2", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-photo-2" }],
    analysisResults: [],
  };
}

function provenance(version = "1") {
  return { tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", actorOrSystem: "inspector-1", timestamp: "2026-10-18T00:00:00.000Z", authority: "HUMAN", version, fingerprint: "pending" };
}

function location(id = "loc-1", kind: "MEMBER_STATION_OR_RANGE" | "CONNECTION_REGION" | "FOUNDATION_OR_SUPPORT_LOCATION" = "MEMBER_STATION_OR_RANGE") {
  return { locationId: id, locationKind: kind, description: "explicit station", explicit: true as const, aiSuggested: false, confirmed: true, inferredBy: null };
}

function evidenceInput(overrides: Partial<D1hR1EvidenceInput> = {}): D1hR1EvidenceInput {
  return { evidenceId: "ev-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", sourceClass: "PHOTO", sourceArtifactId: "art-photo", analysisResultId: null, priorEvidenceId: null, derivedFromEvidenceId: null, capturedAt: "2026-10-18T02:00:00.000Z", capturedBy: "inspector-1", location: location(), methodRef: "photo", unit: null, authority: "HUMAN_OBSERVATION", modelIdentity: null, modelVersion: null, executionFingerprint: null, provenance: provenance(), version: "1", recordedAt: "2026-10-18T02:00:00.000Z", explicitNegativeObservation: false, negativeScopeStatement: null, ...overrides };
}

function targetInput(kind: D1hR1TargetInput["targetKind"], id: string, extras: Partial<D1hR1TargetInput> = {}): D1hR1TargetInput {
  return { targetId: id, targetKind: kind, structuralSystemId: "sys-1", memberId: kind === "MEMBER" ? id : null, connectionId: kind === "CONNECTION" ? id : null, supportId: kind === "SUPPORT" ? id : null, foundationIdentity: kind === "FOUNDATION" ? id : null, parentTargetKind: null, parentTargetId: null, regionRef: null, candidateOnly: false, inferredBy: null, ...extras };
}

function prepared(targetKind: D1hR1TargetInput["targetKind"] = "MEMBER", targetId = "mem-1") {
  const r1 = createD1hR1Store();
  const source = catalog();
  recordStructuralInspectionContext(r1, source, { inspectionContextId: "ctx-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: "ses-1", purpose: "ROUTINE", scopeStatement: "member scope", inspectedAt: "2026-10-18T00:00:00.000Z", coverageScopeRef: "scope-1", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: provenance(), version: "1", status: "RECORDED", declaredTargetIds: [targetId], recordedAt: "2026-10-18T01:00:00.000Z" });
  bindStructuralInspectionTarget(r1, source, "ctx-1", targetInput(targetKind, targetId));
  recordStructuralInspectionCoverage(r1, { coverageId: "cov-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId, regionRef: null, methodRef: "visual", accessState: "INSPECTED_NO_FINDING_RECORDED", limitations: "visible face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-10-18T01:30:00.000Z" });
  recordStructuralInspectionEvidence(r1, source, evidenceInput({ targetId, location: location("loc-1", targetKind === "CONNECTION" ? "CONNECTION_REGION" : targetKind === "FOUNDATION" || targetKind === "SUPPORT" ? "FOUNDATION_OR_SUPPORT_LOCATION" : "MEMBER_STATION_OR_RANGE") }));
  return { r1, r2: createD1hR2Store(), source };
}

function findingInput(overrides: Partial<D1hR2FindingInput> = {}): D1hR2FindingInput {
  return { findingId: "find-1", inspectionContextId: "ctx-1", targetId: "mem-1", findingType: "CRACKING", location: location(), supportingEvidenceIds: ["ev-1"], origin: "HUMAN_RECORDED", authority: "HUMAN", createdAt: "2026-10-18T03:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "1", modelIdentity: null, modelVersion: null, executionFingerprint: null, ...overrides };
}

function measurementInput(overrides: Partial<D1hR2MeasurementInput> = {}): D1hR2MeasurementInput {
  return { measurementId: "meas-1", inspectionContextId: "ctx-1", targetId: "mem-1", evidenceId: "ev-1", findingId: "find-1", quantity: "length", value: 0.002, unit: CANONICAL_INTERNAL_UNITS.length, dimensionless: false, location: location(), methodRef: "gauge", sourceType: "INSTRUMENT_MEASURED", instrumentRef: "gauge-1", measuredAt: "2026-10-18T04:00:00.000Z", uncertainty: null, accuracy: null, calibrationBasis: null, modelIdentity: null, modelVersion: null, authority: "HUMAN", provenance: provenance(), version: "1", ...overrides };
}

const validators = [{ validatorId: "rev-1", role: "VALIDATOR" as const, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authorized: true }];

function validationInput(overrides: Partial<D1hR2ValidationInput> = {}): D1hR2ValidationInput {
  return { validationId: "val-1", inspectionContextId: "ctx-1", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-1", scopeStatement: "classification only", validatorId: "rev-1", role: "VALIDATOR", validatedAt: "2026-10-18T05:00:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null, ...overrides };
}

describe("EOS-D1H-R2 finding measurement validation foundation", () => {
  it("records a cracking finding from R1 evidence without a condition claim", () => {
    const { r1, r2 } = prepared();
    const beforeCoverage = r1.coverages.length;
    const finding = recordStructuralFinding(r1, r2, findingInput());
    expect(finding.recordKind).toBe("STRUCTURAL_FINDING");
    expect(finding.findingType).toBe("CRACKING");
    expect(finding.conditionRating).toBe(false);
    expect(finding.severity).toBe(false);
    expect(r2.links).toHaveLength(1);
    expect(r1.coverages.length).toBe(beforeCoverage);
    expect(r1.coverages[0]?.goodCondition).toBe(false);
    expect(D1H_R2_STRUCTURAL_FINDING_RUNTIME_COUNT).toBe(1);
    expect(D1H_R2_MATURITY_STATE).toBe("STRUCTURAL_FINDING_MEASUREMENT_VALIDATION_RUNTIME_FOUNDATION_IMPLEMENTED");
  });

  it("supports many evidence records for one finding and one evidence record for many findings", () => {
    const { r1, r2, source } = prepared();
    recordStructuralInspectionEvidence(r1, source, evidenceInput({ evidenceId: "ev-2", sourceArtifactId: "art-photo-2", location: location("loc-2") }));
    const finding = recordStructuralFinding(r1, r2, findingInput({ supportingEvidenceIds: ["ev-1", "ev-2"] }));
    expect(finding.supportingEvidenceIds).toEqual(["ev-1", "ev-2"]);
    recordStructuralFinding(r1, r2, findingInput({ findingId: "find-2", findingType: "CORROSION", location: location("loc-b") }));
    expect(r2.structuralFindings).toHaveLength(2);
    expect(r2.links.filter((row) => row.evidenceId === "ev-1")).toHaveLength(2);
    expect(() => recordStructuralFinding(r1, r2, findingInput({ findingId: "find-none", supportingEvidenceIds: [] }))).toThrow(/FINDING_EVIDENCE_REQUIRED/);
  });

  it("does not turn a negative observation or no-finding coverage into a structural finding", () => {
    const { r1, r2, source } = prepared();
    recordExplicitNegativeObservation(r1, source, evidenceInput({ evidenceId: "ev-neg", sourceClass: "HUMAN_OBSERVATION", sourceArtifactId: null, explicitNegativeObservation: true, negativeScopeStatement: "no relevant visible defect", methodRef: "visual" }));
    expect(() => recordStructuralFinding(r1, r2, findingInput({ findingId: "find-neg", supportingEvidenceIds: ["ev-neg"] }))).toThrow(/NEGATIVE_OBSERVATION_CANNOT_CREATE_FINDING/);
    expect(evaluateStructuralFindingMeasurementValidation(r1, r2, { inspectionContextId: "ctx-1", declaredFindingIds: [], declaredMeasurementIds: [], declaredValidationIds: [] }).findingIds).toEqual([]);
  });

  it("keeps an AI candidate non-governing and unpromoted", () => {
    const { r1, r2 } = prepared();
    const candidate = recordStructuralFinding(r1, r2, findingInput({ findingId: "find-ai", origin: "AI_CANDIDATE", authority: "AI_CANDIDATE", modelIdentity: "model-a", modelVersion: "0", executionFingerprint: "exec-1" }));
    expect(candidate.governs).toBe(false);
    expect(candidate.validationState).toBe("UNVALIDATED");
    expect(candidate.conditionRating).toBe(false);
    expect(D1H_R2_AI_CANDIDATE_GOVERNS).toBe(false);
    expect(AI_FINDING_AUTHORITY).toBe(false);
    expect(promoteAiCandidateFinding).toThrow(/AI_CANDIDATE_AUTO_PROMOTED_REJECTED/);
  });

  it("binds member, connection, support, foundation, and parented region targets and requires an explicit location", () => {
    for (const [kind, id] of [["CONNECTION", "conn-1"], ["SUPPORT", "sup-1"], ["FOUNDATION", "fnd-1"]] as const) {
      const { r1, r2 } = prepared(kind, id);
      const finding = recordStructuralFinding(r1, r2, findingInput({ targetId: id, location: location("loc-t", kind === "CONNECTION" ? "CONNECTION_REGION" : "FOUNDATION_OR_SUPPORT_LOCATION") }));
      expect(finding.targetId).toBe(id);
    }
    const region = prepared();
    bindStructuralInspectionTarget(region.r1, region.source, "ctx-1", targetInput("BOUNDED_REGION", "region-1", { memberId: null, parentTargetKind: "MEMBER", parentTargetId: "mem-1", regionRef: "midspan" }));
    recordStructuralInspectionCoverage(region.r1, { coverageId: "cov-region", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "region-1", regionRef: "midspan", methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "region only", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-10-18T01:40:00.000Z" });
    recordStructuralInspectionEvidence(region.r1, region.source, evidenceInput({ evidenceId: "ev-region", targetId: "region-1" }));
    expect(recordStructuralFinding(region.r1, region.r2, findingInput({ findingId: "find-region", targetId: "region-1", supportingEvidenceIds: ["ev-region"] })).targetId).toBe("region-1");
    expect(() => recordStructuralFinding(region.r1, region.r2, findingInput({ findingId: "find-guess", location: { ...location(), inferredBy: "FILENAME" } }))).toThrow(/LOCATION_GUESSED/);
    expect(() => recordStructuralFinding(region.r1, region.r2, findingInput({ findingId: "find-ai-loc", location: { ...location("loc-ai"), aiSuggested: true } }))).toThrow(/AI_LOCATION_CANNOT_GOVERN/);
  });

  it("records a quantified measurement with or without a finding and rejects a missing unit", () => {
    const { r1, r2 } = prepared();
    recordStructuralFinding(r1, r2, findingInput());
    const measured = recordInspectionMeasurement(r1, r2, measurementInput());
    expect(measured.unit).toBe(CANONICAL_INTERNAL_UNITS.length);
    expect(measured.instrumentMeasured).toBe(true);
    expect(measured.capacityChanged).toBe(false);
    const bare = recordInspectionMeasurement(r1, r2, measurementInput({ measurementId: "meas-bare", findingId: null, quantity: "length", value: 1, unit: "m" }));
    expect(bare.findingId).toBeNull();
    const qualitative = createD1hR2Store();
    recordStructuralFinding(r1, qualitative, findingInput({ findingId: "find-qual" }));
    expect(qualitative.measurements).toHaveLength(0);
    expect(() => recordInspectionMeasurement(r1, r2, measurementInput({ measurementId: "meas-missing", unit: null }))).toThrow(/MISSING_UNIT/);
    expect(() => recordInspectionMeasurement(r1, r2, measurementInput({ measurementId: "meas-blank", unit: " " }))).toThrow(/MISSING_UNIT/);
    const ratio = recordInspectionMeasurement(r1, r2, measurementInput({ measurementId: "meas-ratio", quantity: "ratio", value: 0.5, unit: "dimensionless", dimensionless: true, findingId: null }));
    expect(ratio.unit).toBe("dimensionless");
    expect(() => recordInspectionMeasurement(r1, r2, measurementInput({ measurementId: "meas-inferred", unit: "dimensionless", dimensionless: false, findingId: null }))).toThrow(/MISSING_UNIT_NOT_DIMENSIONLESS/);
    const estimated = recordInspectionMeasurement(r1, r2, measurementInput({ measurementId: "meas-ai", sourceType: "AI_ESTIMATED", authority: "AI_CANDIDATE", calibrationBasis: null, modelIdentity: "model-a", modelVersion: "0", findingId: null }));
    expect(estimated.governs).toBe(false);
    expect(estimated.instrumentMeasured).toBe(false);
    expect(D1H_R2_MEASUREMENT_RUNTIME_COUNT).toBe(1);
  });

  it("scopes human validation and does not cascade it", () => {
    const { r1, r2 } = prepared();
    recordStructuralFinding(r1, r2, findingInput());
    recordInspectionMeasurement(r1, r2, measurementInput());
    const findingValidation = recordHumanValidation(r1, r2, validators, validationInput());
    expect(findingValidation.engineeringAcceptance).toBe(false);
    expect(findingValidation.structuralAdequacy).toBe(false);
    expect(findingValidation.repairApproval).toBe(false);
    expect(findingValidation.independenceClaimed).toBe(false);
    expect(r2.measurements[0]?.validationState).toBe("UNVALIDATED");
    recordHumanValidation(r1, r2, validators, validationInput({ validationId: "val-m", subjectType: "MEASUREMENT_VALUE", subjectId: "meas-1", scopeStatement: "value only" }));
    recordHumanValidation(r1, r2, validators, validationInput({ validationId: "val-u", subjectType: "MEASUREMENT_UNIT", subjectId: "meas-1", scopeStatement: "unit only" }));
    recordHumanValidation(r1, r2, validators, validationInput({ validationId: "val-l", subjectType: "MEASUREMENT_LOCATION", subjectId: "meas-1", scopeStatement: "location only" }));
    expect(r2.structuralFindings[0]?.validationState).toBe("UNVALIDATED");
    expect(() => recordHumanValidation(r1, r2, [], validationInput({ validationId: "val-no" }))).toThrow(/VALIDATOR_UNAUTHORIZED/);
    expect(D1H_R2_HUMAN_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_R2_VALIDATION_DECISION_STATES).toContain("CONFIRMED");
    expect(D1H_R2_VALIDATION_DECISION_STATES).not.toContain("SAFE");
  });

  it("rejects cross-project, cross-tenant, and cross-target evidence", () => {
    const { r1, r2, source } = prepared();
    bindStructuralInspectionTarget(r1, source, "ctx-1", targetInput("MEMBER", "mem-2"));
    recordStructuralInspectionCoverage(r1, { coverageId: "cov-2", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-2", regionRef: null, methodRef: "visual", accessState: "NOT_INSPECTED", limitations: "separate member", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-10-18T01:35:00.000Z" });
    recordStructuralInspectionEvidence(r1, source, evidenceInput({ evidenceId: "ev-2", targetId: "mem-2", sourceArtifactId: "art-photo-2", location: location("loc-2") }));
    expect(() => recordStructuralFinding(r1, r2, findingInput({ supportingEvidenceIds: ["ev-2"] }))).toThrow(/TARGET_MISMATCH/);
    const other = createD1hR1Store();
    recordStructuralInspectionContext(other, { ...catalog(), objects: [object("STRUCTURAL_SYSTEM", "sys-2", { structuralSystemId: "sys-2", projectId: "project-2" })], sessions: [{ inspectionSessionId: "ses-2", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2" }] }, { inspectionContextId: "ctx-2", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2", structuralSystemId: "sys-2", inspectionSessionId: "ses-2", purpose: "ROUTINE", scopeStatement: "other", inspectedAt: "2026-10-18T00:00:00.000Z", coverageScopeRef: "scope-2", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: { ...provenance(), projectId: "project-2" }, version: "1", status: "RECORDED", declaredTargetIds: [], recordedAt: "2026-10-18T01:00:00.000Z" });
    expect(() => recordStructuralFinding(r1, r2, findingInput({ inspectionContextId: "ctx-2" }))).toThrow(/CONTEXT_UNKNOWN|CROSS_PROJECT/);
    expect(() => recordStructuralFinding(other, r2, findingInput({ inspectionContextId: "ctx-2", supportingEvidenceIds: ["ev-1"] }))).toThrow(/CROSS_PROJECT_BINDING_REJECTED|EVIDENCE_UNKNOWN/);
    const tenantStore = createD1hR1Store();
    const tenantCatalog = catalog();
    tenantCatalog.objects = tenantCatalog.objects.map((row) => ({ ...row, tenantId: "tenant-2" }));
    tenantCatalog.sessions = [{ inspectionSessionId: "ses-2", tenantId: "tenant-2", workspaceId: "workspace-1", projectId: "project-1" }];
    tenantCatalog.artifacts = tenantCatalog.artifacts.map((row) => ({ ...row, tenantId: "tenant-2" }));
    recordStructuralInspectionContext(tenantStore, tenantCatalog, { inspectionContextId: "ctx-t", tenantId: "tenant-2", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: "ses-2", purpose: "ROUTINE", scopeStatement: "other tenant", inspectedAt: "2026-10-18T00:00:00.000Z", coverageScopeRef: "scope-t", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: { ...provenance(), tenantId: "tenant-2" }, version: "1", status: "RECORDED", declaredTargetIds: ["mem-1"], recordedAt: "2026-10-18T01:00:00.000Z" });
    bindStructuralInspectionTarget(tenantStore, tenantCatalog, "ctx-t", targetInput("MEMBER", "mem-1"));
    recordStructuralInspectionCoverage(tenantStore, { coverageId: "cov-t", inspectionContextId: "ctx-t", inspectionSessionId: "ses-2", targetId: "mem-1", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "tenant scope", authority: "HUMAN", provenance: { ...provenance(), tenantId: "tenant-2" }, version: "1", recordedAt: "2026-10-18T01:30:00.000Z" });
    recordStructuralInspectionEvidence(tenantStore, tenantCatalog, evidenceInput({ evidenceId: "ev-foreign", inspectionContextId: "ctx-t", inspectionSessionId: "ses-2", provenance: { ...provenance(), tenantId: "tenant-2" } }));
    expect(() => recordStructuralFinding(tenantStore, createD1hR2Store(), findingInput({ inspectionContextId: "ctx-t", supportingEvidenceIds: ["ev-foreign"], provenance: provenance() }))).toThrow(/CROSS_TENANT_BINDING_REJECTED/);
  });

  it("keeps corrected history and invalidates dependent validation without deleting subjects", () => {
    const { r1, r2 } = prepared();
    const first = recordStructuralFinding(r1, r2, findingInput());
    recordInspectionMeasurement(r1, r2, measurementInput());
    recordHumanValidation(r1, r2, validators, validationInput());
    recordHumanValidation(r1, r2, validators, validationInput({ validationId: "val-m", subjectType: "MEASUREMENT_VALUE", subjectId: "meas-1" }));
    const findingSnapshot = JSON.stringify(first);
    correctStructuralFinding(r1, r2, "find-1", findingInput({ findingId: "find-1b", version: "2", findingType: "CORROSION", provenance: provenance("2") }), "FINDING_CLASSIFICATION_CORRECTED");
    expect(JSON.stringify(r2.structuralFindings[0])).toBe(findingSnapshot);
    expect(r2.validations).toHaveLength(2);
    expect(r2.states.some((row) => row.subjectId === "val-1" && row.effective === "STALE")).toBe(true);
    const measurementSnapshot = JSON.stringify(r2.measurements[0]);
    correctInspectionMeasurement(r1, r2, "meas-1", measurementInput({ measurementId: "meas-1b", version: "2", value: 0.003, provenance: provenance("2") }), "MEASUREMENT_CORRECTED");
    expect(JSON.stringify(r2.measurements[0])).toBe(measurementSnapshot);
    withdrawHumanValidation(r2, "val-m", "2026-10-18T06:00:00.000Z");
    expect(r2.structuralFindings.length).toBe(2);
    expect(r2.measurements.length).toBe(2);
    expect(r2.validations.length).toBe(2);
    invalidateStructuralInspectionRecord(r1, "SOURCE_CORRECTION", "EVIDENCE", "ev-1", "2026-10-18T07:00:00.000Z");
    const result = evaluateStructuralFindingMeasurementValidation(r1, r2, { inspectionContextId: "ctx-1", declaredFindingIds: ["find-1"], declaredMeasurementIds: ["meas-1"], declaredValidationIds: ["val-1"] });
    expect(result.completeness).toBe("STALE");
    expect(r2.invalidations.some((row) => row.deletesSubject === false)).toBe(true);
  });

  it("changes fingerprints, repeats them, and traces provenance", () => {
    const { r1, r2 } = prepared();
    const finding = recordStructuralFinding(r1, r2, findingInput());
    const otherType = recordStructuralFinding(prepared().r1, prepared().r2, findingInput({ findingType: "DEFORMATION" }));
    expect(otherType.fingerprint).not.toBe(finding.fingerprint);
    const moved = recordStructuralFinding(prepared().r1, prepared().r2, findingInput({ location: location("loc-9") }));
    expect(moved.fingerprint).not.toBe(finding.fingerprint);
    const { r1: evidenceStore, r2: evidenceRuntime, source } = prepared();
    recordStructuralInspectionEvidence(evidenceStore, source, evidenceInput({ evidenceId: "ev-2", sourceArtifactId: "art-photo-2", location: location("loc-2") }));
    expect(recordStructuralFinding(evidenceStore, evidenceRuntime, findingInput({ supportingEvidenceIds: ["ev-2"] })).fingerprint).not.toBe(finding.fingerprint);
    const measurement = recordInspectionMeasurement(r1, r2, measurementInput({ findingId: null }));
    expect(recordInspectionMeasurement(prepared().r1, prepared().r2, measurementInput({ value: 0.004, findingId: null })).fingerprint).not.toBe(measurement.fingerprint);
    expect(recordInspectionMeasurement(prepared().r1, prepared().r2, measurementInput({ unit: CANONICAL_INTERNAL_UNITS.force, findingId: null })).fingerprint).not.toBe(measurement.fingerprint);
    expect(recordInspectionMeasurement(prepared().r1, prepared().r2, measurementInput({ methodRef: "tape", findingId: null })).fingerprint).not.toBe(measurement.fingerprint);
    const validation = recordHumanValidation(r1, r2, validators, validationInput({ subjectType: "EVIDENCE_IDENTITY", subjectId: "ev-1" }));
    expect(recordHumanValidation(prepared().r1, prepared().r2, validators, validationInput({ subjectType: "EVIDENCE_TARGET_LINK", subjectId: "ev-1", scopeStatement: "target link" })).fingerprint).not.toBe(validation.fingerprint);
    expect(recordHumanValidation(prepared().r1, prepared().r2, validators, validationInput({ decision: "REJECTED", subjectType: "EVIDENCE_IDENTITY", subjectId: "ev-1" })).fingerprint).not.toBe(validation.fingerprint);
    expect(structuralFindingProvenance(r1, r2, "find-1")).toEqual(expect.arrayContaining(["context:ctx-1", "coverage:cov-1", "evidence:ev-1", "link:find-1:ev-1", "finding:find-1"]));
    const left = evaluateStructuralFindingMeasurementValidation(r1, r2, { inspectionContextId: "ctx-1", declaredFindingIds: ["find-1"], declaredMeasurementIds: ["meas-1"], declaredValidationIds: [] });
    const again = prepared();
    recordStructuralFinding(again.r1, again.r2, findingInput());
    recordInspectionMeasurement(again.r1, again.r2, measurementInput({ findingId: null }));
    recordHumanValidation(again.r1, again.r2, validators, validationInput({ subjectType: "EVIDENCE_IDENTITY", subjectId: "ev-1" }));
    expect(evaluateStructuralFindingMeasurementValidation(again.r1, again.r2, { inspectionContextId: "ctx-1", declaredFindingIds: ["find-1"], declaredMeasurementIds: ["meas-1"], declaredValidationIds: [] })).toEqual(left);
  });

  it("keeps runtime diagnostics distinct from structural findings and leaves condition runtime unimplemented", () => {
    const { r1, r2 } = prepared();
    expect(() => recordStructuralFinding(r1, r2, findingInput({ findingType: "MISSING_UNIT" as "CRACKING" }))).toThrow(/FINDING_TYPE_UNKNOWN/);
    expect(r2.structuralFindings).toHaveLength(0);
    const result = evaluateStructuralFindingMeasurementValidation(r1, r2, { inspectionContextId: "ctx-1", declaredFindingIds: ["missing"], declaredMeasurementIds: [], declaredValidationIds: [] });
    expect(result.runtimeDiagnostics.every((row) => row.kind === "RUNTIME_DIAGNOSTIC" && row.structuralFinding === false)).toBe(true);
    expect(result.findingIds).toEqual([]);
    expect(result.conditionStateIds).toEqual([]);
    expect(result.conditionRatingIds).toEqual([]);
    expect(result.engineeringInterpretationIds).toEqual([]);
    expect(result.conditionAssessment).toBe(false);
    expect(result.goodCondition).toBe(false);
    expect(D1H_R2_CONDITION_STATE_RUNTIME_COUNT).toBe(0);
    expect(D1H_R2_CONDITION_RATING_RUNTIME_COUNT).toBe(0);
    expect(D1H_R2_ENGINEERING_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1H_R2_SEVERITY_RUNTIME_COUNT).toBe(0);
    expect(D1H_R2_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1H_R2_FINDING_VALIDATION_STATES).not.toContain("SAFE");
    expect(D1H_R2_MEASUREMENT_VALIDATION_STATES).not.toContain("PASS");
    expect(D1H_R2_COMPLETENESS_STATES).toContain("COMPLETE_FOR_DECLARED_R2_SCOPE");
    expect(() => recordStructuralFinding(r1, r2, { ...findingInput(), severityScore: 3 } as D1hR2FindingInput)).toThrow(/SCOPE_REJECTED:severityScore/);
    expect(() => recordInspectionMeasurement(r1, r2, { ...measurementInput(), conditionRating: "poor" } as D1hR2MeasurementInput)).toThrow(/SCOPE_REJECTED:conditionRating/);
    expect(D1H_R3_REQUIRED_R2_CONTRACTS).toContain("structuralFindingIdentity");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_FINDING_RUNTIME")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_MEASUREMENT_RUNTIME")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_HUMAN_VALIDATION_RUNTIME")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_STATE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(sourcePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(scanAnalysisFormulaBypass(sourcePath, sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(`${sourceText}\n${doc}`).not.toMatch(/crack width\s*[<>]=?\s*\d|section loss\s*[<>]=?\s*\d|corrosion rate\s*=|remaining life\s*=|fatigue damage\s*=|capacity reduction\s*=|condition score\s*=|severity score\s*=/i);
    expect(sourceText).not.toMatch(/FaceDetector|employeeProductivity/i);
  });
});
