import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EOS_CROSS_DISCIPLINE_RELATIONS,
  EOS_DISCIPLINE_IDS,
  STRUCTURAL_OBJECT_KINDS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1K_REFERENCE_RUNTIME_READY } from "./post-d1j-roadmap";
import {
  D1K_R1_AI_CAN_APPROVE_ENGINEERING,
  D1K_R1_AI_CAN_APPROVE_INTERFACE,
  D1K_R1_AI_CAN_INVENT_EVIDENCE,
  D1K_R1_AI_CAN_INVENT_INTERFACE_IDENTITY,
  D1K_R1_AI_CAN_INVENT_PROVENANCE,
  D1K_R1_AI_CAN_INVENT_SOURCE_AUTHORITY,
  D1K_R1_AI_CAN_INVENT_SOURCE_REFERENCE,
  D1K_R1_AI_CAN_INVENT_SOURCE_REVISION,
  D1K_R1_AI_CAN_INVENT_STRUCTURAL_TARGET,
  D1K_R1_APPEND_ONLY_HISTORY,
  D1K_R1_ARCHITECTURE_READY,
  D1K_R1_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R1_AXIS_SIGN_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R1_CANONICAL_FINGERPRINT_REUSED,
  D1K_R1_CLOSEOUT_PATH,
  D1K_R1_COORDINATE_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R1_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R1_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT,
  D1K_R1_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_R1_D1A_STRUCTURAL_TARGET_IDENTITY_REUSED,
  D1K_R1_D1F_IDENTITY_REUSED,
  D1K_R1_D1F_TARGET_KINDS,
  D1K_R1_D1L_STARTED,
  D1K_R1_D1M_ABSORBED,
  D1K_R1_D1N_ABSORBED,
  D1K_R1_D2_D8_RUNTIME_COUNT,
  D1K_R1_D2_D8_RUNTIME_STARTED,
  D1K_R1_D9_RUNTIME_COUNT,
  D1K_R1_D9_RUNTIME_STARTED,
  D1K_R1_DATABASE_SCHEMA_CHANGE_REQUIRED,
  D1K_R1_EXACT_SOURCE_REFERENCE_RUNTIME_COUNT,
  D1K_R1_EXACT_SOURCE_REFERENCE_RUNTIME_IMPLEMENTED,
  D1K_R1_EXTERNAL_REFERENCE_READY,
  D1K_R1_FLOATING_LATEST_SOURCE_ALLOWED,
  D1K_R1_FREEFORM_DISCIPLINE_IDENTITY_ALLOWED,
  D1K_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1K_R1_HANDOFF_RUNTIME_COUNT,
  D1K_R1_INTERFACE_ACCEPTED_EQUALS_ENGINEERING_APPROVAL,
  D1K_R1_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVAL,
  D1K_R1_INTERFACE_IDENTITY_RUNTIME_COUNT,
  D1K_R1_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_R1_MATURITY_STATE,
  D1K_R1_NEW_ENGINEERING_FORMULA_COUNT,
  D1K_R1_PARALLEL_APPROVAL_ENGINE_CREATED,
  D1K_R1_PARALLEL_INTERFACE_IDENTITY_CREATED,
  D1K_R1_PARALLEL_STRUCTURAL_ASSET_IDENTITY_CREATED,
  D1K_R1_REFERENCE_RUNTIME_READY,
  D1K_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1K_R1_SEMANTIC_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R1_SILENT_SOURCE_REPOINTING_ALLOWED,
  D1K_R1_STATUS,
  D1K_R1_UNIT_COMPATIBILITY_RUNTIME_COUNT,
  D1K_R1_UNIT_CONVERSION_RUNTIME_COUNT,
  D1K_R1_UPSTREAM_SOURCE_MUTATION_AUTHORIZED,
  D1K_R2_CANONICAL_PHASE,
  D1K_R2_CANONICAL_SCOPE,
  D1K_R2_PHASE_TYPE,
  createD1kR1Store,
  inspectStructuralInterfaceIdentity,
  registerStructuralInterfaceIdentity,
  supersedeStructuralInterfaceSource,
  type D1kR1Actor,
  type D1kR1Catalog,
  type D1kR1CatalogSource,
  type D1kR1InterfaceInput,
  type D1kR1StructuralTarget,
} from "./interface-identity-foundation";

