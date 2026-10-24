import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_D9_SOURCE_CONTRACT_FIELDS, D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCHITECTURE_SOURCE_COUNT, D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext, recordPipingValveContext } from "./component-connection-valve-context";
import { D5_R11_STARTED, D5_RUNTIME_COUNT as R10_RUNTIME_COUNT, createD5R10Store, recordPipingCurrentness, recordPipingLineage, recordPipingSupersession, type D5R10Pin } from "./currentness-digital-thread";
import { createD5R3Store, recordPipingDesignCondition, recordPipingSpecificationContext } from "./design-condition-specification-context";
import { createD5R8Store, recordPipingInterfaceHandoff } from "./discipline-interfaces-handoffs";
import {
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  CROSS_TENANT_D5_D9_SOURCE_ACCESS_ALLOWED,
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
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_D9_CONTRACT_AUTO_REPOINTS_HISTORY,
  D5_D9_CONTRACT_CREATES_D9_ENGINEERING_AUTHORITY,
  D5_D9_CONTRACT_EXPOSES_AUTHORITY_METADATA,
  D5_D9_CONTRACT_FABRICATES_MISSING_COUNTERPART,
  D5_D9_SOURCE_CONTRACT_GENERATES_ENGINEERING_DECISION,
  D5_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION,
  D5_D9_SOURCE_CONTRACT_GENERATES_NEW_REQUIREMENT,
  D5_D9_CONTRACT_INFERS_COUNTERPART,
  D5_D9_CONTRACT_INFERS_LINEAGE,
  D5_D9_CONTRACT_PRESERVES_APPLICABILITY,
  D5_D9_CONTRACT_PRESERVES_LIMITATIONS,
  D5_D9_CONTRACT_PRESERVES_PROVENANCE,
  D5_D9_CONTRACT_PRESERVES_SOURCE_AUTHORITY,
  D5_D9_CONTRACT_PROMOTES_ASSUMPTION_TO_FACT,
  D5_D9_CONTRACT_PROMOTES_SOURCE_REQUIREMENT_TO_ADOPTED_REQUIREMENT,
  D5_D9_CONTRACT_REINTERPRETS_EXTERNAL_EVIDENCE,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D5_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED,
  D5_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D5_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY,
  D5_D9_SOURCE_DOMAINS_EXPOSED,
  D5_D9_SOURCE_REFERENCE_AUTO_REPOINTED,
  D5_EXPLICIT_LINEAGE_EXPOSED_TO_D9,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_INFERRED_LINEAGE_ALLOWED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_R10_CURRENTNESS_REUSED,
  D5_R10_DIGITAL_THREAD_REUSED,
  D5_R10_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_R10_FINGERPRINT_REUSED,
  D5_R10_RUNTIME_COUNT,
  D5_R11_BLOCKER,
  D5_R11_CANONICAL_NEXT_PHASE,
  D5_R11_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R11_HIDDEN_CALCULATION_ALLOWED,
  D5_R11_HISTORY_PRESERVED,
  D5_R11_MATURITY,
  D5_R11_NEXT_PHASE_TYPE,
  D5_R11_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R11_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R11_STATUS,
  D5_R12_STARTED,
  D5_R1_R10_EXACT_SOURCE_REVISIONS_REUSED,
  D5_R8_INTERFACE_STATE_EXPOSED_TO_D9,
  D5_R9_REVIEW_STATE_EXPOSED_TO_D9,
  D5_R9_VALIDATION_STATE_EXPOSED_TO_D9,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_D9_SOURCE_CONTRACT_PATTERN,
  D5_REUSES_CANONICAL_DIGITAL_THREAD,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_D9_SOURCE_REVISION_REQUIRED,
  EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION,
  FLOATING_D5_D9_SOURCE_REFERENCE_ALLOWED,
  NDE_RESULT_EQUALS_CODE_CONFORMANCE,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_D9_CONTRACT_FRAMEWORK_CREATED,
  PARALLEL_D5_DIGITAL_THREAD_CREATED,
  REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED_TO_D9,
  REVIEWED_EQUALS_VALIDATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R11_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT,
  STALE_D5_RECORD_EXPOSED_AS_CURRENT_TO_D9,
  STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN,
  SUPERSEDED_D5_RECORD_EXPOSED_AS_CURRENT_TO_D9,
  TENANT_WORKSPACE_PROJECT_D5_R11_SCOPE_ENFORCED,
  TEST_RESULT_EQUALS_CODE_CONFORMANCE,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  calculateFromPipingSource,
  createD5R11Store,
  derivePipingSourceFact,
  fabricatePipingCounterpart,
  inferPipingSourceLineage,
  recordPipingSourceContract,
  reinterpretPipingEvidenceFromSource,
  repointPipingSourceContract,
  startD9FromPipingSource,
  transferPipingAuthorityFromSource,
} from "./d9-source-contract";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import { createD5R7Store, recordPipingAssumption, recordPipingChange, recordPipingEngineeringDecision, recordPipingGovernedRequirement, recordPipingReassessment, recordPipingSourceRequirement } from "./requirements-assumptions-change";
import { createD5R9Store, recordPipingReviewCompletion, recordPipingReviewFinding, recordPipingReviewRequest, recordPipingValidationState, type D5R9Actor } from "./review-validation-governance";
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

