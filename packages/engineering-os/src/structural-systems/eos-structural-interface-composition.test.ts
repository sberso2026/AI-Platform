import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D1K_SOURCE_CLASSES } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { createD1kR2Store, reuseCompatibilityResult, type D1kR2Metadata, type D1kR2Requirement } from "./interface-compatibility";
import { createD1kR3Store, deriveInterfaceGovernanceState, type D1kR3Actor } from "./interface-handoff-governance";
import {
  D1K_R4_ARBITRARY_PAYLOAD_BUS_COUNT,
  D1K_R4_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT,
  D1K_R4_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT,
  D1K_R4_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R4_COMPOSITION_SUCCESS_EQUALS_COMPATIBLE,
  D1K_R4_COMPOSITION_SUCCESS_EQUALS_ENGINEERING_APPROVED,
  D1K_R4_COMPOSITION_SUCCESS_EQUALS_SOURCE_CORRECT,
  D1K_R4_COMPOSITION_SUCCESS_EQUALS_STRUCTURAL_ACCEPTED,
  D1K_R4_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R4_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT,
  D1K_R4_CROSS_WORKSPACE_REFERENCE_COMPOSITION_ALLOWED,
  D1K_R4_D2_D8_RUNTIME_COUNT,
  D1K_R4_D2_D8_RUNTIME_STARTED,
  D1K_R4_D9_RUNTIME_COUNT,
  D1K_R4_D9_RUNTIME_STARTED,
  D1K_R4_EXTERNAL_REFERENCE_READY,
  D1K_R4_EXTERNAL_SOURCE_CAN_IMPERSONATE_NATIVE_EOS_SOURCE,
  D1K_R4_FLOATING_EXTERNAL_SOURCE_ALLOWED,
  D1K_R4_GENERIC_ENGINEERING_FILE_INGESTION_RUNTIME_COUNT,
  D1K_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1K_R4_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_R4_LIVE_D2_D8_SOURCE_PROVIDER_COUNT,
  D1K_R4_MANUAL_REFERENCE_EQUALS_AUTHENTICATED_SOURCE,
  D1K_R4_MANUAL_REFERENCE_EQUALS_ENGINEERING_APPROVED,
  D1K_R4_MANUAL_REFERENCE_EQUALS_SOURCE_CORRECT,
  D1K_R4_MANUAL_SOURCE_CAN_IMPERSONATE_NATIVE_EOS_SOURCE,
  D1K_R4_MATURITY_STATE,
  D1K_R4_NEW_ENGINEERING_FORMULA_COUNT,
  D1K_R4_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT,
  D1K_R4_SCHEMA_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R4_SIGN_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R4_STATUS,
  D1K_R4_UNIT_CONVERSION_RUNTIME_COUNT,
  D1K_R5_CANONICAL_PHASE,
  D1K_R5_CANONICAL_SCOPE,
  D1K_R5_PHASE_TYPE,
  assessNativeEosSourceSeam,
  classifyGovernedSource,
  composeExternalGovernedReference,
  composeManualGovernedReference,
  createD1kR4Store,
  diagnoseComposedReference,
  provisionComposedReference,
  supersedeComposedReference,
} from "./interface-reference-composition";
import {
  createD1kR1Store,
  type D1kR1Catalog,
  type D1kR1CatalogSource,
  type D1kR1InterfaceInput,
  type D1kR1StructuralTarget,
} from "./interface-identity-foundation";

const here = dirname(fileURLToPath(import.meta.url));
const runtimePath = join(here, "interface-reference-composition.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1K_R4_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_CLOSEOUT.md");

function actor(overrides: Partial<D1kR3Actor> = {}): D1kR3Actor {
  return { actorId: "engineer-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "HUMAN_ENGINEER", role: "PROVIDER", ...overrides };
}

function target(): D1kR1StructuralTarget {
  return { kind: "MEMBER", id: "member-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4" };
}

function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-ext-4",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE",
    sourceDiscipline: "civil",
    objectId: "civil-grade-4",
    documentId: "doc-grade-4",
    revision: "rev-4",
    evidenceId: "evidence-4",
    evidenceKind: "source_document",
    authority: "CIVIL_ENGINEER_OF_RECORD",
    provenanceRef: "provenance-civil-4",
    issuedAt: "2026-10-20T00:00:00.000Z",
    nativePackContractExposed: false,
    operationalExternalReference: false,
    ...overrides,
  };
}

