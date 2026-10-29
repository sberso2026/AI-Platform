import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createD1kR1Store, registerStructuralInterfaceIdentity, supersedeStructuralInterfaceSource, type D1kR1Actor, type D1kR1Catalog, type D1kR1CatalogSource, type D1kR1InterfaceInput, type D1kR1StructuralTarget } from "./interface-identity-foundation";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import {
  D1K_R2_AI_CAN_APPROVE_ENGINEERING,
  D1K_R2_AI_CAN_INVENT_AXIS_CONVENTION,
  D1K_R2_AI_CAN_INVENT_COORDINATE_SYSTEM,
  D1K_R2_AI_CAN_INVENT_SEMANTIC_IDENTITY,
  D1K_R2_AI_CAN_INVENT_SIGN_CONVENTION,
  D1K_R2_AI_CAN_INVENT_UNIT_IDENTITY,
  D1K_R2_AI_CAN_OVERRIDE_COMPATIBILITY_RESULT,
  D1K_R2_AI_CAN_RECONCILE_COMPATIBILITY_CONFLICT,
  D1K_R2_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT,
  D1K_R2_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R2_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R2_CLOSEOUT_PATH,
  D1K_R2_COMPATIBILITY_PASS_EQUALS_DESIGN_APPROVAL,
  D1K_R2_COMPATIBILITY_PASS_EQUALS_ENGINEERING_APPROVAL,
  D1K_R2_COMPATIBILITY_PASS_EQUALS_SOURCE_CORRECT,
  D1K_R2_COORDINATE_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R2_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R2_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT,
  D1K_R2_D2_D8_RUNTIME_COUNT,
  D1K_R2_D2_D8_RUNTIME_STARTED,
  D1K_R2_D9_RUNTIME_COUNT,
  D1K_R2_D9_RUNTIME_STARTED,
  D1K_R2_DATABASE_SCHEMA_CHANGE_REQUIRED,
  D1K_R2_EXTERNAL_REFERENCE_READY,
  D1K_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1K_R2_HANDOFF_RUNTIME_COUNT,
  D1K_R2_MATURITY_STATE,
  D1K_R2_NEW_ENGINEERING_FORMULA_COUNT,
  D1K_R2_SCHEMA_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R2_SCHEMA_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R2_SEMANTIC_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R2_SIGN_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R2_STATUS,
  D1K_R2_UNIT_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R2_UNIT_CONVERSION_RUNTIME_COUNT,
  D1K_R2_UNKNOWN_SEMANTIC_AUTO_MAPPED,
  D1K_R3_CANONICAL_PHASE,
  D1K_R3_CANONICAL_SCOPE,
  D1K_R3_PHASE_TYPE,
  aggregateCompatibility,
  createD1kR2Store,
  evaluateInterfaceCompatibility,
  reuseCompatibilityResult,
  type D1kR2Metadata,
  type D1kR2Requirement,
} from "./interface-compatibility";

const here = dirname(fileURLToPath(import.meta.url));
const runtimePath = join(here, "interface-compatibility.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1K_R2_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_CLOSEOUT.md");