type Exposed = { subjectId: string; currentness: string; engineeringValidated: boolean; limitations: string; applicability: string; conformant: boolean; approved: boolean; certified: boolean };

describe("EOS-D5-R11 Piping source contract", () => {
  it("projects exact R1-R10 facts without creating engineering truth or starting D9", () => {
    expect(D5_R11_STATUS).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D5_R11_MATURITY).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(11);
    expect(R10_RUNTIME_COUNT).toBe(10);
    expect(D5_R10_RUNTIME_COUNT).toBe(10);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(D5_R11_STARTED).toBe(false);
    expect(D5_R12_STARTED).toBe(false);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(true);
    expect(ARCHITECTURE_SOURCE_COUNT).toBe(0);
    expect(D5_R10_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D5_R1_R10_EXACT_SOURCE_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D5_D9_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D5_D9_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D5_D9_SOURCE_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D5_REUSES_CANONICAL_D9_SOURCE_CONTRACT_PATTERN).toBe(true);
    expect(PARALLEL_D5_D9_CONTRACT_FRAMEWORK_CREATED).toBe(false);
    expect(D5_D9_SOURCE_DOMAINS_EXPOSED).toBe(true);
    expect(D5_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT).toBe(false);
    expect(D5_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE).toBe(false);
    expect(D5_D9_SOURCE_CONTRACT_GENERATES_NEW_REQUIREMENT).toBe(false);
    expect(D5_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION).toBe(false);
    expect(D5_D9_SOURCE_CONTRACT_GENERATES_ENGINEERING_DECISION).toBe(false);
    expect(D5_R10_CURRENTNESS_REUSED).toBe(true);
    expect(D5_R10_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D5_R10_FINGERPRINT_REUSED).toBe(true);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D5_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D5_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(STALE_D5_RECORD_EXPOSED_AS_CURRENT_TO_D9).toBe(false);
    expect(SUPERSEDED_D5_RECORD_EXPOSED_AS_CURRENT_TO_D9).toBe(false);
    expect(REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED_TO_D9).toBe(false);
    expect(D5_EXPLICIT_LINEAGE_EXPOSED_TO_D9).toBe(true);
    expect(D5_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D5_D9_CONTRACT_INFERS_LINEAGE).toBe(false);
    expect(D5_D9_CONTRACT_AUTO_REPOINTS_HISTORY).toBe(false);
    expect(D5_R9_REVIEW_STATE_EXPOSED_TO_D9).toBe(true);
    expect(D5_R9_VALIDATION_STATE_EXPOSED_TO_D9).toBe(true);
    expect(REVIEWED_EQUALS_VALIDATED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(D5_R8_INTERFACE_STATE_EXPOSED_TO_D9).toBe(true);
    expect(D5_D9_CONTRACT_FABRICATES_MISSING_COUNTERPART).toBe(false);
    expect(D5_D9_CONTRACT_INFERS_COUNTERPART).toBe(false);
    expect(D5_D9_CONTRACT_EXPOSES_AUTHORITY_METADATA).toBe(true);
    expect(D5_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY).toBe(false);
    expect(D5_D9_CONTRACT_CREATES_D9_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(D5_D9_CONTRACT_PRESERVES_APPLICABILITY).toBe(true);
    expect(D5_D9_CONTRACT_PRESERVES_LIMITATIONS).toBe(true);
    expect(D5_D9_CONTRACT_PRESERVES_PROVENANCE).toBe(true);
    expect(D5_D9_CONTRACT_PRESERVES_SOURCE_AUTHORITY).toBe(true);
    expect(D5_D9_CONTRACT_REINTERPRETS_EXTERNAL_EVIDENCE).toBe(false);
    expect(STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN).toBe(false);
    expect(NDE_RESULT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(TEST_RESULT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION).toBe(false);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT).toBe(false);
    expect(ASSUMPTION_EQUALS_VALIDATED_FACT).toBe(false);
    expect(AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION).toBe(false);
    expect(D5_D9_CONTRACT_PROMOTES_ASSUMPTION_TO_FACT).toBe(false);
    expect(D5_D9_CONTRACT_PROMOTES_SOURCE_REQUIREMENT_TO_ADOPTED_REQUIREMENT).toBe(false);
    expect(D5_PIPE_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_GEOMETRY_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D5_R11_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT).toBe(0);
    expect(D5_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D5_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D5_R11_HISTORY_PRESERVED).toBe(true);
    expect(SILENT_D5_R11_MUTATION_ALLOWED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D5_R11_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D5_D9_SOURCE_ACCESS_ALLOWED).toBe(false);
    expect(D5_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R11_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R11_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
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
    expect(D5_R11_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R12-PIPING-BOUNDED-CLOSEOUT");
    expect(D5_R11_NEXT_PHASE_TYPE).toBe("PIPING_BOUNDED_CLOSEOUT");
    expect(D5_R11_CANONICAL_NEXT_PHASE_SCOPE).toContain("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D5_R11_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R12.PIPING_BOUNDED_CLOSEOUT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
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
    const sourceRequirement = recordPipingSourceRequirement(r7, actor, {
      ...subject, requirementId: "req-source-1", statement: "Vendor note remains a source requirement", requirementCategory: "DESIGN_CRITERIA", sourceBasis: "VENDOR_REQUIREMENT", sourceRef: "vendor-note-1", sourceRevision: "rev-a",
    });
    const requirement = recordPipingGovernedRequirement(r7, actor, {
      ...subject, requirementId: "req-support-1", statement: "Adopt a guide requirement at bay 3 for CW-100", requirementCategory: "DESIGN_CRITERIA", sourceBasis: "PROJECT_PIPING_DATA",
      sourceRef: "support-note-1", sourceRevision: "rev-a", adoptionRationale: "Piping recorder adopts the supplied guide note for this line revision only",
    });
    const assumption = recordPipingAssumption(r7, actor, { ...subject, assumptionId: "asm-1", statement: "Bay 3 steel is available for a guide", basis: "site note rev-a", materiality: "medium" });
    const decision = recordPipingEngineeringDecision(r7, actor, {
      ...subject, decisionId: "dec-1", statement: "Record the bay 3 guide as the governed requirement", basis: "adopted requirement req-support-1",
      alternatives: [{ id: "alt-keep", statement: "keep bay 3", is_selected: true }, { id: "alt-move", statement: "move to bay 4", is_selected: false }],
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
    recordPipingReviewFinding(reviewStore, reviewer, { ...chain, findingId: "finding-1", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Guide note is recorded and not a structural design", disposition: "OPEN" });
    const completion = recordPipingReviewCompletion(reviewStore, reviewer, { ...chain, completionId: "complete-1", reviewRequestId: request.reviewRequestId });
    const validation = recordPipingValidationState(reviewStore, reviewer, { ...chain, validationId: "val-1", reviewRequestId: request.reviewRequestId, validationScope: "support-1 only", validationState: "VALIDATED", basis: [{ kind: "R6_EVIDENCE", id: support.supportRecordId, fingerprint: support.fingerprint }] });
    const thread = createD5R10Store(reviewStore);
    const supportPin = pin("SUPPORT", support.supportRecordId, support.provenanceRef, support.fingerprint);
    const requirementPin = pin("REQUIREMENT", requirement.requirementId, requirement.provenanceRef, requirement.fingerprint);
    const validationPin = pin("VALIDATION", validation.validationId, validation.subjectRevision, validation.fingerprint);
    const handoffPin = pin("HANDOFF", handoff.handoffId, handoff.provenanceRef, handoff.fingerprint);
    const stressPin = pin("STRESS", stress.evidenceRecordId, stress.provenanceRef, stress.fingerprint);
    const linePin = pin("OBJECT", line.objectId, line.provenanceRef, line.fingerprint);
    recordPipingLineage(thread, actor, { lineageId: "edge-support", contextId: "ctx-1", source: supportPin, target: requirementPin, relationshipType: "DEPENDS_ON", pipingDependency: "R7_REQUIREMENT", citedCurrentness: "CURRENT", provenanceRef: "prov-edge-support" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-support", contextId: "ctx-1", subject: supportPin, currentness: "REASSESSMENT_REQUIRED", propagate: true, provenanceRef: "prov-mark-support" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-validation", contextId: "ctx-1", subject: validationPin, currentness: "STALE", provenanceRef: "prov-mark-validation" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-handoff", contextId: "ctx-1", subject: handoffPin, currentness: "STALE", provenanceRef: "prov-mark-handoff" });
    recordPipingCurrentness(thread, actor, { eventId: "mark-stress", contextId: "ctx-1", subject: stressPin, currentness: "SUPERSEDED", provenanceRef: "prov-mark-stress" });
    recordPipingSupersession(thread, actor, { supersessionId: "super-line", contextId: "ctx-1", predecessor: linePin, successor: pin("OBJECT", successorLine.objectId, successorLine.provenanceRef, successorLine.fingerprint), citedCurrentness: "CURRENT", provenanceRef: "prov-super-line" });
    const before = JSON.stringify({
      condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint, valve: valve.fingerprint, route: route.fingerprint,
      isometric: isometric.fingerprint, stress: stress.fingerprint, support: support.fingerprint, nde: nde.fingerprint, test: test.fingerprint,
      sourceAdopted: sourceRequirement.adopted, requirementAdopted: requirement.adopted, assumptionFact: assumption.validatedFact, decisionAi: decision.aiRecommendation,
      changeRecalculated: change.recalculated, reassessmentValidated: reassessment.engineeringValidated, handoffCounterpart: handoff.counterpart, handoffValidated: handoff.engineeringValidated,
      requestCompleted: request.reviewCompleted, completionValidated: completion.engineeringValidated, validationState: validation.validationState, validationValidated: validation.engineeringValidated, validationCurrent: validation.currentness, line: line.fingerprint,
    });
    const source = createD5R11Store(thread);
    const issued = recordPipingSourceContract(source, actor, { contractId: "contract-support", contextId: "ctx-1", objectId: supportIdentity.objectId, sourceRevision: supportIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-support" });
    expect(issued.exactRevision).toBe(supportIdentity.provenanceRef);
    expect(issued.currentness).toBe("CURRENT");
    expect(issued.representedAsValidated).toBe(false);
    expect(issued.authority).toBe(D5_CONTEXT_AUTHORITY);
    expect(issued.authorityTransferred).toBe(false);
    expect(issued.d9OwnsPipingAuthority).toBe(false);
    expect(issued.d9Started).toBe(false);
    expect(issued.calculationPerformed).toBe(false);
    expect(issued.inferredLineage).toBe(false);
    expect(issued.counterpartFabricated).toBe(false);
    expect(issued.engineeringDerived).toBe(false);
    expect(issued.conformant).toBe(false);
    expect(issued.engineeringApproved).toBe(false);
    expect(issued.certified).toBe(false);
    for (const key of D5_D9_SOURCE_CONTRACT_FIELDS) expect(issued.fields[key]).toBeDefined();
    expect(issued.fields.FINGERPRINT).toBe(issued.fingerprint);
    expect(issued.fields.AUTHORITY).toBe(D5_CONTEXT_AUTHORITY);
    expect(issued.fields.CURRENTNESS).toBe("CURRENT");
    expect(issued.fields.PROVENANCE).toBe("prov-contract-support");
    const limitations = issued.fields.LIMITATIONS as string[];
    expect(limitations.some((row) => row.includes("does not create engineering facts"))).toBe(true);
    expect(limitations.some((row) => row.includes("CW-100 guide at bay 3 only"))).toBe(true);
    const supports = issued.fields.SUPPORT_OR_RESTRAINT_CONTEXT as Array<Exposed & { structuralValidation: boolean }>;
    expect(supports).toHaveLength(1);
    expect(supports[0]?.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(supports[0]?.engineeringValidated).toBe(false);
    expect(supports[0]?.structuralValidation).toBe(false);
    expect(supports[0]?.applicability).toBe(supportIdentity.objectId);
    const truth = issued.fields.REQUIREMENTS_ASSUMPTIONS_DECISIONS_OR_CHANGE as {
      requirements: Array<Exposed & { adopted: boolean }>;
      assumptions: Array<Exposed & { validatedFact: boolean }>;
      decisions: Array<Exposed & { aiRecommendation: boolean }>;
      changes: Array<Exposed & { recalculated: boolean; redesigned: boolean }>;
      reassessments: Array<Exposed & { state: string }>;
    };
    expect(truth.requirements.find((row) => row.subjectId === "req-source-1")?.adopted).toBe(false);
    expect(truth.requirements.find((row) => row.subjectId === "req-support-1")?.adopted).toBe(true);
    expect(truth.assumptions[0]?.validatedFact).toBe(false);
    expect(truth.decisions[0]?.aiRecommendation).toBe(false);
    expect(truth.changes[0]?.recalculated).toBe(false);
    expect(truth.changes[0]?.redesigned).toBe(false);
    expect(truth.reassessments[0]?.state).toBe("REASSESSMENT_REQUIRED");
    expect(truth.reassessments[0]?.engineeringValidated).toBe(false);
    const handoffs = issued.fields.INTERFACES as Array<Exposed & { counterpart: unknown; complete: boolean; authorityTransferred: boolean }>;
    expect(handoffs[0]?.currentness).toBe("STALE");
    expect(handoffs[0]?.counterpart).toBeNull();
    expect(handoffs[0]?.complete).toBe(false);
    expect(handoffs[0]?.authorityTransferred).toBe(false);
    const review = issued.fields.REVIEW_VALIDATION as { reviews: Array<Exposed & { reviewCompleted: boolean }>; completions: Array<Exposed & { reviewCompleted: boolean }>; validations: Array<Exposed & { validationState: string }> };
    expect(review.reviews[0]?.reviewCompleted).toBe(false);
    expect(review.reviews[0]?.engineeringValidated).toBe(false);
    expect(review.completions[0]?.reviewCompleted).toBe(true);
    expect(review.completions[0]?.engineeringValidated).toBe(false);
    expect(review.validations[0]?.validationState).toBe("VALIDATED");
    expect(review.validations[0]?.currentness).toBe("STALE");
    expect(review.validations[0]?.engineeringValidated).toBe(false);
    expect(review.validations[0]?.conformant).toBe(false);
    expect(review.validations[0]?.approved).toBe(false);
    expect(review.validations[0]?.certified).toBe(false);
    const lineage = issued.fields.LINEAGE as Array<{ inferred: boolean; sourceId: string; targetId: string }>;
    expect(lineage.some((row) => row.sourceId === support.supportRecordId && row.targetId === requirement.requirementId && row.inferred === false)).toBe(true);
    expect(lineage.every((row) => row.inferred === false)).toBe(true);
    expect(recordPipingSourceContract(source, actor, { contractId: "contract-support", contextId: "ctx-1", objectId: supportIdentity.objectId, sourceRevision: supportIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-support" })).toBe(issued);
    expect(source.history).toHaveLength(1);
    const lineContract = recordPipingSourceContract(source, actor, { contractId: "contract-line", contextId: "ctx-1", objectId: line.objectId, sourceRevision: line.provenanceRef, citedCurrentness: "SUPERSEDED", provenanceRef: "prov-contract-line" });
    expect(lineContract.currentness).toBe("SUPERSEDED");
    expect(lineContract.representedAsValidated).toBe(false);
    const conditions = lineContract.fields.DESIGN_CONDITIONS as Array<Exposed & { designPressure: { value: string } }>;
    const specifications = lineContract.fields.SPECIFICATIONS_OR_CLASSES as Array<Exposed & { pipingClass: string; materialFamily: string }>;
    expect(conditions[0]?.designPressure.value).toBe("10");
    expect(conditions[0]?.applicability).toBe(line.objectId);
    expect(specifications[0]?.pipingClass).toBe("A1");
    expect(specifications[0]?.materialFamily).toBe("CARBON_STEEL");
    expect((lineContract.fields.CONNECTION_CONTEXT as Array<{ connectionKind: string }>).some((row) => row.connectionKind === "LINE_TO_COMPONENT")).toBe(true);
    expect((lineContract.fields.LIMITATIONS as string[]).some((row) => row.includes("SUPERSEDED"))).toBe(true);
    const stressContract = recordPipingSourceContract(source, actor, { contractId: "contract-stress", contextId: "ctx-1", objectId: stressIdentity.objectId, sourceRevision: stressIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-stress" });
    const stressRows = stressContract.fields.STRESS_OR_FLEXIBILITY_EVIDENCE as Array<Exposed & { analysisExecuted: boolean; validatedPipingDesign: boolean; calculated: boolean; eosValidation: boolean; stressResult: { value: string } }>;
    expect(stressRows[0]?.currentness).toBe("SUPERSEDED");
    expect(stressRows[0]?.stressResult.value).toBe("120");
    expect(stressRows[0]?.analysisExecuted).toBe(false);
    expect(stressRows[0]?.validatedPipingDesign).toBe(false);
    expect(stressRows[0]?.calculated).toBe(false);
    expect(stressRows[0]?.eosValidation).toBe(false);
    const valveContract = recordPipingSourceContract(source, actor, { contractId: "contract-valve", contextId: "ctx-1", objectId: valveIdentity.objectId, sourceRevision: valveIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-valve" });
    const valves = (valveContract.fields.VALVE_AND_SPECIALTY_CONTEXT as { valves: Array<{ valveTag: string; valveSizing: boolean }> }).valves;
    expect(valves[0]?.valveTag).toBe("HV-100");
    expect(valves[0]?.valveSizing).toBe(false);
    const routeContract = recordPipingSourceContract(source, actor, { contractId: "contract-route", contextId: "ctx-1", objectId: routeIdentity.objectId, sourceRevision: routeIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-route" });
    expect((routeContract.fields.ROUTING_CONSTRAINTS as { routes: Array<{ routeSegment: string }> }).routes[0]?.routeSegment).toBe("CW-100 rack A");
    const fabContract = recordPipingSourceContract(source, actor, { contractId: "contract-fab", contextId: "ctx-1", objectId: fabricationIdentity.objectId, sourceRevision: fabricationIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-fab" });
    const fabrication = fabContract.fields.FABRICATION_OR_TESTING_EVIDENCE as { isometrics: Array<{ documentId: string; documentRevision: string }>; welds: Array<{ weldAccepted: boolean }> };
    expect(fabrication.isometrics[0]?.documentId).toBe("ISO-CW-100");
    expect(fabrication.isometrics[0]?.documentRevision).toBe("A");
    expect(fabrication.welds[0]?.weldAccepted).toBe(false);
    const testContract = recordPipingSourceContract(source, actor, { contractId: "contract-test", contextId: "ctx-1", objectId: testIdentity.objectId, sourceRevision: testIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-test" });
    const evidence = testContract.fields.FABRICATION_OR_TESTING_EVIDENCE as { nde: Array<Exposed & { codeConformance: boolean; ndeAccepted: boolean }>; tests: Array<Exposed & { codeConformance: boolean; testPassed: boolean }> };
    expect(evidence.nde[0]?.currentness).toBe("CURRENT");
    expect(evidence.nde[0]?.codeConformance).toBe(false);
    expect(evidence.nde[0]?.ndeAccepted).toBe(false);
    expect(evidence.tests[0]?.testPassed).toBe(false);
    expect(evidence.tests[0]?.codeConformance).toBe(false);
    const systemContract = recordPipingSourceContract(source, actor, { contractId: "contract-system", contextId: "ctx-1", objectId: system.objectId, sourceRevision: system.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-system" });
    expect((systemContract.fields.SYSTEM_OR_LINE_CONTEXT as { systems: Array<{ systemName: string }> }).systems[0]?.systemName).toBe("Cooling water");
    const serviceContract = recordPipingSourceContract(source, actor, { contractId: "contract-service", contextId: "ctx-1", objectId: serviceIdentity.objectId, sourceRevision: serviceIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-service" });
    expect((serviceContract.fields.SERVICE as Array<{ serviceFunction: string }>)[0]?.serviceFunction).toBe("SUPPLY");
    expect(systemContext.fingerprint).toBeTruthy();
    expect(JSON.stringify({
      condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint, valve: valve.fingerprint, route: route.fingerprint,
      isometric: isometric.fingerprint, stress: stress.fingerprint, support: support.fingerprint, nde: nde.fingerprint, test: test.fingerprint,
      sourceAdopted: sourceRequirement.adopted, requirementAdopted: requirement.adopted, assumptionFact: assumption.validatedFact, decisionAi: decision.aiRecommendation,
      changeRecalculated: change.recalculated, reassessmentValidated: reassessment.engineeringValidated, handoffCounterpart: handoff.counterpart, handoffValidated: handoff.engineeringValidated,
      requestCompleted: request.reviewCompleted, completionValidated: completion.engineeringValidated, validationState: validation.validationState, validationValidated: validation.engineeringValidated, validationCurrent: validation.currentness, line: line.fingerprint,
    })).toBe(before);
    expect(throws(() => recordPipingSourceContract(source, actor, { contractId: "contract-line-current", contextId: "ctx-1", objectId: line.objectId, sourceRevision: line.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-line-current" }))).toBe("D5_R11_SUPERSEDED_EXPOSED_AS_CURRENT");
    expect(throws(() => recordPipingSourceContract(source, actor, { contractId: "contract-support-dup", contextId: "ctx-1", objectId: supportIdentity.objectId, sourceRevision: supportIdentity.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-support" }))).toBe("D5_R11_DUPLICATE_SOURCE_CONTRACT_REJECTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { contractId: "contract-float", contextId: "ctx-1", objectId: supportIdentity.objectId, sourceRevision: "latest", citedCurrentness: "CURRENT", provenanceRef: "prov-float" }))).toBe("D5_R11_SUBJECT_REVISION_REQUIRED");
    expect(throws(() => recordPipingSourceContract(source, actor, { contractId: "contract-spoof", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" }))).toBe("D5_R11_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingSourceContract(source, { ...actor, actorId: "AI_agent" }, { contractId: "contract-ai", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-ai" }))).toBe("D5_R11_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingSourceContract(source, { ...actor, authority: "ADMIN" }, { contractId: "contract-admin", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-admin" }))).toBe("D5_R11_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingSourceContract(source, actor, { tenantId: "tenant-b", contractId: "contract-scope", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-scope" }))).toBe("D5_R11_CROSS_TENANT_OPERATION");
    expect(throws(() => recordPipingSourceContract(source, actor, { infer: true, contractId: "contract-infer", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-infer" }))).toBe("D5_R11_INFERRED_LINEAGE_REJECTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { calculate: true, contractId: "contract-calc", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-calc" }))).toBe("D5_R11_CALCULATION_NOT_IN_R11");
    expect(throws(() => recordPipingSourceContract(source, actor, { derive: true, contractId: "contract-derive", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-derive" }))).toBe("D5_R11_DERIVATION_NOT_IN_R11");
    expect(throws(() => recordPipingSourceContract(source, actor, { fabricateCounterpart: true, contractId: "contract-fab-missing", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-fab-missing" }))).toBe("D5_R11_COUNTERPART_FABRICATION_REJECTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { transferAuthority: true, contractId: "contract-auth", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-auth" }))).toBe("D5_R11_AUTHORITY_TRANSFER_REJECTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { d9Reasoning: true, contractId: "contract-d9", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-d9" }))).toBe("D5_R11_D9_NOT_STARTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { promoteAssumption: true, contractId: "contract-assume", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-assume" }))).toBe("D5_R11_ASSUMPTION_PROMOTION_REJECTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { reinterpretEvidence: true, contractId: "contract-evidence", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-evidence" }))).toBe("D5_R11_EVIDENCE_REINTERPRETATION_REJECTED");
    expect(throws(() => recordPipingSourceContract(source, actor, { stripLimitations: true, contractId: "contract-strip", contextId: "ctx-1", objectId: successorLine.objectId, sourceRevision: successorLine.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-strip" }))).toBe("D5_R11_LIMITATION_STRIPPING_REJECTED");
    expect(throws(() => repointPipingSourceContract())).toBe("D5_R11_AUTO_REPOINT_REJECTED");
    expect(throws(() => inferPipingSourceLineage())).toBe("D5_R11_INFERRED_LINEAGE_REJECTED");
    expect(throws(() => derivePipingSourceFact())).toBe("D5_R11_DERIVATION_NOT_IN_R11");
    expect(throws(() => fabricatePipingCounterpart())).toBe("D5_R11_COUNTERPART_FABRICATION_REJECTED");
    expect(throws(() => startD9FromPipingSource())).toBe("D5_R11_D9_NOT_STARTED");
    expect(throws(() => calculateFromPipingSource())).toBe("D5_R11_CALCULATION_NOT_IN_R11");
    expect(throws(() => transferPipingAuthorityFromSource())).toBe("D5_R11_AUTHORITY_TRANSFER_REJECTED");
    expect(throws(() => reinterpretPipingEvidenceFromSource())).toBe("D5_R11_EVIDENCE_REINTERPRETATION_REJECTED");
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D5_D9_SOURCE_CONTRACT_FIELDS");
    expect(sourceText).not.toContain("createHash");
    expect(scanAnalysisFormulaBypass("d9-source-contract.ts", sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(packageJson.dependencies.zod).toBeTruthy();
    expect(packageJson.dependencies["@rtb/piping-solver"]).toBeUndefined();
  });
});
