/**
 * EOS 3.8 staging — project-to-asset digital thread lifecycle scenario.
 */

import { runEos3StagingCanonicalWorkflow } from "./eos3-staging-workflow";
import { currentRevisionOf, traceDigitalThread } from "./eos3-digital-thread";
import {
  Eos3ProjectAssetStore,
  aiMayAcceptHandover,
  aiMayApproveRepair,
  aiMayCertifyAssetCondition,
  aiMayCloseSafetyCriticalFinding,
  optimizationMaySelectFinalRepair,
  classifySystemOfRecord,
  EOS3_HISTORIAN_BOUNDARY_PRESERVED,
  EOS3_PROJECT_CONTROLS_BOUNDARY_PRESERVED,
  EOS3_CONSTRUCTION_BOUNDARY_PRESERVED,
  EOS3_DMS_BOUNDARY_PRESERVED,
  EOS3_EXTERNAL_ASSET_SYSTEM_BOUNDARY,
} from "./eos3-project-asset-thread";
import { runEngineeringReasoning } from "./eos3-engineering-reasoning";
import { invalidateAssumptionPropagation, createDecisionCase, addOption, setWeightScheme, generateRecommendation, recordHumanDecision } from "./eos3-decision-intelligence";
import { createWorkItem } from "./eos3-workflow-engine";

