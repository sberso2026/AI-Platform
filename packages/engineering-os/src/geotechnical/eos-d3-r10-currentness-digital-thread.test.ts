import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D2_RUNTIME_COUNT as D2_ARCHITECTURE_RUNTIME_COUNT, D3_0_RUNTIME_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_CONTEXT_AUTHORITY, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "./identity-foundation";
import { createD3R2Store, recordInvestigationEvidenceReference } from "./site-investigation-evidence";
import { createD3R3Store } from "./stratigraphy-groundwater-material";
import { createD3R4Store } from "./field-lab-test-context";
import { createD3R5Store } from "./geotechnical-parameter-context";
import { createD3R6Store } from "./foundation-excavation-slope-context";
import { D3_RUNTIME_COUNT as R7_RUNTIME_COUNT, createD3R7Store, recordGeotechnicalChange } from "./requirements-assumptions-change";
import { D3_RUNTIME_COUNT as R8_RUNTIME_COUNT, createD3R8Store, recordGeotechnicalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import {
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY as R9_THREAD_READY,
  D3_R10_STARTED,
  D3_RUNTIME_COUNT as R9_RUNTIME_COUNT,
  createD3R9Store,
  recordGeotechnicalReviewRequest,
  recordGeotechnicalValidationState,
  type D3R9Actor,
} from "./review-validation-governance";
import {
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  CURRENT_EQUALS_APPROVED,
  CURRENT_EQUALS_CERTIFIED,
  CURRENT_EQUALS_CONFORMANT,
  CURRENT_EQUALS_VALIDATED,
  D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
  D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
  D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D3_COUNTERPART_REFERENCE_AUTO_REPOINTED,
  D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D3_CURRENTNESS_AUTO_GENERATES_RECOMMENDATION,
  D3_CURRENTNESS_AUTO_MUTATES_ENGINEERING,
  D3_CURRENTNESS_AUTO_RECALCULATES_PARAMETER,
  D3_CURRENTNESS_AUTO_REDESIGNS_EXCAVATION,
  D3_CURRENTNESS_AUTO_REDESIGNS_FOUNDATION,
  D3_CURRENTNESS_AUTO_REDESIGNS_SLOPE,
  D3_CURRENTNESS_DIGITAL_THREAD_FINGERPRINT_IMPLEMENTED,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_CURRENTNESS_STATE_IMPLEMENTED,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EVIDENCE_LINEAGE_SUPPORTED,
  D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
  D3_EXPLICIT_CURRENTNESS_PROPAGATION_IMPLEMENTED,
  D3_EXPLICIT_LINEAGE_SUPPORTED,
  D3_FIELD_LAB_TEST_RUNTIME_READY,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
  D3_HANDOFF_AUTO_REPOINTED,
  D3_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED,
  D3_PILE_CAPACITY_RUNTIME_COUNT,
  D3_R10_BLOCKER,
  D3_R10_CANONICAL_NEXT_PHASE,
  D3_R10_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R10_HISTORY_PRESERVED,
  D3_R10_MATURITY,
  D3_R10_NEXT_PHASE_TYPE,
  D3_R10_PROVENANCE_PRESERVED,
  D3_R10_PROVENANCE_REQUIRED,
  D3_R10_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R10_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R10_STATUS,
  D3_R11_CANONICAL_PHASE,
  D3_R11_CANONICAL_SCOPE,
  D3_R11_PHASE_TYPE,
  D3_R11_STARTED,
  D3_R7_CHANGE_CURRENTNESS_INTEGRATED,
  D3_R8_INTERFACE_CURRENTNESS_INTEGRATED,
  D3_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY,
  D3_SUPERSESSION_GOVERNANCE_IMPLEMENTED,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EVIDENCE_LINEAGE_EQUALS_ENGINEERING_VALIDATED,
  EXACT_D3_REVISION_REFERENCE_REQUIRED,
  FLOATING_D3_REVISION_REFERENCE_ALLOWED,
  HISTORICAL_D3_REFERENCE_AUTO_REPOINTED,
  INFERRED_D3_LINEAGE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D3_DIGITAL_THREAD_CREATED,
  PRIOR_D3_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D3_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_REQUIRED_EQUALS_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_RECALCULATED,
  REASSESSMENT_REQUIRED_EQUALS_REDESIGNED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R10_MUTATION_ALLOWED,
  STALE_D3_HANDOFF_EXPOSED_AS_CURRENT,
  STALE_D3_REVIEW_EXPOSED_AS_CURRENT,
  STALE_D3_VALIDATION_EXPOSED_AS_CURRENT,
  STALE_EQUALS_INVALID,
  STALE_EQUALS_REJECTED,
  SUPERSEDED_EQUALS_AUTO_REPLACED_IN_HISTORY,
  SUPERSEDED_EQUALS_DELETED,
  SUPERSEDED_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D3_R10_SCOPE_ENFORCED,
  createD3R10Store,
  inferGeotechnicalLineage,
  recalculateFromGeotechnicalCurrentness,
  recordGeotechnicalCurrentness,
  recordGeotechnicalLineage,
  recordGeotechnicalSupersession,
  redesignFromGeotechnicalCurrentness,
  repointHistoricalGeotechnicalReference,
} from "./currentness-digital-thread";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

const reviewer: D3R9Actor = {
  actorId: "geotechnical-reviewer",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "REVIEWER",
  actorKind: "human",
  aal: "aal2",
};

const R11_SCOPE = "Expose governed Geotechnical facts and metadata for future D9 consumption using exact D3 revisions, currentness, authority, provenance, investigation/evidence, stratigraphy/material/groundwater context, tests, parameters, recommendations, requirements/assumptions/decisions, interfaces, review/validation state, lineage, limitations and canonical fingerprint. The source contract must not create new engineering facts, transfer Geotechnical authority, perform cross-discipline reasoning, fabricate counterpart information, start D9 runtime or start D4-D8.";

describe("EOS-D3-R10 currentness and digital thread", () => {
  it("traces exact Geotechnical revisions without performing the engineering implied by a currentness change", () => {
    expect(D3_R10_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D3_R10_MATURITY).toBe(D3_R10_STATUS);
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(10);
    expect(R9_RUNTIME_COUNT).toBe(9);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R10_STARTED).toBe(false);
    expect(R9_THREAD_READY).toBe(false);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT).toBe(1);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY).toBe(true);
    expect(D3_FIELD_LAB_TEST_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(true);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(true);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(PARALLEL_D3_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(EXACT_D3_REVISION_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D3_REVISION_REFERENCE_ALLOWED).toBe(false);
    expect(HISTORICAL_D3_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D3_EXPLICIT_LINEAGE_SUPPORTED).toBe(true);
    expect(INFERRED_D3_LINEAGE_ALLOWED).toBe(false);
    expect(D3_SUPERSESSION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_EQUALS_DELETED).toBe(false);
    expect(SUPERSEDED_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_EQUALS_AUTO_REPLACED_IN_HISTORY).toBe(false);
    expect(D3_CURRENTNESS_STATE_IMPLEMENTED).toBe(true);
    expect(STALE_EQUALS_INVALID).toBe(false);
    expect(STALE_EQUALS_REJECTED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_INVALID).toBe(false);
    expect(D3_EXPLICIT_CURRENTNESS_PROPAGATION_IMPLEMENTED).toBe(true);
    expect(D3_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED).toBe(false);
    expect(D3_CURRENTNESS_AUTO_MUTATES_ENGINEERING).toBe(false);
    expect(D3_CURRENTNESS_AUTO_RECALCULATES_PARAMETER).toBe(false);
    expect(D3_CURRENTNESS_AUTO_REDESIGNS_FOUNDATION).toBe(false);
    expect(D3_CURRENTNESS_AUTO_REDESIGNS_EXCAVATION).toBe(false);
    expect(D3_CURRENTNESS_AUTO_REDESIGNS_SLOPE).toBe(false);
    expect(D3_CURRENTNESS_AUTO_GENERATES_RECOMMENDATION).toBe(false);
    expect(D3_R7_CHANGE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D3_R8_INTERFACE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D3_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_RECALCULATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_REDESIGNED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATED).toBe(false);
    expect(PRIOR_D3_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_D3_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(STALE_D3_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(STALE_D3_REVIEW_EXPOSED_AS_CURRENT).toBe(false);
    expect(STALE_D3_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(D3_HANDOFF_AUTO_REPOINTED).toBe(false);
    expect(D3_COUNTERPART_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D3_EVIDENCE_LINEAGE_SUPPORTED).toBe(true);
    expect(EVIDENCE_LINEAGE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(CURRENT_EQUALS_VALIDATED).toBe(false);
    expect(CURRENT_EQUALS_CONFORMANT).toBe(false);
    expect(CURRENT_EQUALS_APPROVED).toBe(false);
    expect(CURRENT_EQUALS_CERTIFIED).toBe(false);
    expect(D3_R10_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R10_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D3_R10_MUTATION_ALLOWED).toBe(false);
    expect(D3_R10_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R10_SCOPE_ENFORCED).toBe(true);
    expect(D3_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R10_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R10_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
      D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_PILE_CAPACITY_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
      D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
      D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
      D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
      D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array(23).fill(0));
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
    expect(D3_R11_STARTED).toBe(false);
    expect(D3_R11_CANONICAL_PHASE).toBe("EOS-D3-R11-D9-SOURCE-CONTRACT");
    expect(D3_R11_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");
    expect(D3_R10_CANONICAL_NEXT_PHASE).toBe(D3_R11_CANONICAL_PHASE);
    expect(D3_R10_NEXT_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");
    expect(D3_R10_CANONICAL_NEXT_PHASE_SCOPE).toBe(R11_SCOPE);
    expect(D3_R11_CANONICAL_SCOPE).toBe(R11_SCOPE);
    expect(D3_R10_BLOCKER).toBe("NONE");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const site = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-1", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const siteNext = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-2", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site-2" });
    const borehole = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "borehole-1", contextId: context.contextId, objectType: "BOREHOLE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-borehole-identity", parentObjectId: site.objectId });
    const governance = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "governance-1", contextId: context.contextId, objectType: "GEOTECHNICAL_GOVERNANCE_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-governance" });
    const interfaceObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "interface-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_INTERFACE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-interface-identity" });
    const r2 = createD3R2Store(r1);
    const evidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const r7 = createD3R7Store(createD3R6Store(createD3R5Store(createD3R4Store(createD3R3Store(r2)))));
    const change = recordGeotechnicalChange(r7, actor, {
      changeContextId: "change-1",
      contextId: context.contextId,
      objectId: governance.objectId,
      changeCategory: "REASSESSMENT_REQUIRED",
      changedObjectId: site.objectId,
      affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: site.objectId }],
      rationale: "A later log is recorded against this site revision",
      limitations: "The change record does not perform reassessment",
      reassessmentRequired: true,
      provenanceRef: "prov-change-1",
      citedCurrentness: "CURRENT",
      evidenceReferenceIds: [evidence.evidenceReferenceId],
    });
    const r8 = createD3R8Store(r7);
    const handoff = recordGeotechnicalInterfaceHandoff(r8, actor, {
      handoffId: "handoff-mech",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: site.objectId,
      sourceRevision: site.provenanceRef,
      counterpartDiscipline: "mechanical",
      direction: "D3_TO_COUNTERPART",
      interfaceTopic: "DISCIPLINE_OBJECT_IDENTITY_CITATION",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      evidenceReferenceIds: [evidence.evidenceReferenceId],
      limitations: "Placeholder handoff bound to the original site revision",
      handoffStatus: "NOT_YET_AVAILABLE",
      provenanceRef: "prov-handoff-mech",
      citedCurrentness: "CURRENT",
    });
    const r9 = createD3R9Store(r8);
    const subject = { contextId: context.contextId, subjectKind: "OBJECT", subjectId: site.objectId, subjectRevision: site.provenanceRef, subjectFingerprint: site.fingerprint, evidenceReferenceIds: [evidence.evidenceReferenceId] };
    const request = recordGeotechnicalReviewRequest(r9, actor, { ...subject, reviewRequestId: "review-1", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site identity", purpose: "Review this exact revision", requestedReviewerAuthority: "REVIEWER", limitations: "A request is not validation", requestedAt: "2026-10-24T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-review-1" });
    const validation = recordGeotechnicalValidationState(r9, reviewer, { ...subject, validationId: "validation-1", reviewRequestId: request.reviewRequestId, validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "VALIDATED", limitations: "Validation stays on this revision", citedCurrentness: "CURRENT", provenanceRef: "prov-validation-1" });
    const store = createD3R10Store(r9);
    const evidencePin = { subjectKind: "EVIDENCE", subjectId: evidence.evidenceReferenceId, subjectRevision: evidence.provenanceRef, subjectFingerprint: evidence.fingerprint };
    const sitePin = { subjectKind: "OBJECT", subjectId: site.objectId, subjectRevision: site.provenanceRef, subjectFingerprint: site.fingerprint };
    const siteNextPin = { subjectKind: "OBJECT", subjectId: siteNext.objectId, subjectRevision: siteNext.provenanceRef, subjectFingerprint: siteNext.fingerprint };
    const changePin = { subjectKind: "CHANGE", subjectId: change.changeContextId, subjectRevision: change.provenanceRef, subjectFingerprint: change.fingerprint };
    const handoffPin = { subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.sourceRevision, subjectFingerprint: handoff.fingerprint };
    const reviewPin = { subjectKind: "REVIEW_REQUEST", subjectId: request.reviewRequestId, subjectRevision: request.subjectRevision, subjectFingerprint: request.fingerprint };
    const validationPin = { subjectKind: "VALIDATION", subjectId: validation.validationId, subjectRevision: validation.subjectRevision, subjectFingerprint: validation.fingerprint };
    const evidenceLineage = recordGeotechnicalLineage(store, actor, { lineageId: "line-evidence", contextId: context.contextId, source: evidencePin, target: sitePin, relationshipType: "SUPPORTED_BY", geotechnicalDependency: "INVESTIGATION_EVIDENCE_TO_STRATIGRAPHY_AND_GROUNDWATER", citedCurrentness: "CURRENT", provenanceRef: "prov-line-evidence" });
    expect(evidenceLineage.engineeringValidated).toBe(false);
    expect(evidenceLineage.source.subjectRevision).toBe(evidence.provenanceRef);
    expect(recordGeotechnicalLineage(store, actor, { lineageId: "line-evidence", contextId: context.contextId, source: evidencePin, target: sitePin, relationshipType: "SUPPORTED_BY", geotechnicalDependency: "INVESTIGATION_EVIDENCE_TO_STRATIGRAPHY_AND_GROUNDWATER", citedCurrentness: "CURRENT", provenanceRef: "prov-line-evidence" }).fingerprint).toBe(evidenceLineage.fingerprint);
    const changeLineage = recordGeotechnicalLineage(store, actor, { lineageId: "line-change", contextId: context.contextId, source: changePin, target: handoffPin, relationshipType: "DEPENDS_ON", geotechnicalDependency: "PARAMETER_OR_CONTEXT_TO_D1_AND_D2_INTERFACE", citedCurrentness: "CURRENT", provenanceRef: "prov-line-change" });
    expect(changeLineage.target.subjectRevision).toBe(handoff.sourceRevision);
    const objectCount = r1.objects.length;
    const preservedEdge = `${evidenceLineage.source.subjectRevision}>${evidenceLineage.target.subjectRevision}`;
    const supersession = recordGeotechnicalSupersession(store, actor, { supersessionId: "super-1", contextId: context.contextId, predecessor: sitePin, successor: siteNextPin, citedCurrentness: "CURRENT", provenanceRef: "prov-super-1" });
    expect(supersession.deleted).toBe(false);
    expect(supersession.invalid).toBe(false);
    expect(supersession.historicalEdgesRewritten).toBe(false);
    expect(supersession.predecessor.subjectRevision).toBe(site.provenanceRef);
    expect(supersession.successor.subjectRevision).toBe(siteNext.provenanceRef);
    expect(r1.objects).toHaveLength(objectCount);
    expect(store.lineage.map((row) => `${row.source.subjectRevision}>${row.target.subjectRevision}`).join("|")).toContain(preservedEdge);
    const markCount = store.marks.length;
    expect(recordGeotechnicalSupersession(store, actor, { supersessionId: "super-1", contextId: context.contextId, predecessor: sitePin, successor: siteNextPin, citedCurrentness: "CURRENT", provenanceRef: "prov-super-1" }).fingerprint).toBe(supersession.fingerprint);
    expect(store.marks).toHaveLength(markCount);
    expect(store.history.some((row) => row.action === "CREATED" && row.fingerprint === supersession.fingerprint)).toBe(true);
    const propagated = recordGeotechnicalCurrentness(store, actor, { eventId: "mark-change", contextId: context.contextId, subject: changePin, currentness: "STALE", propagate: true, provenanceRef: "prov-mark-change" });
    expect(propagated[0]?.currentness).toBe("STALE");
    expect(propagated[0]?.engineeringInvalid).toBe(false);
    expect(propagated[0]?.engineeringValidated).toBe(false);
    expect(propagated[0]?.contentMutated).toBe(false);
    const handoffMark = propagated.find((row) => row.subject.subjectId === handoff.handoffId);
    expect(handoffMark?.currentness).toBe("STALE");
    expect(handoffMark?.subject.subjectRevision).toBe(site.provenanceRef);
    expect(handoff.sourceRevision).toBe(site.provenanceRef);
    expect(handoff.fingerprint).toBe(handoffPin.subjectFingerprint);
    expect(handoff.citedCurrentness).toBe("CURRENT");
    expect(recordGeotechnicalCurrentness(store, actor, { eventId: "mark-change", contextId: context.contextId, subject: changePin, currentness: "STALE", propagate: true, provenanceRef: "prov-mark-change" })[0]?.fingerprint).toBe(propagated[0]?.fingerprint);
    const reviewMark = recordGeotechnicalCurrentness(store, actor, { eventId: "mark-review", contextId: context.contextId, subject: reviewPin, currentness: "STALE", provenanceRef: "prov-mark-review" })[0];
    expect(reviewMark?.currentness).toBe("STALE");
    expect(reviewMark?.engineeringValidated).toBe(false);
    expect(request.subjectRevision).toBe(site.provenanceRef);
    expect(request.reviewCompleted).toBe(false);
    const validationMark = recordGeotechnicalCurrentness(store, actor, { eventId: "mark-validation", contextId: context.contextId, subject: validationPin, currentness: "REASSESSMENT_REQUIRED", provenanceRef: "prov-mark-validation" })[0];
    expect(validationMark?.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(validationMark?.engineeringValidated).toBe(false);
    expect(validation.engineeringValidated).toBe(true);
    expect(validation.subjectRevision).toBe(site.provenanceRef);
    expect(change.fingerprint).toBe(changePin.subjectFingerprint);
    expect(evidence.fingerprint).toBe(evidencePin.subjectFingerprint);
    expect(site.fingerprint).toBe(sitePin.subjectFingerprint);

    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-float", contextId: context.contextId, source: { ...evidencePin, subjectRevision: "latest" }, target: sitePin, relationshipType: "SUPPORTED_BY", citedCurrentness: "CURRENT", provenanceRef: "prov-float" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-infer", contextId: context.contextId, source: evidencePin, target: siteNextPin, relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-infer", sameBorehole: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-proximity", contextId: context.contextId, source: evidencePin, target: siteNextPin, relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-proximity", proximity: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-self", contextId: context.contextId, source: sitePin, target: sitePin, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-self" })).toThrow(/LINEAGE_SELF_LINK_REJECTED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-super", contextId: context.contextId, source: sitePin, target: siteNextPin, relationshipType: "SUPERSEDES", citedCurrentness: "CURRENT", provenanceRef: "prov-super-edge" })).toThrow(/SUPERSESSION_FUNCTION_REQUIRED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-cycle", contextId: context.contextId, source: sitePin, target: evidencePin, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-cycle" })).toThrow(/CIRCULAR_LINEAGE_REJECTED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-dup", contextId: context.contextId, source: evidencePin, target: sitePin, relationshipType: "SUPPORTED_BY", geotechnicalDependency: "INVESTIGATION_EVIDENCE_TO_STRATIGRAPHY_AND_GROUNDWATER", citedCurrentness: "CURRENT", provenanceRef: "prov-line-dup" })).toThrow(/DUPLICATE_LINEAGE_REJECTED/);
    expect(() => recordGeotechnicalLineage(store, actor, { lineageId: "line-missing", contextId: context.contextId, source: { subjectKind: "PARAMETER", subjectId: "param-missing", subjectRevision: "prov-missing", subjectFingerprint: "fp-missing" }, target: sitePin, relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-missing-param" })).toThrow(/SUBJECT_NOT_FOUND/);
    expect(() => recordGeotechnicalLineage(store, { ...actor, actorId: "AI_recorder", actorKind: "ai" }, { lineageId: "line-ai", contextId: context.contextId, source: evidencePin, target: siteNextPin, relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/AI_CANNOT_FABRICATE_LINEAGE/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-promote", contextId: context.contextId, subject: handoffPin, currentness: "CURRENT", provenanceRef: "prov-promote" })).toThrow(/CURRENTNESS_PROMOTION_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-transfer", contextId: context.contextId, subject: validationPin, currentness: "STALE", provenanceRef: "prov-transfer", transferValidation: true })).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-review-transfer", contextId: context.contextId, subject: reviewPin, currentness: "STALE", provenanceRef: "prov-review-transfer", transferReview: true })).toThrow(/REVIEW_TRANSFER_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-redesign", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-redesign", redesignFoundation: true })).toThrow(/FOUNDATION_REDESIGN_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-excavation", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-excavation", redesignExcavation: true })).toThrow(/EXCAVATION_REDESIGN_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-slope", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-slope", redesignSlope: true })).toThrow(/SLOPE_REDESIGN_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-recommend", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-recommend", generateRecommendation: true })).toThrow(/RECOMMENDATION_GENERATION_REJECTED/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-calc", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-calc", recalculate: true })).toThrow(/RECALCULATION_NOT_IN_R10/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-cross", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-cross", projectId: "project-b" })).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGeotechnicalCurrentness(store, actor, { eventId: "mark-spoof", contextId: context.contextId, subject: sitePin, currentness: "STALE", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => inferGeotechnicalLineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => repointHistoricalGeotechnicalReference()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => redesignFromGeotechnicalCurrentness()).toThrow(/FOUNDATION_REDESIGN_REJECTED/);
    expect(() => recalculateFromGeotechnicalCurrentness()).toThrow(/RECALCULATION_NOT_IN_R10/);
    expect(() => { (evidenceLineage as { provenanceRef: string }).provenanceRef = "silent"; }).toThrow();
    expect(evidence.fingerprint).toBe(evidencePin.subjectFingerprint);
    expect(site.fingerprint).toBe(sitePin.subjectFingerprint);
    expect(siteNext.fingerprint).toBe(siteNextPin.subjectFingerprint);
    expect(change.fingerprint).toBe(changePin.subjectFingerprint);
    expect(handoff.sourceRevision).toBe(site.provenanceRef);
    expect(validation.subjectRevision).toBe(site.provenanceRef);
    expect(validation.engineeringValidated).toBe(true);
    expect(request.subjectRevision).toBe(site.provenanceRef);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("THREAD_DEFAULT_MAX_DEPTH");
    expect(sourceText).toContain("relationSemantics");
    expect(sourceText).toContain("isGovernedRelationType");
    expect(sourceText).toContain("D3_EXPLICIT_CHANGE_DEPENDENCIES");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
