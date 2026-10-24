import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext } from "./component-connection-valve-context";
import { createD5R3Store, recordPipingDesignCondition, recordPipingSpecificationContext } from "./design-condition-specification-context";
import { D5_R9_STARTED, D5_RUNTIME_COUNT as R8_COUNT, createD5R8Store, recordPipingInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import { createD5R7Store, recordPipingChange, recordPipingGovernedRequirement, recordPipingReassessment } from "./requirements-assumptions-change";
import { createD5R5Store, recordPipingRoutingContext } from "./routing-arrangement-fabrication-context";
import { createD5R6Store, recordPipingSupportRestraintContext } from "./stress-support-test-evidence-context";
import { createD5R2Store, recordPipingLineContext, recordPipingServiceFunction, recordPipingSystemContext } from "./system-line-service-context";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY,
  CROSS_TENANT_D5_REVIEW_VALIDATION_ACCESS_ALLOWED,
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
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_PIPING_FINDING_DISPOSITION_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_REVIEW_COMPLETION_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_REVIEW_FINDING_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_REVIEW_REQUEST_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_VALIDATION_BASIS_REQUIRED,
  D5_PIPING_VALIDATION_BASIS_TRACEABLE,
  D5_PIPING_VALIDATION_STATE_GOVERNANCE_IMPLEMENTED,
  D5_R1_R8_EXACT_SUBJECT_REVISIONS_REUSED,
  D5_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED,
  D5_R8_INTERFACE_CONTEXT_REUSED,
  D5_R8_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_R8_RUNTIME_COUNT,
  D5_R9_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D5_R9_AUTO_MUTATES_R3_SPECIFICATION,
  D5_R9_AUTO_MUTATES_R4_COMPONENT_CONTEXT,
  D5_R9_AUTO_MUTATES_R5_ROUTING_CONTEXT,
  D5_R9_AUTO_MUTATES_R6_EVIDENCE,
  D5_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D5_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D5_R9_AUTO_REPOINTS_REVIEW_HISTORY,
  D5_R9_AUTO_REPOINTS_VALIDATION_HISTORY,
  D5_R9_AUTO_VALIDATES_ENGINEERING,
  D5_R9_BLOCKER,
  D5_R9_CANONICAL_NEXT_PHASE,
  D5_R9_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R9_FINDING_CATEGORIES,
  D5_R9_FINDING_DISPOSITIONS,
  D5_R9_HISTORY_PRESERVED,
  D5_R9_MATURITY,
  D5_R9_NEXT_PHASE_TYPE,
  D5_R9_PROVENANCE_PRESERVED,
  D5_R9_PROVENANCE_REQUIRED,
  D5_R9_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R9_REQUEST_STATUSES,
  D5_R9_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R9_STATUS,
  D5_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D5_R9_VALIDATES_D2_CIVIL_ENGINEERING,
  D5_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING,
  D5_R9_VALIDATES_D4_MECHANICAL_ENGINEERING,
  D5_R9_VALIDATES_FUTURE_D6_PROCESS_ENGINEERING,
  D5_R9_VALIDATES_FUTURE_D7_ELECTRICAL_ENGINEERING,
  D5_R9_VALIDATES_FUTURE_D8_IAC_ENGINEERING,
  D5_R9_VALIDATION_STATES,
  D5_R10_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REUSES_CANONICAL_REVIEW_GOVERNANCE,
  D5_REUSES_CANONICAL_VALIDATION_GOVERNANCE,
  D5_REVIEW_SUBJECT_AUTO_REPOINTED,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D5_REVIEWER_AUTHORITY_REQUIRED,
  D5_REVIEWER_AUTHORITY_TRACEABLE,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_REVIEW_SUBJECT_REVISION_REQUIRED,
  FINDING_ADDRESSED_EQUALS_VALIDATED,
  FINDING_CLOSED_EQUALS_APPROVED,
  FINDING_CLOSED_EQUALS_CONFORMANT,
  FINDING_CLOSED_EQUALS_VALIDATED,
  FLOATING_D5_REVIEW_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_REVIEW_ENGINE_CREATED,
  PARALLEL_D5_VALIDATION_ENGINE_CREATED,
  PRIOR_D5_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D5_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATED,
  REVIEW_COMPLETED_EQUALS_APPROVED,
  REVIEW_COMPLETED_EQUALS_CERTIFIED,
  REVIEW_COMPLETED_EQUALS_CONFORMANT,
  REVIEW_COMPLETED_EQUALS_VALIDATED,
  REVIEW_FINDING_EQUALS_ENGINEERING_INVALID,
  REVIEW_FINDING_EQUALS_REDESIGN_REQUIRED,
  REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED,
  REVIEW_REQUESTED_EQUALS_VALIDATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R9_MUTATION_ALLOWED,
  STALE_D5_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D5_VALIDATION_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D5_R9_SCOPE_ENFORCED,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_GA_READY,
  automaticallyValidatePipingEngineering,
  closePipingReassessmentAsValidated,
  createD5R9Store,
  mutatePipingChangeFromReview,
  mutatePipingHandoffFromReview,
  reasonAcrossPipingReview,
  recordPipingReviewCompletion,
  recordPipingReviewFinding,
  recordPipingReviewRequest,
  recordPipingValidationState,
  repointPipingReview,
  transferPipingValidation,
  validatePipingCounterpartFromReview,
  type D5R9Actor,
} from "./review-validation-governance";

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

