import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D2_CONTEXT_AUTHORITY,
  D2_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  createD2R1Store,
  recordCivilContext,
  recordCivilObjectIdentity,
  type D2R1Actor,
} from "./identity-foundation";
import { D2_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD2R2Store, recordSpatialReference, recordSurfaceContext, recordSurveySourceContext } from "./spatial-surface-context";
import { D2_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD2R3Store, recordGradingContext } from "./grading-earthworks-context";
import { D2_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD2R4Store, recordRoadsAccessContext } from "./roads-access-context";
import { D2_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD2R5Store, recordDrainageStormwaterContext } from "./drainage-stormwater-context";
import {
  D2_R7_STARTED as R6_R7_STARTED,
  D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R6_REQUIREMENTS_READY,
  D2_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD2R6Store,
  recordCivilUtilityCorridorContext,
} from "./utility-corridor-context";
import {
  AI_CAN_APPROVE_CIVIL_ASSUMPTION,
  AI_CAN_APPROVE_CIVIL_CHANGE,
  AI_CAN_APPROVE_CIVIL_DECISION,
  AI_CAN_APPROVE_CIVIL_REQUIREMENT,
  AI_CAN_INVENT_AUTHORITATIVE_CIVIL_ASSUMPTION,
  AI_CAN_INVENT_AUTHORITATIVE_CIVIL_REQUIREMENT,
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_CIVIL_ENGINEERING_DECISION,
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  ASSUMPTION_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  CANONICAL_ASSUMPTION_GOVERNANCE_REUSED,
  CANONICAL_CHANGE_GOVERNANCE_REUSED,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_DECISION_GOVERNANCE_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  CANONICAL_REQUIREMENT_GOVERNANCE_REUSED,
  D2_ASSUMPTION_AUTO_REDESIGN_RUNTIME_COUNT,
  D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT,
  D2_CHANGE_AUTO_REDESIGN_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_ASSUMPTION_RUNTIME_IMPLEMENTED,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_CHANGE_CONTEXT_RUNTIME_IMPLEMENTED,
  D2_CIVIL_DECISION_RUNTIME_IMPLEMENTED,
  D2_CIVIL_REQUIREMENT_RUNTIME_IMPLEMENTED,
  D2_CIVIL_REVIEW_RUNTIME_COUNT,
  D2_CIVIL_VALIDATION_RUNTIME_COUNT,
  D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D2_DECISION_AUTO_REDESIGN_RUNTIME_COUNT,
  D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT,
  D2_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT,
  D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT,
  D2_QUANTITY_CALCULATION_RUNTIME_COUNT,
  D2_R7_HISTORY_PRESERVED,
  D2_R7_MATURITY,
  D2_R7_PROVENANCE_PRESERVED,
  D2_R7_PROVENANCE_REQUIRED,
  D2_R7_STATUS,
  D2_R8_CANONICAL_PHASE,
  D2_R8_PHASE_TYPE,
  D2_R8_STARTED,
  D2_REQUIREMENT_AUTO_REDESIGN_RUNTIME_COUNT,
  D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D3_D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DECISION_PRESENT_EQUALS_ENGINEERING_APPROVED,
  DECISION_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  EXACT_D2_OBJECT_REFERENCE_REQUIRED,
  EXPLICIT_D2_CHANGE_RELATIONSHIPS_SUPPORTED,
  FLOATING_D2_OBJECT_REFERENCE_ALLOWED,
  INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D2_CURRENTNESS_ENGINE_CREATED,
  REASSESSMENT_REQUIRED_EQUALS_AUTOMATIC_RECALCULATION,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_VALIDATED,
  REQUIREMENT_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  REQUIREMENT_PRESENT_EQUALS_REQUIREMENT_SATISFIED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D2_R7_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D2_R7_SCOPE_ENFORCED,
  calculateFromGovernance,
  createD2R7Store,
  mutateRequirementsAssumptionsChange,
  recordCivilAssumption,
  recordCivilChange,
  recordCivilDecision,
  recordCivilRequirement,
  redesignCivil,
} from "./requirements-assumptions-change";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

