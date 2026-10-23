import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D2_D9_SOURCE_CONTRACT_FIELDS } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE as PACK_COMPLETE, D1N_REOPENED as PACK_D1N } from "../structural-systems/structural-pack-sequencing";
import { D2_CONTEXT_AUTHORITY, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "./identity-foundation";
import { createD2R2Store, recordSpatialReference, recordSurfaceContext } from "./spatial-surface-context";
import { createD2R3Store, recordGradingContext } from "./grading-earthworks-context";
import { createD2R4Store } from "./roads-access-context";
import { createD2R5Store } from "./drainage-stormwater-context";
import { createD2R6Store } from "./utility-corridor-context";
import { createD2R7Store, recordCivilAssumption, recordCivilDecision, recordCivilRequirement } from "./requirements-assumptions-change";
import { createD2R8Store, recordCivilInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD2R9Store, recordCivilReviewRequest, recordCivilValidationGovernance, type D2R9Actor } from "./review-validation-governance";
import {
  D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT as R10_CONTRACT_COUNT,
  D2_D9_SOURCE_CONTRACT_RUNTIME_READY as R10_CONTRACT_READY,
  D2_R11_STARTED,
  D2_RUNTIME_COUNT as R10_COUNT,
  createD2R10Store,
  recordCivilCurrentness,
  recordCivilLineage,
  recordCivilSupersession,
} from "./currentness-digital-thread";
import {
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  CANONICAL_D9_SOURCE_CONTRACT_PATTERN_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
  D2_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D2_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D2_CURRENTNESS_AUTO_RECALCULATION_RUNTIME_COUNT,
  D2_D9_RUNTIME_INTEGRATION_COUNT,
  D2_D9_SOURCE_CONTRACT_FINGERPRINT_IMPLEMENTED,
  D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D2_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED,
  D2_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D2_R11_MATURITY,
  D2_R11_PROVENANCE_PRESERVED,
  D2_R11_PROVENANCE_REQUIRED,
  D2_R11_STATUS,
  D2_R12_CANONICAL_PHASE,
  D2_R12_PHASE_TYPE,
  D2_R12_STARTED,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D2_SOURCE_CONTRACT_AUTO_REPOINTED,
  D2_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D2_SOURCE_CONTRACT_CURRENTNESS_EXPLICIT,
  D2_SOURCE_CONTRACT_HISTORY_PRESERVED,
  D2_SOURCE_CONTRACT_INFERRED_ENGINEERING_RUNTIME_COUNT,
  D2_SOURCE_CONTRACT_INTERFACE_STATE_EXPLICIT,
  D2_SOURCE_CONTRACT_LIMITATIONS_EXPLICIT,
  D2_SOURCE_CONTRACT_LINEAGE_EXPLICIT,
  D2_SOURCE_CONTRACT_REVIEW_STATE_EXPLICIT,
  D2_SOURCE_CONTRACT_SPATIAL_CONTEXT_EXPLICIT,
  D2_SOURCE_CONTRACT_TRANSFERS_CIVIL_AUTHORITY,
  D2_SOURCE_CONTRACT_VALIDATION_STATE_EXPLICIT,
  D3_RUNTIME_STARTED,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_FUTURE_CONSUMPTION_TRANSFERS_CIVIL_AUTHORITY,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D2_SOURCE_CONTRACT_REVISION_REQUIRED,
  FLOATING_D2_SOURCE_CONTRACT_REFERENCE_ALLOWED,
  INCOMPLETE_HANDOFF_EXPOSED_AS_COMPLETE,
  INFERRED_D2_SOURCE_CONTRACT_LINEAGE_ALLOWED,
  MISSING_COUNTERPART_AUTO_FABRICATED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_GLOBAL_SOURCE_CONTRACT_FRAMEWORK_CREATED,
  REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED,
  REVIEW_STATE_EQUALS_ENGINEERING_VALIDATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D2_SOURCE_CONTRACT_MUTATION_ALLOWED,
  STALE_D2_RECORD_EXPOSED_AS_CURRENT,
  STALE_HANDOFF_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D2_SOURCE_CONTRACT_SCOPE_ENFORCED,
  VALIDATION_STATE_EQUALS_APPROVED,
  VALIDATION_STATE_EQUALS_CERTIFIED,
  VALIDATION_STATE_EQUALS_CONFORMANT,
  createD2R11Store,
  deriveEngineeringFact,
  fabricateCounterpartDiscipline,
  inferSourceContractLineage,
  recordCivilSourceContract,
  repointSourceContract,
  startD9Reasoning,
  transferCivilAuthority,
} from "./d9-source-contract";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

const reviewer: D2R9Actor = {
  actorId: "reviewer-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "REVIEWER",
  actorKind: "human",
  aal: "aal2",
};

describe("EOS-D2-R11 D9 source contract", () => {
  it("projects exact Civil revisions without starting D9 or deriving engineering", () => {
    expect(D2_R11_STATUS).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D2_R11_MATURITY).toBe(D2_R11_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(11);
    expect(R10_COUNT).toBe(10);
    expect(D2_R11_STARTED).toBe(false);
    expect(R10_CONTRACT_READY).toBe(false);
    expect(R10_CONTRACT_COUNT).toBe(0);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(true);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(CANONICAL_D9_SOURCE_CONTRACT_PATTERN_REUSED).toBe(true);
    expect(PARALLEL_GLOBAL_SOURCE_CONTRACT_FRAMEWORK_CREATED).toBe(false);
    expect(EXACT_D2_SOURCE_CONTRACT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D2_SOURCE_CONTRACT_REFERENCE_ALLOWED).toBe(false);
    expect(D2_SOURCE_CONTRACT_AUTO_REPOINTED).toBe(false);
    expect(D2_SOURCE_CONTRACT_CURRENTNESS_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_REVIEW_STATE_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_VALIDATION_STATE_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_INTERFACE_STATE_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_SPATIAL_CONTEXT_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_LINEAGE_EXPLICIT).toBe(true);
    expect(D2_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT).toBe(false);
    expect(D2_SOURCE_CONTRACT_INFERRED_ENGINEERING_RUNTIME_COUNT).toBe(0);
    expect(INFERRED_D2_SOURCE_CONTRACT_LINEAGE_ALLOWED).toBe(false);
    expect(D2_SOURCE_CONTRACT_TRANSFERS_CIVIL_AUTHORITY).toBe(false);
    expect(D9_FUTURE_CONSUMPTION_TRANSFERS_CIVIL_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(STALE_D2_RECORD_EXPOSED_AS_CURRENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(REVIEW_STATE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(VALIDATION_STATE_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATION_STATE_EQUALS_APPROVED).toBe(false);
    expect(VALIDATION_STATE_EQUALS_CERTIFIED).toBe(false);
    expect(MISSING_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(INCOMPLETE_HANDOFF_EXPOSED_AS_COMPLETE).toBe(false);
    expect(STALE_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D2_D9_SOURCE_CONTRACT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D2_R11_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_R11_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D2_SOURCE_CONTRACT_MUTATION_ALLOWED).toBe(false);
    expect(D2_SOURCE_CONTRACT_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D2_SOURCE_CONTRACT_SCOPE_ENFORCED).toBe(true);
    expect(D2_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D2_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT).toBe(0);
    expect(D2_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CURRENTNESS_AUTO_RECALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D3_RUNTIME_STARTED).toBe(false);
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(PACK_D1N).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D2_R12_STARTED).toBe(false);
    expect(D2_R12_CANONICAL_PHASE).toBe("EOS-D2-R12-CIVIL-BOUNDED-CLOSEOUT");
    expect(D2_R12_PHASE_TYPE).toBe("CIVIL_BOUNDED_CLOSEOUT");

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const made = (objectId: string, objectType: "COORDINATE_REFERENCE" | "SURFACE_REFERENCE" | "GRADING_ZONE" | "ROAD_CORRIDOR" | "FINISHED_LEVEL" | "CIVIL_INTERFACE" | "CIVIL_REQUIREMENT" | "CIVIL_ASSUMPTION" | "CIVIL_DECISION" | "CIVIL_EVIDENCE_REFERENCE") =>
      recordCivilObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef: `prov-${objectId}` });
    const coordinate = made("coordinate-object", "COORDINATE_REFERENCE");
    const surfaceObject = made("surface-object", "SURFACE_REFERENCE");
    const grading = made("grading-object", "GRADING_ZONE");
    const unrelated = made("unrelated-object", "FINISHED_LEVEL");
    const interfaceObject = made("interface-object", "CIVIL_INTERFACE");
    const requirementObject = made("requirement-object", "CIVIL_REQUIREMENT");
    const assumptionObject = made("assumption-object", "CIVIL_ASSUMPTION");
    const decisionObject = made("decision-object", "CIVIL_DECISION");
    const evidence = made("evidence-object", "CIVIL_EVIDENCE_REFERENCE");
    const r2 = createD2R2Store(r1);
    const spatial = recordSpatialReference(r2, actor, {
      spatialReferenceId: "spatial-1",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "CRS-LOCAL",
      horizontalDatum: "LOCAL-H",
      verticalDatum: "LOCAL-V",
      projectCoordinateContext: "project-grid",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    });
    const surface = recordSurfaceContext(r2, actor, {
      surfaceContextId: "surface-1",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "DESIGN_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      sourceReference: "cited-design-surface",
      revision: "rev-surface-1",
      provenanceRef: "prov-surface",
      citedCurrentness: "CURRENT",
    });
    const r3 = createD2R3Store(r2);
    const gradingContext = recordGradingContext(r3, actor, {
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: grading.objectId,
      surfaceContextIds: [surface.surfaceContextId],
      criteria: [{ kind: "TARGET_FINISHED_LEVEL", suppliedValue: "cited-level", sourceRef: "requirement-1" }],
      relationships: [],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    });
    const r7 = createD2R7Store(createD2R6Store(createD2R5Store(createD2R4Store(r3))));
    const requirement = recordCivilRequirement(r7, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: [grading.objectId],
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
      affectedObjectIds: [grading.objectId],
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
      affectedObjectIds: [grading.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-decision",
      citedCurrentness: "CURRENT",
    });
    const r8 = createD2R8Store(r7);
    const handoff = recordCivilInterfaceHandoff(r8, actor, {
      handoffId: "handoff-d3",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: grading.objectId,
      sourceRevision: grading.fingerprint,
      counterpartDiscipline: "geotechnical",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GROUNDWATER",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      changeContextIds: [],
      limitations: "Geotechnical truth is not created by this handoff.",
      handoffStatus: "AWAITING_COUNTERPART",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-handoff",
    });
    const staleHandoff = recordCivilInterfaceHandoff(r8, actor, {
      handoffId: "handoff-stale",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: grading.objectId,
      sourceRevision: grading.fingerprint,
      counterpartDiscipline: "geotechnical",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "SETTLEMENT_CRITERIA",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      changeContextIds: [],
      limitations: "A stale handoff stays on the revision it cited.",
      handoffStatus: "STALE",
      citedCurrentness: "STALE",
      provenanceRef: "prov-handoff-stale",
    });
    const r9 = createD2R9Store(r8);
    const request = recordCivilReviewRequest(r9, actor, {
      subjectKind: "OBJECT",
      subjectId: grading.objectId,
      subjectRevision: grading.fingerprint,
      subjectFingerprint: grading.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      reviewRequestId: "review-1",
      reviewType: "CIVIL_SUBJECT_REVIEW",
      requestedReviewerAuthority: "REVIEWER",
      limitations: "A request does not complete the review.",
      requestedAt: "2026-10-23T01:00:00.000Z",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-review",
    });
    const validation = recordCivilValidationGovernance(r9, reviewer, {
      subjectKind: "OBJECT",
      subjectId: grading.objectId,
      subjectRevision: grading.fingerprint,
      subjectFingerprint: grading.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      validationId: "validation-1",
      reviewRequestId: request.reviewRequestId,
      validationScope: "cited finished level record",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "VALIDATED",
      limitations: "Validation is not approval.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-validation",
    });
    const r10 = createD2R10Store(r9);
    const objectPin = (row: { objectId: string; fingerprint: string }) => ({ subjectKind: "OBJECT", subjectId: row.objectId, subjectRevision: row.fingerprint, subjectFingerprint: row.fingerprint });
    recordCivilLineage(r10, actor, {
      lineageId: "line-surface-grading",
      contextId: context.contextId,
      source: objectPin(surfaceObject),
      target: objectPin(grading),
      relationshipType: "DEPENDS_ON",
      civilDependency: "SURFACE_REFERENCE_TO_GRADING_AND_EARTHWORKS",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-line-1",
    });
    recordCivilLineage(r10, actor, {
      lineageId: "line-handoff",
      contextId: context.contextId,
      source: objectPin(grading),
      target: { subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.sourceRevision, subjectFingerprint: handoff.fingerprint },
      relationshipType: "DEPENDS_ON",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-line-handoff",
    });
    const candidate = recordCivilLineage(r10, { ...actor, actorId: "AI-assistant", authority: "AI_ASSISTANT", actorKind: "ai" }, {
      lineageId: "line-candidate",
      contextId: context.contextId,
      source: objectPin(grading),
      target: objectPin(unrelated),
      relationshipType: "DEPENDS_ON",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-candidate",
      candidate: true,
      authoritative: false,
    });
    const store = createD2R11Store(r10);
    const issued = recordCivilSourceContract(store, actor, {
      contractId: "contract-current",
      contextId: context.contextId,
      objectId: grading.objectId,
      sourceRevision: grading.fingerprint,
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-contract",
    });
    const replay = recordCivilSourceContract(store, actor, {
      contractId: "contract-current",
      contextId: context.contextId,
      objectId: grading.objectId,
      sourceRevision: grading.fingerprint,
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-contract",
    });
    expect(replay.fingerprint).toBe(issued.fingerprint);
    expect(store.contracts).toHaveLength(1);
    for (const field of D2_D9_SOURCE_CONTRACT_FIELDS) expect(issued.fields).toHaveProperty(field);
    expect(issued.fields.OBJECT_IDENTITY.objectId).toBe(grading.objectId);
    expect(issued.fields.OBJECT_TYPE).toBe("GRADING_ZONE");
    expect(issued.exactRevision).toBe(grading.fingerprint);
    expect(issued.currentness).toBe("CURRENT");
    expect(issued.fields.AUTHORITY).toBe(D2_CONTEXT_AUTHORITY);
    expect(issued.authorityTransferred).toBe(false);
    expect(issued.d9OwnsCivilAuthority).toBe(false);
    expect(issued.fields.REQUIREMENTS[0].requirementText).toBe(requirement.requirementText);
    expect(issued.fields.REQUIREMENTS[0].requirementSatisfied).toBe(false);
    expect(issued.fields.ASSUMPTIONS[0].validationStatus).toBe("unvalidated");
    expect(issued.fields.DECISIONS).toHaveLength(1);
    expect(issued.fields.EVIDENCE.map((row) => row.objectId)).toContain(evidence.objectId);
    expect(issued.fields.SPATIAL_CONTEXT.surfaces[0].surfaceContextId).toBe(surface.surfaceContextId);
    expect(issued.fields.SPATIAL_CONTEXT.spatialReferences[0].spatialReferenceId).toBe(spatial.spatialReferenceId);
    expect(issued.fields.SPATIAL_CONTEXT.grading[0].gradingDesignComplete).toBe(false);
    expect(issued.fields.SPATIAL_CONTEXT.grading[0].fingerprint).toBe(gradingContext.fingerprint);
    expect(issued.fields.SPATIAL_CONTEXT.roads).toEqual([]);
    expect(issued.fields.SPATIAL_CONTEXT.drainage).toEqual([]);
    expect(issued.fields.SPATIAL_CONTEXT.utilities).toEqual([]);
    expect(issued.fields.MATURITY).toBe("CONCEPT");
    expect(issued.fields.LIMITATIONS.join(" ")).toContain("Geotechnical truth is not created by this handoff.");
    expect(issued.fields.CANONICAL_FINGERPRINT).toBe(issued.fingerprint);
    expect(issued.reviewState[0].engineeringValidated).toBe(false);
    expect(issued.reviewState[0].reviewCompleted).toBe(false);
    expect(issued.reviewState[0].subjectRevision).toBe(grading.fingerprint);
    expect(issued.validationState[0].validationState).toBe("VALIDATED");
    expect(issued.validationState[0].conformant).toBe(false);
    expect(issued.validationState[0].engineeringApproved).toBe(false);
    expect(issued.validationState[0].certified).toBe(false);
    expect(issued.representedAsValidated).toBe(true);
    const awaiting = issued.fields.INTERFACES.find((row) => row.handoffId === handoff.handoffId);
    const stale = issued.fields.INTERFACES.find((row) => row.handoffId === staleHandoff.handoffId);
    expect(awaiting?.complete).toBe(false);
    expect(awaiting?.counterpart).toBeNull();
    expect(awaiting?.handoffStatus).toBe("AWAITING_COUNTERPART");
    expect(stale?.citedCurrentness).toBe("STALE");
    expect(stale?.complete).toBe(false);
    expect(issued.lineage.some((row) => row.lineageId === "line-surface-grading" && row.authoritative)).toBe(true);
    expect(issued.lineage.find((row) => row.lineageId === candidate.lineageId)?.authoritative).toBe(false);
    expect(issued.engineeringDerived).toBe(false);
    expect(issued.inferredLineage).toBe(false);
    expect(issued.counterpartFabricated).toBe(false);
    const unrelatedContract = recordCivilSourceContract(store, actor, {
      contractId: "contract-unrelated",
      contextId: context.contextId,
      objectId: unrelated.objectId,
      sourceRevision: unrelated.fingerprint,
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-unrelated",
    });
    expect(unrelatedContract.fields.REQUIREMENTS).toEqual([]);
    expect(unrelatedContract.fields.SPATIAL_CONTEXT.grading).toEqual([]);
    expect(unrelatedContract.lineage.find((row) => row.lineageId === candidate.lineageId)?.authoritative).toBe(false);

    const gradingFingerprint = grading.fingerprint;
    recordCivilCurrentness(r10, actor, { eventId: "event-stale", contextId: context.contextId, subject: objectPin(grading), currentness: "STALE", propagate: true, provenanceRef: "prov-stale" });
    expect(() => recordCivilSourceContract(store, actor, { contractId: "contract-stale-rejected", contextId: context.contextId, objectId: grading.objectId, sourceRevision: grading.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-stale-contract" })).toThrow(/CURRENTNESS_MISMATCH/);
    const staleContract = recordCivilSourceContract(store, actor, { contractId: "contract-stale", contextId: context.contextId, objectId: grading.objectId, sourceRevision: grading.fingerprint, citedCurrentness: "STALE", provenanceRef: "prov-stale-contract" });
    expect(staleContract.currentness).toBe("STALE");
    expect(staleContract.representedAsValidated).toBe(false);
    expect(staleContract.exactRevision).toBe(gradingFingerprint);
    expect(issued.currentness).toBe("CURRENT");
    expect(issued.fingerprint).toBe(replay.fingerprint);
    expect(staleContract.fields.INTERFACES.find((row) => row.handoffId === handoff.handoffId)?.citedCurrentness).toBe("STALE");
    expect(handoff.sourceRevision).toBe(gradingFingerprint);
    expect(handoff.citedCurrentness).toBe("CURRENT");
    expect(requirement.requirementText).toBe("Finished level remains the cited design surface.");
    expect(grading.fingerprint).toBe(gradingFingerprint);

    recordCivilCurrentness(r10, actor, { eventId: "event-reassess", contextId: context.contextId, subject: objectPin(grading), currentness: "REASSESSMENT_REQUIRED", propagate: false, provenanceRef: "prov-reassess" });
    const reassessed = recordCivilSourceContract(store, actor, { contractId: "contract-reassess", contextId: context.contextId, objectId: grading.objectId, sourceRevision: grading.fingerprint, citedCurrentness: "REASSESSMENT_REQUIRED", provenanceRef: "prov-reassess-contract" });
    expect(reassessed.representedAsValidated).toBe(false);
    expect(reassessed.validationState[0].validationState).toBe("VALIDATED");
    expect(reassessed.validationState[0].conformant).toBe(false);

    const successor = recordCivilObjectIdentity(r1, actor, { objectId: "grading-object-2", contextId: context.contextId, objectType: "GRADING_ZONE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-grading-2", predecessorObjectId: grading.objectId });
    recordCivilSupersession(r10, actor, { supersessionId: "super-1", contextId: context.contextId, predecessor: objectPin(grading), successor: objectPin(successor), citedCurrentness: "CURRENT", provenanceRef: "prov-super" });
    const superseded = recordCivilSourceContract(store, actor, { contractId: "contract-superseded", contextId: context.contextId, objectId: grading.objectId, sourceRevision: gradingFingerprint, citedCurrentness: "SUPERSEDED", provenanceRef: "prov-super-contract" });
    const successorContract = recordCivilSourceContract(store, actor, { contractId: "contract-successor", contextId: context.contextId, objectId: successor.objectId, sourceRevision: successor.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-successor-contract" });
    expect(superseded.exactRevision).toBe(gradingFingerprint);
    expect(superseded.supersessionState).toBe("SUPERSEDED");
    expect(superseded.reviewState[0].subjectRevision).toBe(gradingFingerprint);
    expect(successorContract.exactRevision).toBe(successor.fingerprint);
    expect(successorContract.reviewState).toEqual([]);
    expect(successorContract.validationState).toEqual([]);
    expect(successorContract.fields.INTERFACES).toEqual([]);
    expect(validation.subjectRevision).toBe(gradingFingerprint);
    expect(store.history[0].fingerprint).toBe(issued.fingerprint);
    expect(store.history[0].action).toBe("CREATED");

    expect(() => recordCivilSourceContract(store, actor, { contractId: "contract-float", contextId: context.contextId, objectId: grading.objectId, sourceRevision: "latest", citedCurrentness: "SUPERSEDED", provenanceRef: "prov-float" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordCivilSourceContract(store, actor, { contractId: "contract-infer", contextId: context.contextId, objectId: successor.objectId, sourceRevision: successor.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-infer", infer: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordCivilSourceContract(store, actor, { contractId: "contract-spoof", contextId: context.contextId, objectId: successor.objectId, sourceRevision: successor.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordCivilSourceContract(store, actor, { contractId: "contract-scope", contextId: context.contextId, objectId: successor.objectId, sourceRevision: successor.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-scope", workspaceId: "workspace-b" })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilSourceContract(store, actor, { contractId: "contract-current", contextId: context.contextId, objectId: grading.objectId, sourceRevision: gradingFingerprint, citedCurrentness: "SUPERSEDED", provenanceRef: "prov-duplicate" })).toThrow(/DUPLICATE_SOURCE_CONTRACT_REJECTED/);
    expect(() => recordCivilSourceContract(store, { ...actor, actorId: "AI-assistant", authority: "AI_ASSISTANT", actorKind: "ai" }, { contractId: "contract-ai", contextId: context.contextId, objectId: successor.objectId, sourceRevision: successor.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilSourceContract(store, { ...actor, authority: "ADMINISTRATOR" }, { contractId: "contract-admin", contextId: context.contextId, objectId: successor.objectId, sourceRevision: successor.fingerprint, citedCurrentness: "CURRENT", provenanceRef: "prov-admin" })).toThrow(/ADMIN_NOT_CIVIL_AUTHORITY/);
    expect(() => repointSourceContract()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => inferSourceContractLineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => deriveEngineeringFact()).toThrow(/ENGINEERING_DERIVATION_NOT_IN_R11/);
    expect(() => startD9Reasoning()).toThrow(/D9_NOT_STARTED/);
    expect(() => transferCivilAuthority()).toThrow(/AUTHORITY_TRANSFER_REJECTED/);
    expect(() => fabricateCounterpartDiscipline()).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D2_D9_SOURCE_CONTRACT_FIELDS");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "d9-source-contract.ts"), sourceText)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R12.CIVIL_BOUNDED_CLOSEOUT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