describe("EOS-D5-R9 review and validation governance", () => {
  it("governs Piping review and validation on exact R1-R8 revisions without performing the engineering", () => {
    expect(D5_R9_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D5_R9_MATURITY).toBe(D5_R9_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(9);
    expect(D5_R8_RUNTIME_COUNT).toBe(8);
    expect(R8_COUNT).toBe(8);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_R9_STARTED).toBe(false);
    expect(D5_R10_STARTED).toBe(false);
    expect(D5_R8_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(0);
    expect(D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(1);
    expect(D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D5_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D5_REUSES_CANONICAL_REVIEW_GOVERNANCE).toBe(true);
    expect(D5_REUSES_CANONICAL_VALIDATION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D5_REVIEW_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D5_VALIDATION_ENGINE_CREATED).toBe(false);
    expect(D5_R9_REQUEST_STATUSES).toContain("REQUESTED");
    expect(D5_R9_FINDING_DISPOSITIONS).toContain("OPEN");
    expect(D5_R9_VALIDATION_STATES).toContain("VALIDATED");
    expect(D5_R9_FINDING_CATEGORIES).toContain("COMMENT");
    expect(D5_R1_R8_EXACT_SUBJECT_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D5_REVIEW_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D5_REVIEW_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D5_REVIEW_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D5_PIPING_REVIEW_REQUEST_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED).toBe(false);
    expect(REVIEW_REQUESTED_EQUALS_VALIDATED).toBe(false);
    expect(D5_REVIEWER_AUTHORITY_REQUIRED).toBe(true);
    expect(D5_REVIEWER_AUTHORITY_TRACEABLE).toBe(true);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(D5_PIPING_REVIEW_FINDING_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REVIEW_FINDING_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(REVIEW_FINDING_EQUALS_REDESIGN_REQUIRED).toBe(false);
    expect(D5_PIPING_FINDING_DISPOSITION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(FINDING_ADDRESSED_EQUALS_VALIDATED).toBe(false);
    expect(FINDING_CLOSED_EQUALS_VALIDATED).toBe(false);
    expect(FINDING_CLOSED_EQUALS_APPROVED).toBe(false);
    expect(FINDING_CLOSED_EQUALS_CONFORMANT).toBe(false);
    expect(D5_PIPING_REVIEW_COMPLETION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REVIEW_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_CONFORMANT).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_CERTIFIED).toBe(false);
    expect(D5_PIPING_VALIDATION_BASIS_REQUIRED).toBe(true);
    expect(D5_PIPING_VALIDATION_BASIS_TRACEABLE).toBe(true);
    expect(D5_PIPING_VALIDATION_STATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(VALIDATED_EQUALS_GA_READY).toBe(false);
    expect(D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D5_R9_AUTO_VALIDATES_ENGINEERING).toBe(false);
    expect(D5_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PRIOR_D5_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_D5_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(STALE_D5_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D5_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(D5_R9_HISTORY_PRESERVED).toBe(true);
    expect(D5_R9_AUTO_REPOINTS_REVIEW_HISTORY).toBe(false);
    expect(D5_R9_AUTO_REPOINTS_VALIDATION_HISTORY).toBe(false);
    expect(SILENT_D5_R9_MUTATION_ALLOWED).toBe(false);
    expect(D5_R8_INTERFACE_CONTEXT_REUSED).toBe(true);
    expect(D5_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING).toBe(false);
    expect(D5_R9_VALIDATES_D2_CIVIL_ENGINEERING).toBe(false);
    expect(D5_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING).toBe(false);
    expect(D5_R9_VALIDATES_D4_MECHANICAL_ENGINEERING).toBe(false);
    expect(D5_R9_VALIDATES_FUTURE_D6_PROCESS_ENGINEERING).toBe(false);
    expect(D5_R9_VALIDATES_FUTURE_D7_ELECTRICAL_ENGINEERING).toBe(false);
    expect(D5_R9_VALIDATES_FUTURE_D8_IAC_ENGINEERING).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R3_SPECIFICATION).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R4_COMPONENT_CONTEXT).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R5_ROUTING_CONTEXT).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R6_EVIDENCE).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE).toBe(false);
    expect(D5_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF).toBe(false);
    expect(D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT).toBe(0);
    expect(D5_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D5_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_R9_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R9_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R9_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D5_REVIEW_VALIDATION_ACCESS_ALLOWED).toBe(false);
    expect(D5_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R9_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R9_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_R9_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D5_R9_NEXT_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");
    expect(D5_R9_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R9 revisions");
    expect(D5_R9_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("NOT_IMPLEMENTED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const routeIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "route-1", contextId: "ctx-1", objectType: "PIPING_ROUTE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-route" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const supportIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "support-1", contextId: "ctx-1", objectType: "PIPING_SUPPORT_REQUIREMENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-support" });
    const r2 = createD5R2Store(r1);
    const r2Bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-a", citedCurrentness: "CURRENT" };
    recordPipingSystemContext(r2, actor, { ...r2Bound, objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-ctx", systemName: "Cooling water", systemDescription: "Utility", systemClassification: "UTILITY_PIPING_SYSTEM", systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10" });
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
    const component = recordPipingComponentContext(r4, actor, {
      contextId: "ctx-1", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint, lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", applicabilityRef: flange.objectId, limitations: "Supplied flange only", identityBasis: "EXPLICIT",
      componentRecordId: "comp-flange", componentClassification: "FLANGE",
    });
    const connection = recordPipingConnectionContext(r4, actor, {
      contextId: "ctx-1", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint, lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", applicabilityRef: connectionIdentity.objectId, limitations: "Explicit flange to line", identityBasis: "EXPLICIT",
      connectionRecordId: "conn-1", connectionKind: "LINE_TO_COMPONENT", connectionBasis: "EXPLICIT", fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: line.objectId, toRevisionFingerprint: line.fingerprint,
    });
    const r5 = createD5R5Store(r4);
    const route = recordPipingRoutingContext(r5, actor, {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint, specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint, connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r5", sourceBasisRef: "iso-basis", sourceBasisCategory: "APPROVED_ISOMETRIC", limitations: "Supplied route only",
      identityBasis: "EXPLICIT", relationshipBasis: "EXPLICIT", objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-1", routeSegment: "CW-100 rack A", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint, destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint,
      placement: "ABOVE_GROUND", routingConstraint: "rack A",
    });
    const r6 = createD5R6Store(r5);
    const support = recordPipingSupportRestraintContext(r6, actor, {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint, conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint, connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6",
      sourceBasisRef: "support-note-1", sourceBasisCategory: "PROJECT_PIPING_DATA", limitations: "Supplied guide location only", identityBasis: "EXPLICIT",
      objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      supportRecordId: "sup-1", supportFunction: "GUIDE", supportLocation: "rack A bay 3 supplied", loadReference: { value: "4.2", unit: "kN" },
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
    const completed = recordPipingReassessment(r7, actor, { ...subject, reassessmentId: "ras-done", changeId: change.changeId, targetId: support.supportRecordId, targetFingerprint: support.fingerprint, state: "REASSESSMENT_COMPLETED" });
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
    const upstream = JSON.stringify({ condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint, route: route.fingerprint, support: support.fingerprint, change: change.fingerprint, reassessment: reassessment.fingerprint, handoff: handoff.fingerprint, handoffValidated: handoff.engineeringValidated });
    const store = createD5R9Store(r8);
    const chain = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: "ctx-1", objectId: support.objectId, objectRevisionFingerprint: support.objectRevisionFingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint, conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint, componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint, routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      r6SubjectKind: "SUPPORT", r6SubjectId: support.supportRecordId, r6RevisionFingerprint: support.fingerprint, r7SubjectKind: "CHANGE", r7SubjectId: change.changeId, r7RevisionFingerprint: change.fingerprint,
      r8HandoffId: handoff.handoffId, r8RevisionFingerprint: handoff.fingerprint, subjectKind: "EVIDENCE", subjectId: support.supportRecordId, subjectRevision: support.provenanceRef, subjectFingerprint: support.fingerprint,
      applicability: "support-1", limitations: "This exact support revision only", provenanceRef: "prov-review", citedLifecycleStage: "FEED",
    };
    const request = recordPipingReviewRequest(store, recorder, {
      ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-1", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "CW-100 guide at bay 3", requestedReviewerAuthority: "REVIEWER",
    });
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.objectRevisionFingerprint).toBe(support.objectRevisionFingerprint);
    expect(request.r8RevisionFingerprint).toBe(handoff.fingerprint);
    expect(recordPipingReviewRequest(store, recorder, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-1", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "CW-100 guide at bay 3", requestedReviewerAuthority: "REVIEWER" })).toBe(request);
    const finding = recordPipingReviewFinding(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", findingId: "finding-1", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Guide note is recorded and not a structural design", disposition: "OPEN",
    });
    expect(finding.engineeringInvalid).toBe(false);
    expect(finding.engineeringValidated).toBe(false);
    expect(finding.reviewerAuthority).toBe("REVIEWER");
    expect(finding.aiReview).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    const linked = recordPipingReviewFinding(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", findingId: "finding-reassess", reviewRequestId: request.reviewRequestId, findingCategory: "REASSESSMENT_RECOMMENDATION", severity: "REQUIRES_ATTENTION",
      findingText: "The exact support revision needs reassessment", disposition: "REASSESSMENT_REQUESTED", changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint,
    });
    expect(linked.engineeringValidated).toBe(false);
    expect(linked.changeId).toBe(change.changeId);
    expect(completed.engineeringValidated).toBe(false);
    const completion = recordPipingReviewCompletion(store, reviewer, { ...chain, citedCurrentness: "CURRENT", completionId: "complete-1", reviewRequestId: request.reviewRequestId });
    expect(completion.reviewCompleted).toBe(true);
    expect(completion.engineeringValidated).toBe(false);
    expect(completion.conformant).toBe(false);
    expect(completion.engineeringApproved).toBe(false);
    expect(completion.certified).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    const validated = recordPipingValidationState(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", validationId: "val-1", reviewRequestId: request.reviewRequestId, validationScope: "support-1 only", validationState: "VALIDATED",
      basis: [{ kind: "R6_EVIDENCE", id: support.supportRecordId, fingerprint: support.fingerprint }],
    });
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.conformant).toBe(false);
    expect(validated.engineeringApproved).toBe(false);
    expect(validated.certified).toBe(false);
    expect(validated.d1Validated).toBe(false);
    expect(validated.basis[0]?.fingerprint).toBe(support.fingerprint);
    expect(handoff.engineeringValidated).toBe(false);
    const reassessed = recordPipingValidationState(store, reviewer, {
      ...chain, citedCurrentness: "REASSESSMENT_REQUIRED", validationId: "val-reassess", validationScope: "reassessment obligation", validationState: "REASSESSMENT_REQUIRED",
      changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint,
    });
    expect(reassessed.engineeringValidated).toBe(false);
    expect(reassessed.reassessmentId).toBe(reassessment.reassessmentId);
    const stale = recordPipingValidationState(store, reviewer, {
      ...chain, citedCurrentness: "STALE", validationId: "val-stale", predecessorValidationId: validated.validationId, validationScope: "support-1 only", validationState: "STALE",
    });
    expect(stale.currentness).toBe("STALE");
    expect(stale.engineeringValidated).toBe(false);
    expect(validated.currentness).toBe("SUPERSEDED");
    expect(validated.fingerprint).toBe(store.validations.find((row) => row.validationId === "val-1")?.fingerprint);
    expect(validated.recordStatus).toBe("SUPERSEDED");
    const handoffChain = { ...chain, subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.provenanceRef, subjectFingerprint: handoff.fingerprint };
    const interfaceRequest = recordPipingReviewRequest(store, recorder, {
      ...handoffChain, citedCurrentness: "CURRENT", reviewRequestId: "review-handoff", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "Piping side of the structural handoff", requestedReviewerAuthority: "REVIEWER",
    });
    const interfaceCompletion = recordPipingReviewCompletion(store, reviewer, { ...handoffChain, citedCurrentness: "CURRENT", completionId: "complete-handoff", reviewRequestId: interfaceRequest.reviewRequestId });
    expect(interfaceCompletion.engineeringValidated).toBe(false);
    expect(interfaceCompletion.d1Validated).toBe(false);
    expect(handoff.engineeringValidated).toBe(false);
    expect(JSON.stringify({ condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint, route: route.fingerprint, support: support.fingerprint, change: change.fingerprint, reassessment: reassessment.fingerprint, handoff: handoff.fingerprint, handoffValidated: handoff.engineeringValidated })).toBe(upstream);
    expect(throws(() => recordPipingReviewRequest(store, recorder, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-dup", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "another scope", requestedReviewerAuthority: "REVIEWER" }))).toBe("D5_R9_DUPLICATE_REVIEW_REQUEST_REJECTED");
    expect(throws(() => recordPipingReviewRequest(store, recorder, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-float", objectRevisionFingerprint: "latest", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "floating", requestedReviewerAuthority: "REVIEWER" }))).toBe("D5_R9_R1_REVISION_REQUIRED");
    expect(throws(() => recordPipingReviewRequest(store, recorder, { ...handoffChain, citedCurrentness: "CURRENT", predecessorReviewRequestId: request.reviewRequestId, reviewRequestId: "review-transfer", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "moved review", requestedReviewerAuthority: "REVIEWER" }))).toBe("D5_R9_REVIEW_TRANSFER_REJECTED");
    expect(throws(() => recordPipingReviewRequest(store, { ...recorder, actorId: "AI_agent" }, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-ai", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "ai", requestedReviewerAuthority: "REVIEWER" }))).toBe("D5_R9_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingReviewFinding(store, { ...reviewer, actorId: "AI-reviewer", actorKind: "ai" }, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-ai", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "ai note", disposition: "OPEN" }))).toBe("D5_R9_AI_NOT_PIPING_REVIEWER");
    expect(throws(() => recordPipingReviewFinding(store, { ...reviewer, actorId: "ADMIN", authority: "ADMIN" }, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-admin", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "admin note", disposition: "OPEN" }))).toBe("D5_R9_ADMIN_NOT_PIPING_REVIEWER");
    expect(throws(() => recordPipingReviewFinding(store, { ...reviewer, aal: "aal1" }, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-aal", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "weak assurance", disposition: "OPEN" }))).toBe("D5_R9_AAL2_REQUIRED");
    expect(throws(() => recordPipingReviewFinding(store, reviewer, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-dup", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Guide note is recorded and not a structural design", disposition: "NOTED" }))).toBe("D5_R9_DUPLICATE_FINDING_REJECTED");
    expect(throws(() => recordPipingReviewFinding(store, reviewer, { ...chain, assertedFingerprint: "spoofed", citedCurrentness: "CURRENT", findingId: "finding-spoof", reviewRequestId: request.reviewRequestId, findingCategory: "CLARIFICATION_REQUIRED", severity: "INFORMATION_GAP", findingText: "spoofed finding", disposition: "OPEN" }))).toBe("D5_R9_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingReviewCompletion(store, reviewer, { ...chain, reviewCompleted: true, citedCurrentness: "CURRENT", completionId: "complete-flag", reviewRequestId: request.reviewRequestId }))).toBe("D5_R9_REVIEW_REQUEST_NOT_COMPLETION");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, citedCurrentness: "CURRENT", validationId: "val-empty", validationScope: "no basis", validationState: "VALIDATED" }))).toBe("D5_R9_BASIS_REQUIRED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, reassessmentCompleted: true, citedCurrentness: "CURRENT", validationId: "val-done", validationScope: "completed reassessment", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_REASSESSMENT_NOT_VALIDATION");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, citedCurrentness: "CURRENT", validationId: "val-from-reassess", validationScope: "completed reassessment", validationState: "VALIDATED", changeId: change.changeId, reassessmentId: completed.reassessmentId, basis: [{ kind: "R6_EVIDENCE", id: support.supportRecordId, fingerprint: support.fingerprint }] }))).toBe("D5_R9_REASSESSMENT_NOT_VALIDATION");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...handoffChain, predecessorValidationId: stale.validationId, citedCurrentness: "STALE", validationId: "val-transfer", validationScope: "moved validation", validationState: "STALE" }))).toBe("D5_R9_VALIDATION_TRANSFER_REJECTED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, validateD1: true, citedCurrentness: "CURRENT", validationId: "val-d1", validationScope: "structural", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_D1_VALIDATION_REJECTED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, validateD4: true, citedCurrentness: "CURRENT", validationId: "val-d4", validationScope: "mechanical", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_D4_VALIDATION_REJECTED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, validateFuture: true, citedCurrentness: "CURRENT", validationId: "val-future", validationScope: "process", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_FUTURE_DISCIPLINE_VALIDATION_REJECTED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, automaticValidation: true, citedCurrentness: "CURRENT", validationId: "val-auto", validationScope: "auto", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_AUTOMATIC_VALIDATION_REJECTED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, mutateR3: true, citedCurrentness: "CURRENT", validationId: "val-r3", validationScope: "mutate", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_R3_MUTATION_REJECTED");
    expect(throws(() => recordPipingValidationState(store, reviewer, { ...chain, mutateR8: true, citedCurrentness: "CURRENT", validationId: "val-r8", validationScope: "mutate handoff", validationState: "NOT_VALIDATED" }))).toBe("D5_R9_R8_MUTATION_REJECTED");
    expect(throws(() => recordPipingReviewRequest(store, recorder, { ...chain, tenantId: "tenant-b", citedCurrentness: "CURRENT", reviewRequestId: "review-scope", reviewType: "PIPING_SUBJECT_REVIEW", reviewScope: "other tenant", requestedReviewerAuthority: "REVIEWER" }))).toBe("D5_R9_SCOPE_MISMATCH");
    expect(throws(() => repointPipingReview())).toBe("D5_R9_AUTO_REPOINT_REJECTED");
    expect(throws(() => transferPipingValidation())).toBe("D5_R9_VALIDATION_TRANSFER_REJECTED");
    expect(throws(() => mutatePipingChangeFromReview())).toBe("D5_R9_R7_MUTATION_REJECTED");
    expect(throws(() => mutatePipingHandoffFromReview())).toBe("D5_R9_R8_MUTATION_REJECTED");
    expect(throws(() => validatePipingCounterpartFromReview())).toBe("D5_R9_D1_VALIDATION_REJECTED");
    expect(throws(() => automaticallyValidatePipingEngineering())).toBe("D5_R9_AUTOMATIC_VALIDATION_REJECTED");
    expect(throws(() => closePipingReassessmentAsValidated())).toBe("D5_R9_REASSESSMENT_NOT_VALIDATION");
    expect(throws(() => reasonAcrossPipingReview())).toBe("D5_R9_CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toContain("D2_R9_REQUEST_STATUSES");
    expect(sourceText).toContain("D2_R9_VALIDATION_STATES");
    expect(sourceText).not.toContain("createHash");
    expect(scanAnalysisFormulaBypass("review-validation-governance.ts", sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(packageJson.dependencies.zod).toBeTruthy();
    expect(packageJson.dependencies["@rtb/piping-solver"]).toBeUndefined();
  });
});