const here = dirname(fileURLToPath(import.meta.url));
const runtimePath = join(here, "interface-identity-foundation.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md");

function actor(overrides: Partial<D1kR1Actor> = {}): D1kR1Actor {
  return {
    actorId: "engineer-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    authority: "HUMAN_ENGINEER",
    ...overrides,
  };
}

function target(overrides: Partial<D1kR1StructuralTarget> = {}): D1kR1StructuralTarget {
  return {
    kind: "MEMBER",
    id: "member-1",
    structuralSystemId: "system-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    revision: "sys-4",
    ...overrides,
  };
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

function catalog(extra: Partial<D1kR1Catalog> = {}): D1kR1Catalog {
  return {
    targets: [
      target(),
      target({ kind: "FOUNDATION_INTERFACE", id: "foundation-1", structuralSystemId: "system-1" }),
      target({ kind: "STRUCTURAL_SYSTEM", id: "system-1", structuralSystemId: "system-1" }),
    ],
    sources: [source(), source({ sourceId: "src-civil-5", revision: "rev-5", documentId: "doc-grade-5", evidenceId: "evidence-5", provenanceRef: "provenance-civil-5" })],
    ...extra,
  };
}

function input(overrides: Partial<D1kR1InterfaceInput> = {}): D1kR1InterfaceInput {
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
    description: "Civil grade input to structural member",
    ...overrides,
  };
}

