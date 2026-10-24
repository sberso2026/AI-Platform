import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext } from "./component-connection-valve-context";
import { createD5R3Store, recordPipingDesignCondition, recordPipingSpecificationContext } from "./design-condition-specification-context";
import { createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import { D5_R6_STARTED, D5_RUNTIME_COUNT as R5_RUNTIME_COUNT, D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT as R5_STRESS_COUNT, createD5R5Store, recordPipingRoutingContext, recordPipingWeldJointContext } from "./routing-arrangement-fabrication-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D5_NDE_RESULT,
  AI_CAN_INVENT_AUTHORITATIVE_D5_STRESS_EVIDENCE,
  AI_CAN_INVENT_AUTHORITATIVE_D5_SUPPORT_REQUIREMENT,
  AI_CAN_INVENT_AUTHORITATIVE_D5_TEST_RESULT,
  AI_CAN_SILENTLY_CHANGE_D5_R6_EVIDENCE_UNITS,
  BASISLESS_AUTHORITATIVE_D5_R6_RECORD_AUTO_ACCEPTED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EXTERNAL_ANALYSIS_EVIDENCE_SUPPORTED,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_PIPING_INSPECTION_REQUIREMENT_CONTEXT_IMPLEMENTED,
  D5_PIPING_NDE_CONTEXT_IMPLEMENTED,
  D5_PIPING_PRESSURE_LEAK_TEST_CONTEXT_IMPLEMENTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_STRESS_FLEXIBILITY_EVIDENCE_CONTEXT_IMPLEMENTED,
  D5_PIPING_SUPPORT_RESTRAINT_CONTEXT_IMPLEMENTED,
  D5_R3_DESIGN_TEST_CONDITION_REFERENCE_SUPPORTED,
  D5_R5_ROUTING_ARRANGEMENT_FABRICATION_CONTEXT_REUSED,
  D5_R5_WELD_JOINT_CONTEXT_REUSED,
  D5_R6_AUTOMATIC_SUPPORT_LOCATION_DERIVATION_ALLOWED,
  D5_R6_AUTOMATIC_SUPPORT_SELECTION_ALLOWED,
  D5_R6_BLOCKER,
  D5_R6_CANONICAL_NEXT_PHASE,
  D5_R6_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R6_EVIDENCE_UNITS_PRESERVED,
  D5_R6_EVIDENCE_UNITS_REQUIRED,
  D5_R6_HIDDEN_STRESS_CALCULATION_ALLOWED,
  D5_R6_HISTORY_PRESERVED,
  D5_R6_MATURITY,
  D5_R6_NEXT_PHASE_TYPE,
  D5_R6_PERFORMS_STRUCTURAL_SUPPORT_DESIGN,
  D5_R6_STATUS,
  D5_R6_VALIDATES_D1_STRUCTURAL_SUPPORT,
  D5_R7_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_STRESS_LOAD_CASE_CONTEXT_SUPPORTED,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_IMPLEMENTED,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_R1_R5_REFERENCE_REQUIRED,
  EXACT_D5_R3_DESIGN_TEST_CONDITION_REVISION_REQUIRED,
  EXACT_D5_R5_WELD_JOINT_REVISION_REQUIRED,
  EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION,
  EXTERNAL_TOOL_RESULT_EQUALS_CODE_CONFORMANCE,
  INSPECTION_REQUIREMENT_EQUALS_INSPECTION_COMPLETED,
  INSPECTION_REQUIREMENT_EQUALS_INSPECTION_PASSED,
  LOAD_CASE_CONTEXT_EQUALS_ANALYSIS_EXECUTED,
  LOAD_CASE_CONTEXT_EQUALS_ANALYSIS_VALIDATED,
  NDE_COMPLETED_EQUALS_NDE_ACCEPTED,
  NDE_EVIDENCE_AUTO_MARKS_R5_WELD_ACCEPTED,
  NDE_REQUIREMENT_EQUALS_NDE_COMPLETED,
  NDE_RESULT_EQUALS_CODE_CONFORMANCE,
  NDE_RESULT_EQUALS_ENGINEERING_VALIDATED,
  NEW_DEPENDENCY_ADDED,
  PIPING_SUPPORT_CONTEXT_EQUALS_STRUCTURAL_ADEQUACY,
  PIPING_SUPPORT_LOAD_REFERENCE_EQUALS_STRUCTURAL_VALIDATION,
  PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN,
  STRESS_ANALYSIS_RESULT_EQUALS_CODE_CONFORMANCE,
  STRESS_ANALYSIS_RESULT_EQUALS_STRUCTURAL_SUPPORT_VALIDATION,
  STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN,
  STRESS_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED,
  SUPPORT_EVIDENCE_AUTO_PROMOTED_TO_STRUCTURAL_ADEQUATE,
  TEST_COMPLETED_EQUALS_TEST_PASSED,
  TEST_EVIDENCE_AUTO_MUTATES_R3_DESIGN_CONDITION,
  TEST_EVIDENCE_AUTO_PROMOTED_TO_ENGINEERING_VALIDATED,
  TEST_PASSED_EQUALS_ENGINEERING_VALIDATED,
  TEST_REQUIREMENT_EQUALS_TEST_COMPLETED,
  TEST_RESULT_AUTO_REWRITES_R3_TEST_CONDITION,
  TEST_RESULT_EQUALS_CODE_CONFORMANCE,
  calculatePipingStress,
  createD5R6Store,
  determinePipingConformance,
  recordPipingInspectionRequirement,
  recordPipingNdeContext,
  recordPipingPressureLeakTestContext,
  recordPipingRequirement,
  recordPipingStressFlexibilityEvidence,
  recordPipingSupportRestraintContext,
  repointPipingEvidence,
  selectPipingSupport,
  validatePipingEngineering,
} from "./stress-support-test-evidence-context";
import { createD5R2Store, recordPipingLineContext, recordPipingServiceFunction, recordPipingSystemContext } from "./system-line-service-context";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D5R1Actor = {
  actorId: "piping-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "PIPING_CONTEXT_AUTHORITY",
};

