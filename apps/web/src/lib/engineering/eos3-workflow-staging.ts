/**
 * EOS 3.5 staging governed workflow + event scenario (synthetic).
 */

import { runEos3StagingCanonicalWorkflow } from "./eos3-staging-workflow";
import {
  authorizeWorkflowAccess,
  createWorkItem,
  createWorkflowInstance,
  transitionWorkflow,
  workItemCompletionGrantsApproval,
  type Eos3WorkItem,
  type Eos3WorkflowInstance,
} from "./eos3-workflow-engine";
import { Eos3GovernedEventBus } from "./eos3-governed-events";
import {
  createDecisionCase,
  generateRecommendation,
  invalidateAssumptionPropagation,
  addOption,
  setWeightScheme,
  recordHumanDecision,
} from "./eos3-decision-intelligence";

export function runEos3StagingGovernedWorkflowScenario() {
  const t0 = performance.now();
  const workflow = runEos3StagingCanonicalWorkflow();
  const store = workflow.store;
  const sample = [...store.objects.values()][0]!;
  const tenantId = sample.tenantId;
  const workspaceId = sample.workspaceId;
  const projectId = sample.projectId;

  const requirement = [...store.objects.values()].find((o) => o.objectType === "Requirement")!;
  const discipline = [...store.objects.values()].find((o) => o.objectType === "DisciplineObject")!;
  const iface = [...store.objects.values()].find((o) => o.objectType === "Interface")!;
  const deliverable = [...store.objects.values()].find((o) => o.objectType === "Deliverable")!;
  const baseline = [...store.objects.values()].find((o) => o.objectType === "Baseline")!;
  const assumption = [...store.objects.values()].find((o) => o.objectType === "Assumption")!;
  const revs = [...store.revisions.values()].filter((r) => r.objectId === discipline.id);
  const revA = revs.find((r) => r.revisionIdentifier === "A")!;
  const revB = revs.find((r) => r.revisionIdentifier === "B")!;

  const bus = new Eos3GovernedEventBus();
  const workItems: Eos3WorkItem[] = [];
  const retrievalInvalidations: string[] = [];
  const instances: Record<string, Eos3WorkflowInstance> = {};

  const ctx = { tenantId, workspaceId, projectId };

  instances.requirement = createWorkflowInstance({
    ...ctx,
    objectId: requirement.id,
    objectType: "Requirement",
    initialState: "APPROVED",
  });
  instances.interface = createWorkflowInstance({
    ...ctx,
    objectId: iface.id,
    objectType: "Interface",
    revisionId: revA.id,
    initialState: "ISSUED",
  });
  instances.deliverable = createWorkflowInstance({
    ...ctx,
    objectId: deliverable.id,
    objectType: "Deliverable",
    revisionId: revA.id,
    initialState: "APPROVED",
  });
  instances.baseline = createWorkflowInstance({
    ...ctx,
    objectId: baseline.id,
    objectType: "Baseline",
    initialState: "FROZEN",
  });
  instances.decision = createWorkflowInstance({
    ...ctx,
    objectId: "decision-case-synthetic",
    objectType: "Decision",
    initialState: "DRAFT",
  });
  instances.optimization = createWorkflowInstance({
    ...ctx,
    objectId: "opt-run-synthetic",
    objectType: "OptimizationRun",
    initialState: "DEFINED",
  });
  instances.review = createWorkflowInstance({
    ...ctx,
    objectId: "review-synthetic",
    objectType: "Review",
    initialState: "DRAFT",
  });

  // 1-2: Revision B already exists from EOS 3.2 staging; emit governed revision event
  const revEvent = bus.publish({
    eventType: "REVISION_CREATED",
    category: "REVISION_CHANGE",
    ...ctx,
    objectId: discipline.id,
    revisionId: revB.id,
    actorId: "engineer-1",
    authority: "engineer",
    source: "eos3.workflow.staging",
    idempotencyKey: `rev:${discipline.id}:${revB.id}`,
    sequenceHint: 10,
    payload: { fromRevision: revA.revisionIdentifier, toRevision: revB.revisionIdentifier },
  });
  bus.markProcessed(revEvent.eventId);

  // Duplicate event test
  const dup = bus.publish({
    eventType: "REVISION_CREATED",
    category: "REVISION_CHANGE",
    ...ctx,
    objectId: discipline.id,
    revisionId: revB.id,
    actorId: "engineer-1",
    authority: "engineer",
    source: "eos3.workflow.staging",
    idempotencyKey: `rev:${discipline.id}:${revB.id}`,
    sequenceHint: 10,
  });

  // Out-of-order older event
  const older = bus.publish({
    eventType: "REVISION_CREATED",
    category: "REVISION_CHANGE",
    ...ctx,
    objectId: discipline.id,
    revisionId: revA.id,
    actorId: "engineer-1",
    authority: "engineer",
    source: "eos3.workflow.staging",
    idempotencyKey: `rev:${discipline.id}:${revA.id}:late`,
    sequenceHint: 5,
  });

  // 3-6: change propagation — impact candidate + stale deliverable + work item (non-authoritative)
  const impactEvent = bus.publish({
    eventType: "IMPACT_CANDIDATE_CREATED",
    category: "IMPACT_CHANGE",
    ...ctx,
    objectId: deliverable.id,
    revisionId: revB.id,
    actorId: null,
    authority: null,
    source: "eos3.change.propagation",
    causationId: revEvent.eventId,
    correlationId: revEvent.correlationId,
    idempotencyKey: `impact:${deliverable.id}:${revB.id}`,
    sequenceHint: 11,
    payload: { reason: "upstream_revision_advanced" },
  });
  bus.markProcessed(impactEvent.eventId);

  store.markStale(deliverable.id, "upstream_revision_advanced");
  instances.deliverable = transitionWorkflow(instances.deliverable, {
    to: "STALE",
    actorId: "system",
    authorityRole: "operator",
    eventId: impactEvent.eventId,
    reason: "upstream_revision_B",
  });
  retrievalInvalidations.push(`object:${deliverable.id}`);

  const reviewItem = createWorkItem({
    ...ctx,
    objectId: deliverable.id,
    type: "review_required",
    assignedTo: { kind: "role", value: "reviewer" },
    priority: "high",
  });
  workItems.push(reviewItem);

  // Requirement change workflow
  const reqChange = bus.publish({
    eventType: "REQUIREMENT_REVISED",
    category: "REQUIREMENT_CHANGE",
    ...ctx,
    objectId: requirement.id,
    actorId: "engineer-1",
    authority: "engineer",
    source: "eos3.requirement.workflow",
    causationId: revEvent.eventId,
    correlationId: revEvent.correlationId,
    idempotencyKey: `req:${requirement.id}:rev2`,
    sequenceHint: 12,
  });
  bus.markProcessed(reqChange.eventId);
  workItems.push(
    createWorkItem({
      ...ctx,
      objectId: requirement.id,
      type: "impact_assessment_required",
      assignedTo: { kind: "user", value: "engineer-1" },
    }),
  );

  // 7: AI cannot accept interface / approve deliverable / finalize decision / freeze
  let aiInterfaceDenied = false;
  try {
    transitionWorkflow(instances.interface, {
      to: "ACCEPTED",
      actorId: "ai",
      authorityRole: "ai",
    });
  } catch {
    aiInterfaceDenied = true;
  }
  // Need RECEIVED first for ACCEPTED - also test AI on APPROVED->RELEASED
  let aiReleaseDenied = false;
  try {
    // deliverable is STALE; try release path on a temp approved instance
    const tempDel = createWorkflowInstance({
      ...ctx,
      objectId: deliverable.id + "-tmp",
      objectType: "Deliverable",
      initialState: "APPROVED",
    });
    transitionWorkflow(tempDel, { to: "RELEASED", actorId: "ai", authorityRole: "ai" });
  } catch {
    aiReleaseDenied = true;
  }

  let aiDecideDenied = false;
  try {
    instances.decision = transitionWorkflow(instances.decision, {
      to: "ANALYSIS",
      actorId: "ai",
      authorityRole: "ai",
    });
    instances.decision = transitionWorkflow(instances.decision, {
      to: "READY_FOR_HUMAN_DECISION",
      actorId: "ai",
      authorityRole: "ai",
    });
    transitionWorkflow(instances.decision, {
      to: "DECIDED",
      actorId: "ai",
      authorityRole: "ai",
    });
  } catch {
    aiDecideDenied = true;
  }

  let aiFreezeDenied = false;
  try {
    const bl = createWorkflowInstance({
      ...ctx,
      objectId: baseline.id + "-new",
      objectType: "Baseline",
      initialState: "READY",
    });
    transitionWorkflow(bl, { to: "FROZEN", actorId: "ai", authorityRole: "ai" });
  } catch {
    aiFreezeDenied = true;
  }

  // Role escalation: engineer cannot release
  let roleEscalationDenied = false;
  try {
    const tempDel = createWorkflowInstance({
      ...ctx,
      objectId: "del-release-test",
      objectType: "Deliverable",
      initialState: "APPROVED",
    });
    transitionWorkflow(tempDel, { to: "RELEASED", actorId: "eng", authorityRole: "engineer" });
  } catch {
    roleEscalationDenied = true;
  }

  // Human checkpoint blocking: decision READY without human stays not DECIDED
  const humanCheckpointBlocking = instances.decision.currentState === "READY_FOR_HUMAN_DECISION";

  // 8-9: authorized human resolves review + interface acceptance path
  instances.review = transitionWorkflow(instances.review, {
    to: "IN_REVIEW",
    actorId: "ai",
    authorityRole: "ai",
    reason: "ai_prepared_findings",
  });
  instances.review = transitionWorkflow(instances.review, {
    to: "ACCEPTED",
    actorId: "reviewer-1",
    authorityRole: "reviewer",
  });

  instances.interface = transitionWorkflow(instances.interface, {
    to: "RECEIVED",
    actorId: "receiver-1",
    authorityRole: "receiver",
  });
  instances.interface = transitionWorkflow(instances.interface, {
    to: "ACCEPTED",
    actorId: "receiver-1",
    authorityRole: "receiver",
  });

  // Decision workflow with stale on assumption change
  let decisionCase = createDecisionCase({
    ...ctx,
    subject: "Workflow-linked decision",
    decisionQuestion: "Accept revised concept?",
    decisionOwnerId: "decision-owner-1",
    decisionAuthorityRole: "responsible_engineer",
  });
  decisionCase.assumptionIds = [assumption.id];
  decisionCase = addOption(decisionCase, {
    label: "Accept B",
    description: "Proceed with revision B",
    origin: "human",
    assumptionIds: [assumption.id],
    constraintKeys: [],
    objectiveScores: { safety: 1 },
    evidenceIds: [],
    risks: [],
    estimatedConsequences: [],
    calculationIds: [],
    optimizationCandidateIds: [],
    evidenceClass: "FACT",
  });
  decisionCase = setWeightScheme(decisionCase, {
    version: "v1",
    source: "human",
    actorId: "decision-owner-1",
    rationale: "equal",
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
  instances.decision = transitionWorkflow(instances.decision, {
    to: "DECIDED",
    actorId: "decision-owner-1",
    authorityRole: "decision_owner",
  });
  decisionCase = recordHumanDecision(decisionCase, {
    selectedOptionId: decisionCase.options[0]!.optionId,
    actorId: "decision-owner-1",
    authorityRole: "responsible_engineer",
    rationale: "Human accepts after review",
  });
  const decisionBeforeStale = { ...decisionCase.humanDecision! };
  decisionCase = invalidateAssumptionPropagation(decisionCase, assumption.id);
  const decisionStaleWorkflow =
    decisionCase.recommendation?.stale === true &&
    decisionCase.humanDecision?.immutable === true &&
    decisionCase.humanDecision.selectedOptionId === decisionBeforeStale.selectedOptionId;

  const assumptionEvent = bus.publish({
    eventType: "ASSUMPTION_INVALIDATED",
    category: "ASSUMPTION_CHANGE",
    ...ctx,
    objectId: assumption.id,
    actorId: "engineer-1",
    authority: "engineer",
    source: "eos3.decision.stale",
    causationId: revEvent.eventId,
    correlationId: revEvent.correlationId,
    idempotencyKey: `asm:${assumption.id}:invalid`,
    sequenceHint: 13,
  });
  bus.markProcessed(assumptionEvent.eventId);
  retrievalInvalidations.push(`assumption:${assumption.id}`);

  // Optimization workflow: complete without becoming decision
  instances.optimization = transitionWorkflow(instances.optimization, {
    to: "READY",
    actorId: "engineer-1",
    authorityRole: "engineer",
  });
  instances.optimization = transitionWorkflow(instances.optimization, {
    to: "RUNNING",
    actorId: "engineer-1",
    authorityRole: "engineer",
  });
  instances.optimization = transitionWorkflow(instances.optimization, {
    to: "COMPLETED",
    actorId: "ai",
    authorityRole: "ai",
  });
  const optResultEvent = bus.publish({
    eventType: "OPTIMIZATION_COMPLETED",
    category: "OPTIMIZATION_RESULT",
    ...ctx,
    objectId: "opt-run-synthetic",
    actorId: "ai",
    authority: null,
    source: "eos3.optimization.workflow",
    causationId: revEvent.eventId,
    correlationId: revEvent.correlationId,
    idempotencyKey: `opt:opt-run-synthetic:complete`,
    sequenceHint: 14,
  });
  // Must not auto-decide
  const optDoesNotDecide = bus.eventMayFinalizeDecision(optResultEvent) === false;

  // 10: freeze new baseline (authorized) — prior frozen baseline immutable
  const frozenMembership = [...store.baselineMembers];
  const newBaselineInstance = createWorkflowInstance({
    ...ctx,
    objectId: "baseline-new",
    objectType: "Baseline",
    initialState: "READY",
  });
  const frozenNew = transitionWorkflow(newBaselineInstance, {
    to: "FROZEN",
    actorId: "config-mgr",
    authorityRole: "freeze_authority",
  });
  // Post-freeze: create another revision must not mutate old baseline members
  store.createRevision({
    objectId: discipline.id,
    revisionIdentifier: "C",
    actorId: "engineer-1",
    authority: "discipline_lead",
    source: "staging",
    changeRationale: "post-freeze",
    payload: { massKg: 1200 },
  });
  const postFreezeImmutable =
    JSON.stringify(store.baselineMembers) === JSON.stringify(frozenMembership);

  // Event cycle / cascade depth
  let cycleDetected = false;
  try {
    let causation = revEvent.eventId;
    for (let i = 0; i < 10; i += 1) {
      const e = bus.publish({
        eventType: "STATE_CHANGE_CASCADE",
        category: "STATE_CHANGE",
        ...ctx,
        objectId: discipline.id,
        source: "eos3.cascade.test",
        causationId: causation,
        correlationId: revEvent.correlationId,
        idempotencyKey: `cascade:${i}`,
        sequenceHint: 20 + i,
      });
      causation = e.eventId;
    }
  } catch {
    cycleDetected = true;
  }

  // Failed handler recovery
  const failEv = bus.publish({
    eventType: "HANDLER_FAIL_PROBE",
    category: "SECURITY_GOVERNANCE",
    ...ctx,
    objectId: discipline.id,
    source: "eos3.failure.test",
    idempotencyKey: "fail-probe-1",
    sequenceHint: 40,
  });
  bus.failHandler(failEv.eventId, "forced_handler_failure");
  bus.failHandler(failEv.eventId, "forced_handler_failure");
  const dead = bus.failHandler(failEv.eventId, "forced_handler_failure", { deadLetter: true });
  const failureVisible = dead.status === "DEAD_LETTER";

  // Replay safety
  const replay = bus.replay(revEvent.eventId);

  // Security: foreign workspace / untrusted injection / direct API bypass analog
  const foreign = authorizeWorkflowAccess(
    {
      authenticated: true,
      tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
    },
    instances.deliverable,
  );
  const untrustedInject = bus.authorizeEventIngest(
    {
      authenticated: true,
      tenantId,
      workspaceId,
      eos3Entitled: true,
      eos3Enrolled: true,
      trustedIngress: false,
    },
    { tenantId, workspaceId },
  );
  let directBypassDenied = false;
  try {
    // Attempt transition without valid edge (API bypass style)
    transitionWorkflow(instances.deliverable, {
      to: "RELEASED",
      actorId: "attacker",
      authorityRole: "release_authority",
      clientSubmittedEvent: true,
    });
  } catch {
    directBypassDenied = true;
  }

  const performanceMs = performance.now() - t0;

  const causationTrace = bus.events
    .filter((e) => e.correlationId === revEvent.correlationId && e.status === "PROCESSED")
    .map((e) => ({ eventId: e.eventId, type: e.eventType, causationId: e.causationId }));

  return {
    instances,
    bus,
    workItems,
    retrievalInvalidations,
    revEvent,
    dup,
    older,
    impactEvent,
    aiInterfaceDenied,
    aiReleaseDenied,
    aiDecideDenied,
    aiFreezeDenied,
    roleEscalationDenied,
    humanCheckpointBlocking,
    decisionStaleWorkflow,
    optDoesNotDecide,
    postFreezeImmutable,
    frozenNewState: frozenNew.currentState,
    cycleDetected,
    failureVisible,
    replay,
    foreignDenied: !foreign.allowed,
    untrustedInjectDenied: !untrustedInject.allowed,
    directBypassDenied,
    workItemCompletionGrantsApproval: workItemCompletionGrantsApproval(),
    staleDeliverable: instances.deliverable.currentState === "STALE",
    causationTrace,
    observability: bus.observability,
    performanceMs,
    store,
  };
}
