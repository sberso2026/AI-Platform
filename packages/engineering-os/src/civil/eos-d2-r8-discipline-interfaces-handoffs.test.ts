import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  createD1kR1Store,
  registerStructuralInterfaceIdentity,
  supersedeStructuralInterfaceSource,
  type D1kR1Actor,
  type D1kR1Catalog,
  type D1kR1CatalogSource,
  type D1kR1InterfaceInput,
  type D1kR1StructuralTarget,
} from "../structural-systems/interface-identity-foundation";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D2_CONTEXT_AUTHORITY, D2_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "./identity-foundation";
import { D2_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD2R2Store } from "./spatial-surface-context";
import { D2_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD2R3Store } from "./grading-earthworks-context";
import { D2_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD2R4Store } from "./roads-access-context";
import { D2_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD2R5Store } from "./drainage-stormwater-context";
import { D2_RUNTIME_COUNT as R6_RUNTIME_COUNT, createD2R6Store } from "./utility-corridor-context";
import {
  D2_DISCIPLINE_INTERFACE_RUNTIME_READY as R7_INTERFACE_READY,
  D2_R8_STARTED as R7_R8_STARTED,
  D2_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  createD2R7Store,
  recordCivilAssumption,
  recordCivilChange,
  recordCivilDecision,
  recordCivilRequirement,
} from "./requirements-assumptions-change";
import {
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  CANONICAL_INTERFACE_GOVERNANCE_REUSED,
  D1_EQUALS_D2_CIVIL_AUTHORITY,
  D2_AUTOMATIC_INTERFACE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D2_AUTOMATIC_INTERFACE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_REVIEW_RUNTIME_COUNT,
  D2_CIVIL_VALIDATION_RUNTIME_COUNT,
  D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D2_D1_INTERFACE_RUNTIME_IMPLEMENTED,
  D2_D3_INTERFACE_RUNTIME_IMPLEMENTED,
  D2_D4_D8_FUTURE_HANDOFF_PLACEHOLDERS_IMPLEMENTED,
  D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT,
  D2_DISCIPLINE_INTERFACE_HANDOFF_RUNTIME_COUNT,
  D2_DISCIPLINE_INTERFACE_HANDOFF_RUNTIME_IMPLEMENTED,
  D2_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D2_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D2_INTERFACE_AUTO_REPOINTED,
  D2_INTERFACE_HISTORY_PRESERVED,
  D2_INTERFACE_PROVENANCE_PRESERVED,
  D2_INTERFACE_PROVENANCE_REQUIRED,
  D2_R8_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE,
  D2_R8_CREATES_PARALLEL_DECISION_GOVERNANCE,
  D2_R8_CREATES_PARALLEL_REQUIREMENT_GOVERNANCE,
  D2_R8_MATURITY,
  D2_R8_STATUS,
  D2_R9_CANONICAL_PHASE,
  D2_R9_PHASE_TYPE,
  D2_R9_STARTED,
  D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D3_RUNTIME_STARTED,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_COUNTERPART_REFERENCE_REQUIRED_WHEN_COUNTERPART_EXISTS,
  EXACT_D2_INTERFACE_SOURCE_REFERENCE_REQUIRED,
  FLOATING_COUNTERPART_REFERENCE_ALLOWED,
  FLOATING_D2_INTERFACE_SOURCE_REFERENCE_ALLOWED,
  HANDOFF_ACCEPTED_EQUALS_ENGINEERING_APPROVED,
  INCOMPLETE_HANDOFF_EQUALS_VALIDATED_INTERFACE,
  INTERFACE_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  INTERFACE_HANDOFF_EQUALS_AUTHORITY_TRANSFER,
  MISSING_COUNTERPART_AUTO_FABRICATED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D2_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_GLOBAL_CROSS_DISCIPLINE_FRAMEWORK_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D2_INTERFACE_MUTATION_ALLOWED,
  SOURCE_EVIDENCE_EQUALS_RECEIVING_DISCIPLINE_VALIDATION,
  STALE_HANDOFF_AUTO_REPOINTED,
  TENANT_WORKSPACE_PROJECT_D2_INTERFACE_SCOPE_ENFORCED,
  createD2R8Store,
  detectInterfaceConflict,
  mutateCivilInterface,
  reasonAcrossDisciplines,
  recordCivilInterfaceHandoff,
  resolveInterfaceConflict,
  validateCounterpart,
} from "./discipline-interfaces-handoffs";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

