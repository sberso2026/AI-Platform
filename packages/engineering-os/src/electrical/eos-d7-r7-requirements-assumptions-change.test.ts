import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as ARCHITECTURE_R7_COUNT,
  D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D7_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD7R5Store, recordElectricalCalculationEvidence } from "./calculation-evidence";
import { D7_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD7R4Store, recordElectricalFeederContext } from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, D7_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { D7_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import {
  D7_R7_STARTED,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_REQUIREMENTS_COUNT,
  D7_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD7R6Store,
  recordElectricalProtectionDeviceContext,
  recordElectricalProtectionSetting,
} from "./protection-grounding-hazardous-area-context";
import {
  ADMIN_ACTION_EQUALS_ELECTRICAL_ENGINEERING_DECISION,
  ADMIN_CAN_PROMOTE_D7_CHANGE_TO_ENGINEERING_APPROVAL,
  ADMIN_EQUALS_D7_ENGINEERING_DECISION_AUTHORITY,
  AI_CAN_AUTO_ADOPT_D7_REQUIREMENT,
  AI_CAN_CLOSE_D7_REASSESSMENT_AS_VALIDATED,
  AI_CAN_CREATE_AUTHORITATIVE_D7_ENGINEERING_DECISION,
  AI_CAN_INVENT_AUTHORITATIVE_D7_ELECTRICAL_ASSUMPTION,
  AI_EQUALS_D7_ENGINEERING_DECISION_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_ELECTRICAL_ENGINEERING_DECISION,
  D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD,
  D6_PROCESS_REQUIREMENT_AUTO_ADOPTED_AS_D7_REQUIREMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
  D7_ASSUMPTION_CHANGE_AUTO_INVALIDATES_ALL_DEPENDENTS,
  D7_ASSUMPTION_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D7_CHANGE_AUTO_APPROVES_ENGINEERING,
  D7_CHANGE_AUTO_CERTIFIES_ENGINEERING,
  D7_CHANGE_AUTO_DETERMINES_CONFORMANCE,
  D7_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D7_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D7_CHANGE_AUTO_REVALIDATES_ENGINEERING,
  D7_ELECTRICAL_ASSUMPTION_GOVERNANCE_IMPLEMENTED,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_ELECTRICAL_CHANGE_GOVERNANCE_IMPLEMENTED,
  D7_ELECTRICAL_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED,
  D7_ELECTRICAL_REQUIREMENT_GOVERNANCE_IMPLEMENTED,
  D7_ENGINEERING_DECISION_AUTHORITY_REQUIRED,
  D7_ENGINEERING_DECISION_AUTHORITY_TRACEABLE,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_R1_R6_EXACT_REVISIONS_REUSED,
  D7_R7_CAN_REFERENCE_D4_MECHANICAL_CONTEXT,
  D7_R7_CAN_REFERENCE_D6_PROCESS_REQUIREMENT,
  D7_R7_CHANGE_AUTO_RECALCULATES_LOAD,
  D7_R7_CHANGE_AUTO_RECALCULATES_PROTECTION_SETTING,
  D7_R7_CHANGE_AUTO_RECLASSIFIES_HAZARDOUS_AREA,
  D7_R7_CHANGE_AUTO_REDESIGNS_GROUNDING,
  D7_R7_CHANGE_AUTO_REPOINTS_R1_IDENTITY,
  D7_R7_CHANGE_AUTO_REWRITES_EXTERNAL_EVIDENCE,
  D7_R7_EXPLICIT_DEPENDENT_STALENESS_SUPPORTED,
  D7_R7_EXPLICIT_DEPENDENCY_REQUIRED,
  D7_R7_INFERRED_DEPENDENCY_ALLOWED,
  D7_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED,
  D7_R7_INFORMATION_MAY_APPROVE_ENGINEERING,
  D7_R8_CANONICAL_PHASE,
  D7_R8_STARTED,
  D7_REQUIREMENT_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D7_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D7_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D7_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ELECTRICAL_ASSUMPTION_EQUALS_ENGINEERING_VALIDATED,
  ELECTRICAL_ASSUMPTION_EQUALS_VALIDATED_FACT,
  ELECTRICAL_ENGINEERING_DECISION_EQUALS_APPROVAL,
  EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_PROCESS_REQUIREMENT_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D7_R7_SUBJECT_REVISION_REQUIRED,
  FLOATING_D7_R7_SUBJECT_REFERENCE_ALLOWED,
  MECHANICAL_DUTY_AUTO_ADOPTED_AS_D7_REQUIREMENT,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN,
  PARALLEL_D7_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D7_CHANGE_ENGINE_CREATED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DECISION_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  PARALLEL_D7_REQUIREMENT_ENGINE_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_DESIGN_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  SOURCE_REQUIREMENT_AUTO_ADOPTED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_REQUIREMENT,
  SOURCE_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN,
  SOURCE_REQUIREMENT_EQUALS_VALIDATED_ELECTRICAL_DESIGN,
  STALE_D7_RECORD_EXPOSED_AS_CURRENT,
  SUPERSEDED_D7_DECISION_DELETED,
  SUPERSEDED_D7_DECISION_HISTORY_REPLACED,
  SUPERSEDED_D7_RECORD_DELETED,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EXPOSED_AS_CURRENT,
  closeElectricalReassessmentAsValidated,
  createD7R7Store,
  inferElectricalChangeDependency,
  recalculateElectricalFromChange,
  recordAdoptedElectricalRequirement,
  recordElectricalAssumption,
  recordElectricalChange,
  recordElectricalEngineeringDecision,
  recordElectricalReassessment,
  recordElectricalSourceRequirement,
  redesignElectricalFromChange,
  revalidateElectricalFromChange,
  markElectricalDependentCurrentness,
} from "./requirements-assumptions-change";
import { D7_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD7R2Store, recordElectricalSystemContext } from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R7 requirements assumptions and change", () => {
  it("records Electrical requirements, assumptions, decisions, and change without recalculating engineering", () => {
    expect(D7_R1_R6_EXACT_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D7_R7_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D7_R7_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R6_REQUIREMENTS_COUNT).toBe(0);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_R7_COUNT).toBe(0);
    expect(D7_RUNTIME_STARTED).toBe(true);
    expect(D7_RUNTIME_COUNT).toBe(7);
    expect(D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D7_R7_STARTED).toBe(false);
    expect(D7_R8_STARTED).toBe(false);
    expect(D7_R8_CANONICAL_PHASE).toBe("EOS-D7-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS");
    expect(D7_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE).toBe(true);
    expect(PARALLEL_D7_REQUIREMENT_ENGINE_CREATED).toBe(false);
    expect(D7_ELECTRICAL_REQUIREMENT_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_REQUIREMENT).toBe(false);
    expect(SOURCE_REQUIREMENT_AUTO_ADOPTED).toBe(false);
    expect(SOURCE_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN).toBe(false);
    expect(SOURCE_REQUIREMENT_EQUALS_VALIDATED_ELECTRICAL_DESIGN).toBe(false);
    expect(D7_R7_CAN_REFERENCE_D6_PROCESS_REQUIREMENT).toBe(true);
    expect(EXACT_D6_PROCESS_REQUIREMENT_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN).toBe(false);
    expect(D6_PROCESS_REQUIREMENT_AUTO_ADOPTED_AS_D7_REQUIREMENT).toBe(false);
    expect(D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD).toBe(false);
    expect(D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN).toBe(false);
    expect(D7_R7_CAN_REFERENCE_D4_MECHANICAL_CONTEXT).toBe(true);
    expect(EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN).toBe(false);
    expect(MECHANICAL_DUTY_AUTO_ADOPTED_AS_D7_REQUIREMENT).toBe(false);
    expect(D7_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D7_ASSUMPTION_ENGINE_CREATED).toBe(false);
    expect(D7_ELECTRICAL_ASSUMPTION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(ELECTRICAL_ASSUMPTION_EQUALS_VALIDATED_FACT).toBe(false);
    expect(ELECTRICAL_ASSUMPTION_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D7_ELECTRICAL_ASSUMPTION).toBe(false);
    expect(D7_REUSES_CANONICAL_DECISION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D7_DECISION_ENGINE_CREATED).toBe(false);
    expect(D7_ELECTRICAL_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(AI_RECOMMENDATION_EQUALS_ELECTRICAL_ENGINEERING_DECISION).toBe(false);
    expect(ADMIN_ACTION_EQUALS_ELECTRICAL_ENGINEERING_DECISION).toBe(false);
    expect(ELECTRICAL_ENGINEERING_DECISION_EQUALS_APPROVAL).toBe(false);
    expect(D7_ENGINEERING_DECISION_AUTHORITY_REQUIRED).toBe(true);
    expect(D7_ENGINEERING_DECISION_AUTHORITY_TRACEABLE).toBe(true);
    expect(AI_EQUALS_D7_ENGINEERING_DECISION_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D7_ENGINEERING_DECISION_AUTHORITY).toBe(false);
    expect(D7_REUSES_CANONICAL_CHANGE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D7_CHANGE_ENGINE_CREATED).toBe(false);
    expect(D7_ELECTRICAL_CHANGE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D7_R7_EXPLICIT_DEPENDENCY_REQUIRED).toBe(true);
    expect(D7_R7_INFERRED_DEPENDENCY_ALLOWED).toBe(false);
    expect(D7_R7_EXPLICIT_DEPENDENT_STALENESS_SUPPORTED).toBe(true);
    expect(D7_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED).toBe(false);
    expect(D7_R7_CHANGE_AUTO_REPOINTS_R1_IDENTITY).toBe(false);
    expect(D7_R7_CHANGE_AUTO_RECALCULATES_LOAD).toBe(false);
    expect(D7_R7_CHANGE_AUTO_RECALCULATES_PROTECTION_SETTING).toBe(false);
    expect(D7_R7_CHANGE_AUTO_REWRITES_EXTERNAL_EVIDENCE).toBe(false);
    expect(D7_R7_CHANGE_AUTO_REDESIGNS_GROUNDING).toBe(false);
    expect(D7_R7_CHANGE_AUTO_RECLASSIFIES_HAZARDOUS_AREA).toBe(false);
    expect(D7_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D7_CHANGE_AUTO_REDESIGNS_ENGINEERING).toBe(false);
    expect(D7_CHANGE_AUTO_REVALIDATES_ENGINEERING).toBe(false);
    expect(D7_CHANGE_AUTO_APPROVES_ENGINEERING).toBe(false);
    expect(D7_CHANGE_AUTO_DETERMINES_CONFORMANCE).toBe(false);
    expect(D7_CHANGE_AUTO_CERTIFIES_ENGINEERING).toBe(false);
    expect(D7_ASSUMPTION_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D7_ASSUMPTION_CHANGE_AUTO_INVALIDATES_ALL_DEPENDENTS).toBe(false);
    expect(D7_REQUIREMENT_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(SUPERSEDED_D7_RECORD_DELETED).toBe(false);
    expect(SUPERSEDED_D7_RECORD_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_D7_DECISION_DELETED).toBe(false);
    expect(SUPERSEDED_D7_DECISION_HISTORY_REPLACED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_DESIGN_INVALID).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(D7_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D7_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(STALE_D7_RECORD_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D7_RECORD_EXPOSED_AS_CURRENT).toBe(false);
    expect(D7_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(PARALLEL_D7_DIGITAL_THREAD_CREATED).toBe(false);
    expect(D7_EXPLICIT_LINEAGE_REQUIRED).toBe(true);
    expect(D7_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D7_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D7_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(AI_CAN_AUTO_ADOPT_D7_REQUIREMENT).toBe(false);
    expect(AI_CAN_CREATE_AUTHORITATIVE_D7_ENGINEERING_DECISION).toBe(false);
    expect(AI_CAN_CLOSE_D7_REASSESSMENT_AS_VALIDATED).toBe(false);
    expect(ADMIN_CAN_PROMOTE_D7_CHANGE_TO_ENGINEERING_APPROVAL).toBe(false);
    expect(D7_R7_INFORMATION_MAY_APPROVE_ENGINEERING).toBe(false);
    expect(D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: "ELECTRICAL_SYSTEM" | "ELECTRICAL_LOAD" | "ELECTRICAL_FEEDER" | "ELECTRICAL_PROTECTION_CONTEXT" | "ELECTRICAL_CALCULATION_EVIDENCE") =>
      recordElectricalObjectIdentity(r1, who, { objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}` });
    const system = identity("sys-1", "ELECTRICAL_SYSTEM");
    const load = identity("load-1", "ELECTRICAL_LOAD");
    const feeder = identity("feeder-1", "ELECTRICAL_FEEDER");
    const deviceObject = identity("device-1", "ELECTRICAL_PROTECTION_CONTEXT");
    const evidenceObject = identity("evidence-1", "ELECTRICAL_CALCULATION_EVIDENCE");
    const identityFingerprint = load.fingerprint;
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    const systemContext = recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const feederContext = recordElectricalFeederContext(r4, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "DISTRIBUTION_FEEDER" });
    const r5 = createD7R5Store(r1, r4);
    const protectionEvidence = recordElectricalCalculationEvidence(r5, who, {
      contextId: "ctx-1",
      objectId: evidenceObject.objectId,
      objectRevisionFingerprint: evidenceObject.fingerprint,
      subjectObjectId: deviceObject.objectId,
      subjectRevisionFingerprint: deviceObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-evidence",
      sourceBasisRef: "basis-evidence",
      sourceOrigin: "EXTERNAL_ENGINEERING_SOFTWARE",
      sourceToolName: "ETAP",
      sourceToolVersion: "22.0",
      sourceOrganization: "External study office",
      applicability: "Applies only to evidence-1 and device-1",
      limitations: "Supplied study evidence is not an EOS calculation",
      assumptions: ["External study assumption retained"],
      inputs: [{ name: "SUPPLIED_INPUT", value: "10", unit: "kA" }],
      evidenceId: "evidence-protection",
      evidenceClass: "PROTECTION_COORDINATION",
      sourceDocumentRef: "RPT-PROTECTION",
      results: [{ name: "SUPPLIED_RESULT", value: "12", unit: "kA" }],
    });
    const r6 = createD7R6Store(r1, r5);
    const governed = { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6", sourceBasisRef: "basis-r6" };
    const device = recordElectricalProtectionDeviceContext(r6, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), deviceRecordId: "device-rec", deviceClass: "BREAKER" });
    const suppliedSetting = recordElectricalProtectionSetting(r6, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-supplied", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", protectionEvidenceId: protectionEvidence.evidenceId, protectionEvidenceRevisionFingerprint: protectionEvidence.fingerprint, jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference" });
    const store = createD7R7Store(r1, r6, {
      process: { requirements: [{ requirementId: "pr-1", fingerprint: "fp-process", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" }] },
      mechanical: { records: [{ recordId: "mech-1", fingerprint: "fp-mech", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" }] },
    });
    const requirementBase = { ...bound(load.objectId, load.fingerprint), statement: "Retain the supplied continuous load basis", requirementCategory: "DESIGN_INPUT", sourceClass: "D6_PROCESS_REQUIREMENT", sourceRef: "PR-LOAD-001", sourceRevision: "rev-2", processRequirementId: "pr-1", processRequirementFingerprint: "fp-process" };
    const source = recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-source", requirementRole: "SOURCE_REQUIREMENT" });
    const candidate = recordElectricalSourceRequirement(store, who, { ...bound(load.objectId, load.fingerprint), requirementId: "req-candidate", statement: "Candidate owner constraint for the same load", requirementRole: "CANDIDATE_REQUIREMENT", requirementCategory: "DESIGN_CRITERIA", sourceClass: "OWNER_REQUIREMENT", sourceRef: "OWN-014", sourceRevision: "rev-1" });
    const mechanical = recordElectricalSourceRequirement(store, who, { ...bound(load.objectId, load.fingerprint), requirementId: "req-mech", statement: "Mechanical duty is cited and not adopted as motor design", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D4_MECHANICAL_CONTEXT", sourceRef: "MECH-DUTY-7", sourceRevision: "rev-4", mechanicalRecordId: "mech-1", mechanicalRevisionFingerprint: "fp-mech" });
    const adopted = recordAdoptedElectricalRequirement(store, who, { ...requirementBase, requirementId: "req-adopted", sourceRequirementId: source.requirementId, adoptionRationale: "Explicit adoption of the cited process requirement" });
    const assumption = recordElectricalAssumption(store, who, { ...bound(load.objectId, load.fingerprint), assumptionId: "asm-1", statement: "Ambient grouping remains as supplied", materiality: "medium" });
    const decision = recordElectricalEngineeringDecision(store, who, { ...bound(load.objectId, load.fingerprint), decisionId: "dec-1", statement: "Keep the supplied load basis until reassessment", alternatives: [{ id: "alt-keep", statement: "Keep the supplied basis", is_selected: true }, { id: "alt-hold", statement: "Hold for later reassessment", is_selected: false }] });
    const decisionHistory = store.history.filter((row) => row.subjectId === decision.decisionId).map((row) => row.fingerprint);
    const successor = recordElectricalEngineeringDecision(store, who, { ...bound(load.objectId, load.fingerprint), decisionId: "dec-2", statement: "Supersede the prior basis decision without deleting it", predecessorDecisionId: decision.decisionId, alternatives: [{ id: "alt-next", statement: "Record a successor decision", is_selected: true }] });
    const change = recordElectricalChange(store, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-1", changeCategory: "R3_LOAD_CHANGED", reason: "The cited load requirement changed", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }] });
    const stale = markElectricalDependentCurrentness(store, who, { ...bound(load.objectId, load.fingerprint), markId: "mark-1", changeId: change.changeId, targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, mark: "STALE" });
    const required = recordElectricalReassessment(store, who, { ...bound(load.objectId, load.fingerprint), reassessmentId: "ras-required", changeId: change.changeId, targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const completed = recordElectricalReassessment(store, who, { ...bound(load.objectId, load.fingerprint), reassessmentId: "ras-completed", changeId: change.changeId, targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, state: "REASSESSMENT_COMPLETED" });
    const replay = recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-source", requirementRole: "SOURCE_REQUIREMENT", assertedFingerprint: source.fingerprint });

    expect(replay).toBe(source);
    expect(source.adopted).toBe(false);
    expect(source.designSatisfied).toBe(false);
    expect(source.processRequirementId).toBe("pr-1");
    expect(source.processRequirementFingerprint).toBe("fp-process");
    expect(candidate.adopted).toBe(false);
    expect(candidate.requirementRole).toBe("CANDIDATE_REQUIREMENT");
    expect(mechanical.adopted).toBe(false);
    expect(mechanical.mechanicalRecordId).toBe("mech-1");
    expect(adopted.adopted).toBe(true);
    expect(adopted.requirementRole).toBe("ADOPTED_ELECTRICAL_REQUIREMENT");
    expect(adopted.designSatisfied).toBe(false);
    expect(adopted.approved).toBe(false);
    expect(adopted.engineeringValidated).toBe(false);
    expect(source.adopted).toBe(false);
    expect(store.requirements.find((row) => row.requirementId === source.requirementId)?.recordStatus).toBe("CURRENT");
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.validatedFact).toBe(false);
    expect(assumption.engineeringValidated).toBe(false);
    expect(decision.authoritativeDecision).toBe(true);
    expect(decision.aiRecommendation).toBe(false);
    expect(decision.adminAction).toBe(false);
    expect(decision.authority).toBe(D7_CONTEXT_AUTHORITY);
    expect(decision.recordedBy).toBe(who.actorId);
    expect(decision.approved).toBe(false);
    expect(successor.predecessorId).toBe(decision.decisionId);
    expect(store.decisions.find((row) => row.decisionId === decision.decisionId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.decisions.find((row) => row.decisionId === decision.decisionId)?.currentness).toBe("SUPERSEDED");
    expect(store.decisions).toHaveLength(2);
    expect(decisionHistory.every((item) => store.history.some((row) => row.subjectId === decision.decisionId && row.fingerprint === item))).toBe(true);
    expect(change.dependencies).toHaveLength(1);
    expect(change.recalculated).toBe(false);
    expect(change.redesigned).toBe(false);
    expect(change.approved).toBe(false);
    expect(stale.mark).toBe("STALE");
    expect(stale.exposedAsCurrent).toBe(false);
    expect(required.state).toBe("REASSESSMENT_REQUIRED");
    expect(required.validationFailed).toBe(false);
    expect(required.designInvalid).toBe(false);
    expect(required.approved).toBe(false);
    expect(completed.state).toBe("REASSESSMENT_COMPLETED");
    expect(completed.engineeringValidated).toBe(false);
    expect(completed.approved).toBe(false);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(suppliedLoad.fingerprint).toBe(suppliedLoad.fingerprint);
    expect(suppliedLoad.adopted).toBe(false);
    expect(suppliedSetting.suppliedValue).toBe("800");
    expect(suppliedSetting.calculated).toBe(false);
    expect(suppliedSetting.adopted).toBe(false);
    expect(device.fingerprint).toBe(device.fingerprint);
    expect(feederContext.protectionCoordination).toBe(false);
    expect(protectionEvidence.results[0]?.value).toBe("12");
    expect(protectionEvidence.eosCalculated).toBe(false);
    expect(systemContext.fingerprint).toBe(systemContext.fingerprint);
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(assumption.recordStatus).toBe("CURRENT");
    expect(store.assumptions.find((row) => row.assumptionId === assumption.assumptionId)?.recordStatus).toBe("CURRENT");

    expect(() => createD7R7Store(createD7R1Store(), r6)).toThrow(/R1_R6_STORE_MISMATCH/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-auto", requirementRole: "SOURCE_REQUIREMENT", autoAdopt: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-float", requirementRole: "SOURCE_REQUIREMENT", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-spoof-d6", requirementRole: "SOURCE_REQUIREMENT", processRequirementFingerprint: "spoof" })).toThrow(/D6_REVISION_MISMATCH/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...bound(load.objectId, load.fingerprint), requirementId: "req-d4-missing", statement: "Missing mechanical revision", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D4_MECHANICAL_CONTEXT", sourceRef: "MECH-MISSING", sourceRevision: "rev-9" })).toThrow(/D4_REVISION_REQUIRED/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-dup", requirementRole: "SOURCE_REQUIREMENT" })).toThrow(/DUPLICATE_REQUIREMENT_REJECTED/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-source", requirementRole: "SOURCE_REQUIREMENT", assertedFingerprint: "spoof" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordElectricalSourceRequirement(store, who, { ...requirementBase, requirementId: "req-tenant", requirementRole: "SOURCE_REQUIREMENT", tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordElectricalSourceRequirement(store, actor({ authority: "AI_ASSISTANT" }), { ...requirementBase, requirementId: "req-ai", requirementRole: "SOURCE_REQUIREMENT" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalAssumption(store, actor({ authority: "ADMIN" }), { ...bound(load.objectId, load.fingerprint), assumptionId: "asm-admin", statement: "Admin cannot author an assumption" })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalAssumption(store, who, { ...bound(load.objectId, load.fingerprint), assumptionId: "asm-fact", statement: "This is not a validated fact", validationStatus: "validated" })).toThrow(/ASSUMPTION_NOT_VALIDATED_FACT/);
    expect(() => recordElectricalEngineeringDecision(store, who, { ...bound(load.objectId, load.fingerprint), decisionId: "dec-ai", statement: "An AI recommendation is not a decision", aiRecommendation: true, alternatives: [{ id: "alt-ai", statement: "Recommended only", is_selected: true }] })).toThrow(/AI_DECISION_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-empty", changeCategory: "REQUIREMENT_CHANGED", reason: "No dependency supplied", dependencies: [] })).toThrow(/EXPLICIT_DEPENDENCY_REQUIRED/);
    expect(() => recordElectricalChange(store, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-infer", changeCategory: "REQUIREMENT_CHANGED", reason: "Name match is not a dependency", dependencies: [{ kind: "topology", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }] })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-same", changeCategory: "R3_LOAD_CHANGED", reason: "Same voltage is not a dependency", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, inferred: true, inference: "same_voltage" }] })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => markElectricalDependentCurrentness(store, who, { ...bound(load.objectId, load.fingerprint), markId: "mark-setting", changeId: change.changeId, targetKind: "R6_SETTING", targetId: suppliedSetting.settingRecordId, targetFingerprint: suppliedSetting.fingerprint, mark: "STALE" })).toThrow(/DEPENDENCY_REVISION_MISMATCH/);
    expect(() => markElectricalDependentCurrentness(store, who, { ...bound(load.objectId, load.fingerprint), markId: "mark-all", changeId: change.changeId, targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, mark: "STALE", invalidateAllDependents: true })).toThrow(/INFERRED_STALENESS_REJECTED/);
    expect(() => markElectricalDependentCurrentness(store, who, { ...bound(load.objectId, load.fingerprint), markId: "mark-expose", changeId: change.changeId, targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, mark: "STALE", exposeStaleAsCurrent: true })).toThrow(/STALE_NOT_CURRENT/);
    expect(() => recordElectricalReassessment(store, who, { ...bound(load.objectId, load.fingerprint), reassessmentId: "ras-close", changeId: change.changeId, targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, state: "REASSESSMENT_COMPLETED", closeReassessmentAsValidated: true })).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(() => recordElectricalChange(store, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-load", changeCategory: "R3_LOAD_CHANGED", reason: "Do not recalculate the load", dependencies: [{ kind: "PARENT", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }], recalculateLoad: true })).toThrow(/LOAD_RECALCULATION_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(feeder.objectId, feeder.fingerprint), changeId: "chg-cable", changeCategory: "R4_FEEDER_CHANGED", reason: "Do not size the feeder", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R4_FEEDER", targetId: feederContext.feederRecordId, targetFingerprint: feederContext.fingerprint }], sizeFeeder: true })).toThrow(/CABLE_RECALCULATION_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(deviceObject.objectId, deviceObject.fingerprint), changeId: "chg-protect", changeCategory: "R6_PROTECTION_CHANGED", reason: "Do not recalculate the setting", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_SETTING", targetId: suppliedSetting.settingRecordId, targetFingerprint: suppliedSetting.fingerprint }], recalculateProtection: true })).toThrow(/PROTECTION_RECALCULATION_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(evidenceObject.objectId, evidenceObject.fingerprint), changeId: "chg-evidence", changeCategory: "R5_EVIDENCE_CHANGED", reason: "Do not rewrite external evidence", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R5_EVIDENCE", targetId: protectionEvidence.evidenceId, targetFingerprint: protectionEvidence.fingerprint }], rewriteEvidence: true })).toThrow(/EVIDENCE_RECALCULATION_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(system.objectId, system.fingerprint), changeId: "chg-system", changeCategory: "R2_CONTEXT_CHANGED", reason: "Do not reconfigure the system", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R2_SYSTEM", targetId: systemContext.systemRecordId, targetFingerprint: systemContext.fingerprint }], reconfigureSystem: true })).toThrow(/TOPOLOGY_REDESIGN_REJECTED/);
    expect(() => recordElectricalChange(store, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-identity", changeCategory: "R1_IDENTITY_CHANGED", reason: "Do not repoint identity", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R1_IDENTITY", targetId: load.objectId, targetFingerprint: load.fingerprint }], repointIdentity: true })).toThrow(/IDENTITY_REWRITE_REJECTED/);
    expect(() => recalculateElectricalFromChange()).toThrow(/LOAD_RECALCULATION_REJECTED/);
    expect(() => redesignElectricalFromChange()).toThrow(/TOPOLOGY_REDESIGN_REJECTED/);
    expect(() => revalidateElectricalFromChange()).toThrow(/REVALIDATION_REJECTED/);
    expect(() => inferElectricalChangeDependency()).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => closeElectricalReassessmentAsValidated()).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(suppliedSetting.suppliedValue).toBe("800");
    expect(protectionEvidence.results[0]?.value).toBe("12");
    expect(feederContext.protectionCoordination).toBe(false);
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "requirements-assumptions-change.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