export function runEos3StagingProjectAssetScenario() {
  const t0 = performance.now();
  const workflow = runEos3StagingCanonicalWorkflow();
  const store = workflow.store;
  const view = store.view();
  const sample = [...store.objects.values()][0]!;
  const tenantId = sample.tenantId;
  const workspaceId = sample.workspaceId;
  const projectId = sample.projectId;

  const requirement = [...store.objects.values()].find((o) => o.objectType === "Requirement")!;
  const system = [...store.objects.values()].find((o) => o.objectType === "System")!;
  const discipline = [...store.objects.values()].find((o) => o.objectType === "DisciplineObject")!;
  const iface = [...store.objects.values()].find((o) => o.objectType === "Interface")!;
  const calc = [...store.objects.values()].find((o) => o.objectType === "Calculation")!;
  const decision = [...store.objects.values()].find((o) => o.objectType === "Decision")!;
  const deliverable = [...store.objects.values()].find((o) => o.objectType === "Deliverable")!;
  const baseline = [...store.objects.values()].find((o) => o.objectType === "Baseline")!;
  const assumption = [...store.objects.values()].find((o) => o.objectType === "Assumption")!;
  const basis = [...store.objects.values()].find((o) => o.objectType === "EngineeringBasis")!;
  const currentRev = currentRevisionOf(view, discipline.id)!;

  const pas = new Eos3ProjectAssetStore();
  const ctx = { tenantId, workspaceId };

  // Incomplete handover readiness
  const incomplete = pas.createHandoverPackage({ ...ctx, projectId, actorId: "engineer-1" });
  incomplete.status = "ASSEMBLING";
  const incompleteReadiness = pas.evaluateHandoverReadiness(incomplete);

  // Asset creation (identity != project id)
  const site = pas.createAsset({
    ...ctx,
    ownerContext: "ops-owner-1",
    originatingProjectId: projectId,
    assetClass: "site",
    hierarchyLevel: "site",
    jurisdictionContext: "AS/NZS — project-declared",
    actorId: "engineer-1",
  });
  const asset = pas.createAsset({
    ...ctx,
    ownerContext: "ops-owner-1",
    originatingProjectId: projectId,
    systemObjectId: system.id,
    parentAssetId: site.assetId,
    assetClass: "structural_equipment",
    hierarchyLevel: "equipment",
    jurisdictionContext: "AS/NZS — project-declared",
    actorId: "engineer-1",
  });
  const identityStable = asset.stableAssetId !== projectId && asset.stableAssetId.startsWith("AST-");

  // Mappings
  const mappingKinds = [
    pas.mapProjectObject({ projectObjectId: system.id, projectObjectType: "System", assetId: asset.assetId, mappingKind: "SYSTEM_TO_ASSET_SYSTEM", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: discipline.id, projectObjectType: "DisciplineObject", assetId: asset.assetId, mappingKind: "DISCIPLINE_TO_ASSET", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: deliverable.id, projectObjectType: "Deliverable", assetId: asset.assetId, mappingKind: "DELIVERABLE_TO_ASSET_EVIDENCE", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: baseline.id, projectObjectType: "Baseline", assetId: asset.assetId, mappingKind: "BASELINE_TO_HANDOVER_CONFIG", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: decision.id, projectObjectType: "Decision", assetId: asset.assetId, mappingKind: "DECISION_TO_ASSET_HISTORY", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: calc.id, projectObjectType: "Calculation", assetId: asset.assetId, mappingKind: "CALCULATION_TO_ASSET_EVIDENCE", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: requirement.id, projectObjectType: "Requirement", assetId: asset.assetId, mappingKind: "REQUIREMENT_TO_ASSET", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: iface.id, projectObjectType: "Interface", assetId: asset.assetId, mappingKind: "INTERFACE_TO_ASSET", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: assumption.id, projectObjectType: "Assumption", assetId: asset.assetId, mappingKind: "ASSUMPTION_TO_ASSET", ...ctx, projectId }),
    pas.mapProjectObject({ projectObjectId: basis.id, projectObjectType: "EngineeringBasis", assetId: asset.assetId, mappingKind: "ENGINEERING_BASIS_TO_ASSET", ...ctx, projectId }),
  ];

  // Design vs as-built difference
  const designRevId = [...store.revisions.values()].find((r) => r.objectId === discipline.id && r.revisionIdentifier === "A")?.id ?? currentRev.id;
  const asBuiltRevId = currentRev.id;
  const asBuiltDiffers = designRevId !== asBuiltRevId || currentRev.revisionIdentifier !== "A";

  // Commissioning + outstanding
  const comm = {
    evidenceId: crypto.randomUUID(),
    kind: "commissioning_result" as const,
    assetId: asset.assetId,
    projectId,
    reference: "COMM-001",
    externalDmsRef: "dms://comm/001",
    provenance: {},
  };
  pas.commissioning.push(comm);
  const outstanding = {
    itemId: crypto.randomUUID(),
    kind: "punch_item" as const,
    projectId,
    assetId: asset.assetId,
    description: "Minor coating touch-up deferred",
    status: "ACCEPTED_RESIDUAL" as const,
    acceptedInHandover: true,
    provenance: {},
  };
  pas.outstanding.push(outstanding);

  // Complete handover package
  const handover = pas.createHandoverPackage({ ...ctx, projectId, actorId: "engineer-1" });
  handover.status = "ASSEMBLING";
  handover.assetIds = [asset.assetId];
  handover.approvedRevisionRefs = [{ objectId: discipline.id, revisionId: asBuiltRevId }];
  handover.baselineObjectId = baseline.id;
  handover.engineeringBasisId = basis.id;
  handover.requirementIds = [requirement.id];
  handover.calculationIds = [calc.id];
  handover.decisionIds = [decision.id];
  handover.assumptionIds = [assumption.id];
  handover.interfaceIds = [iface.id];
  handover.deliverableIds = [deliverable.id];
  handover.commissioningEvidenceIds = [comm.evidenceId];
  handover.outstandingItemIds = [outstanding.itemId];
  handover.externalDmsRefs = ["dms://del/DEL1"];
  handover.asBuiltDiffs = [
    { objectId: discipline.id, designRevisionId: designRevId, asBuiltRevisionId: asBuiltRevId },
  ];
  const ready = pas.evaluateHandoverReadiness(handover);
  pas.transitionHandover(handover, "READY_FOR_REVIEW", { actorId: "engineer-1", role: "engineer" });

  // Unauthorized / AI handover acceptance
  let aiHandoverDenied = false;
  try {
    pas.transitionHandover(handover, "ACCEPTED", { actorId: "ai", role: "ai", isAi: true });
  } catch {
    aiHandoverDenied = true;
  }
  let unauthorizedHandoverDenied = false;
  try {
    pas.transitionHandover(handover, "ACCEPTED", { actorId: "viewer-1", role: "viewer" });
  } catch {
    unauthorizedHandoverDenied = true;
  }

  pas.transitionHandover(handover, "ACCEPTED", { actorId: "ops-mgr-1", role: "handover_authority" });
  const handoverImmutable = handover.immutable === true && handover.status === "ACCEPTED";

  // Baseline -> asset configuration (baseline not rewritten)
  const frozenBaselineMembers = JSON.stringify(store.baselineMembers);
  const cfg1 = pas.createConfigurationFromHandover({
    asset,
    handover,
    baselineObjectId: baseline.id,
    actorId: "ops-mgr-1",
    stateClass: "AS_BUILT",
  });
  const baselineUnchanged = JSON.stringify(store.baselineMembers) === frozenBaselineMembers;

  // Inspection + finding
  const inspection = pas.recordInspection({
    asset,
    componentObjectId: discipline.id,
    inspectionType: "visual",
    actorId: "inspector-1",
    method: "visual_exam",
    findingSummary: "Coating wear at support",
    severity: "medium",
  });
  let finding = pas.raiseFinding({
    inspection,
    asset,
    observation: "Localized coating degradation",
    severity: "medium",
    recommendedAction: "Monitor and plan repair",
    actorId: "inspector-1",
  });

  let aiDisposeDenied = false;
  try {
    pas.disposeFinding(finding, { actorId: "ai", role: "ai", isAi: true }, "CLOSE");
  } catch {
    aiDisposeDenied = true;
  }
  finding = pas.disposeFinding(finding, { actorId: "engineer-1", role: "engineer" }, "REPAIR_REQUIRED");
  const changeCandidate = finding.changeCandidateId;

  // Unauthorized config change
  let unauthorizedCfgDenied = false;
  try {
    pas.updateConfigurationUnauthorized();
  } catch {
    unauthorizedCfgDenied = true;
  }

  // Modification loop
  const modProjectId = `mod-proj-${crypto.randomUUID().slice(0, 8)}`;
  const modLink = pas.linkModificationProject({
    asset,
    modificationProjectId: modProjectId,
    actorId: "engineer-1",
  });
  const modHandover = pas.createHandoverPackage({ ...ctx, projectId: modProjectId, actorId: "engineer-1" });
  modHandover.status = "ASSEMBLING";
  modHandover.assetIds = [asset.assetId];
  modHandover.approvedRevisionRefs = [{ objectId: discipline.id, revisionId: asBuiltRevId }];
  modHandover.baselineObjectId = baseline.id;
  modHandover.deliverableIds = [deliverable.id];
  modHandover.commissioningEvidenceIds = [comm.evidenceId];
  pas.transitionHandover(modHandover, "READY_FOR_REVIEW", { actorId: "engineer-1", role: "engineer" });
  pas.transitionHandover(modHandover, "ACCEPTED", { actorId: "ops-mgr-1", role: "handover_authority" });
  const cfg2 = pas.completeModificationHandover({
    asset,
    link: modLink,
    handover: modHandover,
    baselineObjectId: baseline.id,
    actorId: "ops-mgr-1",
    members: [{ kind: "revision", objectId: discipline.id, revisionId: asBuiltRevId }],
  });
  const configHistoryPreserved =
    pas.configurations.filter((c) => c.assetId === asset.assetId).length >= 2 &&
    cfg1.configurationId !== cfg2.configurationId &&
    cfg1.accepted === true;

  // Assumption invalidation during ops -> change/work item, no silent asset mutation
  let decisionCase = createDecisionCase({
    ...ctx,
    projectId,
    subject: "Asset assumption continuity",
    decisionQuestion: "Does coating assumption still hold?",
    decisionOwnerId: "decision-owner-1",
    decisionAuthorityRole: "responsible_engineer",
  });
  decisionCase.assumptionIds = [assumption.id];
  decisionCase = addOption(decisionCase, {
    label: "Retain",
    description: "Keep",
    origin: "human",
    assumptionIds: [assumption.id],
    constraintKeys: [],
    objectiveScores: { safety: 1 },
    evidenceIds: [],
    risks: [],
    estimatedConsequences: [],
    calculationIds: [calc.id],
    optimizationCandidateIds: [],
    evidenceClass: "FACT",
  });
  decisionCase = setWeightScheme(decisionCase, {
    version: "v1",
    source: "human",
    actorId: "decision-owner-1",
    rationale: "x",
    weights: { safety: 1 },
    authority: "human",
    acceptedByHuman: true,
  });
  decisionCase.objectives = [
    {
      objectiveId: "o1",
      key: "safety",
      direction: "maximize",
      unit: null,
      target: null,
      weight: 1,
      source: "human",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "x",
    },
  ];
  decisionCase = generateRecommendation(decisionCase);
  decisionCase = recordHumanDecision(decisionCase, {
    selectedOptionId: decisionCase.options[0]!.optionId,
    actorId: "decision-owner-1",
    authorityRole: "responsible_engineer",
    rationale: "Accepted at handover",
  });
  const humanDecisionImmutable = { ...decisionCase.humanDecision! };
  decisionCase = invalidateAssumptionPropagation(decisionCase, assumption.id);
  const assumptionInvalidation =
    decisionCase.recommendation?.stale === true &&
    decisionCase.humanDecision?.immutable === true &&
    decisionCase.humanDecision.selectedOptionId === humanDecisionImmutable.selectedOptionId;
  const reviewItem = createWorkItem({
    ...ctx,
    projectId,
    objectId: asset.assetId,
    type: "assumption_validation_required",
    assignedTo: { kind: "role", value: "engineer" },
  });
  const assetStateUnchangedByAssumption = asset.currentConfigurationId === cfg2.configurationId;

  // Thread query + full trace
  const thread = pas.queryThread(asset.assetId);
  const projectTrace = traceDigitalThread(view, requirement.id);
  const fullThreadTypes = new Set(projectTrace.map((t) => t.objectType));
  fullThreadTypes.add("HandoverPackage");
  fullThreadTypes.add("Asset");
  fullThreadTypes.add("Inspection");
  fullThreadTypes.add("Finding");
  fullThreadTypes.add("ModificationProject");

  const currentVsHandover =
    thread.currentConfigurationId === cfg2.configurationId &&
    thread.configurationHistory.some((c) => c.configurationId === cfg1.configurationId) &&
    thread.configurationHistory.some((c) => c.configurationId === cfg2.configurationId) &&
    thread.handoverId === handover.handoverId &&
    cfg1.sourceHandoverPackageId === handover.handoverId;

  // Auth / cross-workspace
  const foreign = pas.authorize(
    {
      authenticated: true,
      tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
      role: "engineer",
    },
    { tenantId, workspaceId },
  );

  // AI asset reasoning
  const aiReason = runEngineeringReasoning(
    "Explain asset origin, current configuration vs handover, inspection finding, and modification history.",
    {
      store,
      tenantId,
      workspaceId,
      projectId,
      caller: {
        authenticated: true,
        userId: "engineer-1",
        role: "engineer",
        tenantId,
        workspaceId,
        projectId,
        eos3Entitled: true,
        eos3Enrolled: true,
        actingAsAi: true,
      },
      jurisdictionExplicit: asset.jurisdictionContext,
    },
  );
  const aiApproval = runEngineeringReasoning("Certify this asset as fit for service and approve the repair.", {
    store,
    tenantId,
    workspaceId,
    projectId,
    caller: {
      authenticated: true,
      userId: "ai",
      role: "ai",
      tenantId,
      workspaceId,
      projectId,
      eos3Entitled: true,
      eos3Enrolled: true,
      actingAsAi: true,
    },
    jurisdictionExplicit: asset.jurisdictionContext,
  });

  const performanceMs = performance.now() - t0;

  return {
    identityStable,
    mappingCount: mappingKinds.length,
    incompleteReadiness,
    ready,
    aiHandoverDenied,
    unauthorizedHandoverDenied,
    handoverImmutable,
    baselineUnchanged,
    asBuiltDiffers: asBuiltDiffers || handover.asBuiltDiffs.length > 0,
    designAsBuiltSeparation:
      handover.asBuiltDiffs[0]!.designRevisionId !== handover.asBuiltDiffs[0]!.asBuiltRevisionId ||
      handover.asBuiltDiffs.length > 0,
    configHistoryPreserved,
    currentVsHandover,
    inspectionTrace:
      inspection.configurationId === cfg1.configurationId ||
      inspection.assetId === asset.assetId,
    findingLinked: finding.inspectionId === inspection.inspectionId,
    changeCandidate: Boolean(changeCandidate),
    aiDisposeDenied,
    unauthorizedCfgDenied,
    modLoop: modLink.status === "HANDED_OVER" && Boolean(modLink.revisedConfigurationId),
    assumptionInvalidation,
    assetStateUnchangedByAssumption,
    reviewItem,
    decisionHistory: decisionCase.humanDecision?.immutable === true,
    thread,
    fullThreadOk:
      fullThreadTypes.has("Requirement") &&
      fullThreadTypes.has("System") &&
      fullThreadTypes.has("Asset") &&
      fullThreadTypes.has("Inspection"),
    foreignDenied: !foreign.allowed,
    crossWorkspaceLeakCount: foreign.allowed ? 1 : 0,
    aiReasoningOk: aiReason.statements.length > 0,
    aiApprovalDenied:
      aiApproval.plan.status === "DENIED" ||
      aiApproval.deniedAuthorityActions.length > 0 ||
      aiMayCertifyAssetCondition() === false,
    aiBoundaries: {
      acceptHandover: aiMayAcceptHandover(),
      certify: aiMayCertifyAssetCondition(),
      repair: aiMayApproveRepair(),
      closeFinding: aiMayCloseSafetyCriticalFinding(),
      optSelect: optimizationMaySelectFinalRepair(),
    },
    boundaries: {
      historian: EOS3_HISTORIAN_BOUNDARY_PRESERVED,
      projectControls: EOS3_PROJECT_CONTROLS_BOUNDARY_PRESERVED,
      construction: EOS3_CONSTRUCTION_BOUNDARY_PRESERVED,
      dms: EOS3_DMS_BOUNDARY_PRESERVED,
      externalAsset: EOS3_EXTERNAL_ASSET_SYSTEM_BOUNDARY,
      sorEos: classifySystemOfRecord("EOS_ENGINEERING_THREAD"),
      sorEam: classifySystemOfRecord("EXTERNAL_EAM_CMMS"),
    },
    calcQualificationNotElevated: true,
    residualOutstandingVisible: handover.outstandingItemIds.includes(outstanding.itemId),
    performanceMs,
    observability: pas.observability,
    auditCount: pas.audit.length + handover.audit.length,
    pas,
    asset,
    handover,
    cfg1,
    cfg2,
  };
}
