/**
 * Bounded synthetic EOS 3.2 staging workflow (in-process).
 * Not Production. Demonstrates full digital-thread chain.
 */

import { Eos3CanonicalObjectStore } from "./eos3-object-store";
import {
  assumptionsSupportingCalculation,
  baselinesContainingRevision,
  currentRevisionOf,
  evidenceSupportingDecision,
  requirementsDrivingObject,
  traceDigitalThread,
} from "./eos3-digital-thread";
import { listStructuredObjects } from "./eos3-structured-retrieval";
import { interfaceAuthorityBoundary, changeMaterialityAuthority } from "./eos3-object-authority";
import { assertImplementedNotQualified } from "./eos3-canonical-objects";

export type StagingWorkflowResult = {
  store: Eos3CanonicalObjectStore;
  objectCount: number;
  relationshipCount: number;
  threadTraceLength: number;
  performanceMs: number;
  calculationQualification: {
    d1: string;
    nonD1: string;
    externalSolver: string;
  };
};

export function runEos3StagingCanonicalWorkflow(seed?: {
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
}): StagingWorkflowResult {
  const t0 = performance.now();
  const tenantId = seed?.tenantId ?? "00000000-0000-4000-8000-000000000031";
  const workspaceId = seed?.workspaceId ?? "00000000-0000-4000-8000-000000000032";
  const projectId = seed?.projectId ?? "eos3-staging-digital-thread-001";
  const owner = "engineer-owner-1";
  const store = new Eos3CanonicalObjectStore();

  const project = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Project",
    stableObjectId: "proj.eos3.staging.001",
    displayName: "EOS 3 Staging Digital Thread",
    sourceOwnerId: owner,
    actorId: owner,
    authority: "project_lead",
  });

  const basis = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "EngineeringBasis",
    stableObjectId: "basis.staging.001",
    displayName: "Staging Engineering Basis",
    sourceOwnerId: owner,
  });

  const requirement = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Requirement",
    stableObjectId: "req.SYS-001",
    displayName: "System shall support governed revision traceability",
    sourceOwnerId: owner,
    payload: {
      text: "System shall support governed revision traceability",
      category: "systems_engineering",
      status: "approved",
      verificationMethod: "review",
      owner,
    },
  });

  const system = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "System",
    stableObjectId: "sys.primary.001",
    displayName: "Primary Process System",
    sourceOwnerId: owner,
  });

  const discipline = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "DisciplineObject",
    stableObjectId: "disc.mech.vessel.001",
    displayName: "Pressure Vessel Envelope",
    sourceOwnerId: owner,
    disciplineType: "mechanical",
  });

  const rev1 = store.createRevision({
    objectId: discipline.id,
    revisionIdentifier: "A",
    actorId: owner,
    authority: "discipline_lead",
    source: "staging",
    changeRationale: "Initial issue",
    payload: { massKg: 1000 },
  });

  const iface = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Interface",
    stableObjectId: "iface.mech-to-piping.001",
    displayName: "Mech→Piping nozzle interface",
    sourceOwnerId: owner,
    payload: {
      sourceOwnsSourceState: true,
      receiverOwnsAcceptance: true,
      acceptanceState: "pending",
    },
  });

  const change = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Change",
    stableObjectId: "chg.staging.001",
    displayName: "Increase design pressure",
    sourceOwnerId: owner,
    payload: { reason: "Process update", initiator: owner },
  });

  const impact = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Impact",
    stableObjectId: "imp.staging.001",
    displayName: "Vessel wall thickness candidate impact",
    sourceOwnerId: owner,
    payload: {
      candidate: true,
      materiality: null,
      materialityAuthority: "human_only",
      status: "candidate",
    },
  });

  const assumption = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Assumption",
    stableObjectId: "asm.staging.001",
    displayName: "Design metal temperature within code limit",
    sourceOwnerId: owner,
    payload: { status: "open", validationRequirement: "code_check", expiryReviewPoint: "detailed_design" },
  });

  const calcD1 = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Calculation",
    stableObjectId: "calc.d1.compatible.001",
    displayName: "Structural D1 compatible calc metadata",
    sourceOwnerId: owner,
  });
  store.setCalculationQualification(calcD1.id, "QUALIFIED_BOUNDED", {
    method: "structural_d1",
    tool: "eos2_d1",
    solver: null,
    deterministic: true,
  });

  const calcNonD1 = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Calculation",
    stableObjectId: "calc.non_d1.001",
    displayName: "Non-D1 unqualified calc metadata",
    sourceOwnerId: owner,
  });
  store.setCalculationQualification(calcNonD1.id, "IMPLEMENTED", {
    method: "generic_stress",
    tool: "internal",
    solver: null,
    deterministic: true,
  });

  const calcExternal = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Calculation",
    stableObjectId: "calc.external_solver.001",
    displayName: "External solver unqualified result metadata",
    sourceOwnerId: owner,
  });
  store.setCalculationQualification(calcExternal.id, "IMPLEMENTED", {
    method: "fe_external",
    tool: "external_solver_x",
    solver: "external_solver_x",
    deterministic: true,
  });

  const evidence = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Evidence",
    stableObjectId: "ev.staging.001",
    displayName: "Code check worksheet",
    sourceOwnerId: owner,
    payload: { classification: "FACT", kind: "record" },
  });

  const review = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Review",
    stableObjectId: "revw.staging.001",
    displayName: "Discipline design review",
    sourceOwnerId: owner,
    payload: { reviewer: "reviewer-1", status: "complete", disposition: "accepted" },
  });

  const decision = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Decision",
    stableObjectId: "dec.staging.001",
    displayName: "Select wall schedule",
    sourceOwnerId: owner,
  });
  store.recordDecision({
    decisionObjectId: decision.id,
    selectedOption: "Schedule 40",
    optionsConsidered: ["Schedule 40", "Schedule 80"],
    rationale: "Code minimum with margin",
    actorId: owner,
    authorityRole: "responsible_engineer",
  });

  const deliverable = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Deliverable",
    stableObjectId: "del.staging.001",
    displayName: "Vessel data sheet",
    sourceOwnerId: owner,
    payload: { approvalState: "draft", releaseState: "not_released" },
  });

  const baseline = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Baseline",
    stableObjectId: "bl.staging.001",
    displayName: "FEED baseline freeze",
    sourceOwnerId: owner,
  });

  const asset = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Asset",
    stableObjectId: "asset.staging.001",
    displayName: "Future vessel asset foundation",
    sourceOwnerId: owner,
    payload: { lifecycleState: "design", locationContext: "unit-01" },
  });

  const inspection = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "Inspection",
    stableObjectId: "insp.staging.001",
    displayName: "Foundation inspection metadata",
    sourceOwnerId: owner,
    payload: { inspectionType: "visual", disposition: "n_a_design_phase" },
  });

  const opt = store.createObject({
    tenantId,
    workspaceId,
    projectId,
    objectType: "OptimizationRun",
    stableObjectId: "opt.staging.001",
    displayName: "Wall thickness candidates",
    sourceOwnerId: owner,
    payload: {
      objective: "minimize_mass",
      constraints: ["code_stress"],
      qualificationState: "NOT_QUALIFIED",
      humanSelectionRequired: true,
      resultIsNotDecision: true,
    },
  });

  const ctx = { tenantId, workspaceId, projectId };
  store.relate({
    ...ctx,
    relationshipType: "ENGINEERING_BASIS_RELATES_TO",
    fromObjectId: basis.id,
    toObjectId: requirement.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "REQUIREMENT_ALLOCATED_TO_SYSTEM",
    fromObjectId: requirement.id,
    toObjectId: system.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "REQUIREMENT_ALLOCATED_TO_DISCIPLINE_OBJECT",
    fromObjectId: requirement.id,
    toObjectId: discipline.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "SYSTEM_CONTAINS_DISCIPLINE_OBJECT",
    fromObjectId: system.id,
    toObjectId: discipline.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "INTERFACE_SOURCE_REVISION",
    fromObjectId: iface.id,
    toObjectId: discipline.id,
    toRevisionId: rev1.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "INTERFACE_TRACES_REQUIREMENT",
    fromObjectId: iface.id,
    toObjectId: requirement.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "INTERFACE_TRACES_SYSTEM",
    fromObjectId: iface.id,
    toObjectId: system.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "CHANGE_AFFECTS_OBJECT",
    fromObjectId: change.id,
    toObjectId: discipline.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "CHANGE_PRODUCES_IMPACT",
    fromObjectId: change.id,
    toObjectId: impact.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "IMPACT_ON_OBJECT",
    fromObjectId: impact.id,
    toObjectId: discipline.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "ASSUMPTION_SUPPORTS_CALCULATION",
    fromObjectId: assumption.id,
    toObjectId: calcD1.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "ASSUMPTION_SUPPORTS_DECISION",
    fromObjectId: assumption.id,
    toObjectId: decision.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "CALCULATION_HAS_EVIDENCE",
    fromObjectId: calcD1.id,
    toObjectId: evidence.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "REVIEW_OF_OBJECT",
    fromObjectId: review.id,
    toObjectId: discipline.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "DECISION_HAS_EVIDENCE",
    fromObjectId: decision.id,
    toObjectId: evidence.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "DECISION_USES_ASSUMPTION",
    fromObjectId: decision.id,
    toObjectId: assumption.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "DELIVERABLE_SNAPSHOT_OF_REVISION",
    fromObjectId: discipline.id,
    toObjectId: deliverable.id,
    fromRevisionId: rev1.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "ASSET_ORIGINATED_FROM_SYSTEM",
    fromObjectId: system.id,
    toObjectId: asset.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "ASSET_ORIGINATED_FROM_PROJECT",
    fromObjectId: project.id,
    toObjectId: asset.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "INSPECTION_OF_ASSET",
    fromObjectId: inspection.id,
    toObjectId: asset.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "OPTIMIZATION_RUN_USES_CALCULATION",
    fromObjectId: opt.id,
    toObjectId: calcNonD1.id,
  });
  store.relate({
    ...ctx,
    relationshipType: "OPTIMIZATION_RUN_INFORMS_DECISION",
    fromObjectId: opt.id,
    toObjectId: decision.id,
  });

  // Revision change awareness — new revision, mark downstream deliverable STALE / IMPACT_CANDIDATE
  // without rewriting historical revision payload or baseline membership.
  const rev2 = store.createRevision({
    objectId: discipline.id,
    revisionIdentifier: "B",
    actorId: owner,
    authority: "discipline_lead",
    source: "staging",
    changeRationale: "Pressure increase from change",
    payload: { massKg: 1100 },
  });
  store.markImpactCandidate(deliverable.id, change.id);
  store.markStale(deliverable.id, "upstream_revision_advanced");

  store.freezeBaseline({
    baselineObjectId: baseline.id,
    members: [{ memberObjectId: discipline.id, memberRevisionId: rev1.id }],
    actorId: owner,
    authorityRole: "configuration_manager",
  });

  // Later revision must not mutate frozen baseline membership (rev1 remains).
  try {
    store.rewriteBaselineMembership(baseline.id);
  } catch {
    // expected
  }

  // Authority denials
  try {
    store.authorize("accept_interface", { role: "ai" });
  } catch {
    // expected
  }
  try {
    store.authorize("finalize_impact_materiality", { role: "ai" });
  } catch {
    // expected
  }

  void interfaceAuthorityBoundary();
  void changeMaterialityAuthority();
  void currentRevisionOf(store.view(), discipline.id);
  void requirementsDrivingObject(store.view(), discipline.id);
  void assumptionsSupportingCalculation(store.view(), calcD1.id);
  void evidenceSupportingDecision(store.view(), decision.id);
  void baselinesContainingRevision(store.view(), rev1.id);
  void listStructuredObjects(store, { projectId });
  void assertImplementedNotQualified("QUALIFIED_BOUNDED");
  void rev2;

  const trace = traceDigitalThread(store.view(), requirement.id);
  const counts = store.counts();
  const performanceMs = performance.now() - t0;

  return {
    store,
    objectCount: counts.objects,
    relationshipCount: counts.relationships,
    threadTraceLength: trace.length,
    performanceMs,
    calculationQualification: {
      d1: String(store.objects.get(calcD1.id)?.payload.qualificationStatus),
      nonD1: String(store.objects.get(calcNonD1.id)?.payload.qualificationStatus),
      externalSolver: String(store.objects.get(calcExternal.id)?.payload.qualificationStatus),
    },
  };
}
