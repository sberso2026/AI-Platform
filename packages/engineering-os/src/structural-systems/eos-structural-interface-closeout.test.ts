import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { createD1kR2Store, reuseCompatibilityResult, type D1kR2Metadata, type D1kR2Requirement } from "./interface-compatibility";
import {
  D1K_R5_ARCHITECTURE_READY,
  D1K_R5_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT,
  D1K_R5_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT,
  D1K_R5_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R5_CAPABILITY_MATRIX,
  D1K_R5_COMPLETE_EQUALS_CERTIFIED,
  D1K_R5_COMPLETE_EQUALS_STRUCTURAL_DESIGN_APPROVED,
  D1K_R5_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R5_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT,
  D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_R5_D1L_ARCHITECTURE_AUTHORIZED,
  D1K_R5_D1L_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1K_R5_D1L_CURRENT_STATUS,
  D1K_R5_D1L_STARTED,
  D1K_R5_D1M_ABSORBED,
  D1K_R5_D1M_CURRENT_STATUS,
  D1K_R5_D1N_ABSORBED,
  D1K_R5_D1N_CURRENT_STATUS,
  D1K_R5_D2_D8_RUNTIME_COUNT,
  D1K_R5_D9_RUNTIME_COUNT,
  D1K_R5_EXTERNAL_REFERENCE_READY,
  D1K_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1K_R5_GENERIC_FILE_INGESTION_RUNTIME_COUNT,
  D1K_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1K_R5_HISTORICAL_ARCHITECTURE_READY_PRESERVED,
  D1K_R5_HISTORICAL_POST_D1J_STATUS_PRESERVED,
  D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_R5_INTERNAL_INTEGRATION_BLOCKED_BY_MISSING_COUNTERPARTY_PACKS,
  D1K_R5_LIVE_D2_D8_SOURCE_PROVIDER_COUNT,
  D1K_R5_MATURITY_STATE,
  D1K_R5_NEW_ENGINEERING_FORMULA_COUNT,
  D1K_R5_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT,
  D1K_R5_POST_D1J_DEBT_PRESERVED,
  D1K_R5_REFERENCE_RUNTIME_READY,
  D1K_R5_SCHEMA_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R5_SIGN_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R5_STATUS,
  D1K_R5_STRUCTURAL_PACK_COMPLETE,
  D1K_R5_TRACK_COMPLETE,
  D1K_R5_TRACK_COMPLETE_EQUALS_PACK_COMPLETE,
  D1K_R5_TRACK_STATUS,
  D1K_R5_UNIT_CONVERSION_RUNTIME_COUNT,
  D1L_0_CANONICAL_PHASE,
  D1L_0_CANONICAL_SCOPE,
  D1L_0_PHASE_TYPE,
} from "./interface-closeout";
import { createD1kR3Store, deriveInterfaceGovernanceState, type D1kR3Actor } from "./interface-handoff-governance";
import {
  assessNativeEosSourceSeam,
  composeExternalGovernedReference,
  composeManualGovernedReference,
  createD1kR4Store,
  diagnoseComposedReference,
  provisionComposedReference,
  supersedeComposedReference,
} from "./interface-reference-composition";
import { createD1kR1Store, type D1kR1CatalogSource, type D1kR1InterfaceInput, type D1kR1StructuralTarget } from "./interface-identity-foundation";
import { POST_D1J_STRUCTURAL_DEBT_LEDGER } from "./post-d1j-roadmap";

const here = dirname(fileURLToPath(import.meta.url));
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1K_R5_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_CLOSEOUT.md");
const evidence = [
  "EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md",
  "EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md",
  "EOS_D1K_R2_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_CLOSEOUT.md",
  "EOS_D1K_R3_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_CLOSEOUT.md",
  "EOS_D1K_R4_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_CLOSEOUT.md",
  "EOS_POST_D1J_CANONICAL_ROADMAP.md",
].map((name) => join(here, "../../../../docs/architecture/engineering-os", name));

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

function requirement(): D1kR2Requirement {
  return { ...meta(), requiredDimensions: ["SEMANTICS", "SCHEMA_VERSION", "UNITS", "COORDINATES", "AXIS_SIGN"] };
}