describe("EOS-D2-R7 requirements assumptions and change", () => {
  it("records governed Civil requirements, assumptions, decisions, and explicit reassessment without redesign", () => {
    expect(D2_R7_STATUS).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D2_R7_MATURITY).toBe(D2_R7_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(R6_REQUIREMENTS_READY).toBe(false);
    expect(R6_R7_STARTED).toBe(false);
    expect(CANONICAL_REQUIREMENT_GOVERNANCE_REUSED).toBe(true);
    expect(CANONICAL_ASSUMPTION_GOVERNANCE_REUSED).toBe(true);
    expect(CANONICAL_DECISION_GOVERNANCE_REUSED).toBe(true);
    expect(CANONICAL_CHANGE_GOVERNANCE_REUSED).toBe(true);
    expect(EXACT_D2_OBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D2_OBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D2_CIVIL_REQUIREMENT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_ASSUMPTION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_DECISION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_CHANGE_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(AI_CAN_INVENT_AUTHORITATIVE_CIVIL_REQUIREMENT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_CIVIL_ASSUMPTION).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_REQUIREMENT_SATISFIED).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(ASSUMPTION_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_RECOMMENDATION_EQUALS_CIVIL_ENGINEERING_DECISION).toBe(false);
    expect(DECISION_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(DECISION_PRESENT_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(EXPLICIT_D2_CHANGE_RELATIONSHIPS_SUPPORTED).toBe(true);
    expect(INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_AUTOMATIC_RECALCULATION).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_APPROVE_CIVIL_REQUIREMENT).toBe(false);
    expect(AI_CAN_APPROVE_CIVIL_ASSUMPTION).toBe(false);
    expect(AI_CAN_APPROVE_CIVIL_DECISION).toBe(false);
    expect(AI_CAN_APPROVE_CIVIL_CHANGE).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D2_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D2_R7_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_R7_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D2_R7_MUTATION_ALLOWED).toBe(false);
    expect(D2_R7_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D2_R7_SCOPE_ENFORCED).toBe(true);
    expect(D2_REQUIREMENT_AUTO_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_ASSUMPTION_AUTO_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_DECISION_AUTO_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_CHANGE_AUTO_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT).toBe(0);
    expect(D2_QUANTITY_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_REVIEW_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT).toBe(0);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D2_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(false);
    expect(D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D3_D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D2_R8_STARTED).toBe(false);
    expect(D2_R8_CANONICAL_PHASE).toBe("EOS-D2-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS");
    expect(D2_R8_PHASE_TYPE).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS");

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const object = (objectId: string, objectType: "COORDINATE_REFERENCE" | "SURVEY_SOURCE" | "SURFACE_REFERENCE" | "GRADING_ZONE" | "CIVIL_SITE" | "ROAD_ALIGNMENT" | "ROAD_PROFILE" | "ROAD_CORRIDOR" | "PAVEMENT_CONTEXT" | "DRAINAGE_CATCHMENT" | "DRAINAGE_NETWORK" | "DRAINAGE_NODE" | "DRAINAGE_LINK" | "CIVIL_UTILITY_CORRIDOR" | "TRENCH" | "PIT" | "CROSSING" | "CLEARANCE_ENVELOPE" | "CIVIL_REQUIREMENT" | "CIVIL_ASSUMPTION" | "CIVIL_DECISION" | "CIVIL_EVIDENCE_REFERENCE") =>
      recordCivilObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef: `prov-${objectId}` });
    const coordinate = object("crs-object", "COORDINATE_REFERENCE");
    const surveyObject = object("survey-object", "SURVEY_SOURCE");
    const surfaceObject = object("surface-object", "SURFACE_REFERENCE");
    const gradingObject = object("grading-object", "GRADING_ZONE");
    const site = object("site-object", "CIVIL_SITE");
    const alignment = object("alignment-object", "ROAD_ALIGNMENT");
    const profile = object("profile-object", "ROAD_PROFILE");
    const roadCorridor = object("road-corridor-object", "ROAD_CORRIDOR");
    const pavement = object("pavement-object", "PAVEMENT_CONTEXT");
    const catchment = object("catchment-object", "DRAINAGE_CATCHMENT");
    const network = object("network-object", "DRAINAGE_NETWORK");
    const node = object("node-a", "DRAINAGE_NODE");
    const link = object("link-a", "DRAINAGE_LINK");
    const corridor = object("utility-corridor-object", "CIVIL_UTILITY_CORRIDOR");
    const trench = object("trench-a", "TRENCH");
    const pit = object("pit-object", "PIT");
    const crossing = object("crossing-a", "CROSSING");
    const clearance = object("clearance-object", "CLEARANCE_ENVELOPE");
    const requirementObject = object("requirement-object", "CIVIL_REQUIREMENT");
    const assumptionObject = object("assumption-object", "CIVIL_ASSUMPTION");
    const decisionObject = object("decision-object", "CIVIL_DECISION");
    const evidence = object("evidence-object", "CIVIL_EVIDENCE_REFERENCE");
    const r2 = createD2R2Store(r1);
    const spatial = recordSpatialReference(r2, actor, {
      spatialReferenceId: "spatial-1",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    });
    const survey = recordSurveySourceContext(r2, actor, {
      surveySourceId: "survey-1",
      contextId: context.contextId,
      objectId: surveyObject.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      sourceType: "CONTROL_SURVEY",
      sourceRevision: "rev-a",
      provenanceRef: "prov-survey",
      citedCurrentness: "CURRENT",
    });
    const existing = recordSurfaceContext(r2, actor, {
      surfaceContextId: "surface-existing",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "EXISTING_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      surveySourceId: survey.surveySourceId,
      sourceReference: "survey-1",
      revision: "s-rev-a",
      provenanceRef: "prov-existing",
      citedCurrentness: "CURRENT",
    });
    const design = recordSurfaceContext(r2, actor, {
      surfaceContextId: "surface-design",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "DESIGN_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      sourceReference: "design-reference",
      revision: "d-rev-a",
      provenanceRef: "prov-design",
      citedCurrentness: "CURRENT",
    });
    const r3 = createD2R3Store(r2);
    const grading = recordGradingContext(r3, actor, {
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      criteria: [{ kind: "TARGET_FINISHED_LEVEL", suppliedValue: "RL 12.50", sourceRef: "criteria-source" }],
      relationships: [],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    });
    const r4 = createD2R4Store(r3);
    const road = recordRoadsAccessContext(r4, actor, {
      roadsContextId: "road-1",
      contextId: context.contextId,
      alignmentObjectId: alignment.objectId,
      profileObjectId: profile.objectId,
      corridorObjectId: roadCorridor.objectId,
      pavementObjectId: pavement.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      criteria: [{ kind: "DESIGN_SPEED", suppliedValue: "60 km/h", sourceRef: "road-authority" }],
      accessRelationships: [{ kind: "OBJECT_REFERENCE", accessRole: "ROAD_TO_SITE", targetObjectId: site.objectId }],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      pavementTypeReference: null,
      subgradeReference: null,
      trafficCriterionReference: null,
      standardsReference: null,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-road",
      citedCurrentness: "CURRENT",
    });
    const r5 = createD2R5Store(r4);
    const drainage = recordDrainageStormwaterContext(r5, actor, {
      drainageContextId: "drainage-1",
      contextId: context.contextId,
      catchmentObjectId: catchment.objectId,
      catchmentBoundaryReference: "boundary-ref-a",
      rainfallObjectId: null,
      networkObjectId: network.objectId,
      nodeObjectIds: [node.objectId],
      linkObjectIds: [link.objectId],
      pitObjectIds: [],
      manholeObjectIds: [],
      channelObjectId: null,
      culvertObjectId: null,
      outfallObjectId: null,
      detentionObjectId: null,
      pipeReference: null,
      floodLevelReference: null,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      rainfallCriteria: [],
      runoffCriteria: [],
      relationships: [],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      standardsReference: null,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-drainage",
      citedCurrentness: "CURRENT",
    });
    const r6 = createD2R6Store(r5);
    const utility = recordCivilUtilityCorridorContext(r6, actor, {
      utilityContextId: "utility-1",
      contextId: context.contextId,
      corridorObjectId: corridor.objectId,
      trenchObjectIds: [trench.objectId],
      pitObjectIds: [pit.objectId],
      crossingObjectIds: [crossing.objectId],
      clearanceEnvelopeObjectId: clearance.objectId,
      reservedSpaceReference: "cited-reserved-space",
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      drainageContextId: drainage.drainageContextId,
      criteria: [{ kind: "CORRIDOR_CLASSIFICATION", suppliedValue: "cited shared services", sourceRef: "corridor-authority" }],
      relationships: [{ kind: "OBJECT_REFERENCE", utilityRole: "CORRIDOR_TO_GRADING", targetObjectId: gradingObject.objectId }],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-utility",
      citedCurrentness: "CURRENT",
    });
    const store = createD2R7Store(r6);
    const gradingFingerprint = grading.fingerprint;
    const roadFingerprint = road.fingerprint;
    const drainageFingerprint = drainage.fingerprint;
    const utilityFingerprint = utility.fingerprint;
    const gradingIdentity = r1.objects.find((row) => row.objectId === gradingObject.objectId);
    const requirement = recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: [corridor.objectId, gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
    });
    expect(requirement.requirementSatisfied).toBe(false);
    expect(requirement.engineeringValidated).toBe(false);
    expect(requirement.affectedObjectIds).toEqual(["grading-object", "utility-corridor-object"]);
    expect(requirement.fingerprint).toBe(fingerprintCanonical({
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: ["grading-object", "utility-corridor-object"],
      jurisdictionProfileId: "apac-other",
      requirementStatus: "PLANNED",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorRequirementContextId: null,
    }));
    expect(recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: [gradingObject.objectId, corridor.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
    }).fingerprint).toBe(requirement.fingerprint);
    const assumption = recordCivilAssumption(store, actor, {
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
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.authoritativeAdopted).toBe(true);
    expect(assumption.engineeringValidated).toBe(false);
    const candidate = recordCivilAssumption(store, actor, {
      assumptionContextId: "assumption-candidate",
      contextId: context.contextId,
      objectId: assumptionObject.objectId,
      statement: "Candidate only: a later survey may revise the surface.",
      sourceRef: "survey-authority",
      rationale: "Not adopted.",
      affectedObjectIds: [gradingObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      candidateSuggestion: true,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-assumption-candidate",
      citedCurrentness: "CURRENT",
    });
    expect(candidate.adoption).toBe("CANDIDATE");
    expect(candidate.authoritativeAdopted).toBe(false);
    const decision = recordCivilDecision(store, actor, {
      decisionContextId: "decision-1",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "Retain the cited finished level.",
      rationale: "The requirement and assumption were supplied.",
      authorityRole: "DECISION_AUTHORITY",
      alternatives: [
        { id: "alt-hold", statement: "Hold the cited level.", is_selected: true },
        { id: "alt-lower", statement: "Lower the cited level." },
      ],
      affectedObjectIds: [gradingObject.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-decision",
      citedCurrentness: "CURRENT",
    });
    expect(decision.engineeringApproved).toBe(false);
    expect(decision.engineeringValidated).toBe(false);
    expect(decision.authority).toBe(D2_CONTEXT_AUTHORITY);
    const change = recordCivilChange(store, actor, {
      changeContextId: "change-1",
      contextId: context.contextId,
      initiatingSource: "survey-revision-note",
      changedObjectId: gradingObject.objectId,
      affectedRelationships: [
        { kind: "PARENT", targetObjectId: gradingObject.objectId },
        { kind: "OBJECT_REFERENCE", targetObjectId: corridor.objectId },
      ],
      rationale: "The cited survey note asks for reassessment of the explicit links.",
      reassessmentRequired: true,
      authorityRole: "AUTHOR",
      provenanceRef: "prov-change",
      citedCurrentness: "REASSESSMENT_REQUIRED",
    });
    expect(change.reassessmentRequired).toBe(true);
    expect(change.engineeringInvalid).toBe(false);
    expect(change.automaticRecalculation).toBe(false);
    expect(change.engineeringValidated).toBe(false);
    expect(store.reassessments.map((row) => row.objectId).sort()).toEqual(["grading-object", "utility-corridor-object"]);
    expect(store.reassessments.every((row) => row.engineeringInvalid === false && row.automaticRecalculation === false && row.engineeringValidated === false)).toBe(true);
    expect(store.reassessments.some((row) => row.objectId === pit.objectId)).toBe(false);
    expect(grading.fingerprint).toBe(gradingFingerprint);
    expect(road.fingerprint).toBe(roadFingerprint);
    expect(drainage.fingerprint).toBe(drainageFingerprint);
    expect(utility.fingerprint).toBe(utilityFingerprint);
    expect(r1.objects.find((row) => row.objectId === gradingObject.objectId)).toBe(gradingIdentity);
    expect(gradingIdentity?.recordStatus).toBe("CURRENT");
    const successor = recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-2",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface, revision note attached.",
      sourceRef: "council-standard",
      sourceRevision: "2024-b",
      applicability: "site platform",
      affectedObjectIds: [gradingObject.objectId, corridor.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement-2",
      citedCurrentness: "CURRENT",
      predecessorRequirementContextId: requirement.requirementContextId,
    });
    expect(successor.affectedObjectIds).toEqual(requirement.affectedObjectIds);
    expect(store.requirements.find((row) => row.requirementContextId === "requirement-1")?.recordStatus).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.action === "SUPERSEDED")).toBe(true);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-dup",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: successor.requirementText,
      sourceRef: successor.sourceRef,
      sourceRevision: successor.sourceRevision,
      applicability: successor.applicability,
      affectedObjectIds: [...successor.affectedObjectIds],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement-dup",
      citedCurrentness: "CURRENT",
    })).toThrow(/DUPLICATE_REQUIREMENT_REJECTED/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: successor.requirementText,
      sourceRef: successor.sourceRef,
      sourceRevision: successor.sourceRevision,
      applicability: successor.applicability,
      affectedObjectIds: [...successor.affectedObjectIds],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
      assertedFingerprint: "spoofed",
    })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-float",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: ["latest"],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/AFFECTED_OBJECT_REQUIRED/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-ph",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "philippines",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/JURISDICTION_PROFILE_INVALID/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-sat",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      satisfied: true,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/REQUIREMENT_SATISFACTION_NOT_IN_R7/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-accept",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      requirementStatus: "ACCEPTED_FOR_PURPOSE",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/REQUIREMENT_ACCEPTANCE_NOT_IN_R7/);
    expect(() => recordCivilRequirement(store, { ...actor, actorId: "AI_assistant" }, {
      requirementContextId: "requirement-ai",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "invented",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-invent",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "invented",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      inventRequirement: true,
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/REQUIREMENT_NOT_INVENTED/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-approve",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      approve: true,
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/APPROVAL_NOT_IN_R7/);
    expect(() => recordCivilDecision(store, { ...actor, actorId: "AI_reviewer" }, {
      decisionContextId: "decision-ai",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "AI decides.",
      rationale: "none",
      authorityRole: "DECISION_AUTHORITY",
      affectedObjectIds: [gradingObject.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      approve: true,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/Autonomous AI approval/);
    expect(() => recordCivilAssumption(store, actor, {
      assumptionContextId: "assumption-invent",
      contextId: context.contextId,
      objectId: assumptionObject.objectId,
      statement: "invented",
      sourceRef: "source",
      rationale: "none",
      affectedObjectIds: [gradingObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      inventAssumption: true,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/ASSUMPTION_NOT_INVENTED/);
    expect(() => recordCivilAssumption(store, actor, {
      assumptionContextId: "assumption-valid",
      contextId: context.contextId,
      objectId: assumptionObject.objectId,
      statement: "validated claim",
      sourceRef: "source",
      rationale: "none",
      affectedObjectIds: [gradingObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      validationStatus: "validated",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/ASSUMPTION_VALIDATION_NOT_IN_R7/);
    expect(() => recordCivilDecision(store, actor, {
      decisionContextId: "decision-ai-rec",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "recommendation",
      rationale: "model output",
      authorityRole: "DECISION_AUTHORITY",
      affectedObjectIds: [gradingObject.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      aiRecommendation: true,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_RECOMMENDATION_NOT_DECISION/);
    expect(() => recordCivilDecision(store, actor, {
      decisionContextId: "decision-eng",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "engineering authority",
      rationale: "none",
      authorityRole: "CIVIL_ENGINEERING_AUTHORITY",
      affectedObjectIds: [gradingObject.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/AUTHORITY_ROLE_NOT_CIVIL_ENGINEERING/);
    expect(() => recordCivilChange(store, actor, {
      changeContextId: "change-infer",
      contextId: context.contextId,
      initiatingSource: "note",
      changedObjectId: gradingObject.objectId,
      affectedRelationships: [{ kind: "PARENT", targetObjectId: gradingObject.objectId }],
      rationale: "infer",
      reassessmentRequired: true,
      authorityRole: "AUTHOR",
      inferDependencies: true,
      provenanceRef: "prov",
      citedCurrentness: "REASSESSMENT_REQUIRED",
    })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordCivilChange(store, actor, {
      changeContextId: "change-near",
      contextId: context.contextId,
      initiatingSource: "note",
      changedObjectId: gradingObject.objectId,
      affectedRelationships: [{ kind: "PROXIMITY", targetObjectId: pit.objectId }],
      rationale: "near",
      reassessmentRequired: true,
      authorityRole: "AUTHOR",
      provenanceRef: "prov",
      citedCurrentness: "REASSESSMENT_REQUIRED",
    })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    expect(() => recordCivilChange(store, actor, {
      changeContextId: "change-redesign",
      contextId: context.contextId,
      initiatingSource: "note",
      changedObjectId: gradingObject.objectId,
      affectedRelationships: [{ kind: "PARENT", targetObjectId: gradingObject.objectId }],
      rationale: "redesign",
      reassessmentRequired: false,
      authorityRole: "AUTHOR",
      redesign: true,
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/REDESIGN_NOT_IN_R7/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-calc",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      recalculate: true,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/RECALCULATION_NOT_IN_R7/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-scope",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      workspaceId: "workspace-b",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilRequirement(store, actor, {
      requirementContextId: "requirement-build",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "text",
      sourceRef: "source",
      sourceRevision: "rev",
      applicability: "site",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONSTRUCTION",
      provenanceRef: "prov",
      citedCurrentness: "CURRENT",
    })).toThrow(/MATURITY_INVALID/);
    expect(() => mutateRequirementsAssumptionsChange()).toThrow(/R7_MUTATION_REJECTED/);
    expect(() => redesignCivil()).toThrow(/REDESIGN_NOT_IN_R7/);
    expect(() => calculateFromGovernance()).toThrow(/RECALCULATION_NOT_IN_R7/);
    expect(grading.fingerprint).toBe(gradingFingerprint);
    expect(utility.fingerprint).toBe(utilityFingerprint);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).toContain("assertAssumptionValidationStatus");
    expect(source).toContain("assertHumanApprovalActor");
    expect(source).toContain("INFORMATION_REQUIREMENT_AI_BOUNDARY");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "requirements-assumptions-change.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
