import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D2_RUNTIME_COUNT as D2_ARCHITECTURE_RUNTIME_COUNT, D3_0_RUNTIME_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_CONTEXT_AUTHORITY, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "../civil/identity-foundation";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD1kR1Store, registerStructuralInterfaceIdentity, type D1kR1Actor, type D1kR1Catalog, type D1kR1CatalogSource, type D1kR1InterfaceInput, type D1kR1StructuralTarget } from "../structural-systems/interface-identity-foundation";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_CONTEXT_AUTHORITY, D3_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "./identity-foundation";
import { D3_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD3R2Store, recordInvestigationEvidenceReference } from "./site-investigation-evidence";
import { D3_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD3R3Store } from "./stratigraphy-groundwater-material";
import { D3_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD3R4Store } from "./field-lab-test-context";
import { D3_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD3R5Store } from "./geotechnical-parameter-context";
import { D3_RUNTIME_COUNT as R6_RUNTIME_COUNT, createD3R6Store } from "./foundation-excavation-slope-context";
import {
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY as R7_INTERFACE_READY,
  D3_R8_CANONICAL_SCOPE as R7_STORED_R8_SCOPE,
  D3_R8_STARTED,
  D3_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  createD3R7Store,
} from "./requirements-assumptions-change";
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1_COUNTERPART_REFERENCE_EQUALS_D3_VALIDATION,
  D1_COUNTERPART_VALIDATES_D3_AUTOMATICALLY,
  D1_HANDOFF_AUTO_MUTATES_D3_OBJECT,
  D1_TO_D3_COUNTERPART_REFERENCE_SUPPORTED,
  D2_COUNTERPART_REFERENCE_EQUALS_D3_VALIDATION,
  D2_COUNTERPART_VALIDATES_D3_AUTOMATICALLY,
  D2_HANDOFF_AUTO_MUTATES_D3_OBJECT,
  D2_REOPENED,
  D2_TO_D3_COUNTERPART_REFERENCE_SUPPORTED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_D1_AUTHORITY_TRANSFER_ALLOWED,
  D3_D1_HANDOFF_SUPPORTED,
  D3_D1_INTERFACE_IMPLEMENTED,
  D3_D2_AUTHORITY_TRANSFER_ALLOWED,
  D3_D2_HANDOFF_SUPPORTED,
  D3_D2_INTERFACE_IMPLEMENTED,
  D3_D4_INTERFACE_CONTRACT_DEFINED,
  D3_D5_INTERFACE_CONTRACT_DEFINED,
  D3_D6_INTERFACE_CONTRACT_DEFINED,
  D3_D7_INTERFACE_CONTRACT_DEFINED,
  D3_D8_INTERFACE_CONTRACT_DEFINED,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_HANDOFF_AUTO_REPOINTED,
  D3_HANDOFF_CURRENTNESS_EXPLICIT,
  D3_HANDOFF_LIMITATIONS_EXPLICIT,
  D3_HANDOFF_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D3_INTERFACE_AUTO_MUTATES_D1_OBJECT,
  D3_INTERFACE_AUTO_MUTATES_D2_OBJECT,
  D3_INTERFACE_AUTO_RECALCULATES_PARAMETER,
  D3_INTERFACE_AUTO_REDESIGNS_RECOMMENDATION,
  D3_INTERFACE_SOURCE_AUTO_REPOINTED,
  D3_R8_BLOCKER,
  D3_R8_CANONICAL_NEXT_PHASE,
  D3_R8_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R8_HISTORY_PRESERVED,
  D3_R8_MATURITY,
  D3_R8_NEXT_PHASE_TYPE,
  D3_R8_PROVENANCE_PRESERVED,
  D3_R8_PROVENANCE_REQUIRED,
  D3_R8_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R8_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R8_STATUS,
  D3_R9_STARTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_REUSES_CANONICAL_HANDOFF_GOVERNANCE,
  D3_REUSES_CANONICAL_INTERFACE_GOVERNANCE,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D3_VALIDATES_D2_CIVIL_ENGINEERING,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D3_INTERFACE_SOURCE_REVISION_REQUIRED,
  FLOATING_D3_INTERFACE_SOURCE_REFERENCE_ALLOWED,
  HANDOFF_ACCEPTED_EQUALS_ENGINEERING_APPROVED,
  HANDOFF_COMPLETE_EQUALS_ENGINEERING_VALIDATED,
  INCOMPLETE_D3_HANDOFF_EXPOSED_AS_COMPLETE,
  MISSING_COUNTERPART_AUTO_FABRICATED,
  MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D3_HANDOFF_FRAMEWORK_CREATED,
  PARALLEL_D3_INTERFACE_FRAMEWORK_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R8_MUTATION_ALLOWED,
  STALE_D3_HANDOFF_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D3_R8_SCOPE_ENFORCED,
  createD3R8Store,
  detectGeotechnicalInterfaceConflict,
  mutateGeotechnicalInterface,
  reasonAcrossGeotechnicalDisciplines,
  recordGeotechnicalInterfaceHandoff,
  repointGeotechnicalHandoff,
  resolveGeotechnicalInterfaceConflict,
  validateGeotechnicalCounterpart,
} from "./discipline-interfaces-handoffs";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

