import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT as ARCHITECTURE_INTERFACE_COUNT,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD8R5Store } from "./control-system-architecture-context";
import {
  ADMIN_CAN_PROMOTE_D8_HANDOFF_TO_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D8_COUNTERPART_RELATIONSHIP,
  AI_CAN_INVENT_D8_HANDOFF_RELATIONSHIP,
  AI_CAN_PROMOTE_HANDOFF_TO_COUNTERPART_VALIDATION,
  AI_CAN_TRANSFER_ENGINEERING_AUTHORITY_THROUGH_HANDOFF,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  COUNTERPART_HANDOFF_TRANSFERS_ENGINEERING_AUTHORITY_TO_D8,
  COUNTERPART_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  COUNTERPART_VALIDATION_EQUALS_D8_ENGINEERING_VALIDATED,
  CROSS_TENANT_D8_R8_ACCESS_ALLOWED,
  CURRENT_D8_HANDOFF_EQUALS_COUNTERPART_VALIDATED,
  D4_MECHANICAL_CONTEXT_EQUALS_D8_IAC_DESIGN,
  D5_PIPING_CONTEXT_EQUALS_D8_IAC_DESIGN,
  D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D1_INTERFACE_CONTEXT_SUPPORTED,
  D8_D2_INTERFACE_CONTEXT_SUPPORTED,
  D8_D3_INTERFACE_CONTEXT_SUPPORTED,
  D8_D4_INTERFACE_CONTEXT_SUPPORTED,
  D8_D5_INTERFACE_CONTEXT_SUPPORTED,
  D8_D6_HANDOFF_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT,
  D8_D6_HANDOFF_IMPLEMENTED,
  D8_D7_HANDOFF_COMPATIBLE_WITH_EXISTING_D7_R8_CONTRACT,
  D8_D7_HANDOFF_IMPLEMENTED,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_COUNTERPART_REQUIRED,
  D8_EXPLICIT_INTERFACE_DEPENDENCY_REQUIRED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED,
  D8_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_CONFORMANT,
  D8_HANDOFF_COMPLETED_EQUALS_COUNTERPART_VALIDATED,
  D8_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH,
  D8_HANDOFF_CURRENTNESS_INTEGRATED,
  D8_HANDOFF_RECORD_IMPLEMENTED,
  D8_HANDOFF_REASSESSMENT_COMPLETED_EQUALS_COUNTERPART_VALIDATED,
  D8_HANDOFF_REASSESSMENT_REQUIRED_EQUALS_COUNTERPART_INVALID,
  D8_HANDOFF_TRANSFERS_ENGINEERING_AUTHORITY,
  D8_HANDOFF_VALIDATION_EQUALS_COUNTERPART_ENGINEERING_VALIDATED,
  D8_IAC_CONTEXT_EQUALS_D4_MECHANICAL_DESIGN,
  D8_INFERRED_COUNTERPART_ALLOWED,
  D8_INFERRED_INTERFACE_DEPENDENCY_ALLOWED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_CONTEXT_EQUALS_VALIDATED_D5_PIPING_DESIGN,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_R1_R7_EXACT_REVISIONS_REUSED,
  D8_R7_RUNTIME_COUNT,
  D8_R8_APPLICABILITY_EXPLICIT,
  D8_R8_AUTO_MUTATES_D1_STRUCTURAL,
  D8_R8_AUTO_MUTATES_D2_CIVIL,
  D8_R8_AUTO_MUTATES_D3_GEOTECHNICAL,
  D8_R8_AUTO_MUTATES_D4_MECHANICAL,
  D8_R8_AUTO_MUTATES_D5_PIPING,
  D8_R8_AUTO_MUTATES_D6_PROCESS,
  D8_R8_AUTO_MUTATES_D7_ELECTRICAL,
  D8_R8_AUTO_MUTATES_R1_IDENTITY,
  D8_R8_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R8_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT,
  D8_R8_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT,
  D8_R8_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT,
  D8_R8_AUTO_MUTATES_R6_SAFETY_CONTEXT,
  D8_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D8_R8_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D8_R8_CANONICAL_NEXT_PHASE,
  D8_R8_COUNTERPART_REFERENCE_AUTO_REPOINTED,
  D8_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R8_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_R8_HISTORY_PRESERVED,
  D8_R8_LIMITATIONS_EXPLICIT,
  D8_R8_NEXT_PHASE_TYPE,
  D8_R8_PROVENANCE_PRESERVED,
  D8_R8_PROVENANCE_REQUIRED,
  D8_R8_R7_CHANGE_INTEGRATION_IMPLEMENTED,
  D8_R8_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED,
  D8_R8_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R8_SOURCE_AUTO_REPOINTED,
  D8_R8_SOURCE_BASIS_REQUIRED,
  D8_R8_SOURCE_BASIS_TRACEABLE,
  D8_R8_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R8_STATUS,
  D8_R9_STARTED,
  D8_REQUIREMENT_EQUALS_COUNTERPART_ADOPTED_REQUIREMENT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_DISCIPLINE_INTERFACE_GOVERNANCE,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_VALIDATION_STATE_EQUALS_COUNTERPART_VALIDATION_STATE,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_COUNTERPART_REVISION_REQUIRED,
  EXACT_D4_MECHANICAL_COUNTERPART_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D5_PIPING_COUNTERPART_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_PROCESS_COUNTERPART_REVISION_REQUIRED,
  EXACT_D7_ELECTRICAL_COUNTERPART_REVISION_REQUIRED,
  EXACT_D8_R8_SOURCE_REVISION_REQUIRED,
  FLOATING_D8_R8_SOURCE_REFERENCE_ALLOWED,
  HANDOFF_AUTO_ADOPTS_REQUIREMENT,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  PARALLEL_D8_INTERFACE_ENGINE_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D8_R8_MUTATION_ALLOWED,
  STALE_D8_HANDOFF_EQUALS_INVALID,
  SUPERSEDED_D8_HANDOFF_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D8_R8_SCOPE_ENFORCED,
  adoptRequirementFromHandoff,
  createD8R8Store,
  inferIacCounterpart,
  propagateIacChangeToCounterpart,
  recordIacInterfaceHandoff,
  transferIacAuthorityThroughHandoff,
  validateCounterpartFromHandoff,
} from "./discipline-interfaces-handoffs";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import { createD8R3Store } from "./instrument-device-context";
import { createD8R2Store } from "./process-measurement-tag-context";
import { createD8R7Store, recordIacChange, recordIacSourceRequirement } from "./requirements-assumptions-change";
import { createD8R6Store } from "./safety-interlock-shutdown-context";
import { createD8R4Store } from "./signal-io-control-loop-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R8 discipline interfaces and handoffs", () => {
  it("records exact-revision handoffs without transferring counterpart truth", () => {
    expect(D8_R1_R7_EXACT_REVISIONS_REUSED && EXACT_D8_R8_SOURCE_REVISION_REQUIRED && EXACT_COUNTERPART_REVISION_REQUIRED && EXACT_D6_PROCESS_COUNTERPART_REVISION_REQUIRED && EXACT_D7_ELECTRICAL_COUNTERPART_REVISION_REQUIRED && EXACT_D4_MECHANICAL_COUNTERPART_REVISION_REQUIRED_WHEN_REFERENCED && EXACT_D5_PIPING_COUNTERPART_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(FLOATING_D8_R8_SOURCE_REFERENCE_ALLOWED || D8_R8_SOURCE_AUTO_REPOINTED || D8_INFERRED_COUNTERPART_ALLOWED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(8);
    expect(D8_R7_RUNTIME_COUNT).toBe(7);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_INTERFACE_COUNT).toBe(0);
    expect(D8_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED && D8_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY && D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY && D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY && D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY && D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D8_REUSES_CANONICAL_DISCIPLINE_INTERFACE_GOVERNANCE && D8_EXPLICIT_COUNTERPART_REQUIRED && D8_HANDOFF_RECORD_IMPLEMENTED && D8_D6_HANDOFF_IMPLEMENTED && D8_D6_HANDOFF_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT && D8_D7_HANDOFF_IMPLEMENTED && D8_D7_HANDOFF_COMPATIBLE_WITH_EXISTING_D7_R8_CONTRACT).toBe(true);
    expect(PARALLEL_D8_INTERFACE_ENGINE_CREATED).toBe(false);
    expect(D8_D4_INTERFACE_CONTEXT_SUPPORTED && D8_D5_INTERFACE_CONTEXT_SUPPORTED && D8_D1_INTERFACE_CONTEXT_SUPPORTED && D8_D2_INTERFACE_CONTEXT_SUPPORTED && D8_D3_INTERFACE_CONTEXT_SUPPORTED).toBe(true);
    expect(D8_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH || D8_HANDOFF_COMPLETED_EQUALS_COUNTERPART_VALIDATED || D8_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED || D8_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_CONFORMANT).toBe(false);
    expect(D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN || D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM || D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION).toBe(false);
    expect(D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN || D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION || D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION).toBe(false);
    expect(D4_MECHANICAL_CONTEXT_EQUALS_D8_IAC_DESIGN || D8_IAC_CONTEXT_EQUALS_D4_MECHANICAL_DESIGN || D5_PIPING_CONTEXT_EQUALS_D8_IAC_DESIGN || D8_INSTRUMENT_CONTEXT_EQUALS_VALIDATED_D5_PIPING_DESIGN).toBe(false);
    expect(D8_REQUIREMENT_EQUALS_COUNTERPART_ADOPTED_REQUIREMENT || COUNTERPART_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT || HANDOFF_AUTO_ADOPTS_REQUIREMENT).toBe(false);
    expect(D8_VALIDATION_STATE_EQUALS_COUNTERPART_VALIDATION_STATE || D8_HANDOFF_VALIDATION_EQUALS_COUNTERPART_ENGINEERING_VALIDATED || COUNTERPART_VALIDATION_EQUALS_D8_ENGINEERING_VALIDATED || D8_HANDOFF_TRANSFERS_ENGINEERING_AUTHORITY || COUNTERPART_HANDOFF_TRANSFERS_ENGINEERING_AUTHORITY_TO_D8).toBe(false);
    expect(D8_EQUALS_D1_STRUCTURAL_AUTHORITY || D8_EQUALS_D2_CIVIL_AUTHORITY || D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D8_EQUALS_D4_MECHANICAL_AUTHORITY || D8_EQUALS_D5_PIPING_AUTHORITY || D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(D8_R8_AUTO_MUTATES_D1_STRUCTURAL || D8_R8_AUTO_MUTATES_D2_CIVIL || D8_R8_AUTO_MUTATES_D3_GEOTECHNICAL || D8_R8_AUTO_MUTATES_D4_MECHANICAL || D8_R8_AUTO_MUTATES_D5_PIPING || D8_R8_AUTO_MUTATES_D6_PROCESS || D8_R8_AUTO_MUTATES_D7_ELECTRICAL).toBe(false);
    expect(D8_R8_AUTO_MUTATES_R1_IDENTITY || D8_R8_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT || D8_R8_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT || D8_R8_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT || D8_R8_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT || D8_R8_AUTO_MUTATES_R6_SAFETY_CONTEXT || D8_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE).toBe(false);
    expect(D8_R8_R7_CHANGE_INTEGRATION_IMPLEMENTED && D8_R8_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED && D8_EXPLICIT_INTERFACE_DEPENDENCY_REQUIRED && D8_HANDOFF_CURRENTNESS_INTEGRATED && D8_EXPLICIT_LINEAGE_REQUIRED && D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(D8_HANDOFF_REASSESSMENT_REQUIRED_EQUALS_COUNTERPART_INVALID || D8_HANDOFF_REASSESSMENT_COMPLETED_EQUALS_COUNTERPART_VALIDATED || D8_INFERRED_INTERFACE_DEPENDENCY_ALLOWED || CURRENT_D8_HANDOFF_EQUALS_COUNTERPART_VALIDATED || STALE_D8_HANDOFF_EQUALS_INVALID || SUPERSEDED_D8_HANDOFF_EQUALS_INVALID || D8_R8_HISTORICAL_REFERENCE_AUTO_REPOINTED || D8_R8_COUNTERPART_REFERENCE_AUTO_REPOINTED || PARALLEL_D8_CURRENTNESS_ENGINE_CREATED || PARALLEL_D8_DIGITAL_THREAD_CREATED || SECOND_D8_FINGERPRINT_ALGORITHM_CREATED || D8_INFERRED_LINEAGE_ALLOWED || SILENT_D8_R8_MUTATION_ALLOWED).toBe(false);
    expect(D8_R8_SOURCE_BASIS_REQUIRED && D8_R8_SOURCE_BASIS_TRACEABLE && D8_R8_APPLICABILITY_EXPLICIT && D8_R8_LIMITATIONS_EXPLICIT && D8_R8_PROVENANCE_REQUIRED && D8_R8_PROVENANCE_PRESERVED && D8_R8_HISTORY_PRESERVED && TENANT_WORKSPACE_PROJECT_D8_R8_SCOPE_ENFORCED && D8_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R8_REPLAY_PROTECTION_IMPLEMENTED && D8_R8_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D8_R8_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY || CROSS_TENANT_D8_R8_ACCESS_ALLOWED || AI_CAN_INVENT_D8_COUNTERPART_RELATIONSHIP || AI_CAN_INVENT_D8_HANDOFF_RELATIONSHIP || AI_CAN_PROMOTE_HANDOFF_TO_COUNTERPART_VALIDATION || AI_CAN_TRANSFER_ENGINEERING_AUTHORITY_THROUGH_HANDOFF || ADMIN_CAN_PROMOTE_D8_HANDOFF_TO_ENGINEERING_TRUTH || D9_RUNTIME_STARTED || D8_R9_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect([D8_INSTRUMENT_SIZING_RUNTIME_COUNT, D8_INSTRUMENT_SELECTION_RUNTIME_COUNT, D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT, D8_ACTUATOR_SIZING_RUNTIME_COUNT, D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT, D8_SIL_CALCULATION_RUNTIME_COUNT, D8_SIL_VERIFICATION_RUNTIME_COUNT, D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT, D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT, D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT, D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D8_APPROVAL_RUNTIME_COUNT, D8_CERTIFICATION_RUNTIME_COUNT, D8_REVIEW_VALIDATION_RUNTIME_COUNT, D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D8_D9_RUNTIME_INTEGRATION_COUNT, D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual(Array(25).fill(0));
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R8_STATUS).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED");
    expect(D8_R8_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R9-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D8_R8_NEXT_PHASE_TYPE).toBe("REVIEW_AND_VALIDATION_GOVERNANCE");

    const r1 = createD8R1Store();
    const who = actor();
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const face = recordIacObjectIdentity(r1, who, { objectId: "ifc-101", contextId: "ctx-1", objectType: "IAC_INTERFACE", ...identity("ifc-101") });
    const r7 = createD8R7Store(createD8R6Store(createD8R5Store(createD8R4Store(createD8R3Store(createD8R2Store(r1))))));
    const governed = { contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-ifc", sourceBasisRef: "basis-ifc", applicability: "ifc-101 handoff scope", limitations: "handoff is not counterpart design" };
    const source = recordIacSourceRequirement(r7, who, { ...governed, requirementId: "req-ifc-1", statement: "Preserve the supplied process measurement requirement as a source", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D8_GOVERNED_CONTEXT", sourceRef: "d8-interface-note-1", sourceRevision: "rev-ifc-1" });
    const counterparts = [
      { discipline: "process" as const, counterpartId: "d6-meas-1", sourceRevision: "rev-d6-1", fingerprint: "fp-d6-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
      { discipline: "electrical" as const, counterpartId: "d7-power-1", sourceRevision: "rev-d7-1", fingerprint: "fp-d7-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
      { discipline: "mechanical" as const, counterpartId: "d4-pkg-1", sourceRevision: "rev-d4-1", fingerprint: "fp-d4-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
      { discipline: "piping" as const, counterpartId: "d5-inline-1", sourceRevision: "rev-d5-1", fingerprint: "fp-d5-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
      { discipline: "structural" as const, counterpartId: "d1-mount-1", sourceRevision: "rev-d1-1", fingerprint: "fp-d1-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
      { discipline: "civil" as const, counterpartId: "d2-duct-1", sourceRevision: "rev-d2-1", fingerprint: "fp-d2-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
      { discipline: "geotechnical" as const, counterpartId: "d3-site-1", sourceRevision: "rev-d3-1", fingerprint: "fp-d3-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const },
    ];
    const before = JSON.stringify({ objects: r1.objects, counterparts, requirements: r7.requirements });
    const store = createD8R8Store(r7, counterparts);
    const dependency = [{ targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint }];
    const base = { ...governed, direction: "D8_TO_COUNTERPART", suppliedContent: "supplied interface content", dependencies: dependency, handoffStatus: "COMPLETE" };
    const process = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d6", counterpartDiscipline: "process", interfaceTopic: "PROCESS_MEASUREMENT_REQUIREMENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", requirementId: source.requirementId, requirementFingerprint: source.fingerprint, dependencies: [...dependency, { targetKind: "R7_REQUIREMENT", targetId: source.requirementId, targetFingerprint: source.fingerprint }] });
    const electrical = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d7", counterpartDiscipline: "electrical", interfaceTopic: "INSTRUMENT_AND_CONTROL_POWER_SUPPLY", counterpartId: "d7-power-1", counterpartRevision: "rev-d7-1", counterpartFingerprint: "fp-d7-1" });
    const mechanical = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d4", counterpartDiscipline: "mechanical", interfaceTopic: "INSTRUMENTATION_INTERFACE_POINTS", counterpartId: "d4-pkg-1", counterpartRevision: "rev-d4-1", counterpartFingerprint: "fp-d4-1" });
    const piping = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d5", counterpartDiscipline: "piping", interfaceTopic: "INLINE_INSTRUMENT", counterpartId: "d5-inline-1", counterpartRevision: "rev-d5-1", counterpartFingerprint: "fp-d5-1" });
    const structural = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d1", counterpartDiscipline: "structural", interfaceTopic: "INSTRUMENT_SUPPORT_OR_MOUNTING_CONTEXT", counterpartId: "d1-mount-1", counterpartRevision: "rev-d1-1", counterpartFingerprint: "fp-d1-1" });
    const civil = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d2", counterpartDiscipline: "civil", interfaceTopic: "INSTRUMENT_TRENCH_OR_DUCT_CONTEXT", counterpartId: "d2-duct-1", counterpartRevision: "rev-d2-1", counterpartFingerprint: "fp-d2-1" });
    const geotech = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d3", counterpartDiscipline: "geotechnical", interfaceTopic: "SITE_INSTALLATION_GEOTECHNICAL_SOURCE", counterpartId: "d3-site-1", counterpartRevision: "rev-d3-1", counterpartFingerprint: "fp-d3-1" });
    const change = recordIacChange(r7, who, { ...governed, changeId: "chg-ifc-1", changeCategory: "REQUIREMENT_CHANGED", reason: "Supplied interface source text was revised", priorRevisionFingerprint: face.fingerprint, currentRevisionFingerprint: face.fingerprint, dependencies: dependency });
    const reassessed = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d6-r2", predecessorHandoffId: process.handoffId, counterpartDiscipline: "process", interfaceTopic: "PROCESS_MEASUREMENT_REQUIREMENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", handoffStatus: "REASSESSMENT_REQUIRED", citedCurrentness: "REASSESSMENT_REQUIRED", changeId: change.changeId, changeFingerprint: change.fingerprint, limitations: "reassessment does not validate the process counterpart" });

    expect(process.counterpartTruth || process.counterpartValidated || process.counterpartApproved || process.counterpartConformant || process.authorityTransferred || process.engineeringValidated || process.requirementAdopted).toBe(false);
    expect(process.handoffAccepted).toBe(true);
    expect(process.counterpart.fingerprint).toBe("fp-d6-1");
    expect(process.objectRevisionFingerprint).toBe(face.fingerprint);
    expect(electrical.counterpartDiscipline).toBe("electrical");
    expect(mechanical.counterpartTruth || piping.counterpartValidated || structural.authorityTransferred || civil.engineeringValidated || geotech.counterpartApproved).toBe(false);
    expect(source.adopted).toBe(false);
    expect(store.handoffs.find((row) => row.handoffId === process.handoffId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.handoffs.find((row) => row.handoffId === process.handoffId)?.counterpart.fingerprint).toBe("fp-d6-1");
    expect(store.handoffs.find((row) => row.handoffId === process.handoffId)?.objectRevisionFingerprint).toBe(face.fingerprint);
    expect(reassessed.handoffStatus).toBe("REASSESSMENT_REQUIRED");
    expect(reassessed.counterpartInvalid).toBe(false);
    expect(reassessed.counterpartValidated).toBe(false);
    expect(reassessed.counterpart.fingerprint).toBe(process.counterpart.fingerprint);
    expect(reassessed.changeId).toBe(change.changeId);
    expect(r7.changes).toHaveLength(1);
    expect(r7.changes[0].fingerprint).toBe(change.fingerprint);
    expect(JSON.stringify({ objects: r1.objects, counterparts, requirements: r7.requirements })).toBe(before);
    const replay = recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-d7", counterpartDiscipline: "electrical", interfaceTopic: "INSTRUMENT_AND_CONTROL_POWER_SUPPLY", counterpartId: "d7-power-1", counterpartRevision: "rev-d7-1", counterpartFingerprint: "fp-d7-1" });
    expect(replay.fingerprint).toBe(electrical.fingerprint);

    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-dup", counterpartDiscipline: "electrical", interfaceTopic: "INSTRUMENT_AND_CONTROL_POWER_SUPPLY", counterpartId: "d7-power-1", counterpartRevision: "rev-d7-1", counterpartFingerprint: "fp-d7-1" })).toThrow(/DUPLICATE_HANDOFF_REJECTED/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-float", counterpartDiscipline: "process", interfaceTopic: "PROCESS_CONTROL_INTENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-infer", counterpartDiscipline: "process", interfaceTopic: "PROCESS_CONTROL_INTENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", inference: "tag_name" })).toThrow(/INFERRED_COUNTERPART_REJECTED/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-wrong", counterpartDiscipline: "process", interfaceTopic: "PROCESS_CONTROL_INTENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-spoof" })).toThrow(/COUNTERPART_REVISION_MISMATCH/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-topic", counterpartDiscipline: "process", interfaceTopic: "NOT_A_PROCESS_SUBJECT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1" })).toThrow(/INTERFACE_TOPIC_INVALID/);
    expect(() => recordIacInterfaceHandoff(store, actor({ actorId: "AI-recorder", authority: "AI" }), { ...base, handoffId: "hof-ai", counterpartDiscipline: "civil", interfaceTopic: "CONTROL_BUILDING_OR_SITE_INTERFACE", counterpartId: "d2-duct-1", counterpartRevision: "rev-d2-1", counterpartFingerprint: "fp-d2-1" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacInterfaceHandoff(store, actor({ authority: "ADMIN" }), { ...base, handoffId: "hof-admin", counterpartDiscipline: "civil", interfaceTopic: "CONTROL_BUILDING_OR_SITE_INTERFACE", counterpartId: "d2-duct-1", counterpartRevision: "rev-d2-1", counterpartFingerprint: "fp-d2-1" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => recordIacInterfaceHandoff(store, actor({ tenantId: "tenant-b" }), { ...base, handoffId: "hof-cross", counterpartDiscipline: "process", interfaceTopic: "PROCESS_CONTROL_INTENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1" })).toThrow(/CROSS_TENANT_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-adopt", counterpartDiscipline: "process", interfaceTopic: "PROCESS_CONTROL_INTENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", autoAdopt: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-auth", counterpartDiscipline: "electrical", interfaceTopic: "UPS_OR_DC_SUPPLY_CONTEXT", counterpartId: "d7-power-1", counterpartRevision: "rev-d7-1", counterpartFingerprint: "fp-d7-1", transferAuthority: true })).toThrow(/AUTHORITY_TRANSFER_REJECTED/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-prop", counterpartDiscipline: "mechanical", interfaceTopic: "PACKAGE_CONTROL_INTERFACES", counterpartId: "d4-pkg-1", counterpartRevision: "rev-d4-1", counterpartFingerprint: "fp-d4-1", propagateChange: true })).toThrow(/CHANGE_PROPAGATION_REJECTED/);
    expect(() => recordIacInterfaceHandoff(store, who, { ...base, handoffId: "hof-empty", counterpartDiscipline: "piping", interfaceTopic: "CONTROL_VALVE_OR_INSTRUMENT_CONNECTION", counterpartId: "d5-inline-1", counterpartRevision: "rev-d5-1", counterpartFingerprint: "fp-d5-1", dependencies: [] })).toThrow(/EXPLICIT_DEPENDENCY_REQUIRED/);
    expect(() => inferIacCounterpart()).toThrow(/INFERRED_COUNTERPART_REJECTED/);
    expect(() => transferIacAuthorityThroughHandoff()).toThrow(/AUTHORITY_TRANSFER_REJECTED/);
    expect(() => adoptRequirementFromHandoff()).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => validateCounterpartFromHandoff()).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    expect(() => propagateIacChangeToCounterpart()).toThrow(/CHANGE_PROPAGATION_REJECTED/);
    expect(store.counterparts.map((row) => row.fingerprint)).toEqual(["fp-d6-1", "fp-d7-1", "fp-d4-1", "fp-d5-1", "fp-d1-1", "fp-d2-1", "fp-d3-1"]);
    expect(r1.objects[0].fingerprint).toBe(face.fingerprint);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/assertInterfaceType/);
    expect(sourceText).toMatch(/assertInterfaceDirectionality/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "discipline-interfaces-handoffs.ts"), sourceText)).toEqual([]);
    const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