function throws(run: () => void): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : "";
  }
  return "";
}

describe("EOS-D5-R6 piping stress support and test evidence context", () => {
  it("records supplied analysis and test evidence without calculating or validating it", () => {
    expect(D5_R6_STATUS).toBe("STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT_IMPLEMENTED");
    expect(D5_R6_MATURITY).toBe(D5_R6_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_COUNT).toBe(6);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R5_STRESS_COUNT).toBe(0);
    expect(D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D5_R5_ROUTING_ARRANGEMENT_FABRICATION_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D5_R1_R5_REFERENCE_REQUIRED).toBe(true);
    expect(D5_PIPING_STRESS_FLEXIBILITY_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN).toBe(false);
    expect(STRESS_ANALYSIS_RESULT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(STRESS_ANALYSIS_RESULT_EQUALS_STRUCTURAL_SUPPORT_VALIDATION).toBe(false);
    expect(D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_R6_HIDDEN_STRESS_CALCULATION_ALLOWED).toBe(false);
    expect(D5_STRESS_LOAD_CASE_CONTEXT_SUPPORTED).toBe(true);
    expect(LOAD_CASE_CONTEXT_EQUALS_ANALYSIS_EXECUTED).toBe(false);
    expect(LOAD_CASE_CONTEXT_EQUALS_ANALYSIS_VALIDATED).toBe(false);
    expect(D5_R6_EVIDENCE_UNITS_REQUIRED).toBe(true);
    expect(D5_R6_EVIDENCE_UNITS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D5_R6_EVIDENCE_UNITS).toBe(false);
    expect(D5_PIPING_SUPPORT_RESTRAINT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN).toBe(false);
    expect(PIPING_SUPPORT_CONTEXT_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(PIPING_SUPPORT_LOAD_REFERENCE_EQUALS_STRUCTURAL_VALIDATION).toBe(false);
    expect(D5_R6_VALIDATES_D1_STRUCTURAL_SUPPORT).toBe(false);
    expect(D5_R6_PERFORMS_STRUCTURAL_SUPPORT_DESIGN).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_R6_AUTOMATIC_SUPPORT_SELECTION_ALLOWED).toBe(false);
    expect(D5_R6_AUTOMATIC_SUPPORT_LOCATION_DERIVATION_ALLOWED).toBe(false);
    expect(D5_PIPING_INSPECTION_REQUIREMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(INSPECTION_REQUIREMENT_EQUALS_INSPECTION_COMPLETED).toBe(false);
    expect(INSPECTION_REQUIREMENT_EQUALS_INSPECTION_PASSED).toBe(false);
    expect(D5_PIPING_NDE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(NDE_REQUIREMENT_EQUALS_NDE_COMPLETED).toBe(false);
    expect(NDE_COMPLETED_EQUALS_NDE_ACCEPTED).toBe(false);
    expect(NDE_RESULT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(NDE_RESULT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D5_PIPING_PRESSURE_LEAK_TEST_CONTEXT_IMPLEMENTED).toBe(true);
    expect(TEST_REQUIREMENT_EQUALS_TEST_COMPLETED).toBe(false);
    expect(TEST_COMPLETED_EQUALS_TEST_PASSED).toBe(false);
    expect(TEST_PASSED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(TEST_RESULT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(D5_R3_DESIGN_TEST_CONDITION_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D5_R3_DESIGN_TEST_CONDITION_REVISION_REQUIRED).toBe(true);
    expect(TEST_EVIDENCE_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(TEST_RESULT_AUTO_REWRITES_R3_TEST_CONDITION).toBe(false);
    expect(D5_R5_WELD_JOINT_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D5_R5_WELD_JOINT_REVISION_REQUIRED).toBe(true);
    expect(NDE_EVIDENCE_AUTO_MARKS_R5_WELD_ACCEPTED).toBe(false);
    expect(D5_EXTERNAL_ANALYSIS_EVIDENCE_SUPPORTED).toBe(true);
    expect(EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION).toBe(false);
    expect(EXTERNAL_TOOL_RESULT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(BASISLESS_AUTHORITATIVE_D5_R6_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(STRESS_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED).toBe(false);
    expect(SUPPORT_EVIDENCE_AUTO_PROMOTED_TO_STRUCTURAL_ADEQUATE).toBe(false);
    expect(TEST_EVIDENCE_AUTO_PROMOTED_TO_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_STRESS_EVIDENCE).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_SUPPORT_REQUIREMENT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_NDE_RESULT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_TEST_RESULT).toBe(false);
    expect(D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT + D5_AUTOMATIC_ROUTING_RUNTIME_COUNT + D5_GEOMETRY_SOLVER_RUNTIME_COUNT + D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT + D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT + D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(0);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D5_R6_STARTED).toBe(false);
    expect(D5_R7_STARTED).toBe(false);
    expect(D5_R6_HISTORY_PRESERVED).toBe(true);
    expect(D5_R6_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE");
    expect(D5_R6_NEXT_PHASE_TYPE).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE");
    expect(D5_R6_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R6 revisions");
    expect(D5_R6_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R6.STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const routeIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "route-1", contextId: "ctx-1", objectType: "PIPING_ROUTE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-route" });
    const fabricationIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "fab-1", contextId: "ctx-1", objectType: "PIPING_FABRICATION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-fab" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const stressIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "stress-1", contextId: "ctx-1", objectType: "PIPING_STRESS_FLEXIBILITY_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-stress" });
    const supportIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "support-1", contextId: "ctx-1", objectType: "PIPING_SUPPORT_REQUIREMENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-support" });
    const testIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "test-1", contextId: "ctx-1", objectType: "PIPING_TEST_INSPECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-test" });
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
    const condition = recordPipingDesignCondition(r3, actor, {
      ...specCommon, conditionId: "cond-1", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    });
    const specification = recordPipingSpecificationContext(r3, actor, {
      ...specCommon, specificationId: "spec-1", specificationRef: "CW-CLASS-A", pipingClass: "A1",
      materialFamily: "CARBON_STEEL", pressureRatingContext: "Class 150 reference", flangeRatingContext: "ASME B16.5 class 150 reference",
      wallScheduleContext: "Schedule 40 reference", codeStandardRef: "ASME B31.3 reference", assignmentBasis: "EXPLICIT",
    });
    const r4 = createD5R4Store(r1, r2, r3);
    const component = recordPipingComponentContext(r4, actor, {
      contextId: "ctx-1", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", applicabilityRef: flange.objectId,
      limitations: "Supplied flange only", identityBasis: "EXPLICIT", componentRecordId: "comp-flange", componentClassification: "FLANGE",
    });
    const connection = recordPipingConnectionContext(r4, actor, {
      contextId: "ctx-1", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", applicabilityRef: connectionIdentity.objectId,
      limitations: "Explicit flange to line", identityBasis: "EXPLICIT", connectionRecordId: "conn-1",
      connectionKind: "LINE_TO_COMPONENT", connectionBasis: "EXPLICIT",
      fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: line.objectId, toRevisionFingerprint: line.fingerprint,
    });
    const r5 = createD5R5Store(r4);
    const r5Base = {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r5",
      sourceBasisRef: "iso-basis", sourceBasisCategory: "APPROVED_ISOMETRIC",
      limitations: "Supplied route only", identityBasis: "EXPLICIT", relationshipBasis: "EXPLICIT",
    };
    const route = recordPipingRoutingContext(r5, actor, {
      ...r5Base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-1", routeSegment: "CW-100 rack A", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "rack A",
    });
    const weld = recordPipingWeldJointContext(r5, actor, {
      ...r5Base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      weldRecordId: "weld-1", jointType: "BUTT",
    });
    const conditionsBefore = JSON.stringify(r3.conditions);
    const weldsBefore = JSON.stringify(r5.welds);
    const store = createD5R6Store(r5);
    const base = {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6",
      sourceBasisRef: "caesar-report-1", sourceBasisCategory: "EXTERNAL_ANALYSIS",
      limitations: "External evidence for CW-100 case LC-1 only", identityBasis: "EXPLICIT",
    };
    const stress = recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-ev-1", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-1", toolIdentity: "CAESAR II",
      modelRevision: "model-a", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-01", assumptions: "supplied restraint set",
      stressResult: { value: "120", unit: "MPa" }, displacementResult: { value: "8", unit: "mm" }, allowableReference: "supplied allowable reference",
    });
    expect(stress.stressResult).toEqual({ value: "120", unit: "MPa" });
    expect(stress.calculated).toBe(false);
    expect(stress.analysisExecuted).toBe(false);
    expect(stress.analysisValidated).toBe(false);
    expect(stress.validatedPipingDesign).toBe(false);
    expect(stress.codeConformance).toBe(false);
    expect(stress.structuralSupportValidation).toBe(false);
    expect(stress.eosValidation).toBe(false);
    expect(stress.conditionRevisionFingerprint).toBe(condition.fingerprint);
    expect(recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-ev-1", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-1", toolIdentity: "CAESAR II",
      modelRevision: "model-a", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-01", assumptions: "supplied restraint set",
      stressResult: { value: "120", unit: "MPa" }, displacementResult: { value: "8", unit: "mm" }, allowableReference: "supplied allowable reference",
    })).toBe(stress);
    const support = recordPipingSupportRestraintContext(store, actor, {
      ...base, objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      sourceBasisCategory: "PROJECT_PIPING_DATA", supportRecordId: "sup-1", supportFunction: "GUIDE", supportLocation: "rack A bay 3 supplied",
      loadReference: { value: "4.2", unit: "kN" },
    });
    expect(support.structuralDesign).toBe(false);
    expect(support.structuralAdequacy).toBe(false);
    expect(support.structuralValidation).toBe(false);
    expect(support.loadReference).toEqual({ value: "4.2", unit: "kN" });
    const inspection = recordPipingInspectionRequirement(store, actor, {
      ...base, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisCategory: "INSPECTION_EVIDENCE", inspectionRecordId: "insp-1", inspectionRequirement: "visual inspection of shop welds",
    });
    expect(inspection.inspectionCompleted).toBe(false);
    expect(inspection.inspectionPassed).toBe(false);
    const nde = recordPipingNdeContext(store, actor, {
      ...base, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisCategory: "NDE_EVIDENCE", ndeRecordId: "nde-1", ndeMethod: "RT", extent: "10 percent supplied",
      observedStatus: "report status as supplied", evidenceRevision: "nde-rev-a",
      weldRecordId: weld.weldRecordId, weldRevisionFingerprint: weld.fingerprint,
    });
    expect(nde.ndeCompleted).toBe(false);
    expect(nde.ndeAccepted).toBe(false);
    expect(nde.codeConformance).toBe(false);
    expect(nde.weldMarkedAccepted).toBe(false);
    expect(r5.welds.find((row) => row.weldRecordId === "weld-1")?.weldAccepted).toBe(false);
    const test = recordPipingPressureLeakTestContext(store, actor, {
      ...base, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisCategory: "TEST_EVIDENCE", testRecordId: "test-rec-1", testKind: "HYDROTEST", testReference: "TP-100",
      observedStatus: "gauge reading as supplied", evidenceRef: "test-cert-a", testPressure: { value: "15", unit: "bar" },
    });
    expect(test.testCompleted).toBe(false);
    expect(test.testPassed).toBe(false);
    expect(test.engineeringValidated).toBe(false);
    expect(test.codeConformance).toBe(false);
    expect(test.testPressure).toEqual({ value: "15", unit: "bar" });
    expect(JSON.stringify(r3.conditions)).toBe(conditionsBefore);
    expect(JSON.stringify(r5.welds)).toBe(weldsBefore);
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-unit", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-2", toolIdentity: "CAESAR II",
      modelRevision: "model-a", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-01", assumptions: "supplied",
      stressResult: { value: "120", unit: "MPa", normalizedUnit: "psi" },
    }))).toBe("D5_R6_UNIT_CHANGE_REJECTED");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-calc", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-3", toolIdentity: "CAESAR II",
      modelRevision: "model-a", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-01", assumptions: "supplied",
      stressResult: { value: "S=PD/2t", unit: "MPa" },
    }))).toBe("D5_R6_CALCULATION_NOT_IN_R6");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, calculateStress: true, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-hidden", analysisReference: "x", loadCaseId: "LC-4", toolIdentity: "tool", modelRevision: "m",
      sourceAuthority: "analyst", evidenceVersion: "v", assumptions: "a", stressResult: { value: "1", unit: "MPa" },
    }))).toBe("D5_R6_CALCULATION_NOT_IN_R6");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, analysisExecuted: true, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-exec", analysisReference: "x", loadCaseId: "LC-5", toolIdentity: "tool", modelRevision: "m",
      sourceAuthority: "analyst", evidenceVersion: "v", assumptions: "a", stressResult: { value: "1", unit: "MPa" },
    }))).toBe("D5_R6_LOAD_CASE_NOT_EXECUTION");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, conditionRevisionFingerprint: "not-the-condition", objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-cond", analysisReference: "x", loadCaseId: "LC-6", toolIdentity: "tool", modelRevision: "m",
      sourceAuthority: "analyst", evidenceVersion: "v", assumptions: "a", stressResult: { value: "1", unit: "MPa" },
    }))).toBe("D5_R6_R3_CONDITION_REVISION_MISMATCH");
    expect(throws(() => recordPipingSupportRestraintContext(store, actor, {
      ...base, autoSelectSupport: true, objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      supportRecordId: "sup-auto", supportFunction: "ANCHOR", supportLocation: "derived",
    }))).toBe("D5_R6_AUTOMATIC_SUPPORT_REJECTED");
    expect(throws(() => recordPipingSupportRestraintContext(store, actor, {
      ...base, deriveLocation: true, identityBasis: "route_geometry", objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      supportRecordId: "sup-geo", supportFunction: "GUIDE", supportLocation: "nearby",
    }))).toBe("D5_R6_AUTOMATIC_SUPPORT_REJECTED");
    expect(throws(() => recordPipingSupportRestraintContext(store, actor, {
      ...base, structuralDesign: true, objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      supportRecordId: "sup-d1", supportFunction: "SPRING", supportLocation: "bay 4 supplied",
    }))).toBe("D5_R6_STRUCTURAL_AUTHORITY_NOT_IN_R6");
    expect(throws(() => recordPipingNdeContext(store, actor, {
      ...base, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      ndeRecordId: "nde-miss", ndeMethod: "UT", extent: "spot", observedStatus: "supplied", evidenceRevision: "b",
    }))).toBe("D5_R6_R5_WELD_REQUIRED");
    expect(throws(() => recordPipingNdeContext(store, actor, {
      ...base, markWeldAccepted: true, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      ndeRecordId: "nde-accept", ndeMethod: "MT", extent: "spot", observedStatus: "supplied", evidenceRevision: "c",
      weldRecordId: weld.weldRecordId, weldRevisionFingerprint: weld.fingerprint,
    }))).toBe("D5_R6_UPSTREAM_MUTATION_REJECTED");
    expect(throws(() => recordPipingPressureLeakTestContext(store, actor, {
      ...base, mutateCondition: true, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      testRecordId: "test-mut", testKind: "LEAK", testReference: "TP-2", observedStatus: "supplied", evidenceRef: "cert",
    }))).toBe("D5_R6_UPSTREAM_MUTATION_REJECTED");
    expect(throws(() => recordPipingPressureLeakTestContext(store, actor, {
      ...base, testPassed: true, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      testRecordId: "test-pass", testKind: "PNEUMATIC", testReference: "TP-3", observedStatus: "supplied", evidenceRef: "cert",
    }))).toBe("D5_R6_REQUIREMENT_NOT_RESULT");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, { ...actor, actorId: "AI-recorder" }, {
      ...base, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-ai", analysisReference: "x", loadCaseId: "LC-9", toolIdentity: "tool", modelRevision: "m",
      sourceAuthority: "analyst", evidenceVersion: "v", assumptions: "a", stressResult: { value: "1", unit: "MPa" },
    }))).toBe("D5_R6_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, sourceBasisRef: "", objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-basis", analysisReference: "x", loadCaseId: "LC-10", toolIdentity: "tool", modelRevision: "m",
      sourceAuthority: "analyst", evidenceVersion: "v", assumptions: "a", stressResult: { value: "1", unit: "MPa" },
    }))).toBe("D5_R6_SOURCE_BASIS_REQUIRED");
    expect(throws(() => recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, assertedFingerprint: "not-canonical", objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-spoof", analysisReference: "x", loadCaseId: "LC-11", toolIdentity: "tool", modelRevision: "m",
      sourceAuthority: "analyst", evidenceVersion: "v", assumptions: "a", stressResult: { value: "2", unit: "MPa" },
    }))).toBe("D5_R6_FINGERPRINT_MISMATCH");
    const revised = recordPipingStressFlexibilityEvidence(store, actor, {
      ...base, predecessorId: "stress-ev-1", objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-ev-2", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-1", toolIdentity: "CAESAR II",
      modelRevision: "model-b", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-02", assumptions: "revised supplied set",
      stressResult: { value: "118", unit: "MPa" },
    });
    expect(revised.predecessorId).toBe("stress-ev-1");
    expect(store.stressEvidence.find((row) => row.evidenceRecordId === "stress-ev-1")?.fingerprint).toBe(stress.fingerprint);
    expect(store.stressEvidence.find((row) => row.evidenceRecordId === "stress-ev-1")?.stressResult).toEqual({ value: "120", unit: "MPa" });
    expect(store.stressEvidence.find((row) => row.evidenceRecordId === "stress-ev-1")?.currentness).toBe("SUPERSEDED");
    expect(JSON.stringify(r3.conditions)).toBe(conditionsBefore);
    expect(JSON.stringify(r5.welds)).toBe(weldsBefore);
    expect(throws(() => repointPipingEvidence())).toBe("D5_R6_AUTO_REPOINT_REJECTED");
    expect(throws(() => calculatePipingStress())).toBe("D5_R6_CALCULATION_NOT_IN_R6");
    expect(throws(() => selectPipingSupport())).toBe("D5_R6_AUTOMATIC_SUPPORT_REJECTED");
    expect(throws(() => validatePipingEngineering())).toBe("D5_R6_VALIDATION_NOT_IN_R6");
    expect(throws(() => determinePipingConformance())).toBe("D5_R6_CONFORMANCE_NOT_IN_R6");
    expect(throws(() => recordPipingRequirement())).toBe("D5_R6_REQUIREMENTS_NOT_IN_R6");
    const source = readFileSync(join(here, "stress-support-test-evidence-context.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("stress-support-test-evidence-context.ts", source)).toEqual([]);
    expect(source.includes("createHash")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies)).toContain("zod");
    expect(Object.keys(packageJson.dependencies)).not.toContain("@rtb/piping-solver");
  });
});