function catalog(sources: D1kR1CatalogSource[] = [source(), source({ sourceId: "src-ext-5", revision: "rev-5", documentId: "doc-grade-5", evidenceId: "evidence-5", provenanceRef: "provenance-civil-5" }), source({ sourceId: "src-manual-4", sourceClass: "MANUAL_GOVERNED_REFERENCE", documentId: "doc-manual-4", evidenceId: "evidence-manual-4", provenanceRef: "provenance-manual-4" }), source({ sourceId: "src-native-structural", sourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE", sourceDiscipline: "structural", objectId: "member-1", documentId: "doc-structural-4" }), source({ sourceId: "src-native-civil", sourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE", sourceDiscipline: "civil", objectId: "civil-pack", documentId: "doc-civil-pack" })]): D1kR1Catalog {
  return { targets: [target()], sources };
}

function interfaceInput(overrides: Partial<D1kR1InterfaceInput> = {}): D1kR1InterfaceInput {
  return {
    interfaceId: "interface-ext-1",
    relation: "PROVIDES_INPUT_TO",
    sourceDiscipline: "civil",
    targetDiscipline: "structural",
    counterpartyDiscipline: "civil",
    structuralTargetKind: "MEMBER",
    structuralTargetId: "member-1",
    sourceId: "src-ext-4",
    humanReviewRequired: true,
    description: "External civil grade reference",
    ...overrides,
  };
}

function meta(overrides: Partial<D1kR2Metadata> = {}): D1kR2Metadata {
  return { semanticId: "APPLIED_FORCE", schemaId: "D1K_INTERFACE_QUANTITY", schemaVersion: "1", quantity: "force", unit: "kN", coordinateSystem: "GLOBAL", axisConvention: "UX", signConvention: "FORCE_SIGN", ...overrides };
}

function requirement(overrides: Partial<D1kR2Requirement> = {}): D1kR2Requirement {
  return { ...meta(), requiredDimensions: ["SEMANTICS", "SCHEMA_VERSION", "UNITS", "COORDINATES", "AXIS_SIGN"], ...overrides };
}