const civilActor: D2R1Actor = {
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

const R9_SCOPE = "Implement governed Geotechnical review requests, findings, reviewer authority and validation state using exact D3 revisions. Preserve the separation between review, validation, conformance, approval and certification. AI/admin must not automatically validate Geotechnical engineering. Do not start D4-D9.";

function target(overrides: Partial<D1kR1StructuralTarget> = {}): D1kR1StructuralTarget {
  return { kind: "FOUNDATION_INTERFACE", id: "foundation-target-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4", ...overrides };
}

function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-geotech-4",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    sourceClass: "MANUAL_GOVERNED_REFERENCE",
    sourceDiscipline: "geotechnical",
    objectId: "foundation-context-1",
    documentId: "doc-geotech-4",
    revision: "rev-4",
    evidenceId: "evidence-4",
    evidenceKind: "source_document",
    authority: "GEOTECHNICAL_ENGINEER_OF_RECORD",
    provenanceRef: "provenance-geotech-4",
    issuedAt: "2026-10-20T00:00:00.000Z",
    nativePackContractExposed: false,
    operationalExternalReference: false,
    ...overrides,
  };
}

function catalog(): D1kR1Catalog {
  return { targets: [target(), target({ kind: "STRUCTURAL_SYSTEM", id: "system-1" })], sources: [source()] };
}

function d1Input(): D1kR1InterfaceInput {
  return {
    interfaceId: "interface-1",
    relation: "PROVIDES_INPUT_TO",
    sourceDiscipline: "geotechnical",
    targetDiscipline: "structural",
    counterpartyDiscipline: "geotechnical",
    structuralTargetKind: "FOUNDATION_INTERFACE",
    structuralTargetId: "foundation-target-1",
    sourceId: "src-geotech-4",
    humanReviewRequired: true,
    description: "Geotechnical foundation context supplied to the structural foundation interface",
  };
}