describe("EOS-D1K-R5 interface closeout", () => {
  it("composes an external reference through R1, R2, and R3 without approving engineering", () => {
    const interfaces = createD1kR1Store({
      targets: [target()],
      sources: [
        source(),
        source({ sourceId: "src-ext-5", revision: "rev-5", documentId: "doc-grade-5", evidenceId: "evidence-5", provenanceRef: "provenance-civil-5" }),
        source({ sourceId: "src-manual-4", sourceClass: "MANUAL_GOVERNED_REFERENCE", documentId: "doc-manual-4", evidenceId: "evidence-manual-4", provenanceRef: "provenance-manual-4" }),
        source({ sourceId: "src-native-structural", sourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE", sourceDiscipline: "structural", objectId: "member-1", documentId: "doc-structural-4" }),
        source({ sourceId: "src-native-civil", sourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE", sourceDiscipline: "civil" }),
      ],
    }, () => "2026-10-20T01:00:00.000Z");
    const compositions = createD1kR4Store(() => "2026-10-20T03:00:00.000Z");
    const compatibility = createD1kR2Store(() => "2026-10-20T02:00:00.000Z");
    const governance = createD1kR3Store(() => "2026-10-20T04:00:00.000Z");
    const external = composeExternalGovernedReference(interfaces, compositions, actor(), { ...interfaceInput(), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" });
    const manual = composeManualGovernedReference(interfaces, compositions, actor(), { ...interfaceInput({ interfaceId: "interface-manual-1", sourceId: "src-manual-4" }), claimedSourceClass: "MANUAL_GOVERNED_REFERENCE" });
    const diagnosed = diagnoseComposedReference(interfaces, compatibility, actor(), external, meta(), requirement());
    const provision = provisionComposedReference(interfaces, governance, actor(), external);
    const changed = supersedeComposedReference(interfaces, governance, actor(), external, interfaceInput({ interfaceId: "interface-ext-2", sourceId: "src-ext-5" }));
    const stale = deriveInterfaceGovernanceState(interfaces, governance, actor(), external.interfaceId);
    const seam = assessNativeEosSourceSeam(interfaces, actor(), "src-native-structural");
    expect(external.sourceClass).toBe("EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
    expect(external.sourceRevision).toBe("rev-4");
    expect(external.sourceFingerprint).toBe(provision.sourceFingerprint);
    expect(external.engineeringApproval).toBe(false);
    expect(manual.sourceClass).toBe("MANUAL_GOVERNED_REFERENCE");
    expect(diagnosed.engineeringApproval).toBe(false);
    expect(diagnosed.sourceFingerprint).toBe(external.sourceFingerprint);
    expect(changed.predecessor.sourceRevision).toBe("rev-4");
    expect(changed.predecessor.sourceClass).toBe("EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
    expect(stale.stale).toBe(true);
    expect(stale.engineeringApproval).toBe(false);
    expect(() => reuseCompatibilityResult(interfaces, compatibility, actor(), diagnosed.resultId, changed.successor.interfaceId)).toThrow("COMPATIBILITY_REEVALUATION_REQUIRED");
    expect(() => assessNativeEosSourceSeam(interfaces, actor(), "src-native-civil")).toThrow("SOURCE_PACK_NOT_STARTED");
    expect(() => composeExternalGovernedReference(interfaces, compositions, actor({ authority: "AI_ASSISTANT" }), { ...interfaceInput({ interfaceId: "interface-ai" }), claimedSourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE" })).toThrow("UNAUTHORIZED");
    expect(seam.liveProvider).toBe(false);
    expect(seam.internalIntegrationReady).toBe(false);
    expect(compositions.results.map((row) => row.sourceClass)).toEqual(["EXTERNAL_GOVERNED_ENGINEERING_SOURCE", "MANUAL_GOVERNED_REFERENCE"]);
  });

  it("closes the bounded track without completing the structural pack or starting D1L", () => {
    const doc = readFileSync(docPath, "utf8");
    for (const path of evidence) expect(existsSync(path)).toBe(true);
    expect(doc.includes("```")).toBe(false);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(D1K_R5_STATUS).toBe("CLOSEOUT_DEFINED");
    expect(D1K_R5_MATURITY_STATE).toBe("STRUCTURAL_CROSS_DISCIPLINE_INTERFACE_GOVERNANCE_BOUNDED_RUNTIME_IMPLEMENTED");
    expect(D1K_R5_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1K_R5_TRACK_COMPLETE).toBe(true);
    expect(D1K_R5_ARCHITECTURE_READY).toBe(true);
    expect(D1K_R5_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1K_R5_EXTERNAL_REFERENCE_READY).toBe(true);
    expect(D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY).toBe(false);
    expect(D1K_R5_HISTORICAL_POST_D1J_STATUS_PRESERVED).toBe("NOT_STARTED");
    expect(D1K_R5_HISTORICAL_ARCHITECTURE_READY_PRESERVED).toBe(false);
    expect(D1K_R5_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1K_R5_TRACK_COMPLETE_EQUALS_PACK_COMPLETE).toBe(false);
    expect(D1K_R5_COMPLETE_EQUALS_STRUCTURAL_DESIGN_APPROVED).toBe(false);
    expect(D1K_R5_COMPLETE_EQUALS_CERTIFIED).toBe(false);
    expect(D1K_R5_LIVE_D2_D8_SOURCE_PROVIDER_COUNT).toBe(0);
    expect(D1K_R5_INTERNAL_INTEGRATION_BLOCKED_BY_MISSING_COUNTERPARTY_PACKS).toBe(true);
    expect(D1K_R5_SCHEMA_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_SIGN_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT).toBe(0);
    expect(D1K_R5_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT).toBe(0);
    expect(D1K_R5_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_D9_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1K_R5_GENERIC_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1K_R5_D1L_CURRENT_STATUS).toBe("NOT_STARTED");
    expect(D1K_R5_D1L_ARCHITECTURE_AUTHORIZED).toBe(true);
    expect(D1K_R5_D1L_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1K_R5_D1L_STARTED).toBe(false);
    expect(D1K_R5_D1M_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1K_R5_D1M_ABSORBED).toBe(false);
    expect(D1K_R5_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1K_R5_D1N_ABSORBED).toBe(false);
    expect(D1K_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1K_R5_POST_D1J_DEBT_PRESERVED).toBe(POST_D1J_STRUCTURAL_DEBT_LEDGER);
    expect(D1K_R5_CAPABILITY_MATRIX).toContain("Live D2 through D8 integration not ready");
    expect(D1L_0_CANONICAL_PHASE).toBe("EOS-D1L-0-STRUCTURAL-GLOBAL-CERTIFICATION-GATE-ARCHITECTURE");
    expect(D1L_0_PHASE_TYPE).toBe("STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE");
    expect(D1L_0_CANONICAL_SCOPE).toContain("Do not grant certification");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.R5.CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_CLOSEOUT");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.STRUCTURAL_INTERFACE_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