const d1Actor: D1kR1Actor = {
  actorId: "engineer-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "HUMAN_ENGINEER",
};

function target(overrides: Partial<D1kR1StructuralTarget> = {}): D1kR1StructuralTarget {
  return { kind: "MEMBER", id: "member-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4", ...overrides };
}

function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-civil-4",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    sourceClass: "MANUAL_GOVERNED_REFERENCE",
    sourceDiscipline: "civil",
    objectId: "grading-object",
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
  return {
    targets: [target(), target({ kind: "FOUNDATION_INTERFACE", id: "foundation-1" }), target({ kind: "STRUCTURAL_SYSTEM", id: "system-1" })],
    sources: [source(), source({ sourceId: "src-civil-5", revision: "rev-5", documentId: "doc-grade-5", evidenceId: "evidence-5", provenanceRef: "provenance-civil-5" })],
  };
}

function d1Input(overrides: Partial<D1kR1InterfaceInput> = {}): D1kR1InterfaceInput {
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

describe("EOS-D2-R8 discipline interfaces and handoffs", () => {
  it("records Civil handoffs on exact sources without transferring authority or starting other disciplines", () => {
    expect(D2_R8_STATUS).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED");
    expect(D2_R8_MATURITY).toBe(D2_R8_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(R7_INTERFACE_READY).toBe(false);
    expect(R7_R8_STARTED).toBe(false);
    expect(D2_DISCIPLINE_INTERFACE_HANDOFF_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_DISCIPLINE_INTERFACE_HANDOFF_RUNTIME_COUNT).toBe(1);
    expect(CANONICAL_INTERFACE_GOVERNANCE_REUSED).toBe(true);
    expect(PARALLEL_GLOBAL_CROSS_DISCIPLINE_FRAMEWORK_CREATED).toBe(false);
    expect(EXACT_D2_INTERFACE_SOURCE_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D2_INTERFACE_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(EXACT_COUNTERPART_REFERENCE_REQUIRED_WHEN_COUNTERPART_EXISTS).toBe(true);
    expect(FLOATING_COUNTERPART_REFERENCE_ALLOWED).toBe(false);
    expect(D2_D1_INTERFACE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D1_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D2_D3_INTERFACE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D2_D4_D8_FUTURE_HANDOFF_PLACEHOLDERS_IMPLEMENTED).toBe(true);
    expect(INTERFACE_HANDOFF_EQUALS_AUTHORITY_TRANSFER).toBe(false);
    expect(SOURCE_EVIDENCE_EQUALS_RECEIVING_DISCIPLINE_VALIDATION).toBe(false);
    expect(HANDOFF_ACCEPTED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_INTERFACE_CONFLICT_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_INTERFACE_CONFLICT_RESOLUTION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(INCOMPLETE_HANDOFF_EQUALS_VALIDATED_INTERFACE).toBe(false);
    expect(MISSING_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(STALE_HANDOFF_AUTO_REPOINTED).toBe(false);
    expect(D2_R8_CREATES_PARALLEL_REQUIREMENT_GOVERNANCE).toBe(false);
    expect(D2_R8_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE).toBe(false);
    expect(D2_R8_CREATES_PARALLEL_DECISION_GOVERNANCE).toBe(false);
    expect(INTERFACE_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D2_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D2_INTERFACE_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_INTERFACE_PROVENANCE_PRESERVED).toBe(true);
    expect(D2_INTERFACE_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D2_INTERFACE_MUTATION_ALLOWED).toBe(false);
    expect(D2_INTERFACE_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D2_INTERFACE_SCOPE_ENFORCED).toBe(true);
    expect(D2_CIVIL_REVIEW_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT).toBe(0);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D3_RUNTIME_STARTED).toBe(false);
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D2_R9_STARTED).toBe(false);
    expect(D2_R9_CANONICAL_PHASE).toBe("EOS-D2-R9-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D2_R9_PHASE_TYPE).toBe("REVIEW_AND_VALIDATION_GOVERNANCE");

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const object = (objectId: string, objectType: "GRADING_ZONE" | "CIVIL_INTERFACE" | "CIVIL_REQUIREMENT" | "CIVIL_ASSUMPTION" | "CIVIL_DECISION" | "CIVIL_EVIDENCE_REFERENCE") =>
      recordCivilObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef: `prov-${objectId}` });
    const gradingObject = object("grading-object", "GRADING_ZONE");
    const interfaceObject = object("interface-object", "CIVIL_INTERFACE");
    const requirementObject = object("requirement-object", "CIVIL_REQUIREMENT");
    const assumptionObject = object("assumption-object", "CIVIL_ASSUMPTION");
    const decisionObject = object("decision-object", "CIVIL_DECISION");
    const evidence = object("evidence-object", "CIVIL_EVIDENCE_REFERENCE");
    const r7 = createD2R7Store(createD2R6Store(createD2R5Store(createD2R4Store(createD2R3Store(createD2R2Store(r1))))));
    recordCivilRequirement(r7, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
    });
    recordCivilAssumption(r7, actor, {
      assumptionContextId: "assumption-1",
      contextId: context.contextId,
      objectId: assumptionObject.objectId,
      statement: "The cited existing surface remains the reference.",
      sourceRef: "survey-authority",
      rationale: "Supplied by the survey record.",
      affectedObjectIds: [gradingObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-assumption",
      citedCurrentness: "CURRENT",
    });
    recordCivilDecision(r7, actor, {
      decisionContextId: "decision-1",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "Retain the cited finished level.",
      rationale: "The requirement and assumption were supplied.",
      authorityRole: "DECISION_AUTHORITY",
      alternatives: [],
      affectedObjectIds: [gradingObject.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-decision",
      citedCurrentness: "CURRENT",
    });
    recordCivilChange(r7, actor, {
      changeContextId: "change-1",
      contextId: context.contextId,
      initiatingSource: "survey-revision-note",
      changedObjectId: gradingObject.objectId,
      affectedRelationships: [{ kind: "PARENT", targetObjectId: gradingObject.objectId }],
      rationale: "The cited survey note asks for reassessment of the explicit link.",
      reassessmentRequired: true,
      authorityRole: "AUTHOR",
      provenanceRef: "prov-change",
      citedCurrentness: "REASSESSMENT_REQUIRED",
    });
    const d1 = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
    const structural = registerStructuralInterfaceIdentity(d1, d1Actor, d1Input());
    const store = createD2R8Store(r7, d1);
    const shared = {
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: gradingObject.objectId,
      sourceRevision: "rev-civil-1",
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      changeContextIds: ["change-1"],
      limitations: "Structural compatibility is not evaluated by Civil.",
      provenanceRef: "prov-handoff",
    };
    const gradingFingerprint = gradingObject.fingerprint;
    const d1Fingerprint = structural.fingerprint;
    const recorded = recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-d1",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision,
      handoffStatus: "COMPLETE",
      receivingAcknowledged: true,
      citedCurrentness: "CURRENT",
    });
    expect(recorded.engineeringValidated).toBe(false);
    expect(recorded.engineeringApproved).toBe(false);
    expect(recorded.authorityTransferred).toBe(false);
    expect(recorded.receivingAcknowledged).toBe(true);
    expect(recorded.ownership).toBe("CIVIL");
    expect(recorded.sourceAuthority).toBe(D2_CONTEXT_AUTHORITY);
    expect(recorded.receivingAuthority).toBe("structural");
    expect(recorded.counterpart?.interfaceId).toBe("interface-1");
    expect(recorded.counterpart?.sourceRevision).toBe("rev-4");
    expect(recorded.fingerprint).toBe(fingerprintCanonical({
      handoffId: "handoff-d1",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: gradingObject.objectId,
      sourceRevision: "rev-civil-1",
      sourceObjectFingerprint: gradingObject.fingerprint,
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpart: { interfaceId: "interface-1", sourceRevision: "rev-4", fingerprint: structural.fingerprint },
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      changeContextIds: ["change-1"],
      limitations: "Structural compatibility is not evaluated by Civil.",
      handoffStatus: "COMPLETE",
      receivingAcknowledged: true,
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-handoff",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorHandoffId: null,
    }));
    expect(recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-d1",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision,
      handoffStatus: "COMPLETE",
      receivingAcknowledged: true,
      citedCurrentness: "CURRENT",
    }).fingerprint).toBe(recorded.fingerprint);
    expect(store.history.filter((row) => row.action === "CREATED")).toHaveLength(1);
    const awaiting = recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-awaiting",
      sourceRevision: "rev-civil-awaiting",
      counterpartDiscipline: "structural",
      direction: "COUNTERPART_TO_D2",
      interfaceTopic: "SITE_LEVELS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "AWAITING_COUNTERPART",
      limitations: "No structural counterpart has been cited.",
      provenanceRef: "prov-awaiting",
      citedCurrentness: "CURRENT",
    });
    expect(awaiting.counterpart).toBeNull();
    expect(awaiting.engineeringValidated).toBe(false);
    const geotechnical = recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-d3",
      sourceRevision: "rev-civil-d3",
      counterpartDiscipline: "geotechnical",
      direction: "COUNTERPART_TO_D2",
      interfaceTopic: "GROUNDWATER",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "AWAITING_COUNTERPART",
      limitations: "D3 runtime has not started. No geotechnical record is fabricated.",
      provenanceRef: "prov-d3",
      citedCurrentness: "CURRENT",
    });
    expect(geotechnical.counterpart).toBeNull();
    expect(geotechnical.receivingAuthority).toBe("geotechnical");
    const placeholders = ["mechanical", "piping", "process", "electrical", "instrumentation_control"] as const;
    for (const discipline of placeholders) {
      const placeholder = recordCivilInterfaceHandoff(store, actor, {
        ...shared,
        handoffId: `handoff-${discipline}`,
        sourceRevision: `rev-${discipline}`,
        counterpartDiscipline: discipline,
        direction: "D2_TO_COUNTERPART",
        interfaceTopic: "CORRIDOR_SPACE",
        counterpartInterfaceId: null,
        counterpartSourceRevision: null,
        evidenceObjectIds: [],
        requirementContextIds: [],
        assumptionContextIds: [],
        decisionContextIds: [],
        changeContextIds: [],
        handoffStatus: "NOT_YET_AVAILABLE",
        limitations: "Counterpart discipline runtime has not started.",
        provenanceRef: `prov-${discipline}`,
        citedCurrentness: "CURRENT",
      });
      expect(placeholder.counterpart).toBeNull();
      expect(placeholder.handoffStatus).toBe("NOT_YET_AVAILABLE");
      expect(placeholder.engineeringValidated).toBe(false);
    }
    expect(gradingObject.fingerprint).toBe(gradingFingerprint);
    expect(structural.fingerprint).toBe(d1Fingerprint);
    expect(structural.recordStatus).toBe("CURRENT");
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-float",
      sourceRevision: "latest",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision,
      handoffStatus: "COMPLETE",
      citedCurrentness: "CURRENT",
    })).toThrow(/SOURCE_REVISION_REQUIRED/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-float-counterpart",
      sourceRevision: "rev-float-counterpart",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "ROADS_AND_ACCESS",
      counterpartInterfaceId: "latest",
      counterpartSourceRevision: "rev-4",
      handoffStatus: "INCOMPLETE",
      citedCurrentness: "CURRENT",
    })).toThrow(/COUNTERPART_REFERENCE_REQUIRED/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-d3-fake",
      sourceRevision: "rev-d3-fake",
      counterpartDiscipline: "geotechnical",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "SOIL_PARAMETERS",
      counterpartInterfaceId: "invented-d3",
      counterpartSourceRevision: "rev-d3",
      handoffStatus: "AWAITING_COUNTERPART",
      citedCurrentness: "CURRENT",
    })).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-elec-fake",
      sourceRevision: "rev-elec-fake",
      counterpartDiscipline: "electrical",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "CLEARANCE_ENVELOPE",
      counterpartInterfaceId: "invented-electrical",
      counterpartSourceRevision: "rev-e",
      handoffStatus: "NOT_YET_AVAILABLE",
      citedCurrentness: "CURRENT",
    })).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-d3-complete",
      sourceRevision: "rev-d3-complete",
      counterpartDiscipline: "geotechnical",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "CIVIL_LEVELS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "COMPLETE",
      citedCurrentness: "CURRENT",
    })).toThrow(/INCOMPLETE_COUNTERPART_NOT_COMPLETE/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-transfer",
      sourceRevision: "rev-transfer",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "CROSSINGS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "AWAITING_COUNTERPART",
      transferAuthority: true,
      citedCurrentness: "CURRENT",
    })).toThrow(/AUTHORITY_TRANSFER_REJECTED/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-reason",
      sourceRevision: "rev-reason",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "DRAINAGE_INTERFACES",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "INCOMPLETE",
      reasonAcrossDisciplines: true,
      citedCurrentness: "CURRENT",
    })).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-detect",
      sourceRevision: "rev-detect",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "CIVIL_CONDITIONS_AFFECTING_STRUCTURAL_ASSETS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "INCOMPLETE",
      detectConflict: true,
      citedCurrentness: "CURRENT",
    })).toThrow(/CONFLICT_DETECTION_NOT_IN_R8/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-resolve",
      sourceRevision: "rev-resolve",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "CROSSINGS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "INCOMPLETE",
      resolveConflict: true,
      citedCurrentness: "CURRENT",
    })).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R8/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-validate",
      sourceRevision: "rev-validate",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "CROSSINGS",
      counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision,
      handoffStatus: "INCOMPLETE",
      validateCounterpart: true,
      citedCurrentness: "CURRENT",
    })).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    expect(() => recordCivilInterfaceHandoff(store, { ...actor, actorId: "AI_assistant" }, {
      ...shared,
      handoffId: "handoff-ai",
      sourceRevision: "rev-ai",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "SITE_LEVELS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "AWAITING_COUNTERPART",
      approve: true,
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_CANNOT_APPROVE_INTERFACE/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-scope",
      sourceRevision: "rev-scope",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "SITE_LEVELS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      handoffStatus: "AWAITING_COUNTERPART",
      workspaceId: "workspace-b",
      citedCurrentness: "CURRENT",
    })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-d1",
      sourceRevision: "rev-civil-1",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision,
      handoffStatus: "COMPLETE",
      receivingAcknowledged: true,
      assertedFingerprint: "spoofed",
      citedCurrentness: "CURRENT",
    })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-missing-req",
      sourceRevision: "rev-missing-req",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "SITE_LEVELS",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      requirementContextIds: ["missing-requirement"],
      handoffStatus: "AWAITING_COUNTERPART",
      citedCurrentness: "CURRENT",
    })).toThrow(/REQUIREMENT_REFERENCE_REQUIRED/);
    supersedeStructuralInterfaceSource(d1, d1Actor, d1Input({
      interfaceId: "interface-2",
      sourceId: "src-civil-5",
      predecessorInterfaceId: structural.interfaceId,
    }));
    expect(d1.records.find((row) => row.interfaceId === "interface-1")?.recordStatus).toBe("SUPERSEDED");
    expect(store.handoffs.find((row) => row.handoffId === "handoff-d1")?.counterpart?.interfaceId).toBe("interface-1");
    expect(store.handoffs.find((row) => row.handoffId === "handoff-d1")?.counterpart?.sourceRevision).toBe("rev-4");
    expect(() => recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-current-stale-counterpart",
      sourceRevision: "rev-current-stale",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpartInterfaceId: "interface-1",
      counterpartSourceRevision: "rev-4",
      handoffStatus: "INCOMPLETE",
      citedCurrentness: "CURRENT",
    })).toThrow(/COUNTERPART_NOT_CURRENT/);
    const stale = recordCivilInterfaceHandoff(store, actor, {
      ...shared,
      handoffId: "handoff-stale",
      counterpartDiscipline: "structural",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GRADING_NEAR_STRUCTURES",
      counterpartInterfaceId: "interface-1",
      counterpartSourceRevision: "rev-4",
      handoffStatus: "STALE",
      limitations: "The cited structural interface revision is no longer current.",
      provenanceRef: "prov-stale",
      citedCurrentness: "STALE",
      predecessorHandoffId: "handoff-d1",
    });
    expect(stale.counterpart?.interfaceId).toBe("interface-1");
    expect(stale.counterpart?.interfaceId).not.toBe("interface-2");
    expect(store.handoffs.find((row) => row.handoffId === "handoff-d1")?.recordStatus).toBe("SUPERSEDED");
    expect(store.handoffs.find((row) => row.handoffId === "handoff-d1")?.counterpart?.interfaceId).toBe("interface-1");
    expect(store.history.some((row) => row.action === "SUPERSEDED")).toBe(true);
    expect(gradingObject.fingerprint).toBe(gradingFingerprint);
    expect(() => mutateCivilInterface()).toThrow(/INTERFACE_MUTATION_REJECTED/);
    expect(() => reasonAcrossDisciplines()).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(() => detectInterfaceConflict()).toThrow(/CONFLICT_DETECTION_NOT_IN_R8/);
    expect(() => resolveInterfaceConflict()).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R8/);
    expect(() => validateCounterpart()).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D2_D1_INTERFACE_TOPICS");
    expect(sourceText).toContain("D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "discipline-interfaces-handoffs.ts"), sourceText)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