describe("EOS-D3-R8 discipline interfaces and handoffs", () => {
  it("records exact Geotechnical handoffs without transferring authority or starting other disciplines", () => {
    expect(D3_R8_STATUS).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED");
    expect(D3_R8_MATURITY).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R8_STARTED).toBe(false);
    expect(R7_INTERFACE_READY).toBe(false);
    expect(D3_R9_STARTED).toBe(false);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D3_REUSES_CANONICAL_INTERFACE_GOVERNANCE).toBe(true);
    expect(D3_REUSES_CANONICAL_HANDOFF_GOVERNANCE).toBe(true);
    expect(PARALLEL_D3_INTERFACE_FRAMEWORK_CREATED).toBe(false);
    expect(PARALLEL_D3_HANDOFF_FRAMEWORK_CREATED).toBe(false);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(EXACT_D3_INTERFACE_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D3_INTERFACE_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D3_INTERFACE_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D3_D1_INTERFACE_IMPLEMENTED).toBe(true);
    expect(D3_D1_HANDOFF_SUPPORTED).toBe(true);
    expect(D3_D1_AUTHORITY_TRANSFER_ALLOWED).toBe(false);
    expect(D1_TO_D3_COUNTERPART_REFERENCE_SUPPORTED).toBe(true);
    expect(D1_COUNTERPART_REFERENCE_EQUALS_D3_VALIDATION).toBe(false);
    expect(D3_D2_INTERFACE_IMPLEMENTED).toBe(true);
    expect(D3_D2_HANDOFF_SUPPORTED).toBe(true);
    expect(D3_D2_AUTHORITY_TRANSFER_ALLOWED).toBe(false);
    expect(D2_TO_D3_COUNTERPART_REFERENCE_SUPPORTED).toBe(true);
    expect(D2_COUNTERPART_REFERENCE_EQUALS_D3_VALIDATION).toBe(false);
    expect(D3_D4_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D3_D5_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D3_D6_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D3_D7_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D3_D8_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(MISSING_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE).toBe(false);
    expect(D3_HANDOFF_CURRENTNESS_EXPLICIT).toBe(true);
    expect(D3_HANDOFF_LIMITATIONS_EXPLICIT).toBe(true);
    expect(STALE_D3_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(INCOMPLETE_D3_HANDOFF_EXPOSED_AS_COMPLETE).toBe(false);
    expect(D3_HANDOFF_AUTO_REPOINTED).toBe(false);
    expect(D3_HANDOFF_TRANSFERS_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D3_VALIDATES_D1_STRUCTURAL_ENGINEERING).toBe(false);
    expect(D3_VALIDATES_D2_CIVIL_ENGINEERING).toBe(false);
    expect(D1_COUNTERPART_VALIDATES_D3_AUTOMATICALLY).toBe(false);
    expect(D2_COUNTERPART_VALIDATES_D3_AUTOMATICALLY).toBe(false);
    expect(D3_INTERFACE_AUTO_MUTATES_D1_OBJECT).toBe(false);
    expect(D3_INTERFACE_AUTO_MUTATES_D2_OBJECT).toBe(false);
    expect(D1_HANDOFF_AUTO_MUTATES_D3_OBJECT).toBe(false);
    expect(D2_HANDOFF_AUTO_MUTATES_D3_OBJECT).toBe(false);
    expect(D3_INTERFACE_AUTO_RECALCULATES_PARAMETER).toBe(false);
    expect(D3_INTERFACE_AUTO_REDESIGNS_RECOMMENDATION).toBe(false);
    expect(HANDOFF_COMPLETE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(HANDOFF_ACCEPTED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect([
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array(12).fill(0));
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D2_ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_R8_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R8_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D3_R8_MUTATION_ALLOWED).toBe(false);
    expect(D3_R8_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R8_SCOPE_ENFORCED).toBe(true);
    expect(D3_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R8_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R8_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R8_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R9-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D3_R8_NEXT_PHASE_TYPE).toBe("REVIEW_AND_VALIDATION_GOVERNANCE");
    expect(D3_R8_CANONICAL_NEXT_PHASE_SCOPE).toBe(R9_SCOPE);
    expect(D3_R8_BLOCKER).toBe("NONE");
    expect(R7_STORED_R8_SCOPE).toContain("Do not perform cross-discipline reasoning");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const site = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-1", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const borehole = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "borehole-1", contextId: context.contextId, objectType: "BOREHOLE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-borehole-identity", parentObjectId: site.objectId });
    const foundation = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "foundation-context-1", contextId: context.contextId, objectType: "FOUNDATION_GEOTECHNICAL_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-foundation-identity" });
    const interfaceObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "interface-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_INTERFACE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-interface-identity" });
    const r2 = createD3R2Store(r1);
    const evidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const r7 = createD3R7Store(createD3R6Store(createD3R5Store(createD3R4Store(createD3R3Store(r2)))));
    const d1 = createD1kR1Store(catalog(), () => "2026-10-23T00:00:00.000Z");
    const structural = registerStructuralInterfaceIdentity(d1, d1Actor, d1Input());
    const d2 = createD2R1Store();
    const civilContext = recordCivilContext(d2, civilActor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-civil-context" });
    const civilSite = recordCivilObjectIdentity(d2, civilActor, { objectId: "civil-site-1", contextId: civilContext.contextId, objectType: "CIVIL_SITE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-civil-site" });
    const foundationFingerprint = foundation.fingerprint;
    const structuralFingerprint = structural.fingerprint;
    const civilFingerprint = civilSite.fingerprint;
    const objectCount = r1.objects.length;
    const store = createD3R8Store(r7, d1, d2);
    const shared = { contextId: context.contextId, objectId: interfaceObject.objectId, sourceObjectId: foundation.objectId, sourceRevision: foundation.provenanceRef, evidenceReferenceIds: [evidence.evidenceReferenceId], limitations: "This handoff does not design or validate the receiving discipline", provenanceRef: "prov-handoff", citedCurrentness: "CURRENT" };
    const toStructural = recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "FOUNDATION_SOIL_ROCK_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", receivingAcknowledged: true });
    expect(toStructural.ownership).toBe("GEOTECHNICAL");
    expect(toStructural.authorityTransferred).toBe(false);
    expect(toStructural.engineeringValidated).toBe(false);
    expect(toStructural.engineeringApproved).toBe(false);
    expect(toStructural.engineeringCertified).toBe(false);
    expect(toStructural.receivingAcknowledged).toBe(true);
    expect(toStructural.counterpart?.fingerprint).toBe(structuralFingerprint);
    expect(toStructural.sourceObjectFingerprint).toBe(foundationFingerprint);
    expect(recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "FOUNDATION_SOIL_ROCK_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", receivingAcknowledged: true }).fingerprint).toBe(toStructural.fingerprint);
    const fromStructural = recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1-in", counterpartDiscipline: "structural", direction: "COUNTERPART_TO_D3", interfaceTopic: "FOUNDATION_GEOMETRY", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE" });
    expect(fromStructural.engineeringValidated).toBe(false);
    const toCivil = recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d2", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "GROUNDWATER", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE" });
    expect(toCivil.authorityTransferred).toBe(false);
    expect(toCivil.receivingAuthority).toBe("civil");
    const fromCivil = recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d2-in", counterpartDiscipline: "civil", direction: "COUNTERPART_TO_D3", interfaceTopic: "SITE_OR_SURFACE_CONTEXT", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "INCOMPLETE" });
    expect(fromCivil.handoffStatus).toBe("INCOMPLETE");
    expect(fromCivil.engineeringValidated).toBe(false);
    for (const discipline of ["mechanical", "piping", "process", "electrical", "instrumentation_control"] as const) {
      const placeholder = recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: `handoff-${discipline}`, counterpartDiscipline: discipline, direction: "D3_TO_COUNTERPART", interfaceTopic: "DISCIPLINE_OBJECT_IDENTITY_CITATION", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "NOT_YET_AVAILABLE" });
      expect(placeholder.counterpart).toBeNull();
      expect(placeholder.handoffStatus).toBe("NOT_YET_AVAILABLE");
    }
    expect(foundation.fingerprint).toBe(foundationFingerprint);
    expect(structural.fingerprint).toBe(structuralFingerprint);
    expect(civilSite.fingerprint).toBe(civilFingerprint);
    expect(r1.objects).toHaveLength(objectCount);
    expect(d1.records).toHaveLength(1);
    expect(d2.objects).toHaveLength(1);
    const preserved = toStructural.fingerprint;
    const revised = recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1b", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "SETTLEMENT_CRITERIA", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", limitations: "Revised handoff still does not design the structure", provenanceRef: "prov-handoff-b", predecessorHandoffId: toStructural.handoffId });
    const historical = store.handoffs.find((row) => row.handoffId === toStructural.handoffId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.fingerprint).toBe(preserved);
    expect(historical?.sourceRevision).toBe(foundation.provenanceRef);
    expect(historical?.counterpart?.sourceRevision).toBe(structural.sourceRevision);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    expect(recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1b", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "SETTLEMENT_CRITERIA", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", limitations: "Revised handoff still does not design the structure", provenanceRef: "prov-handoff-b", predecessorHandoffId: toStructural.handoffId }).fingerprint).toBe(revised.fingerprint);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-float", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "GROUNDWATER", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", sourceRevision: "latest" })).toThrow(/SOURCE_REVISION_REQUIRED/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-mismatch", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "GROUNDWATER", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", sourceRevision: "rev-other" })).toThrow(/SOURCE_REVISION_MISMATCH/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-missing", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "LATERAL_SOIL_PARAMETER_CONTEXT", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "COMPLETE" })).toThrow(/INCOMPLETE_COUNTERPART_NOT_COMPLETE/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-future-complete", counterpartDiscipline: "mechanical", direction: "D3_TO_COUNTERPART", interfaceTopic: "CORRIDOR_SPACE", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "COMPLETE" })).toThrow(/INCOMPLETE_COUNTERPART_NOT_COMPLETE/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-fabricated", counterpartDiscipline: "piping", direction: "D3_TO_COUNTERPART", interfaceTopic: "CLEARANCE_ENVELOPE", counterpartInterfaceId: "invented-piping", counterpartSourceRevision: "rev-invented", handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-stale-as-current", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "EXCAVATION_CONSTRAINTS", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "STALE" })).toThrow(/CURRENTNESS_STATUS_MISMATCH/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-wrong-rev", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "GEOHAZARD_LIMITATIONS", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: "rev-wrong", handoffStatus: "COMPLETE" })).toThrow(/COUNTERPART_REVISION_MISMATCH/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, { ...actor, actorId: "AI_assistant" }, { ...shared, handoffId: "handoff-ai", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "EXCAVATION_CONSTRAINTS", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, { ...actor, authority: "ADMIN" }, { ...shared, handoffId: "handoff-admin", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "SLOPE_CRITERIA", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-transfer", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "PILE_OR_FOUNDATION_GEOTECHNICAL_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", transferAuthority: true })).toThrow(/AUTHORITY_TRANSFER_REJECTED/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-reason", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "SETTLEMENT_CONTEXT", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", reasonAcrossDisciplines: true })).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-detect", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "GEOHAZARD_CONTEXT", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "INCOMPLETE", detectConflict: true })).toThrow(/CONFLICT_DETECTION_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-resolve", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "GEOHAZARD_CONTEXT", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "INCOMPLETE", resolveConflict: true })).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-validate", counterpartDiscipline: "structural", direction: "COUNTERPART_TO_D3", interfaceTopic: "STRUCTURAL_REACTIONS", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", validateCounterpart: true })).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-calc", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "ALLOWABLE_OR_CHARACTERISTIC_PARAMETER_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", recalculate: true })).toThrow(/RECALCULATION_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-redesign", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "EXCAVATION_CONSTRAINTS", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", redesign: true })).toThrow(/REDESIGN_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1-mutate", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "GROUNDWATER", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", mutateD1: true })).toThrow(/D1_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d2-mutate", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "EARTHWORKS_MATERIAL_SUITABILITY", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", mutateD2: true })).toThrow(/D2_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d3-mutate", counterpartDiscipline: "civil", direction: "D3_TO_COUNTERPART", interfaceTopic: "PAVEMENT_SUBGRADE_PARAMETERS", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", mutateD3: true })).toThrow(/D3_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-approve", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "GROUNDWATER", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", approve: true })).toThrow(/APPROVAL_NOT_IN_R8/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-cross", counterpartDiscipline: "civil", direction: "COUNTERPART_TO_D3", interfaceTopic: "GRADING", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "INCOMPLETE", projectId: "project-b" })).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-spoof", counterpartDiscipline: "civil", direction: "COUNTERPART_TO_D3", interfaceTopic: "DRAINAGE_CONTEXT", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "INCOMPLETE", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordGeotechnicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-dup", counterpartDiscipline: "structural", direction: "D3_TO_COUNTERPART", interfaceTopic: "SETTLEMENT_CRITERIA", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", limitations: "Revised handoff still does not design the structure", provenanceRef: "prov-handoff-b" })).toThrow(/DUPLICATE_HANDOFF_REJECTED/);
    expect(() => reasonAcrossGeotechnicalDisciplines()).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(() => detectGeotechnicalInterfaceConflict()).toThrow(/CONFLICT_DETECTION_NOT_IN_R8/);
    expect(() => resolveGeotechnicalInterfaceConflict()).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R8/);
    expect(() => validateGeotechnicalCounterpart()).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    expect(() => repointGeotechnicalHandoff()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateGeotechnicalInterface()).toThrow(/INTERFACE_MUTATION_REJECTED/);
    expect(() => { (toStructural as { limitations: string }).limitations = "silent"; }).toThrow();
    expect(toStructural.limitations).toBe("This handoff does not design or validate the receiving discipline");
    expect(foundation.fingerprint).toBe(foundationFingerprint);
    expect(structural.fingerprint).toBe(structuralFingerprint);
    expect(civilSite.fingerprint).toBe(civilFingerprint);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED");
    expect(sourceText).toContain("D2_R8_HANDOFF_STATUSES");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "discipline-interfaces-handoffs.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
