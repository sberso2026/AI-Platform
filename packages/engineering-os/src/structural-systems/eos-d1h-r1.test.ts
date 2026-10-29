import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D1H_COVERAGE_RESULTS } from "@rtb/types";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  AI_COVERAGE_AUTHORITY,
  D1H_R1_ALL_OBSERVATIONS_CLASSIFIED_AS_OBSERVED_DEFECT,
  D1H_R1_ARTIFACT_REQUIREMENT_MATRIX,
  D1H_R1_CONDITION_RATING_RUNTIME_COUNT,
  D1H_R1_CONDITION_STATE_RUNTIME_COUNT,
  D1H_R1_ENGINEERING_INTERPRETATION_RUNTIME_COUNT,
  D1H_R1_EVIDENCE_COMPLETENESS_STATES,
  D1H_R1_EVIDENCE_FOUNDATION_RUNTIME_COUNT,
  D1H_R1_HUMAN_VALIDATION_RUNTIME_COUNT,
  D1H_R1_MATURITY_STATE,
  D1H_R1_MEASUREMENT_RUNTIME_COUNT,
  D1H_R1_NEW_ENGINEERING_FORMULA_COUNT,
  D1H_R1_STRUCTURAL_FINDING_RUNTIME_COUNT,
  D1H_R2_REQUIRED_R1_CONTRACTS,
  aggregateSystemCoverageCompleteness,
  bindStructuralInspectionTarget,
  correctStructuralInspectionEvidence,
  createD1hR1Store,
  deriveStructuralInspectionEvidence,
  evaluateStructuralInspectionEvidence,
  invalidateStructuralInspectionRecord,
  provenanceChain,
  rebindStaleTarget,
  recordExplicitNegativeObservation,
  recordStructuralInspectionContext,
  recordStructuralInspectionCoverage,
  recordStructuralInspectionEvidence,
  type D1hR1CatalogObject,
  type D1hR1EvidenceInput,
  type D1hR1GovernedCatalog,
  type D1hR1TargetInput,
} from "./inspection-evidence";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "inspection-evidence.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1H_R1_STRUCTURAL_INSPECTION_EVIDENCE_FOUNDATION.md");

function object(kind: D1hR1CatalogObject["kind"], id: string, overrides: Partial<D1hR1CatalogObject> = {}): D1hR1CatalogObject {
  return {
    kind,
    id,
    structuralSystemId: "sys-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    version: "1",
    lifecycle: "CURRENT",
    ...overrides,
  };
}

