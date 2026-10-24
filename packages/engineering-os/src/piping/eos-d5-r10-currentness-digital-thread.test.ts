import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext, recordPipingValveContext } from "./component-connection-valve-context";
import {
  ADMIN_CAN_SILENTLY_REPOINT_D5_HISTORY,
  AI_CAN_INFER_AUTHORITATIVE_D5_LINEAGE,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D5_DIGITAL_THREAD_ACCESS_ALLOWED,
  CURRENT_D5_RECORD_EQUALS_VALIDATED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_CANONICAL_FINGERPRINT_INTEGRATED,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED,
  D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DIGITAL_THREAD_REFERENCE_AUTO_REPOINTED,
  D5_EXPLICIT_LINEAGE_SUPPORTED,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_HISTORICAL_LINEAGE_AUTO_REPOINTED,
  D5_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED,
  D5_INFERRED_LINEAGE_ALLOWED,
  D5_INTERFACE_COUNTERPART_AUTO_REPOINTED,
  D5_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_R10_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D5_R10_AUTO_MUTATES_R3_SPECIFICATION,
  D5_R10_AUTO_MUTATES_R4_COMPONENT_CONTEXT,
  D5_R10_AUTO_MUTATES_R5_ROUTING_CONTEXT,
  D5_R10_AUTO_MUTATES_R6_EVIDENCE,
  D5_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D5_R10_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D5_R10_AUTO_MUTATES_R9_VALIDATION_STATE,
  D5_R10_BLOCKER,
  D5_R10_CANONICAL_NEXT_PHASE,
  D5_R10_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R10_EXPLICIT_RELATIONSHIP_REQUIRED_FOR_PROPAGATION,
  D5_R10_HISTORY_PRESERVED,
  D5_R10_INFERRED_PROPAGATION_ALLOWED,
  D5_R10_MATURITY,
  D5_R10_NEXT_PHASE_TYPE,
  D5_R10_PROVENANCE_PRESERVED,
  D5_R10_PROVENANCE_REQUIRED,
  D5_R10_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R10_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R10_STATUS,
  D5_R10_THREAD_DEPTH_REUSED,
  D5_R11_STARTED,
  D5_R1_R9_DIGITAL_THREAD_TRACEABLE,
  D5_R1_R9_EXACT_SOURCE_REVISIONS_REUSED,
  D5_R1_R9_THREAD_FINGERPRINT_TRACEABLE,
  D5_R3_DESIGN_SPECIFICATION_CURRENTNESS_INTEGRATED,
  D5_R4_COMPONENT_CONNECTION_CURRENTNESS_INTEGRATED,
  D5_R5_ROUTING_FABRICATION_CURRENTNESS_INTEGRATED,
  D5_R6_EVIDENCE_CURRENTNESS_INTEGRATED,
  D5_R7_CHANGE_CURRENTNESS_INTEGRATED,
  D5_R7_REASSESSMENT_CURRENTNESS_INTEGRATED,
  D5_R8_INTERFACE_CURRENTNESS_INTEGRATED,
  D5_R9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_R9_REVIEW_CURRENTNESS_INTEGRATED,
  D5_R9_RUNTIME_COUNT,
  D5_R9_VALIDATION_CURRENTNESS_INTEGRATED,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_SUPERSESSION_CURRENTNESS_INTEGRATED,
  D5_SUPERSESSION_HISTORY_PRESERVED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_DIGITAL_THREAD_REVISION_REQUIRED,
  FLOATING_D5_DIGITAL_THREAD_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  NEW_SOURCE_CONDITION_AUTO_REPLACES_ADOPTED_D5_CONDITION,
  NEW_SPECIFICATION_REVISION_AUTO_ADOPTED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_DIGITAL_THREAD_CREATED,
  PRIOR_D5_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D5_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_UNCHANGED_CURRENT_ENGINEERING,
  REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R10_MUTATION_ALLOWED,
  STALE_D5_HANDOFF_EXPOSED_AS_CURRENT,
  STALE_D5_RECORD_EQUALS_INVALID,
  STALE_D5_REVISION_EXPOSED_AS_CURRENT,
  STALE_D5_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D5_RECORD_EQUALS_INVALID,
  SUPERSEDED_D5_REVISION_DELETED,
  SUPERSEDED_D5_REVISION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D5_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_NDE_EVIDENCE_EXPOSED_AS_CURRENT,
  SUPERSEDED_STRESS_EVIDENCE_EXPOSED_AS_CURRENT,
  SUPERSEDED_TEST_EVIDENCE_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D5_R10_SCOPE_ENFORCED,
  adoptSpecificationRevisionFromCurrentness,
  createD5R10Store,
  exposedPipingCurrentness,
  inferPipingLineage,
  mutateChangeFromCurrentness,
  mutateComponentFromCurrentness,
  mutateConditionFromCurrentness,
  mutateEvidenceFromCurrentness,
  mutateHandoffFromCurrentness,
  mutateRouteFromCurrentness,
  mutateSpecificationFromCurrentness,
  mutateValidationFromCurrentness,
  reasonAcrossPipingCurrentness,
  recalculateFromPipingCurrentness,
  recordPipingCurrentness,
  recordPipingLineage,
  recordPipingSupersession,
  redesignFromPipingCurrentness,
  replaceAdoptedConditionFromCurrentness,
  repointPipingDigitalThread,
  tracePipingDigitalThread,
  transferPipingReviewFromCurrentness,
  transferPipingValidationFromCurrentness,
  validateFromPipingCurrentness,
  type D5R10Pin,
} from "./currentness-digital-thread";
import { createD5R3Store, recordPipingDesignCondition, recordPipingSpecificationContext } from "./design-condition-specification-context";
import { createD5R8Store, recordPipingInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import { createD5R7Store, recordPipingChange, recordPipingGovernedRequirement, recordPipingReassessment } from "./requirements-assumptions-change";
import { D5_R10_STARTED, D5_RUNTIME_COUNT as R9_COUNT, createD5R9Store, recordPipingReviewCompletion, recordPipingReviewFinding, recordPipingReviewRequest, recordPipingValidationState, type D5R9Actor } from "./review-validation-governance";
import { createD5R5Store, recordPipingIsometricContext, recordPipingRoutingContext, recordPipingSpoolContext, recordPipingWeldJointContext } from "./routing-arrangement-fabrication-context";
import { createD5R6Store, recordPipingNdeContext, recordPipingPressureLeakTestContext, recordPipingStressFlexibilityEvidence, recordPipingSupportRestraintContext } from "./stress-support-test-evidence-context";
import { createD5R2Store, recordPipingLineContext, recordPipingServiceFunction, recordPipingSystemContext } from "./system-line-service-context";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D5R1Actor = { actorId: "piping-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D5_CONTEXT_AUTHORITY };
const recorder: D5R9Actor = { ...actor, actorKind: "human" };
const reviewer: D5R9Actor = { actorId: "piping-reviewer", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "REVIEWER", actorKind: "human", aal: "aal2" };

function throws(run: () => unknown): string {
  try {
    run();
    return "NO_THROW";
  } catch (error) {
    return error instanceof Error ? error.message : "UNKNOWN";
  }
}

function pin(kind: D5R10Pin["subjectKind"], id: string, revision: string, fingerprint: string): D5R10Pin {
  return { subjectKind: kind, subjectId: id, subjectRevision: revision, subjectFingerprint: fingerprint, contextId: "ctx-1" };
}

describe("EOS-D5-R10 currentness and digital thread", () => {
  it("traces exact Piping revisions without inferring lineage or rewriting engineering", () => {
    expect(D5_R10_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D5_R10_MATURITY).toBe(D5_R10_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(10);
    expect(D5_R9_RUNTIME_COUNT).toBe(9);
    expect(R9_COUNT).toBe(9);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_R10_STARTED).toBe(false);
    expect(D5_R11_STARTED).toBe(false);
    expect(D5_R9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(0);
    expect(D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(1);
    expect(D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D5_R1_R9_EXACT_SOURCE_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D5_DIGITAL_THREAD_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D5_DIGITAL_THREAD_REFERENCE_ALLOWED).toBe(false);
    expect(D5_DIGITAL_THREAD_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D5_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_EXPLICIT_LINEAGE_SUPPORTED).toBe(true);
    expect(D5_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D5_R1_R9_DIGITAL_THREAD_TRACEABLE).toBe(true);
    expect(D5_SUPERSESSION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(SUPERSEDED_D5_REVISION_EXPOSED_AS_CURRENT).toBe(false);
    expect(STALE_D5_REVISION_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D5_REVISION_DELETED).toBe(false);
    expect(D5_SUPERSESSION_HISTORY_PRESERVED).toBe(true);
    expect(D5_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED).toBe(false);
    expect(D5_HISTORICAL_LINEAGE_AUTO_REPOINTED).toBe(false);
    expect(D5_R7_CHANGE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D5_R7_REASSESSMENT_CURRENTNESS_INTEGRATED).toBe(true);
    expect(REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_UNCHANGED_CURRENT_ENGINEERING).toBe(false);
    expect(D5_R9_REVIEW_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D5_R9_VALIDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(PRIOR_D5_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_D5_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(STALE_D5_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D5_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(D5_R8_INTERFACE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D5_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D5_INTERFACE_COUNTERPART_AUTO_REPOINTED).toBe(false);
    expect(STALE_D5_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(D5_R6_EVIDENCE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(SUPERSEDED_STRESS_EVIDENCE_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_NDE_EVIDENCE_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_TEST_EVIDENCE_EXPOSED_AS_CURRENT).toBe(false);
    expect(D5_R5_ROUTING_FABRICATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D5_R4_COMPONENT_CONNECTION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D5_R3_DESIGN_SPECIFICATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(NEW_SOURCE_CONDITION_AUTO_REPLACES_ADOPTED_D5_CONDITION).toBe(false);
    expect(NEW_SPECIFICATION_REVISION_AUTO_ADOPTED).toBe(false);
    expect(CURRENT_D5_RECORD_EQUALS_VALIDATED).toBe(false);
    expect(STALE_D5_RECORD_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_D5_RECORD_EQUALS_INVALID).toBe(false);
    expect(D5_CANONICAL_FINGERPRINT_INTEGRATED).toBe(true);
    expect(D5_R1_R9_THREAD_FINGERPRINT_TRACEABLE).toBe(true);
    expect(D5_R10_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R10_PROVENANCE_PRESERVED).toBe(true);
    expect(D5_R10_HISTORY_PRESERVED).toBe(true);
    expect(SILENT_D5_R10_MUTATION_ALLOWED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D5_R10_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D5_DIGITAL_THREAD_ACCESS_ALLOWED).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R3_SPECIFICATION).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R4_COMPONENT_CONTEXT).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R5_ROUTING_CONTEXT).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R6_EVIDENCE).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R8_INTERFACE_HANDOFF).toBe(false);
    expect(D5_R10_AUTO_MUTATES_R9_VALIDATION_STATE).toBe(false);
    expect(D5_R10_EXPLICIT_RELATIONSHIP_REQUIRED_FOR_PROPAGATION).toBe(true);
    expect(D5_R10_INFERRED_PROPAGATION_ALLOWED).toBe(false);
    expect(D5_PIPE_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D5_GEOMETRY_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT).toBe(0);
    expect(D5_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D5_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INFER_AUTHORITATIVE_D5_LINEAGE).toBe(false);
    expect(ADMIN_CAN_SILENTLY_REPOINT_D5_HISTORY).toBe(false);
    expect(D5_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R10_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R10_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R10_THREAD_DEPTH_REUSED).toBe(4);
    expect(D5_R10_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R11-D9-SOURCE-CONTRACT");
    expect(D5_R10_NEXT_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");
    expect(D5_R10_BLOCKER).toBe("NONE");
    expect(D5_R10_CANONICAL_NEXT_PHASE_SCOPE).toContain("D9 runtime must remain 0");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    const context = recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const successorLine = recordPipingObjectIdentity(r1, actor, { objectId: "line-2", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line-2" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const valveIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "valve-1", contextId: "ctx-1", objectType: "PIPING_VALVE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-valve" });
    const routeIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "route-1", contextId: "ctx-1", objectType: "PIPING_ROUTE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-route" });
    const fabricationIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "fab-1", contextId: "ctx-1", objectType: "PIPING_FABRICATION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-fab" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const stressIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "stress-1", contextId: "ctx-1", objectType: "PIPING_STRESS_FLEXIBILITY_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-stress" });
    const supportIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "support-1", contextId: "ctx-1", objectType: "PIPING_SUPPORT_REQUIREMENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-support" });
    const testIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "test-1", contextId: "ctx-1", objectType: "PIPING_TEST_INSPECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-test" });
    const r2 = createD5R2Store(r1);
    const r2Bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-a", citedCurrentness: "CURRENT" };
    const systemContext = recordPipingSystemContext(r2, actor, { ...r2Bound, objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-ctx", systemName: "Cooling water", systemDescription: "Utility", systemClassification: "UTILITY_PIPING_SYSTEM", systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10" });
    const lineContext = recordPipingLineContext(r2, actor, { ...r2Bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ctx", lineTag: "CW-100", lineDescription: "Supply", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10" });
    const service = recordPipingServiceFunction(r2, actor, { ...r2Bound, objectId: serviceIdentity.objectId, objectRevisionFingerprint: serviceIdentity.fingerprint, serviceRecordId: "svc-ctx", serviceFunction: "SUPPLY", serviceDescription: "Supplies cooling water", applicableScope: "unit-10" });
    const r3 = createD5R3Store(r1, r2);
    const specCommon = {
      contextId: "ctx-1", objectId: line.objectId, objectRevisionFingerprint: line.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      serviceRecordId: service.serviceRecordId, serviceContextFingerprint: service.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r3",
      sourceBasisRef: "project-basis-cw", sourceBasisCategory: "PIPING_DESIGN_BASIS",
      applicabilityRef: line.objectId, limitations: "Unit 10 cooling water only",
    };
    const condition = recordPipingDesignCondition(r3, actor, { ...specCommon, conditionId: "cond-1", adoption: "EXPLICIT", designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" } });
    const specification = recordPipingSpecificationContext(r3, actor, {
      ...specCommon, specificationId: "spec-1", specificationRef: "CW-CLASS-A", pipingClass: "A1", materialFamily: "CARBON_STEEL",
      pressureRatingContext: "Class 150 reference", flangeRatingContext: "ASME B16.5 class 150 reference", wallScheduleContext: "Schedule 40 reference",
      codeStandardRef: "ASME B31.3 reference", assignmentBasis: "EXPLICIT",
    });
    const r4 = createD5R4Store(r1, r2, r3);
    const componentBase = {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", limitations: "Supplied item only", identityBasis: "EXPLICIT",
    };
    const component = recordPipingComponentContext(r4, actor, { ...componentBase, objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint, applicabilityRef: flange.objectId, componentRecordId: "comp-flange", componentClassification: "FLANGE" });
    const connection = recordPipingConnectionContext(r4, actor, {
      ...componentBase, objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint, applicabilityRef: connectionIdentity.objectId,
      connectionRecordId: "conn-1", connectionKind: "LINE_TO_COMPONENT", connectionBasis: "EXPLICIT", fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: line.objectId, toRevisionFingerprint: line.fingerprint,
    });
    const valve = recordPipingValveContext(r4, actor, {
      ...componentBase, objectId: valveIdentity.objectId, objectRevisionFingerprint: valveIdentity.fingerprint, applicabilityRef: valveIdentity.objectId,
      valveRecordId: "valve-rec-1", valveTag: "HV-100", valveType: "GATE", actuationContext: "manual supplied", failPosition: "as-supplied closed", size: { value: "6", unit: "in" }, ratingContext: "Class 150 supplied",
    });
    const r5 = createD5R5Store(r4);
    const r5Base = {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r5", sourceBasisRef: "iso-basis", sourceBasisCategory: "APPROVED_ISOMETRIC",
      limitations: "Supplied route context only", identityBasis: "EXPLICIT", relationshipBasis: "EXPLICIT",
    };
    const route = recordPipingRoutingContext(r5, actor, {
      ...r5Base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-1", routeSegment: "CW-100 rack A", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "rack A",
    });
    const isometric = recordPipingIsometricContext(r5, actor, { ...r5Base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId, isometricRecordId: "iso-1", documentId: "ISO-CW-100", documentRevision: "A" });
    const spool = recordPipingSpoolContext(r5, actor, { ...r5Base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId, spoolRecordId: "spool-1", spoolTag: "SP-100" });
    const weld = recordPipingWeldJointContext(r5, actor, { ...r5Base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId, weldRecordId: "weld-1", jointType: "BUTT" });
    const r6 = createD5R6Store(r5);
    const evidenceBase = {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6", limitations: "Supplied evidence only", identityBasis: "EXPLICIT",
    };
    const stress = recordPipingStressFlexibilityEvidence(r6, actor, {
      ...evidenceBase, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      sourceBasisRef: "caesar-report-1", sourceBasisCategory: "EXTERNAL_ANALYSIS", evidenceRecordId: "stress-ev-1", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-1",
      toolIdentity: "CAESAR II", modelRevision: "model-a", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-01", assumptions: "supplied restraint set",
      stressResult: { value: "120", unit: "MPa" }, displacementResult: { value: "8", unit: "mm" }, allowableReference: "supplied allowable reference",
    });
    const support = recordPipingSupportRestraintContext(r6, actor, {
      ...evidenceBase, objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      sourceBasisRef: "support-note-1", sourceBasisCategory: "PROJECT_PIPING_DATA", supportRecordId: "sup-1", supportFunction: "GUIDE", supportLocation: "rack A bay 3 supplied", loadReference: { value: "4.2", unit: "kN" },
    });
    const nde = recordPipingNdeContext(r6, actor, {
      ...evidenceBase, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisRef: "nde-report-1", sourceBasisCategory: "NDE_EVIDENCE", ndeRecordId: "nde-1", ndeMethod: "RT", extent: "10 percent supplied",
      observedStatus: "report status as supplied", evidenceRevision: "nde-rev-a", weldRecordId: weld.weldRecordId, weldRevisionFingerprint: weld.fingerprint,
    });
    const test = recordPipingPressureLeakTestContext(r6, actor, {
      ...evidenceBase, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisRef: "test-cert-a", sourceBasisCategory: "TEST_EVIDENCE", testRecordId: "test-rec-1", testKind: "HYDROTEST", testReference: "TP-100",
      observedStatus: "gauge reading as supplied", evidenceRef: "test-cert-a", testPressure: { value: "15", unit: "bar" },
    });
    const r7 = createD5R7Store(r6);
    const subject = {
      contextId: "ctx-1", objectId: support.objectId, objectRevisionFingerprint: support.objectRevisionFingerprint, lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint, componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint, routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      r6SubjectKind: "SUPPORT" as const, r6SubjectId: support.supportRecordId, r6RevisionFingerprint: support.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT" as const,
      applicabilityRef: support.objectId, limitations: "CW-100 guide at bay 3 only", provenanceRef: "prov-r7", identityBasis: "EXPLICIT",
    };
    const requirement = recordPipingGovernedRequirement(r7, actor, {
      ...subject, requirementId: "req-support-1", statement: "Adopt a guide requirement at bay 3 for CW-100", requirementCategory: "DESIGN_CRITERIA", sourceBasis: "PROJECT_PIPING_DATA",
      sourceRef: "support-note-1", sourceRevision: "rev-a", adoptionRationale: "Piping recorder adopts the supplied guide note for this line revision only",
    });
    const change = recordPipingChange(r7, actor, {
      ...subject, changeId: "chg-reassess-1", changeCategory: "REASSESSMENT_REQUIRED", originRef: "change-note-9", reason: "Support note requires reassessment for this exact revision",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_SUPPORT", targetId: support.supportRecordId, targetFingerprint: support.fingerprint }],
    });
    const reassessment = recordPipingReassessment(r7, actor, { ...subject, reassessmentId: "ras-1", changeId: change.changeId, targetId: support.supportRecordId, targetFingerprint: support.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const r8 = createD5R8Store(r7);
    const handoff = recordPipingInterfaceHandoff(r8, actor, {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: "ctx-1", objectId: support.objectId, objectRevisionFingerprint: support.objectRevisionFingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint, conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint, connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint, r6SubjectKind: "SUPPORT", r6SubjectId: support.supportRecordId, r6RevisionFingerprint: support.fingerprint,
      r7SubjectKind: "REQUIREMENT", r7SubjectId: requirement.requirementId, r7RevisionFingerprint: requirement.fingerprint, counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "SUPPORT_OR_RESTRAINT_REQUIREMENT", handoffStatus: "AWAITING_COUNTERPART", citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicabilityRef: support.objectId,
      limitations: "Handoff cites the Piping support requirement and does not design the structure", provenanceRef: "prov-handoff", identityBasis: "EXPLICIT", handoffId: "handoff-d1",
    });
    const reviewStore = createD5R9Store(r8);
    const chain = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: "ctx-1", objectId: support.objectId, objectRevisionFingerprint: support.objectRevisionFingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint, conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint, componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint, routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      r6SubjectKind: "SUPPORT", r6SubjectId: support.supportRecordId, r6RevisionFingerprint: support.fingerprint, r7SubjectKind: "CHANGE", r7SubjectId: change.changeId, r7RevisionFingerprint: change.fingerprint,
      r8HandoffId: handoff.handoffId, r8RevisionFingerprint: handoff.fingerprint, subjectKind: "EVIDENCE", subjectId: support.supportRecordId, subjectRevision: support.provenanceRef, subjectFingerprint: support.fingerprint,
      applicability: "support-1", limitations: "This exact support revision only", provenanceRef: "prov-review", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT" as const,
    };
    const request = recordPipingReviewRequest(reviewStore, recorder, { ...chain, reviewRequestId: "review-1", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "CW-100 guide at bay 3", requestedReviewerAuthority: "REVIEWER" });
    const finding = recordPipingReviewFinding(reviewStore, reviewer, { ...chain, findingId: "finding-1", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Guide note is recorded and not a structural design", disposition: "OPEN" });
    const completion = recordPipingReviewCompletion(reviewStore, reviewer, { ...chain, completionId: "complete-1", reviewRequestId: request.reviewRequestId });
    const validation = recordPipingValidationState(reviewStore, reviewer, { ...chain, validationId: "val-1", reviewRequestId: request.reviewRequestId, validationScope: "support-1 only", validationState: "VALIDATED", basis: [{ kind: "R6_EVIDENCE", id: support.supportRecordId, fingerprint: support.fingerprint }] });
    const thread = createD5R10Store(reviewStore);
    const upstream = JSON.stringify({
      condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint, valve: valve.fingerprint, connection: connection.fingerprint,
      route: route.fingerprint, isometric: isometric.fingerprint, spool: spool.fingerprint, weld: weld.fingerprint, stress: stress.fingerprint, support: support.fingerprint,
      nde: nde.fingerprint, test: test.fingerprint, change: change.fingerprint, reassessment: reassessment.fingerprint, handoff: handoff.fingerprint, handoffValidated: handoff.engineeringValidated,
      request: request.fingerprint, validation: validation.fingerprint, validationValidated: validation.engineeringValidated, line: line.fingerprint,
    });
    const nodes = [
      pin("CONTEXT", context.contextId, context.provenanceRef, context.fingerprint),
      pin("OBJECT", system.objectId, system.provenanceRef, system.fingerprint),
      pin("SYSTEM", systemContext.systemRecordId, systemContext.provenanceRef, systemContext.fingerprint),
      pin("LINE", lineContext.lineRecordId, lineContext.provenanceRef, lineContext.fingerprint),
      pin("SERVICE", service.serviceRecordId, service.provenanceRef, service.fingerprint),
      pin("CONDITION", condition.conditionId, condition.provenanceRef, condition.fingerprint),
      pin("SPECIFICATION", specification.specificationId, specification.provenanceRef, specification.fingerprint),
      pin("COMPONENT", component.componentRecordId, component.provenanceRef, component.fingerprint),
      pin("CONNECTION", connection.connectionRecordId, connection.provenanceRef, connection.fingerprint),
      pin("VALVE", valve.valveRecordId, valve.provenanceRef, valve.fingerprint),
      pin("ROUTE", route.routeRecordId, route.provenanceRef, route.fingerprint),
      pin("ISOMETRIC", isometric.isometricRecordId, isometric.provenanceRef, isometric.fingerprint),
      pin("SPOOL", spool.spoolRecordId, spool.provenanceRef, spool.fingerprint),
      pin("WELD", weld.weldRecordId, weld.provenanceRef, weld.fingerprint),
      pin("STRESS", stress.evidenceRecordId, stress.provenanceRef, stress.fingerprint),
      pin("NDE", nde.ndeRecordId, nde.provenanceRef, nde.fingerprint),
      pin("TEST", test.testRecordId, test.provenanceRef, test.fingerprint),
      pin("SUPPORT", support.supportRecordId, support.provenanceRef, support.fingerprint),
      pin("REQUIREMENT", requirement.requirementId, requirement.provenanceRef, requirement.fingerprint),
      pin("CHANGE", change.changeId, change.provenanceRef, change.fingerprint),
      pin("REASSESSMENT", reassessment.reassessmentId, reassessment.provenanceRef, reassessment.fingerprint),
      pin("HANDOFF", handoff.handoffId, handoff.provenanceRef, handoff.fingerprint),
      pin("REVIEW_REQUEST", request.reviewRequestId, request.subjectRevision, request.fingerprint),
      pin("FINDING", finding.findingId, finding.subjectRevision, finding.fingerprint),
      pin("COMPLETION", completion.completionId, completion.subjectRevision, completion.fingerprint),
      pin("VALIDATION", validation.validationId, validation.subjectRevision, validation.fingerprint),
    ];
    nodes.slice(0, -1).forEach((source, index) => {
      const target = nodes[index + 1];
      if (!source || !target) return;
      recordPipingLineage(thread, actor, {
        lineageId: `edge-${index + 1}`, contextId: "ctx-1", source, target, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: `prov-edge-${index + 1}`,
      });
    });
    const traced = tracePipingDigitalThread(thread, actor, { contextId: "ctx-1", subject: nodes[0]!, citedCurrentness: "CURRENT" });
    expect(traced.nodes.length).toBe(1 + D5_R10_THREAD_DEPTH_REUSED);
    expect(traced.currentness).toBe("CURRENT");
    expect(traced.edges.every((edge) => edge.engineeringValidated === false)).toBe(true);
    const kinds = new Set(thread.lineage.flatMap((edge) => [edge.source.subjectKind, edge.target.subjectKind]));
    const requiredKinds = ["CONTEXT", "OBJECT", "SYSTEM", "LINE", "SERVICE", "CONDITION", "SPECIFICATION", "COMPONENT", "CONNECTION", "VALVE", "ROUTE", "ISOMETRIC", "SPOOL", "WELD", "STRESS", "SUPPORT", "NDE", "TEST", "REQUIREMENT", "CHANGE", "REASSESSMENT", "HANDOFF", "REVIEW_REQUEST", "FINDING", "COMPLETION", "VALIDATION"] as const;
    for (const kind of requiredKinds) {
      expect(kinds.has(kind)).toBe(true);
    }
    const supportPin = nodes.find((row) => row.subjectKind === "SUPPORT") as D5R10Pin;
    const requirementPin = nodes.find((row) => row.subjectKind === "REQUIREMENT") as D5R10Pin;
    const dependency = recordPipingLineage(thread, actor, {
      lineageId: "edge-reassess", contextId: "ctx-1", source: supportPin, target: requirementPin, relationshipType: "DEPENDS_ON", pipingDependency: "R7_REQUIREMENT", citedCurrentness: "CURRENT", provenanceRef: "prov-edge-reassess",
    });
    expect(dependency.engineeringValidated).toBe(false);
    expect(recordPipingLineage(thread, actor, { lineageId: "edge-reassess", contextId: "ctx-1", source: supportPin, target: requirementPin, relationshipType: "DEPENDS_ON", pipingDependency: "R7_REQUIREMENT", citedCurrentness: "CURRENT", provenanceRef: "prov-edge-reassess" })).toBe(dependency);
    const marked = recordPipingCurrentness(thread, actor, { eventId: "mark-support", contextId: "ctx-1", subject: supportPin, currentness: "REASSESSMENT_REQUIRED", propagate: true, provenanceRef: "prov-mark-support" });
    expect(marked[0]?.engineeringValidated).toBe(false);
    expect(marked[0]?.engineeringInvalid).toBe(false);
    expect(exposedPipingCurrentness(thread, supportPin)).toBe("REASSESSMENT_REQUIRED");
    expect(exposedPipingCurrentness(thread, requirementPin)).toBe("REASSESSMENT_REQUIRED");
    expect(requirement.engineeringValidated).toBe(false);
    expect(reassessment.engineeringValidated).toBe(false);
    expect(change.recalculated).toBe(false);
    expect(change.redesigned).toBe(false);
    const linePin = pin("OBJECT", line.objectId, line.provenanceRef, line.fingerprint);
    const successorPin = pin("OBJECT", successorLine.objectId, successorLine.provenanceRef, successorLine.fingerprint);
    recordPipingLineage(thread, actor, {
      lineageId: "edge-line-object", contextId: "ctx-1", source: pin("OBJECT", system.objectId, system.provenanceRef, system.fingerprint), target: linePin, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-edge-line",
    });
    const lineEdgeBefore = thread.lineage.find((edge) => edge.target.subjectId === line.objectId)?.target.subjectFingerprint;
    const superseded = recordPipingSupersession(thread, actor, { supersessionId: "super-line", contextId: "ctx-1", predecessor: linePin, successor: successorPin, citedCurrentness: "CURRENT", provenanceRef: "prov-super-line" });
    expect(superseded.deleted).toBe(false);
    expect(superseded.historicalEdgesRewritten).toBe(false);
    expect(exposedPipingCurrentness(thread, linePin)).toBe("SUPERSEDED");
    expect(exposedPipingCurrentness(thread, successorPin)).toBe("CURRENT");
    expect(r1.objects.find((row) => row.objectId === "line-1")?.fingerprint).toBe(line.fingerprint);
    expect(r1.objects.find((row) => row.objectId === "line-1")).toBeDefined();
    expect(thread.lineage.find((edge) => edge.target.subjectId === line.objectId)?.target.subjectFingerprint).toBe(lineEdgeBefore);
    expect(reviewStore.validations.some((row) => row.subjectId === successorLine.objectId)).toBe(false);
    const stressPin = nodes.find((row) => row.subjectKind === "STRESS") as D5R10Pin;
    const ndePin = nodes.find((row) => row.subjectKind === "NDE") as D5R10Pin;
    const testPin = nodes.find((row) => row.subjectKind === "TEST") as D5R10Pin;
    const handoffPin = nodes.find((row) => row.subjectKind === "HANDOFF") as D5R10Pin;
    const validationPin = nodes.find((row) => row.subjectKind === "VALIDATION") as D5R10Pin;
    recordPipingCurrentness(thread, actor, { eventId: "mark-stress", contextId: "ctx-1", subject: stressPin, currentness: "SUPERSEDED", provenanceRef: "prov-mark-stress" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-nde", contextId: "ctx-1", subject: ndePin, currentness: "SUPERSEDED", provenanceRef: "prov-mark-nde" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-test", contextId: "ctx-1", subject: testPin, currentness: "SUPERSEDED", provenanceRef: "prov-mark-test" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-handoff", contextId: "ctx-1", subject: handoffPin, currentness: "STALE", provenanceRef: "prov-mark-handoff" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-validation", contextId: "ctx-1", subject: validationPin, currentness: "STALE", provenanceRef: "prov-mark-validation" });
    expect(exposedPipingCurrentness(thread, stressPin)).toBe("SUPERSEDED");
    expect(exposedPipingCurrentness(thread, ndePin)).toBe("SUPERSEDED");
    expect(exposedPipingCurrentness(thread, testPin)).toBe("SUPERSEDED");
    expect(exposedPipingCurrentness(thread, handoffPin)).toBe("STALE");
    expect(exposedPipingCurrentness(thread, validationPin)).toBe("STALE");
    expect(validation.engineeringValidated).toBe(true);
    expect(validation.currentness).toBe("CURRENT");
    expect(handoff.engineeringValidated).toBe(false);
    expect(handoff.counterpart).toBeNull();
    expect(completion.reviewCompleted).toBe(true);
    expect(completion.engineeringValidated).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    expect(JSON.stringify({
      condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint, valve: valve.fingerprint, connection: connection.fingerprint,
      route: route.fingerprint, isometric: isometric.fingerprint, spool: spool.fingerprint, weld: weld.fingerprint, stress: stress.fingerprint, support: support.fingerprint,
      nde: nde.fingerprint, test: test.fingerprint, change: change.fingerprint, reassessment: reassessment.fingerprint, handoff: handoff.fingerprint, handoffValidated: handoff.engineeringValidated,
      request: request.fingerprint, validation: validation.fingerprint, validationValidated: validation.engineeringValidated, line: line.fingerprint,
    })).toBe(upstream);
    expect(throws(() => recordPipingLineage(thread, actor, { lineageId: "edge-dup", contextId: "ctx-1", source: supportPin, target: requirementPin, relationshipType: "DEPENDS_ON", pipingDependency: "R7_REQUIREMENT", citedCurrentness: "STALE", provenanceRef: "prov-dup" }))).toBe("D5_R10_DUPLICATE_LINEAGE_REJECTED");
    expect(throws(() => recordPipingLineage(thread, actor, { lineageId: "edge-float", contextId: "ctx-1", source: { ...supportPin, subjectRevision: "latest" }, target: requirementPin, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "STALE", provenanceRef: "prov-float" }))).toBe("D5_R10_SUBJECT_REVISION_REQUIRED");
    expect(throws(() => recordPipingLineage(thread, actor, { lineageId: "edge-infer", contextId: "ctx-1", source: stressPin, target: ndePin, relationshipType: "matching_tag", citedCurrentness: "STALE", provenanceRef: "prov-infer" }))).toBe("D5_R10_INFERRED_LINEAGE_REJECTED");
    expect(throws(() => recordPipingLineage(thread, actor, { infer: true, lineageId: "edge-flag", contextId: "ctx-1", source: stressPin, target: testPin, relationshipType: "BASED_ON", citedCurrentness: "STALE", provenanceRef: "prov-flag" }))).toBe("D5_R10_INFERRED_LINEAGE_REJECTED");
    expect(throws(() => recordPipingLineage(thread, actor, { lineageId: "edge-spoof", contextId: "ctx-1", source: stressPin, target: testPin, relationshipType: "BASED_ON", citedCurrentness: "STALE", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" }))).toBe("D5_R10_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingLineage(thread, { ...actor, actorId: "AI_agent" }, { lineageId: "edge-ai", contextId: "ctx-1", source: stressPin, target: testPin, relationshipType: "BASED_ON", citedCurrentness: "STALE", provenanceRef: "prov-ai" }))).toBe("D5_R10_AI_CANNOT_INFER_LINEAGE");
    expect(throws(() => recordPipingLineage(thread, { ...actor, actorId: "admin-user", authority: "ADMIN" }, { lineageId: "edge-admin", contextId: "ctx-1", source: stressPin, target: testPin, relationshipType: "BASED_ON", citedCurrentness: "STALE", provenanceRef: "prov-admin" }))).toBe("D5_R10_ADMIN_CANNOT_REPOINT");
    expect(throws(() => recordPipingLineage(thread, actor, { tenantId: "tenant-b", lineageId: "edge-scope", contextId: "ctx-1", source: stressPin, target: testPin, relationshipType: "BASED_ON", citedCurrentness: "STALE", provenanceRef: "prov-scope" }))).toBe("D5_R10_CROSS_TENANT_OPERATION");
    expect(throws(() => recordPipingCurrentness(thread, actor, { eventId: "mark-promote", contextId: "ctx-1", subject: validationPin, currentness: "CURRENT", provenanceRef: "prov-promote" }))).toBe("D5_R10_SUBJECT_NOT_CURRENT");
    expect(throws(() => recordPipingSupersession(thread, actor, { supersessionId: "super-again", contextId: "ctx-1", predecessor: linePin, successor: successorPin, citedCurrentness: "CURRENT", provenanceRef: "prov-super-again" }))).toBe("D5_R10_FALSE_SUPERSESSION_REJECTED");
    expect(throws(() => tracePipingDigitalThread(thread, actor, { contextId: "ctx-1", subject: validationPin, citedCurrentness: "CURRENT" }))).toBe("D5_R10_SUBJECT_NOT_CURRENT");
    expect(throws(() => recordPipingLineage(thread, actor, { transferValidation: true, lineageId: "edge-transfer", contextId: "ctx-1", source: validationPin, target: successorPin, relationshipType: "REVIEWS", citedCurrentness: "STALE", provenanceRef: "prov-transfer" }))).toBe("D5_R10_VALIDATION_TRANSFER_REJECTED");
    expect(throws(() => recordPipingCurrentness(thread, actor, { mutateR3: true, eventId: "mark-r3", contextId: "ctx-1", subject: nodes[5]!, currentness: "STALE", provenanceRef: "prov-r3" }))).toBe("D5_R10_R3_MUTATION_REJECTED");
    expect(throws(() => recordPipingCurrentness(thread, actor, { mutateR9: true, eventId: "mark-r9", contextId: "ctx-1", subject: validationPin, currentness: "STALE", provenanceRef: "prov-r9" }))).toBe("D5_R10_R9_MUTATION_REJECTED");
    expect(throws(() => repointPipingDigitalThread())).toBe("D5_R10_AUTO_REPOINT_REJECTED");
    expect(throws(() => inferPipingLineage())).toBe("D5_R10_INFERRED_LINEAGE_REJECTED");
    expect(throws(() => replaceAdoptedConditionFromCurrentness())).toBe("D5_R10_CONDITION_AUTO_REPLACEMENT_REJECTED");
    expect(throws(() => adoptSpecificationRevisionFromCurrentness())).toBe("D5_R10_SPECIFICATION_AUTO_ADOPTION_REJECTED");
    expect(throws(() => transferPipingReviewFromCurrentness())).toBe("D5_R10_REVIEW_TRANSFER_REJECTED");
    expect(throws(() => transferPipingValidationFromCurrentness())).toBe("D5_R10_VALIDATION_TRANSFER_REJECTED");
    expect(throws(() => mutateConditionFromCurrentness())).toBe("D5_R10_R3_MUTATION_REJECTED");
    expect(throws(() => mutateSpecificationFromCurrentness())).toBe("D5_R10_R3_MUTATION_REJECTED");
    expect(throws(() => mutateComponentFromCurrentness())).toBe("D5_R10_R4_MUTATION_REJECTED");
    expect(throws(() => mutateRouteFromCurrentness())).toBe("D5_R10_R5_MUTATION_REJECTED");
    expect(throws(() => mutateEvidenceFromCurrentness())).toBe("D5_R10_R6_MUTATION_REJECTED");
    expect(throws(() => mutateChangeFromCurrentness())).toBe("D5_R10_R7_MUTATION_REJECTED");
    expect(throws(() => mutateHandoffFromCurrentness())).toBe("D5_R10_R8_MUTATION_REJECTED");
    expect(throws(() => mutateValidationFromCurrentness())).toBe("D5_R10_R9_MUTATION_REJECTED");
    expect(throws(() => recalculateFromPipingCurrentness())).toBe("D5_R10_RECALCULATION_NOT_IN_R10");
    expect(throws(() => redesignFromPipingCurrentness())).toBe("D5_R10_REDESIGN_NOT_IN_R10");
    expect(throws(() => validateFromPipingCurrentness())).toBe("D5_R10_VALIDATION_NOT_IN_R10");
    expect(throws(() => reasonAcrossPipingCurrentness())).toBe("D5_R10_CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toContain("THREAD_DEFAULT_MAX_DEPTH");
    expect(sourceText).toContain("relationSemantics");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).not.toContain("createHash");
    expect(scanAnalysisFormulaBypass("currentness-digital-thread.ts", sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(packageJson.dependencies.zod).toBeTruthy();
    expect(packageJson.dependencies["@rtb/piping-solver"]).toBeUndefined();
  });
});