describe("EOS-D1K-R1 interface identity and exact source reference", () => {
  it("reuses the D0 contract, D1A target kinds, and D1F identity seams", () => {
    const store = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const member = registerStructuralInterfaceIdentity(store, actor(), input());
    const foundation = registerStructuralInterfaceIdentity(store, actor(), input({
      interfaceId: "interface-foundation",
      structuralTargetKind: "FOUNDATION_INTERFACE",
      structuralTargetId: "foundation-1",
      relation: "LOAD_TRANSFER",
    }));
    expect(D1K_R1_D1A_STRUCTURAL_TARGET_IDENTITY_REUSED).toBe(true);
    expect(D1K_R1_D1F_IDENTITY_REUSED).toBe(true);
    expect(D1K_R1_D1F_TARGET_KINDS.every((kind) => (STRUCTURAL_OBJECT_KINDS as readonly string[]).includes(kind))).toBe(true);
    expect(member.relation).toBe(EOS_CROSS_DISCIPLINE_RELATIONS[0]);
    expect(member.sourceDiscipline).toBe(EOS_DISCIPLINE_IDS[1]);
    expect(member.targetDiscipline).toBe("structural");
    expect(member.sourceObject).toBe("civil-grade-4");
    expect(member.targetObject).toBe("member-1");
    expect(member.evidence).toBe("evidence-4");
    expect(member.status).toBe("declared");
    expect(member.provenance).toBe("provenance-civil-4");
    expect(member.humanReviewRequired).toBe(true);
    expect(member.structuralTargetKind).toBe("MEMBER");
    expect(foundation.structuralTargetKind).toBe("FOUNDATION_INTERFACE");
    expect(foundation.structuralSystemId).toBe("system-1");
    expect(D1K_R1_PARALLEL_INTERFACE_IDENTITY_CREATED).toBe(false);
    expect(D1K_R1_PARALLEL_STRUCTURAL_ASSET_IDENTITY_CREATED).toBe(false);
    expect(D1K_R1_FREEFORM_DISCIPLINE_IDENTITY_ALLOWED).toBe(false);
  });

  it("pins revision, authority, evidence, and provenance without replacing source authority", () => {
    const store = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const record = registerStructuralInterfaceIdentity(store, actor(), input({ expectedSourceRevision: "rev-4" }));
    expect(record.sourceRevision).toBe("rev-4");
    expect(record.sourceAuthority).toBe("CIVIL_ENGINEER_OF_RECORD");
    expect(record.sourceAuthority).not.toBe(actor().authority);
    expect(record.evidence).toBe("evidence-4");
    expect(record.evidenceKind).toBe("source_document");
    expect(record.provenanceRecord.transformation).toBe("NONE");
    expect(record.provenanceRecord.aiGenerated).toBe(false);
    expect(record.provenanceRecord.actorId).toBe("engineer-1");
    expect(record.engineeringApproval).toBe(false);
    expect(record.interfaceAccepted).toBe(false);
    expect(record.designApproved).toBe(false);
    const again = registerStructuralInterfaceIdentity(store, actor(), input({ expectedSourceRevision: "rev-4" }));
    expect(again).toBe(record);
    expect(store.records).toHaveLength(1);
  });

  it("computes a deterministic fingerprint from the canonical fingerprint function", () => {
    const now = () => "2026-10-20T01:00:00.000Z";
    const left = registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input());
    const right = registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ description: "display text is not identity" }));
    expect(left.fingerprint).toBe(right.fingerprint);
    expect(left.fingerprint).toBe(fingerprintCanonical({
      interfaceId: left.interfaceId,
      tenantId: left.tenantId,
      workspaceId: left.workspaceId,
      projectId: left.projectId,
      relation: left.relation,
      sourceDiscipline: left.sourceDiscipline,
      targetDiscipline: left.targetDiscipline,
      counterpartyDiscipline: left.counterpartyDiscipline,
      structuralTargetKind: left.structuralTargetKind,
      structuralTargetId: left.structuralTargetId,
      structuralSystemId: left.structuralSystemId,
      sourceObject: left.sourceObject,
      targetObject: left.targetObject,
      sourceId: left.sourceId,
      sourceClass: left.sourceClass,
      sourceDocumentId: left.sourceDocumentId,
      sourceRevision: left.sourceRevision,
      sourceAuthority: left.sourceAuthority,
      sourceFingerprint: left.sourceFingerprint,
      evidence: left.evidence,
      evidenceKind: left.evidenceKind,
      provenance: left.provenance,
      humanReviewRequired: left.humanReviewRequired,
      predecessorInterfaceId: left.predecessorInterfaceId,
      status: left.status,
    }));
    expect(left.sourceFingerprint).not.toBe(left.fingerprint);
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ expectedSourceFingerprint: "caller-supplied" }))).toThrow("FINGERPRINT_MISMATCH");
  });

  it("rejects floating revisions, missing identity, and non-allowlisted disciplines or relations", () => {
    const now = () => "2026-10-20T01:00:00.000Z";
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({ sources: [source({ revision: "latest" })] }), now), actor(), input())).toThrow("FLOATING_SOURCE_REJECTED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({ sources: [source({ revision: "Current" })] }), now), actor(), input())).toThrow("FLOATING_SOURCE_REJECTED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ sourceId: "" }))).toThrow("SOURCE_REFERENCE_REQUIRED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ sourceId: "missing" }))).toThrow("SOURCE_NOT_FOUND");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({ sources: [source({ evidenceId: "" })] }), now), actor(), input())).toThrow("MISSING_EVIDENCE");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({ sources: [source({ provenanceRef: "" })] }), now), actor(), input())).toThrow("INVALID_PROVENANCE");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ sourceDiscipline: "architecture" }))).toThrow("DISCIPLINE_NOT_ALLOWLISTED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ relation: "BIDIRECTIONAL" }))).toThrow("RELATION_NOT_ALLOWLISTED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ structuralTargetKind: "SLAB", structuralTargetId: "slab-1" }))).toThrow("STRUCTURAL_TARGET_INVALID");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ structuralTargetId: "missing-member" }))).toThrow("STRUCTURAL_TARGET_NOT_FOUND");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ expectedSourceRevision: "rev-9" }))).toThrow("SOURCE_REVISION_MISMATCH");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor(), input({ counterpartyDiscipline: "mechanical" }))).toThrow("COUNTERPARTY_DISCIPLINE_MISMATCH");
    expect(D1K_R1_FLOATING_LATEST_SOURCE_ALLOWED).toBe(false);
  });

  it("rejects another tenant or workspace and does not bind that source", () => {
    const now = () => "2026-10-20T01:00:00.000Z";
    const otherWorkspace = createD1kR1Store(catalog({ sources: [source({ workspaceId: "workspace-b" })] }), now);
    expect(() => registerStructuralInterfaceIdentity(otherWorkspace, actor(), input())).toThrow("CROSS_PROJECT_OPERATION");
    expect(otherWorkspace.records).toHaveLength(0);
    const otherTenant = createD1kR1Store(catalog(), now);
    expect(() => registerStructuralInterfaceIdentity(otherTenant, actor({ tenantId: "tenant-b" }), input())).toThrow("CROSS_TENANT_OPERATION");
    expect(otherTenant.records).toHaveLength(0);
    expect(() => inspectStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor({ projectId: "project-b" }), "interface-1")).toThrow("INTERFACE_NOT_FOUND");
  });

  it("keeps the prior source pin when a later revision is recorded", () => {
    const store = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const original = registerStructuralInterfaceIdentity(store, actor(), input());
    const originalRevision = original.sourceRevision;
    const originalFingerprint = original.fingerprint;
    const catalogSource = store.catalog.sources[0];
    const successor = supersedeStructuralInterfaceSource(store, actor(), input({
      interfaceId: "interface-1-rev-5",
      sourceId: "src-civil-5",
      predecessorInterfaceId: original.interfaceId,
      expectedSourceRevision: "rev-5",
    }));
    expect(original.sourceRevision).toBe(originalRevision);
    expect(original.sourceRevision).toBe("rev-4");
    expect(original.recordStatus).toBe("SUPERSEDED");
    expect(catalogSource?.revision).toBe("rev-4");
    expect(successor.sourceRevision).toBe("rev-5");
    expect(successor.fingerprint).not.toBe(originalFingerprint);
    expect(successor.predecessorInterfaceId).toBe(original.interfaceId);
    expect(store.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(D1K_R1_APPEND_ONLY_HISTORY).toBe(true);
    expect(D1K_R1_SILENT_SOURCE_REPOINTING_ALLOWED).toBe(false);
    expect(D1K_R1_UPSTREAM_SOURCE_MUTATION_AUTHORIZED).toBe(false);
    expect(() => supersedeStructuralInterfaceSource(store, actor(), input({
      interfaceId: "interface-1-again",
      predecessorInterfaceId: original.interfaceId,
    }))).toThrow("PREDECESSOR_NOT_CURRENT");
  });

  it("does not assess compatibility, convert units, infer coordinates or axes, hand off, or approve", () => {
    const store = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const record = registerStructuralInterfaceIdentity(store, actor(), input());
    expect(record.compatibilityEvaluated).toBe(false);
    expect(record.handoffExecuted).toBe(false);
    expect(record.engineeringApproval).toBe(false);
    expect(D1K_R1_SEMANTIC_COMPATIBILITY_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_UNIT_COMPATIBILITY_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_COORDINATE_COMPATIBILITY_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_AXIS_SIGN_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_HANDOFF_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_INTERFACE_ACCEPTED_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1K_R1_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVAL).toBe(false);
    expect(D1K_R1_PARALLEL_APPROVAL_ENGINE_CREATED).toBe(false);
    expect(() => registerStructuralInterfaceIdentity(store, actor(), input({ interfaceId: "active", status: "active" }))).toThrow("INTERFACE_STATUS_NOT_R1");
  });

  it("rejects AI authority and does not start D2 through D9, D1L, D1M, or D1N", () => {
    const now = () => "2026-10-20T01:00:00.000Z";
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog(), now), actor({ authority: "AI_ASSISTANT" }), input())).toThrow("UNAUTHORIZED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({ sources: [source({ authority: "LLM_MODEL" })] }), now), actor(), input())).toThrow("SOURCE_AUTHORITY_INVALID");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({ sources: [source({ provenanceRef: "AI provenance" })] }), now), actor(), input())).toThrow("INVALID_PROVENANCE");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({
      sources: [source({ sourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE", sourceDiscipline: "civil" })],
    }), now), actor(), input())).toThrow("SOURCE_PACK_NOT_STARTED");
    expect(() => registerStructuralInterfaceIdentity(createD1kR1Store(catalog({
      sources: [source({ operationalExternalReference: true })],
    }), now), actor(), input())).toThrow("EXTERNAL_REFERENCE_NOT_AUTHORIZED");
    expect(D1K_R1_AI_CAN_INVENT_INTERFACE_IDENTITY).toBe(false);
    expect(D1K_R1_AI_CAN_INVENT_STRUCTURAL_TARGET).toBe(false);
    expect(D1K_R1_AI_CAN_INVENT_SOURCE_REFERENCE).toBe(false);
    expect(D1K_R1_AI_CAN_INVENT_SOURCE_REVISION).toBe(false);
    expect(D1K_R1_AI_CAN_INVENT_EVIDENCE).toBe(false);
    expect(D1K_R1_AI_CAN_INVENT_PROVENANCE).toBe(false);
    expect(D1K_R1_AI_CAN_INVENT_SOURCE_AUTHORITY).toBe(false);
    expect(D1K_R1_AI_CAN_APPROVE_INTERFACE).toBe(false);
    expect(D1K_R1_AI_CAN_APPROVE_ENGINEERING).toBe(false);
    expect(D1K_R1_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1K_R1_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_D9_RUNTIME_STARTED).toBe(false);
    expect(D1K_R1_D9_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R1_D1L_STARTED).toBe(false);
    expect(D1K_R1_D1M_ABSORBED).toBe(false);
    expect(D1K_R1_D1N_ABSORBED).toBe(false);
    expect(D1K_R1_EXTERNAL_REFERENCE_READY).toBe(false);
    expect(D1K_R1_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_R1_CROSS_DISCIPLINE_INTELLIGENCE_READY).toBe(false);
  });

  it("promotes only the bounded reference runtime and preserves the historical readiness constant", () => {
    expect(D1K_R1_STATUS).toBe("REFERENCE_FOUNDATION_DEFINED");
    expect(D1K_R1_MATURITY_STATE).toBe("STRUCTURAL_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_IMPLEMENTED");
    expect(D1K_R1_ARCHITECTURE_READY).toBe(true);
    expect(D1K_R1_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1K_REFERENCE_RUNTIME_READY).toBe(false);
    expect(D1K_R1_INTERFACE_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D1K_R1_EXACT_SOURCE_REFERENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1K_R1_EXACT_SOURCE_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1K_R1_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1K_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1K_R1_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1K_R1_DATABASE_SCHEMA_CHANGE_REQUIRED).toBe(false);
    expect(D1K_R2_CANONICAL_PHASE).toBe("EOS-D1K-R2-SEMANTIC-UNIT-COORDINATE-AXIS-COMPATIBILITY");
    expect(D1K_R2_PHASE_TYPE).toBe("STRUCTURAL_INTERFACE_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY");
    expect(D1K_R2_CANONICAL_SCOPE).toContain("Do not convert units");
    const sourceText = readFileSync(runtimePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(sourceText.includes(["from", '"@rtb/engineering-review"'].join(" "))).toBe(false);
    expect(sourceText).not.toMatch(/\bfetch\(|mqtt|opcua|modbus|WebSocket|fft\(|child_process|eval\(|new Function/);
    expect(sourceText).not.toContain("existingUnitPairCompatible");
    expect(scanAnalysisFormulaBypass(runtimePath, sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(doc).not.toMatch(/```/);
    expect(doc).toContain(D1K_R1_CLOSEOUT_PATH);
    const identity = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1K.R1.INTERFACE_IDENTITY_SOURCE_REFERENCE");
    const runtime = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1K.STRUCTURAL_INTERFACE_RUNTIME");
    expect(identity?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(identity?.validationState).toBe("NOT_VALIDATED");
    expect(runtime?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