function actor(overrides: Partial<D1kR1Actor> = {}): D1kR1Actor {
  return { actorId: "engineer-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "HUMAN_ENGINEER", ...overrides };
}

function target(): D1kR1StructuralTarget {
  return { kind: "MEMBER", id: "member-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4" };
}

function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-civil-4",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    sourceClass: "MANUAL_GOVERNED_REFERENCE",
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

function catalog(): D1kR1Catalog {
  return { targets: [target()], sources: [source(), source({ sourceId: "src-civil-5", revision: "rev-5", documentId: "doc-grade-5", evidenceId: "evidence-5", provenanceRef: "provenance-civil-5" })] };
}

function interfaceInput(overrides: Partial<D1kR1InterfaceInput> = {}): D1kR1InterfaceInput {
  return {
    interfaceId: "interface-1",
    relation: "PROVIDES_INPUT_TO",
    sourceDiscipline: "civil",
    targetDiscipline: "structural",
    counterpartyDiscipline: "civil",
    structuralTargetKind: "MEMBER",
    structuralTargetId: "member-1",
    sourceId: "src-civil-4",
    humanReviewRequired: true,
    description: "Civil grade input",
    ...overrides,
  };
}

function meta(overrides: Partial<D1kR2Metadata> = {}): D1kR2Metadata {
  return {
    semanticId: "APPLIED_FORCE",
    schemaId: "D1K_INTERFACE_QUANTITY",
    schemaVersion: "1",
    quantity: "force",
    unit: "kN",
    coordinateSystem: "GLOBAL",
    axisConvention: "UX",
    signConvention: "FORCE_SIGN",
    ...overrides,
  };
}

function requirement(overrides: Partial<D1kR2Requirement> = {}): D1kR2Requirement {
  return { ...meta(), requiredDimensions: ["SEMANTICS", "SCHEMA_VERSION", "UNITS", "COORDINATES", "AXIS_SIGN"], ...overrides };
}

function harness() {
  const interfaces = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
  const record = registerStructuralInterfaceIdentity(interfaces, actor(), interfaceInput());
  return { interfaces, record, compatibility: createD1kR2Store(() => "2026-10-20T02:00:00.000Z") };
}

function row<T extends { dimension: string }>(result: { diagnostics: readonly T[] }, dimension: string): T {
  const found = result.diagnostics.find((item) => item.dimension === dimension);
  if (!found) throw new Error(`missing ${dimension}`);
  return found;
}

describe("EOS-D1K-R2 compatibility diagnostics", () => {
  it("requires a governed R1 record and preserves the exact source pin", () => {
    const { interfaces, record, compatibility } = harness();
    const snapshot = JSON.parse(JSON.stringify(record));
    expect(() => evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "result-missing",
      interfaceId: "missing",
      sourceMetadata: meta(),
      receivingRequirement: requirement(),
    })).toThrow("INTERFACE_NOT_FOUND");
    expect(() => evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "result-fingerprint",
      interfaceId: record.interfaceId,
      expectedSourceFingerprint: "other",
      sourceMetadata: meta(),
      receivingRequirement: requirement(),
    })).toThrow("FINGERPRINT_MISMATCH");
    const result = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "result-1",
      interfaceId: record.interfaceId,
      expectedInterfaceFingerprint: record.fingerprint,
      expectedSourceFingerprint: record.sourceFingerprint,
      sourceMetadata: meta(),
      receivingRequirement: requirement(),
    });
    expect(result.sourceId).toBe(record.sourceId);
    expect(result.sourceRevision).toBe("rev-4");
    expect(result.sourceFingerprint).toBe(record.sourceFingerprint);
    expect(result.sourceAuthority).toBe("CIVIL_ENGINEER_OF_RECORD");
    expect(result.evidence).toBe("evidence-4");
    expect(result.provenance).toBe("provenance-civil-4");
    expect(result.interfaceFingerprint).toBe(record.fingerprint);
    expect(JSON.parse(JSON.stringify(record))).toEqual(snapshot);
    expect(interfaces.catalog.sources[0]?.revision).toBe("rev-4");
    expect(compatibility.results).toHaveLength(1);
  });

  it("diagnoses semantic, schema, unit, coordinate, axis, and sign identity without inference", () => {
    const { interfaces, record, compatibility } = harness();
    const matched = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "match",
      interfaceId: record.interfaceId,
      sourceMetadata: meta(),
      receivingRequirement: requirement(),
    });
    expect(matched.aggregateConclusion).toBe("MATCHING");
    expect(row(matched, "SEMANTICS").reasonCode).toBe("EXACT_MATCH");
    expect(row(matched, "SCHEMA_VERSION").reasonCode).toBe("SCHEMA_EXACT_MATCH");
    expect(row(matched, "UNITS").reasonCode).toBe("UNIT_EXACT_MATCH");
    expect(row(matched, "COORDINATES").reasonCode).toBe("EXACT_MATCH");
    expect(row(matched, "AXIS").reasonCode).toBe("EXACT_MATCH");
    expect(row(matched, "SIGN").reasonCode).toBe("EXACT_MATCH");
    expect(matched.engineeringApproval).toBe(false);
    expect(matched.designApproval).toBe(false);
    expect(matched.sourceCorrect).toBe(false);
    expect(matched.compatibilityScore).toBeNull();

    const mismatched = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "mismatch",
      interfaceId: record.interfaceId,
      sourceMetadata: meta({ semanticId: "SUPPORT_REACTION", schemaVersion: "2", unit: "N", coordinateSystem: "MEMBER_LOCAL", axisConvention: "UY", signConvention: "MOMENT_SIGN" }),
      receivingRequirement: requirement(),
    });
    expect(row(mismatched, "SEMANTICS").conclusion).toBe("INCOMPATIBLE");
    expect(row(mismatched, "SCHEMA_VERSION").conclusion).toBe("INCOMPATIBLE");
    expect(row(mismatched, "UNITS").conclusion).toBe("UNRESOLVED");
    expect(row(mismatched, "UNITS").reasonCode).toBe("DIMENSIONALLY_COMPATIBLE_CONVERSION_REQUIRED");
    expect(row(mismatched, "UNITS").conversionRequired).toBe(false);
    expect(row(mismatched, "COORDINATES").conclusion).toBe("INCOMPATIBLE");
    expect(row(mismatched, "AXIS").conclusion).toBe("INCOMPATIBLE");
    expect(row(mismatched, "SIGN").conclusion).toBe("INCOMPATIBLE");
    expect(mismatched.aggregateConclusion).toBe("INCOMPATIBLE");

    const unknown = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "unknown",
      interfaceId: record.interfaceId,
      sourceMetadata: meta({ semanticId: "force", schemaVersion: "9", quantity: "force", unit: "kip", coordinateSystem: "project north", axisConvention: "X", signConvention: "tension positive" }),
      receivingRequirement: requirement({ semanticId: "force", schemaVersion: "9", unit: "kip", coordinateSystem: "project north", axisConvention: "X", signConvention: "tension positive" }),
    });
    expect(row(unknown, "SEMANTICS").conclusion).toBe("UNRESOLVED");
    expect(row(unknown, "SEMANTICS").supported).toBe(false);
    expect(row(unknown, "SCHEMA_VERSION").reasonCode).toBe("SCHEMA_UNSUPPORTED");
    expect(row(unknown, "UNITS").reasonCode).toBe("UNIT_UNSUPPORTED");
    expect(row(unknown, "COORDINATES").reasonCode).toBe("COORDINATE_UNSUPPORTED");
    expect(row(unknown, "AXIS").reasonCode).toBe("AXIS_UNSUPPORTED");
    expect(row(unknown, "SIGN").reasonCode).toBe("SIGN_UNSUPPORTED");
    expect(D1K_R2_UNKNOWN_SEMANTIC_AUTO_MAPPED).toBe(false);

    const missing = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "missing-meta",
      interfaceId: record.interfaceId,
      sourceMetadata: meta({ semanticId: null, schemaId: null, schemaVersion: null, quantity: null, unit: null, coordinateSystem: null, axisConvention: null, signConvention: null }),
      receivingRequirement: requirement(),
    });
    expect(row(missing, "SEMANTICS").conclusion).toBe("MISSING");
    expect(row(missing, "SCHEMA_VERSION").conclusion).toBe("MISSING");
    expect(row(missing, "UNITS").conclusion).toBe("MISSING");
    expect(row(missing, "COORDINATES").conclusion).toBe("MISSING");
    expect(row(missing, "AXIS").conclusion).toBe("MISSING");
    expect(row(missing, "SIGN").conclusion).toBe("MISSING");
    expect(missing.aggregateConclusion).toBe("MISSING");
  });

  it("does not hide an incompatible or missing required dimension behind a passing dimension", () => {
    const semanticFail = aggregateCompatibility([
      { dimension: "SEMANTICS", conclusion: "INCOMPATIBLE", reasonCode: "SEMANTIC_INCOMPATIBLE", diagnosticKind: "SEMANTIC_INCOMPATIBILITY", sourceIdentity: "SUPPORT_REACTION", receivingIdentity: "APPLIED_FORCE", supported: true, conversionRequired: false, transformationRequired: false, humanReviewRequired: true },
      { dimension: "UNITS", conclusion: "MATCHING", reasonCode: "UNIT_EXACT_MATCH", diagnosticKind: null, sourceIdentity: "force:kN", receivingIdentity: "force:kN", supported: true, conversionRequired: false, transformationRequired: false, humanReviewRequired: false },
      { dimension: "COORDINATES", conclusion: "MATCHING", reasonCode: "EXACT_MATCH", diagnosticKind: null, sourceIdentity: "GLOBAL", receivingIdentity: "GLOBAL", supported: true, conversionRequired: false, transformationRequired: false, humanReviewRequired: false },
    ]);
    expect(semanticFail).toBe("INCOMPATIBLE");
    const axisMissing = aggregateCompatibility([
      { dimension: "SEMANTICS", conclusion: "MATCHING", reasonCode: "EXACT_MATCH", diagnosticKind: null, sourceIdentity: "APPLIED_FORCE", receivingIdentity: "APPLIED_FORCE", supported: true, conversionRequired: false, transformationRequired: false, humanReviewRequired: false },
      { dimension: "UNITS", conclusion: "MATCHING", reasonCode: "UNIT_EXACT_MATCH", diagnosticKind: null, sourceIdentity: "force:kN", receivingIdentity: "force:kN", supported: true, conversionRequired: false, transformationRequired: false, humanReviewRequired: false },
      { dimension: "AXIS", conclusion: "MISSING", reasonCode: "AXIS_MISSING", diagnosticKind: "MISSING_INTERFACE_INFORMATION", sourceIdentity: null, receivingIdentity: "UX", supported: true, conversionRequired: false, transformationRequired: false, humanReviewRequired: true },
    ]);
    expect(axisMissing).toBe("MISSING");
    const { interfaces, record, compatibility } = harness();
    const mixed = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "mixed-dimension",
      interfaceId: record.interfaceId,
      sourceMetadata: meta({ quantity: "force", unit: "kN" }),
      receivingRequirement: requirement({ quantity: "length", unit: "m" }),
    });
    expect(row(mixed, "UNITS").conclusion).toBe("INCOMPATIBLE");
    expect(row(mixed, "UNITS").reasonCode).toBe("DIMENSION_MISMATCH");
    expect(mixed.aggregateConclusion).toBe("INCOMPATIBLE");
  });

  it("ties the diagnostic fingerprint to the R1 source and requires reevaluation after a revision change", () => {
    const now = () => "2026-10-20T02:00:00.000Z";
    const left = harness();
    const right = harness();
    const first = evaluateInterfaceCompatibility(left.interfaces, left.compatibility, actor(), { resultId: "same", interfaceId: left.record.interfaceId, sourceMetadata: meta(), receivingRequirement: requirement() });
    const second = evaluateInterfaceCompatibility(right.interfaces, right.compatibility, actor(), { resultId: "same", interfaceId: right.record.interfaceId, sourceMetadata: meta(), receivingRequirement: requirement() });
    expect(first.fingerprint).toBe(second.fingerprint);
    expect(evaluateInterfaceCompatibility(left.interfaces, left.compatibility, actor(), { resultId: "same", interfaceId: left.record.interfaceId, sourceMetadata: meta(), receivingRequirement: requirement() })).toBe(first);
    const successor = supersedeStructuralInterfaceSource(left.interfaces, actor(), interfaceInput({ interfaceId: "interface-1-rev-5", sourceId: "src-civil-5", predecessorInterfaceId: left.record.interfaceId }));
    expect(left.record.sourceRevision).toBe("rev-4");
    expect(() => reuseCompatibilityResult(left.interfaces, left.compatibility, actor(), first.resultId, successor.interfaceId)).toThrow("COMPATIBILITY_REEVALUATION_REQUIRED");
    expect(reuseCompatibilityResult(left.interfaces, left.compatibility, actor(), first.resultId, left.record.interfaceId).sourceRevision).toBe("rev-4");
    const again = evaluateInterfaceCompatibility(left.interfaces, createD1kR2Store(now), actor(), { resultId: "successor", interfaceId: successor.interfaceId, sourceMetadata: meta(), receivingRequirement: requirement() });
    expect(again.sourceRevision).toBe("rev-5");
    expect(again.fingerprint).not.toBe(first.fingerprint);
    expect(again.sourceFingerprint).toBe(successor.sourceFingerprint);
  });

  it("rejects another workspace, AI authority, and unauthorized transformation", () => {
    const { interfaces, record, compatibility } = harness();
    expect(() => evaluateInterfaceCompatibility(interfaces, compatibility, actor({ workspaceId: "workspace-b" }), {
      resultId: "cross",
      interfaceId: record.interfaceId,
      sourceMetadata: meta(),
      receivingRequirement: requirement(),
    })).toThrow("CROSS_PROJECT_OPERATION");
    expect(compatibility.results).toHaveLength(0);
    expect(() => evaluateInterfaceCompatibility(interfaces, compatibility, actor({ authority: "AI_ASSISTANT" }), {
      resultId: "ai",
      interfaceId: record.interfaceId,
      sourceMetadata: meta(),
      receivingRequirement: requirement(),
    })).toThrow("UNAUTHORIZED");
    const sourceText = readFileSync(runtimePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(sourceText).not.toContain("existingUnitPairCompatible");
    expect(sourceText).not.toContain("normalizeWithExistingUnitSystem");
    expect(sourceText).not.toContain("toForceN");
    expect(sourceText.includes(["from", '"@rtb/engineering-review"'].join(" "))).toBe(false);
    expect(scanAnalysisFormulaBypass(runtimePath, sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(doc).not.toMatch(/```/);
    expect(D1K_R2_STATUS).toBe("COMPATIBILITY_DIAGNOSTICS_DEFINED");
    expect(D1K_R2_MATURITY_STATE).toBe("STRUCTURAL_INTERFACE_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_IMPLEMENTED");
    expect(D1K_R2_SEMANTIC_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1K_R2_SCHEMA_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1K_R2_UNIT_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1K_R2_COORDINATE_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1K_R2_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1K_R2_SCHEMA_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_SIGN_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT).toBe(0);
    expect(D1K_R2_HANDOFF_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1K_R2_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_D9_RUNTIME_STARTED).toBe(false);
    expect(D1K_R2_D9_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R2_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1K_R2_COMPATIBILITY_PASS_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1K_R2_COMPATIBILITY_PASS_EQUALS_DESIGN_APPROVAL).toBe(false);
    expect(D1K_R2_COMPATIBILITY_PASS_EQUALS_SOURCE_CORRECT).toBe(false);
    expect(D1K_R2_AI_CAN_INVENT_SEMANTIC_IDENTITY).toBe(false);
    expect(D1K_R2_AI_CAN_INVENT_UNIT_IDENTITY).toBe(false);
    expect(D1K_R2_AI_CAN_INVENT_COORDINATE_SYSTEM).toBe(false);
    expect(D1K_R2_AI_CAN_INVENT_AXIS_CONVENTION).toBe(false);
    expect(D1K_R2_AI_CAN_INVENT_SIGN_CONVENTION).toBe(false);
    expect(D1K_R2_AI_CAN_OVERRIDE_COMPATIBILITY_RESULT).toBe(false);
    expect(D1K_R2_AI_CAN_RECONCILE_COMPATIBILITY_CONFLICT).toBe(false);
    expect(D1K_R2_AI_CAN_APPROVE_ENGINEERING).toBe(false);
    expect(D1K_R2_EXTERNAL_REFERENCE_READY).toBe(false);
    expect(D1K_R2_DATABASE_SCHEMA_CHANGE_REQUIRED).toBe(false);
    expect(D1K_R3_CANONICAL_PHASE).toBe("EOS-D1K-R3-HANDOFF-RESPONSE-CHANGE-CONFLICT-GOVERNANCE");
    expect(D1K_R3_PHASE_TYPE).toBe("STRUCTURAL_INTERFACE_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE");
    expect(D1K_R3_CANONICAL_SCOPE).toContain("Do not automatically resolve");
    expect(doc).toContain(D1K_R2_CLOSEOUT_PATH);
    const rowCapability = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.R2.SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY");
    const umbrella = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.STRUCTURAL_INTERFACE_RUNTIME");
    expect(rowCapability?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(rowCapability?.validationState).toBe("NOT_VALIDATED");
    expect(umbrella?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