describe("EOS-D1K-R4 reference composition", () => {
  it("composes external and manual references without treating them as native or approved", () => {
    const interfaces = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const compositions = createD1kR4Store(() => "2026-10-20T03:00:00.000Z");
    expect(D1K_SOURCE_CLASSES).toEqual(["NATIVE_EOS_DISCIPLINE_SOURCE", "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", "MANUAL_GOVERNED_REFERENCE"]);
    expect(classifyGovernedSource("EXTERNAL_GOVERNED_ENGINEERING_SOURCE")).toBe("EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
    expect(() => classifyGovernedSource("VENDOR_EXPORT")).toThrow("SOURCE_CLASS_INVALID");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "VENDOR_EXPORT" })).toThrow("SOURCE_ORIGIN_SPOOFING");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput({ sourceId: "src-float" }), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("SOURCE_NOT_FOUND");
    const floating = createD1kR1Store(catalog([source({ sourceId: "src-float", revision: "latest" })]), () => "2026-10-20T01:00:00.000Z");
    expect(() => composeExternalGovernedReference(floating, compositions, actor(), { ...interfaceInput({ sourceId: "src-float" }), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("FLOATING_SOURCE_REJECTED");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", expectedSourceFingerprint: "tampered" })).toThrow("FINGERPRINT_MISMATCH");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE" })).toThrow("SOURCE_ORIGIN_SPOOFING");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput({ sourceId: "src-manual-4" }), claimedSourceClass: "MANUAL_GOVERNED_REFERENCE" })).toThrow("SOURCE_ORIGIN_MISMATCH");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor({ role: "REQUESTER" }), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("UNAUTHORIZED");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor({ authority: "AI_ASSISTANT" }), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("UNAUTHORIZED");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", payload: { value: 12 } })).toThrow("ARBITRARY_PAYLOAD_REJECTED");
    const external = composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" });
    const repeated = composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" });
    const manual = composeManualGovernedReference(interfaces, compositions, actor(), { ...interfaceInput({ interfaceId: "interface-manual-1", sourceId: "src-manual-4", description: "Manual civil grade reference" }), claimedSourceClass: "MANUAL_GOVERNED_REFERENCE" });
    expect(repeated.fingerprint).toBe(external.fingerprint);
    expect(external.sourceClass).toBe("EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
    expect(external.sourceRevision).toBe("rev-4");
    expect(external.sourceAuthority).toBe("CIVIL_ENGINEER_OF_RECORD");
    expect(external.evidence).toBe("evidence-4");
    expect(external.provenance).toBe("provenance-civil-4");
    expect(external.sourceFingerprint).toBeTruthy();
    expect(external.interfaceFingerprint).toBeTruthy();
    expect(external.engineeringApproval).toBe(false);
    expect(external.compatible).toBe(false);
    expect(external.externalReferenceOperational).toBe(false);
    expect(manual.sourceClass).toBe("MANUAL_GOVERNED_REFERENCE");
    expect(manual.actorId).toBe("engineer-1");
    expect(manual.actorAuthority).toBe("HUMAN_ENGINEER");
    expect(manual.authenticatedSource).toBe(false);
    expect(manual.sourceCorrect).toBe(false);
    expect(manual.engineeringApproval).toBe(false);
    expect(compositions.results).toHaveLength(2);
    expect(D1K_R4_MANUAL_REFERENCE_EQUALS_AUTHENTICATED_SOURCE).toBe(false);
    expect(D1K_R4_MANUAL_REFERENCE_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D1K_R4_MANUAL_REFERENCE_EQUALS_SOURCE_CORRECT).toBe(false);
    expect(D1K_R4_EXTERNAL_SOURCE_CAN_IMPERSONATE_NATIVE_EOS_SOURCE).toBe(false);
    expect(D1K_R4_MANUAL_SOURCE_CAN_IMPERSONATE_NATIVE_EOS_SOURCE).toBe(false);
  });

  it("reuses compatibility and lifecycle governance and preserves source history", () => {
    const interfaces = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const compositions = createD1kR4Store(() => "2026-10-20T03:00:00.000Z");
    const compatibility = createD1kR2Store(() => "2026-10-20T02:00:00.000Z");
    const governance = createD1kR3Store(() => "2026-10-20T04:00:00.000Z");
    const external = composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" });
    const otherWorkspace = createD1kR1Store(catalog([source({ workspaceId: "workspace-b" })]), () => "2026-10-20T01:00:00.000Z");
    expect(() => composeExternalGovernedReference(otherWorkspace, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput({ relation: "SENDS_DATA" }), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("RELATION_NOT_ALLOWLISTED");
    const diagnosed = diagnoseComposedReference(interfaces, compatibility, actor(), external, meta({ semanticId: "PRESSURE" }), requirement());
    const provision = provisionComposedReference(interfaces, governance, actor(), external);
    const changed = supersedeComposedReference(interfaces, governance, actor(), external, interfaceInput({ interfaceId: "interface-ext-2", sourceId: "src-ext-5" }));
    const stale = deriveInterfaceGovernanceState(interfaces, governance, actor(), external.interfaceId);
    const successor = deriveInterfaceGovernanceState(interfaces, governance, actor(), changed.successor.interfaceId);
    expect(diagnosed.aggregateConclusion).toBe("INCOMPATIBLE");
    expect(diagnosed.engineeringApproval).toBe(false);
    expect(external.compatible).toBe(false);
    expect(provision.sourceFingerprint).toBe(external.sourceFingerprint);
    expect(changed.predecessor.sourceRevision).toBe("rev-4");
    expect(changed.predecessor.sourceClass).toBe("EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
    expect(stale.stale).toBe(true);
    expect(successor.reevaluationRequired).toBe(true);
    expect(() => reuseCompatibilityResult(interfaces, compatibility, actor(), diagnosed.resultId, changed.successor.interfaceId)).toThrow("COMPATIBILITY_REEVALUATION_REQUIRED");
    expect(compositions.results[0]?.sourceClass).toBe("EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
    expect(D1K_R4_COMPOSITION_SUCCESS_EQUALS_COMPATIBLE).toBe(false);
    expect(D1K_R4_COMPOSITION_SUCCESS_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D1K_R4_COMPOSITION_SUCCESS_EQUALS_STRUCTURAL_ACCEPTED).toBe(false);
    expect(D1K_R4_COMPOSITION_SUCCESS_EQUALS_SOURCE_CORRECT).toBe(false);
  });

  it("validates the native seam without promoting a live discipline provider", () => {
    const interfaces = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const seam = assessNativeEosSourceSeam(interfaces, actor(), "src-native-structural");
    expect(seam.contractComplete).toBe(true);
    expect(seam.liveProvider).toBe(false);
    expect(seam.internalIntegrationReady).toBe(false);
    expect(seam.sourceClass).toBe("NATIVE_EOS_DISCIPLINE_SOURCE");
    expect(() => assessNativeEosSourceSeam(interfaces, actor(), "src-native-civil")).toThrow("SOURCE_PACK_NOT_STARTED");
    expect(() => assessNativeEosSourceSeam(interfaces, actor(), "src-ext-4")).toThrow("SOURCE_CLASS_INVALID");
    const untrusted = createD1kR1Store(catalog([source({ authority: "" })]), () => "2026-10-20T01:00:00.000Z");
    expect(() => composeExternalGovernedReference(untrusted, createD1kR4Store(() => "2026-10-20T03:00:00.000Z"), actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("SOURCE_AUTHORITY_INVALID");
    const badEvidence = createD1kR1Store(catalog([source({ evidenceKind: "vendor_note" as D1kR1CatalogSource["evidenceKind"] })]), () => "2026-10-20T01:00:00.000Z");
    expect(() => composeExternalGovernedReference(badEvidence, createD1kR4Store(() => "2026-10-20T03:00:00.000Z"), actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("EVIDENCE_REFERENCE_INVALID");
    const badProvenance = createD1kR1Store(catalog([source({ provenanceRef: "" })]), () => "2026-10-20T01:00:00.000Z");
    expect(() => composeExternalGovernedReference(badProvenance, createD1kR4Store(() => "2026-10-20T03:00:00.000Z"), actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("INVALID_PROVENANCE");
    expect(D1K_R4_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_R4_LIVE_D2_D8_SOURCE_PROVIDER_COUNT).toBe(0);
    expect(D1K_R4_EXTERNAL_REFERENCE_READY).toBe(true);
  });

  it("keeps reference composition inside the authorized boundary", () => {
    const runtime = readFileSync(runtimePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(runtime.includes("from \"@rtb/engineering-review\"")).toBe(false);
    expect(runtime.includes("toForceN(")).toBe(false);
    expect(runtime.includes("sendCrossDisciplineData")).toBe(false);
    expect(runtime.includes("parseEngineeringFile")).toBe(false);
    expect(doc.includes("```")).toBe(false);
    expect(scanAnalysisFormulaBypass(runtimePath, runtime)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(D1K_R4_STATUS).toBe("REFERENCE_COMPOSITION_DEFINED");
    expect(D1K_R4_MATURITY_STATE).toBe("STRUCTURAL_INTERFACE_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_IMPLEMENTED");
    expect(D1K_R4_FLOATING_EXTERNAL_SOURCE_ALLOWED).toBe(false);
    expect(D1K_R4_CROSS_WORKSPACE_REFERENCE_COMPOSITION_ALLOWED).toBe(false);
    expect(D1K_R4_ARBITRARY_PAYLOAD_BUS_COUNT).toBe(0);
    expect(D1K_R4_GENERIC_ENGINEERING_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_SCHEMA_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_SIGN_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT).toBe(0);
    expect(D1K_R4_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT).toBe(0);
    expect(D1K_R4_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1K_R4_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_D9_RUNTIME_STARTED).toBe(false);
    expect(D1K_R4_D9_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R4_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1K_R5_CANONICAL_PHASE).toBe("EOS-D1K-R5-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-CLOSEOUT");
    expect(D1K_R5_PHASE_TYPE).toBe("STRUCTURAL_INTERFACE_CROSS_DISCIPLINE_CLOSEOUT");
    expect(D1K_R5_CANONICAL_SCOPE).toContain("Do not grant D9 intelligence");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.R4.INTERNAL_EXTERNAL_REFERENCE_COMPOSITION");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.STRUCTURAL_INTERFACE_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