function catalog(overrides: Partial<D1hR1GovernedCatalog> = {}): D1hR1GovernedCatalog {
  return {
    objects: [
      object("STRUCTURAL_SYSTEM", "sys-1"),
      object("MEMBER", "mem-1"),
      object("MEMBER", "mem-2"),
      object("CONNECTION", "conn-1"),
      object("SUPPORT", "sup-1"),
      object("FOUNDATION", "fnd-1"),
    ],
    sessions: [{ inspectionSessionId: "ses-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1" }],
    artifacts: [
      { artifactId: "art-photo", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-photo" },
      { artifactId: "art-photo-copy", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-photo" },
      { artifactId: "art-doc", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-doc" },
      { artifactId: "art-video", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-video" },
    ],
    analysisResults: [{ analysisResultId: "result-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1" }],
    ...overrides,
  };
}

function provenance(version = "1") {
  return {
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    actorOrSystem: "inspector-1",
    timestamp: "2026-10-18T00:00:00.000Z",
    authority: "HUMAN",
    version,
    fingerprint: "pending",
  };
}

function contextInput(overrides: Record<string, unknown> = {}) {
  return {
    inspectionContextId: "ctx-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    structuralSystemId: "sys-1",
    inspectionSessionId: "ses-1",
    purpose: "ROUTINE" as const,
    scopeStatement: "declared member scope",
    inspectedAt: "2026-10-18T00:00:00.000Z",
    coverageScopeRef: "scope-1",
    methodRefs: ["visual", "photo"],
    sourceAuthority: "HUMAN",
    governanceProfileRef: "profile-1",
    provenance: provenance(),
    version: "1",
    status: "RECORDED" as const,
    declaredTargetIds: ["mem-1"],
    recordedAt: "2026-10-18T01:00:00.000Z",
    ...overrides,
  };
}

function targetInput(kind: D1hR1TargetInput["targetKind"], id: string, extras: Partial<D1hR1TargetInput> = {}): D1hR1TargetInput {
  return {
    targetId: id,
    targetKind: kind,
    structuralSystemId: "sys-1",
    memberId: kind === "MEMBER" ? id : null,
    connectionId: kind === "CONNECTION" ? id : null,
    supportId: kind === "SUPPORT" ? id : null,
    foundationIdentity: kind === "FOUNDATION" ? id : null,
    parentTargetKind: null,
    parentTargetId: null,
    regionRef: null,
    candidateOnly: false,
    inferredBy: null,
    ...extras,
  };
}

function location(id = "loc-1") {
  return {
    locationId: id,
    locationKind: "MEMBER_STATION_OR_RANGE" as const,
    description: "station 1 to 2",
    explicit: true as const,
    aiSuggested: false,
    confirmed: true,
    inferredBy: null,
  };
}

function evidenceInput(overrides: Partial<D1hR1EvidenceInput> = {}): D1hR1EvidenceInput {
  return {
    evidenceId: "ev-1",
    inspectionContextId: "ctx-1",
    inspectionSessionId: "ses-1",
    targetId: "mem-1",
    sourceClass: "PHOTO",
    sourceArtifactId: "art-photo",
    analysisResultId: null,
    priorEvidenceId: null,
    derivedFromEvidenceId: null,
    capturedAt: "2026-10-18T02:00:00.000Z",
    capturedBy: "inspector-1",
    location: location(),
    methodRef: "photo",
    unit: null,
    authority: "HUMAN_OBSERVATION",
    modelIdentity: null,
    modelVersion: null,
    executionFingerprint: null,
    provenance: provenance(),
    version: "1",
    recordedAt: "2026-10-18T02:00:00.000Z",
    explicitNegativeObservation: false,
    negativeScopeStatement: null,
    ...overrides,
  };
}

function prepared(targetKind: D1hR1TargetInput["targetKind"] = "MEMBER", targetId = "mem-1") {
  const store = createD1hR1Store();
  const source = catalog();
  const context = recordStructuralInspectionContext(store, source, contextInput({ declaredTargetIds: [targetId] }));
  const target = bindStructuralInspectionTarget(store, source, context.inspectionContextId, targetInput(targetKind, targetId));
  return { store, source, context, target };
}

describe("EOS-D1H-R1 structural inspection evidence foundation", () => {
  it("records member evidence with provenance and fingerprints", () => {
    const { store, source } = prepared();
    recordStructuralInspectionCoverage(store, {
      coverageId: "cov-1",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "photo",
      accessState: "INSPECTED_WITH_FINDINGS",
      limitations: "north face only",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    const photo = recordStructuralInspectionEvidence(store, source, evidenceInput());
    const document = recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-doc",
      sourceClass: "DOCUMENT",
      sourceArtifactId: "art-doc",
      location: location("loc-doc"),
    }));
    const observation = recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-human",
      sourceClass: "HUMAN_OBSERVATION",
      sourceArtifactId: null,
      location: location("loc-human"),
    }));
    const result = evaluateStructuralInspectionEvidence(store, "ctx-1");
    expect(photo.fingerprint).toBeTruthy();
    expect(document.createsDefect).toBe(false);
    expect(observation.classifiedAsObservedDefect).toBe(false);
    expect(result.evidenceIds).toEqual(["ev-1", "ev-doc", "ev-human"]);
    expect(result.structuralFindingIds).toEqual([]);
    expect(provenanceChain(store, "ev-1")).toContain("artifact:art-photo");
    expect(D1H_R1_EVIDENCE_FOUNDATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_R1_MATURITY_STATE).toBe("STRUCTURAL_INSPECTION_EVIDENCE_RUNTIME_FOUNDATION_IMPLEMENTED");
  });

  it("binds connection, support, and foundation targets", () => {
    for (const [kind, id] of [["CONNECTION", "conn-1"], ["SUPPORT", "sup-1"], ["FOUNDATION", "fnd-1"]] as const) {
      const { store, target } = prepared(kind, id);
      expect(target.targetKind).toBe(kind);
      expect(store.targets).toHaveLength(1);
    }
  });

  it("requires a governed parent for a bounded region and rejects an orphan", () => {
    const { store, source } = prepared("MEMBER", "mem-1");
    const region = bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("BOUNDED_REGION", "region-1", {
      memberId: null,
      parentTargetKind: "MEMBER",
      parentTargetId: "mem-1",
      regionRef: "midspan",
    }));
    expect(region.parentTargetId).toBe("mem-1");
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("BOUNDED_REGION", "region-2", { memberId: null }))).toThrow(/ORPHAN_BOUNDED_REGION/);
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("BOUNDED_REGION", "region-3", {
      memberId: null,
      parentTargetKind: "MEMBER",
      parentTargetId: "missing",
      regionRef: "end",
    }))).toThrow(/ORPHAN_BOUNDED_REGION/);
  });

  it("keeps every coverage state distinct from healthy, inspected, and defect-free", () => {
    for (const accessState of D1H_COVERAGE_RESULTS) {
      const { store } = prepared();
      const coverage = recordStructuralInspectionCoverage(store, {
        coverageId: `cov-${accessState}`,
        inspectionContextId: "ctx-1",
        inspectionSessionId: "ses-1",
        targetId: "mem-1",
        regionRef: null,
        methodRef: "visual",
        accessState,
        limitations: "access note",
        authority: "HUMAN",
        provenance: provenance(),
        version: "1",
        recordedAt: "2026-10-18T01:30:00.000Z",
      });
      expect(coverage.goodCondition).toBe(false);
      expect(coverage.inspectedEqualsHealthy).toBe(false);
      expect(coverage.inspectedNoFindingEqualsDefectFree).toBe(false);
      expect(coverage.inaccessibleEqualsNoDefect).toBe(false);
      expect(coverage.createsFinding).toBe(false);
      expect(coverage.createsConditionRating).toBe(false);
      expect(coverage.methodAdequacy).toBe(false);
      expect(coverage.limitations).toBe("access note");
    }
    expect(D1H_COVERAGE_RESULTS.indexOf("NOT_INSPECTED")).not.toBe(D1H_COVERAGE_RESULTS.indexOf("INSPECTED_NO_FINDING_RECORDED"));
    expect(D1H_COVERAGE_RESULTS.indexOf("INACCESSIBLE")).not.toBe(D1H_COVERAGE_RESULTS.indexOf("INSPECTED_WITH_FINDINGS"));
  });

  it("records a scoped negative observation without creating a defect", () => {
    const { store, source } = prepared();
    recordStructuralInspectionCoverage(store, {
      coverageId: "cov-neg",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: "visible face",
      methodRef: "visual",
      accessState: "INSPECTED_NO_FINDING_RECORDED",
      limitations: "far side inaccessible",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    const evidence = recordExplicitNegativeObservation(store, source, evidenceInput({
      evidenceId: "ev-neg",
      sourceClass: "HUMAN_OBSERVATION",
      sourceArtifactId: null,
      explicitNegativeObservation: true,
      negativeScopeStatement: "no relevant visible defect on the declared face",
      methodRef: "visual",
    }));
    const result = evaluateStructuralInspectionEvidence(store, "ctx-1");
    expect(evidence.createsDefect).toBe(false);
    expect(evidence.classifiedAsObservedDefect).toBe(false);
    expect(D1H_R1_ALL_OBSERVATIONS_CLASSIFIED_AS_OBSERVED_DEFECT).toBe(false);
    expect(result.goodCondition).toBe(false);
    expect(result.defectFree).toBe(false);
    expect(result.healthy).toBe(false);
    expect(result.safe).toBe(false);
    expect(result.structuralFindingIds).toEqual([]);
    expect(store.coverages[0]?.limitations).toBe("far side inaccessible");
  });

  it("keeps evidence without a finding and enforces artifact requirements", () => {
    const { store, source } = prepared();
    recordStructuralInspectionCoverage(store, {
      coverageId: "cov-1",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "photo",
      accessState: "INSPECTED_NO_FINDING_RECORDED",
      limitations: "none declared beyond the face",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    const evidence = recordStructuralInspectionEvidence(store, source, evidenceInput());
    expect(evidence.createsDefect).toBe(false);
    expect(evaluateStructuralInspectionEvidence(store, "ctx-1").structuralFindingIds).toEqual([]);
    expect(() => recordStructuralInspectionEvidence(store, source, evidenceInput({ evidenceId: "ev-missing", sourceArtifactId: null }))).toThrow(/ARTIFACT_REQUIRED/);
    expect(() => recordStructuralInspectionEvidence(store, source, evidenceInput({ evidenceId: "ev-unknown", sourceArtifactId: "missing" }))).toThrow(/ARTIFACT_UNKNOWN/);
    expect(D1H_R1_ARTIFACT_REQUIREMENT_MATRIX.PHOTO).toBe("REQUIRED");
    expect(D1H_R1_ARTIFACT_REQUIREMENT_MATRIX.HUMAN_OBSERVATION).toBe("OPTIONAL");
    expect(D1H_R1_ARTIFACT_REQUIREMENT_MATRIX.ANALYSIS_RESULT_REFERENCE).toBe("ANALYSIS_RESULT");
    expect(D1H_R1_ARTIFACT_REQUIREMENT_MATRIX.AI_DERIVED_CANDIDATE_EVIDENCE).toBe("DERIVED_SOURCE");
    const historical = recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-hist",
      sourceClass: "HISTORICAL_INSPECTION_REFERENCE",
      priorEvidenceId: "ev-1",
      location: location("loc-hist"),
    }));
    expect(historical.reauthored).toBe(false);
    expect(() => recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-hist-copy",
      sourceClass: "HISTORICAL_INSPECTION_REFERENCE",
      sourceArtifactId: "art-doc",
      priorEvidenceId: "ev-1",
      location: location("loc-hist-2"),
    }))).toThrow(/HISTORICAL_REAUTHOR_REJECTED/);
  });

  it("traces derived evidence and rejects a derivation cycle", () => {
    const { store, source } = prepared();
    recordStructuralInspectionEvidence(store, source, evidenceInput());
    const derived = deriveStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-ai",
      sourceClass: "AI_DERIVED_CANDIDATE_EVIDENCE",
      sourceArtifactId: null,
      derivedFromEvidenceId: "ev-1",
      authority: "AI_CANDIDATE",
      modelIdentity: "candidate-model",
      modelVersion: "0",
      executionFingerprint: "exec-1",
    }));
    expect(derived.governsEngineering).toBe(false);
    expect(provenanceChain(store, "ev-ai")).toEqual(expect.arrayContaining(["source:ev-1", "raw:art-photo"]));
    expect(store.evidence[0]?.sourceArtifactId).toBe("art-photo");
    expect(() => deriveStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-cycle",
      sourceClass: "AI_DERIVED_CANDIDATE_EVIDENCE",
      sourceArtifactId: null,
      derivedFromEvidenceId: "ev-cycle",
      authority: "AI_CANDIDATE",
      modelIdentity: "candidate-model",
      modelVersion: "0",
      executionFingerprint: "exec-2",
    }))).toThrow(/DERIVATION_CYCLE/);
  });

  it("rejects duplicate evidence ids and does not merge duplicate content", () => {
    const { store, source } = prepared();
    recordStructuralInspectionEvidence(store, source, evidenceInput());
    expect(() => recordStructuralInspectionEvidence(store, source, evidenceInput())).toThrow(/DUPLICATE_EVIDENCE_ID/);
    recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-copy",
      sourceArtifactId: "art-photo-copy",
      location: location("loc-copy"),
    }));
    const result = evaluateStructuralInspectionEvidence(store, "ctx-1");
    expect(store.evidence).toHaveLength(2);
    expect(result.warnings).toContain("DUPLICATE_CONTENT_NOT_INDEPENDENT");
    expect(store.evidence.every((row) => row.independentCorroboration === false)).toBe(true);
  });

  it("rejects unknown, stale, unconfirmed, inferred, cross-project, and cross-tenant targets", () => {
    const { store, source } = prepared();
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("MEMBER", "missing"))).toThrow(/TARGET_UNKNOWN/);
    const staleCatalog = catalog({ objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-stale", { lifecycle: "SUPERSEDED" })] });
    expect(() => bindStructuralInspectionTarget(store, staleCatalog, "ctx-1", targetInput("MEMBER", "mem-stale"))).toThrow(/STALE_TARGET/);
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("MEMBER", "mem-2", { candidateOnly: true }))).toThrow(/UNCONFIRMED_TARGET/);
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("MEMBER", "mem-2", { inferredBy: "FILENAME" }))).toThrow(/TARGET_INFERRED/);
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("MEMBER", "mem-2", { inferredBy: "LLM" }))).toThrow(/TARGET_INFERRED/);
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("MEMBER", "mem-2", { inferredBy: "IMAGE" }))).toThrow(/TARGET_INFERRED/);
    expect(() => bindStructuralInspectionTarget(store, source, "ctx-1", targetInput("MEMBER", "mem-2", { inferredBy: "PROXIMITY" }))).toThrow(/TARGET_INFERRED/);
    const otherProject = catalog({ objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-x", { projectId: "project-2" })] });
    expect(() => bindStructuralInspectionTarget(store, otherProject, "ctx-1", targetInput("MEMBER", "mem-x"))).toThrow(/CROSS_PROJECT_BINDING_REJECTED/);
    const otherTenant = catalog({ objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-y", { tenantId: "tenant-2" })] });
    expect(() => bindStructuralInspectionTarget(store, otherTenant, "ctx-1", targetInput("MEMBER", "mem-y"))).toThrow(/CROSS_TENANT_BINDING_REJECTED/);
    expect(() => recordStructuralInspectionContext(createD1hR1Store(), catalog({
      sessions: [{ inspectionSessionId: "ses-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2" }],
    }), contextInput())).toThrow(/CROSS_PROJECT_BINDING_REJECTED/);
    expect(() => recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-guess",
      location: { ...location(), inferredBy: "FILENAME" },
    }))).toThrow(/LOCATION_GUESSED/);
    expect(rebindStaleTarget).toThrow(/STALE_TARGET_AUTO_REBIND_REJECTED/);
  });

  it("preserves history when evidence is corrected", () => {
    const { store, source } = prepared();
    const first = recordStructuralInspectionEvidence(store, source, evidenceInput());
    const snapshot = JSON.stringify(first);
    const second = correctStructuralInspectionEvidence(store, source, "ev-1", evidenceInput({
      evidenceId: "ev-1b",
      version: "2",
      provenance: provenance("2"),
      location: location("loc-2"),
    }));
    expect(JSON.stringify(store.evidence[0])).toBe(snapshot);
    expect(store.evidence[0]?.fingerprint).toBe(first.fingerprint);
    expect(second.predecessorId).toBe("ev-1");
    expect(second.fingerprint).not.toBe(first.fingerprint);
    expect(store.evidence).toHaveLength(2);
    expect(store.history.some((row) => row.subjectId === "ev-1" && row.action === "SUPERSEDED")).toBe(true);
  });

  it("invalidates without deleting history", () => {
    const { store, source } = prepared();
    recordStructuralInspectionCoverage(store, {
      coverageId: "cov-1",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "visual",
      accessState: "INSPECTED_NO_FINDING_RECORDED",
      limitations: "partial view",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    const evidence = recordStructuralInspectionEvidence(store, source, evidenceInput());
    const beforeEvidence = JSON.stringify(store.evidence);
    const beforeCoverage = JSON.stringify(store.coverages);
    for (const cause of ["TARGET_REVISION", "SOURCE_CORRECTION", "LOCATION_CORRECTION", "AUTHORITY_WITHDRAWN"] as const) {
      invalidateStructuralInspectionRecord(store, cause, cause === "TARGET_REVISION" ? "TARGET" : "EVIDENCE", cause === "TARGET_REVISION" ? "mem-1" : "ev-1", "2026-10-18T03:00:00.000Z");
    }
    invalidateStructuralInspectionRecord(store, "COVERAGE_CORRECTION", "COVERAGE", "cov-1", "2026-10-18T03:00:00.000Z");
    expect(store.evidence).toHaveLength(1);
    expect(JSON.stringify(store.evidence)).toBe(beforeEvidence);
    expect(JSON.stringify(store.coverages)).toBe(beforeCoverage);
    expect(store.evidence[0]?.fingerprint).toBe(evidence.fingerprint);
    expect(store.invalidations.every((row) => row.deletesHistory === false)).toBe(true);
    expect(evaluateStructuralInspectionEvidence(store, "ctx-1").completeness).toBe("STALE");
    expect(evaluateStructuralInspectionEvidence(store, "ctx-1").blockingFindings).toContain("AUTHORITY_WITHDRAWN");
  });

  it("changes fingerprints for governed changes and repeats them for the same input", () => {
    const base = recordStructuralInspectionContext(createD1hR1Store(), catalog(), contextInput());
    const reordered = recordStructuralInspectionContext(createD1hR1Store(), catalog(), contextInput({ methodRefs: ["photo", "visual"] }));
    expect(reordered.fingerprint).toBe(base.fingerprint);
    expect(recordStructuralInspectionContext(createD1hR1Store(), catalog(), contextInput({ structuralSystemId: "sys-1", scopeStatement: "other scope" })).fingerprint).not.toBe(base.fingerprint);
    const { store, source } = prepared();
    const coverage = recordStructuralInspectionCoverage(store, {
      coverageId: "cov-1",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "visual",
      accessState: "NOT_INSPECTED",
      limitations: "none",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    const otherStore = prepared();
    const otherCoverage = recordStructuralInspectionCoverage(otherStore.store, {
      coverageId: "cov-1",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "visual",
      accessState: "INACCESSIBLE",
      limitations: "none",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    expect(otherCoverage.fingerprint).not.toBe(coverage.fingerprint);
    const limited = recordStructuralInspectionCoverage(prepared().store, { ...coverage, limitations: "obstructed", provenance: provenance() });
    expect(limited.fingerprint).not.toBe(coverage.fingerprint);
    const evidence = recordStructuralInspectionEvidence(store, source, evidenceInput());
    const moved = recordStructuralInspectionEvidence(prepared().store, catalog(), evidenceInput({ location: location("loc-9") }));
    expect(moved.fingerprint).not.toBe(evidence.fingerprint);
    const otherArtifact = recordStructuralInspectionEvidence(prepared().store, catalog(), evidenceInput({ sourceArtifactId: "art-doc" }));
    expect(otherArtifact.fingerprint).not.toBe(evidence.fingerprint);
    const otherMethod = recordStructuralInspectionEvidence(prepared().store, catalog(), evidenceInput({ methodRef: "close-visual" }));
    expect(otherMethod.fingerprint).not.toBe(evidence.fingerprint);
    const otherAuthority = recordStructuralInspectionEvidence(prepared().store, catalog(), evidenceInput({ authority: "GOVERNED_IMPORT" }));
    expect(otherAuthority.fingerprint).not.toBe(evidence.fingerprint);
    const otherVersion = recordStructuralInspectionEvidence(prepared().store, catalog(), evidenceInput({ version: "2", provenance: provenance("2") }));
    expect(otherVersion.fingerprint).not.toBe(evidence.fingerprint);
    const otherTargetStore = prepared("CONNECTION", "conn-1");
    const otherTarget = recordStructuralInspectionEvidence(otherTargetStore.store, otherTargetStore.source, evidenceInput({ targetId: "conn-1", location: { ...location(), locationKind: "CONNECTION_REGION" } }));
    expect(otherTarget.fingerprint).not.toBe(evidence.fingerprint);
  });

  it("requires complete provenance and a traceable chain", () => {
    expect(() => recordStructuralInspectionContext(createD1hR1Store(), catalog(), contextInput({
      provenance: { ...provenance(), actorOrSystem: "" },
    }))).toThrow(/PROVENANCE_INCOMPLETE/);
    const { store, source } = prepared();
    recordStructuralInspectionEvidence(store, source, evidenceInput());
    const chain = provenanceChain(store, "ev-1");
    expect(chain).toEqual(expect.arrayContaining(["project:project-1", "system:sys-1", "session:ses-1", "context:ctx-1", "target:mem-1", "evidence:ev-1", "artifact:art-photo"]));
  });

  it("repeats the same result for the same governed inputs", () => {
    function run() {
      const { store, source } = prepared();
      recordStructuralInspectionCoverage(store, {
        coverageId: "cov-1",
        inspectionContextId: "ctx-1",
        inspectionSessionId: "ses-1",
        targetId: "mem-1",
        regionRef: null,
        methodRef: "photo",
        accessState: "INSPECTED_NO_FINDING_RECORDED",
        limitations: "face only",
        authority: "HUMAN",
        provenance: provenance(),
        version: "1",
        recordedAt: "2026-10-18T01:30:00.000Z",
      });
      recordStructuralInspectionEvidence(store, source, evidenceInput());
      return evaluateStructuralInspectionEvidence(store, "ctx-1");
    }
    const left = run();
    const right = run();
    expect(right).toEqual(left);
    expect(left.completeness).toBe("COMPLETE_FOR_DECLARED_EVIDENCE_SCOPE");
    expect(left.goodCondition).toBe(false);
    expect(left.inspectionAdequate).toBe(false);
    expect(left.engineeringAccepted).toBe(false);
    expect(left.conditionAssessment).toBe(false);
    expect(left.inspectionApproval).toBe(false);
    expect(aggregateSystemCoverageCompleteness()).toBe(false);
    expect(left.systemCoverageComplete).toBe(false);
    expect(left.structureClear).toBe(false);
  });

  it("does not change capacity or the analysis model and does not run finding or condition engines", () => {
    const { store, source } = prepared();
    recordStructuralInspectionEvidence(store, source, evidenceInput({
      evidenceId: "ev-analysis",
      sourceClass: "ANALYSIS_RESULT_REFERENCE",
      sourceArtifactId: null,
      analysisResultId: "result-1",
    }));
    const result = evaluateStructuralInspectionEvidence(store, "ctx-1");
    expect(result.capacityChanged).toBe(false);
    expect(result.sectionPropertiesChanged).toBe(false);
    expect(result.materialPropertiesChanged).toBe(false);
    expect(result.analysisModelChanged).toBe(false);
    expect(result.supportsChanged).toBe(false);
    expect(result.releasesChanged).toBe(false);
    expect(result.loadsChanged).toBe(false);
    expect(store.evidence[0]?.observedCondition).toBe(false);
    expect(store.evidence[0]?.measuredResponse).toBe(false);
    expect(result.structuralFindingIds).toEqual([]);
    expect(result.runtimeDiagnostics.every((row) => row.kind === "RUNTIME_DIAGNOSTIC" && row.structuralFinding === false)).toBe(true);
    expect(result.blockingRuntimeDiagnostics.every((row) => row.kind === "RUNTIME_DIAGNOSTIC" && row.structuralFinding === false)).toBe(true);
    expect(result.measurementIds).toEqual([]);
    expect(result.conditionStateIds).toEqual([]);
    expect(result.conditionRatingIds).toEqual([]);
    expect(result.engineeringInterpretationIds).toEqual([]);
    expect(result.humanValidationIds).toEqual([]);
    expect(D1H_R1_STRUCTURAL_FINDING_RUNTIME_COUNT).toBe(0);
    expect(D1H_R1_MEASUREMENT_RUNTIME_COUNT).toBe(0);
    expect(D1H_R1_CONDITION_STATE_RUNTIME_COUNT).toBe(0);
    expect(D1H_R1_CONDITION_RATING_RUNTIME_COUNT).toBe(0);
    expect(D1H_R1_ENGINEERING_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1H_R1_HUMAN_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1H_R1_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    const sourceText = readFileSync(sourcePath, "utf8");
    expect(sourceText).not.toMatch(/D1hStructuralFinding|createConditionRating|ConditionRatingScheme|assertInspectionTransition|INSPECTION_SESSION_STATES/);
    expect(sourceText).not.toMatch(/faceDetector|FaceDetector|employeeProductivity/i);
    expect(() => recordStructuralInspectionCoverage(store, {
      coverageId: "cov-ai",
      inspectionContextId: "ctx-1",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "visual",
      accessState: "NOT_INSPECTED",
      limitations: "none",
      authority: "AI",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    })).toThrow();
    expect(AI_COVERAGE_AUTHORITY).toBe(false);
    expect(() => recordStructuralInspectionEvidence(store, source, { ...evidenceInput({ evidenceId: "ev-detect" }), runDetection: true } as D1hR1EvidenceInput)).toThrow(/SCOPE_REJECTED:runDetection/);
    expect(() => recordStructuralInspectionEvidence(store, source, { ...evidenceInput({ evidenceId: "ev-face" }), faceRecognition: true } as D1hR1EvidenceInput)).toThrow(/SCOPE_REJECTED:faceRecognition/);
    expect(D1H_R2_REQUIRED_R1_CONTRACTS).toContain("evidenceIdentity");
    expect(D1H_R1_EVIDENCE_COMPLETENESS_STATES).toContain("COMPLETE_FOR_DECLARED_EVIDENCE_SCOPE");
    const partial = prepared();
    recordStructuralInspectionContext(partial.store, partial.source, contextInput({
      inspectionContextId: "ctx-partial",
      declaredTargetIds: ["mem-1", "mem-2"],
      status: "RECORDED",
    }));
    bindStructuralInspectionTarget(partial.store, partial.source, "ctx-partial", targetInput("MEMBER", "mem-1"));
    bindStructuralInspectionTarget(partial.store, partial.source, "ctx-partial", targetInput("MEMBER", "mem-2"));
    recordStructuralInspectionCoverage(partial.store, {
      coverageId: "cov-partial",
      inspectionContextId: "ctx-partial",
      inspectionSessionId: "ses-1",
      targetId: "mem-1",
      regionRef: null,
      methodRef: "visual",
      accessState: "NOT_INSPECTED",
      limitations: "member 2 outstanding",
      authority: "HUMAN",
      provenance: provenance(),
      version: "1",
      recordedAt: "2026-10-18T01:30:00.000Z",
    });
    expect(evaluateStructuralInspectionEvidence(partial.store, "ctx-partial").completeness).toBe("PARTIAL");
    const draft = createD1hR1Store();
    recordStructuralInspectionContext(draft, catalog(), contextInput({ inspectionContextId: "ctx-draft", status: "DRAFT", declaredTargetIds: [] }));
    expect(evaluateStructuralInspectionEvidence(draft, "ctx-draft").completeness).toBe("UNDETERMINED");
    const recorded = createD1hR1Store();
    recordStructuralInspectionContext(recorded, catalog(), contextInput({ inspectionContextId: "ctx-open", declaredTargetIds: ["mem-1"] }));
    expect(evaluateStructuralInspectionEvidence(recorded, "ctx-open").completeness).toBe("INCOMPLETE");
    const manifest = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.R1.STRUCTURAL_INSPECTION_EVIDENCE_FOUNDATION");
    expect(manifest?.implementationState).toBe("IMPLEMENTED_RUNTIME");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_FINDING_RUNTIME")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_MEASUREMENT_RUNTIME")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_STATE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_RATING")?.implementationState).toBe("IMPLEMENTED_PROFILE_BOUND");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_ENGINEERING_INTERPRETATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });

  it("rejects engineering formulas, condition scoring, and surveillance behavior", () => {
    const sourceText = readFileSync(sourcePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(scanAnalysisFormulaBypass(sourcePath, sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    const corpus = `${sourceText}\n${doc}`;
    expect(corpus).not.toMatch(/crack width\s*[<>]=?\s*\d|section loss\s*[<>]=?\s*\d|corrosion rate\s*=|remaining life\s*=|fatigue damage\s*=|capacity reduction\s*=/i);
    expect(corpus).not.toMatch(/condition score\s*=|severity score\s*=/i);
  });
});
