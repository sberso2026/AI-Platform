import {
  assumptionBlocksNextStage,
  emptyLifecycle,
  evaluateGate,
  genericCriteria,
  isAllowedTransition,
  roleMayAuthorizeTransition,
  type AuditRecord,
  type ConfigurationBaseline,
  type DeliveryLifecycle,
  type DeliveryStage,
  type MaturityState,
  type ProjectControlEvent,
  type StageRefs,
  type BaselineType,
} from "./model";

export type TransitionRequest = {
  to: string;
  reason: string;
  actorId: string;
  actorRole: string | null;
  at: string;
  canAuthorizeLifecycleTransition?: boolean;
  overrideRationale?: string | null;
};

export type TransitionResult = {
  lifecycle: DeliveryLifecycle;
  committed: boolean;
  audit: AuditRecord[];
  events: ProjectControlEvent[];
  blockers: string[];
  error: string | null;
};

function refsOf(lifecycle: DeliveryLifecycle): StageRefs {
  return {
    designBasis: lifecycle.requirements.filter((item) => item.discipline === "common").map((item) => item.id),
    requirements: lifecycle.requirements.map((item) => item.id),
    assumptions: lifecycle.assumptions.map((item) => item.id),
    criteria: lifecycle.criteria.map((item) => item.gateId),
    calculations: lifecycle.deliverables.filter((item) => item.deliverableType === "calculation").map((item) => item.id),
    models: lifecycle.deliverables.filter((item) => item.deliverableType === "model").map((item) => item.id),
    interfaces: lifecycle.interfaces.map((item) => item.id),
    decisions: [],
    risks: [],
    changes: lifecycle.changes.map((item) => item.id),
    deliverables: lifecycle.deliverables.map((item) => item.id),
  };
}

export function createDeliveryLifecycle(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorId: string;
  at: string;
}): { lifecycle: DeliveryLifecycle; audit: AuditRecord[]; events: ProjectControlEvent[] } {
  const created = emptyLifecycle(input);
  return { lifecycle: created.lifecycle, audit: [created.audit], events: [] };
}

export function changeMaturity(
  lifecycle: DeliveryLifecycle,
  maturity: MaturityState,
  actorId: string,
  at: string,
): { lifecycle: DeliveryLifecycle; audit: AuditRecord; events: ProjectControlEvent[] } {
  return {
    lifecycle: { ...lifecycle, maturity, revision: lifecycle.revision + 1 },
    audit: {
      action: "maturity_changed",
      at,
      actorId,
      detail: { maturity, approvalGranted: false },
    },
    events: [{ type: "design_maturity", at, lifecycleId: lifecycle.id }],
  };
}

export function requestStageTransition(
  lifecycle: DeliveryLifecycle,
  request: TransitionRequest,
): TransitionResult {
  const audit: AuditRecord[] = [
    {
      action: "stage_transition_requested",
      at: request.at,
      actorId: request.actorId,
      detail: { from: lifecycle.stage, to: request.to, reason: request.reason },
    },
  ];
  if (!isAllowedTransition(lifecycle.stage, request.to)) {
    return {
      lifecycle,
      committed: false,
      audit,
      events: [],
      blockers: ["transition_not_allowed"],
      error: "Only the next stage is allowed. Skipping and future stages are rejected.",
    };
  }
  const to = request.to as DeliveryStage;
  const criteria = lifecycle.criteria.filter((item) => item.stage === lifecycle.stage);
  const gate = evaluateGate(criteria.length ? criteria : []);
  const assumptionBlockers = lifecycle.assumptions.filter(assumptionBlocksNextStage).map((item) => item.id);
  audit.push({
    action: "gate_evaluated",
    at: request.at,
    actorId: request.actorId,
    detail: { ready: gate.ready, blockerCount: gate.blockers.length + assumptionBlockers.length },
  });
  const blockers = [...gate.blockers.map((item) => item.criterion), ...assumptionBlockers];
  const authorized =
    request.canAuthorizeLifecycleTransition === true && roleMayAuthorizeTransition(request.actorRole);
  if (!authorized) {
    return {
      lifecycle,
      committed: false,
      audit,
      events: [{ type: "gate_readiness", at: request.at, lifecycleId: lifecycle.id }],
      blockers,
      error: "Lifecycle transition authority is not granted to this role.",
    };
  }
  if (!gate.ready || assumptionBlockers.length > 0) {
    if (!request.overrideRationale?.trim()) {
      return {
        lifecycle,
        committed: false,
        audit,
        events: [
          { type: "gate_readiness", at: request.at, lifecycleId: lifecycle.id },
          { type: "engineering_blocker", at: request.at, lifecycleId: lifecycle.id },
        ],
        blockers,
        error: "A blocking gate prevents the ordinary stage transition.",
      };
    }
    audit.push({
      action: "gate_override",
      at: request.at,
      actorId: request.actorId,
      detail: { rationale: request.overrideRationale },
    });
  }
  const next = {
    ...lifecycle,
    stage: to,
    stageStatus: "active" as const,
    stageStartedAt: request.at,
    revision: lifecycle.revision + 1,
    criteria: genericCriteria(to === "not_classified" ? "concept" : to),
  };
  audit.push({
    action: "stage_transition",
    at: request.at,
    actorId: request.actorId,
    detail: { previousStage: lifecycle.stage, newStage: to, reason: request.reason },
  });
  return {
    lifecycle: next,
    committed: true,
    audit,
    events: [
      { type: "stage_complete", at: request.at, lifecycleId: lifecycle.id },
      { type: "stage_start", at: request.at, lifecycleId: lifecycle.id },
    ],
    blockers: [],
    error: null,
  };
}

export function createBaseline(input: {
  lifecycle: DeliveryLifecycle;
  id: string;
  baselineType: BaselineType;
  actorId: string;
  at: string;
  unresolvedExceptions: string[];
}): { baseline: ConfigurationBaseline; lifecycle: DeliveryLifecycle; audit: AuditRecord; events: ProjectControlEvent[] } {
  const baseline: ConfigurationBaseline = {
    id: input.id,
    lifecycleId: input.lifecycle.id,
    baselineType: input.baselineType,
    revision: 1,
    frozen: true,
    refs: refsOf(input.lifecycle),
    unresolvedExceptions: input.unresolvedExceptions,
    createdAt: input.at,
    createdBy: input.actorId,
  };
  return {
    baseline,
    lifecycle: { ...input.lifecycle, baselineId: baseline.id, revision: input.lifecycle.revision + 1 },
    audit: {
      action: "baseline_created",
      at: input.at,
      actorId: input.actorId,
      detail: { baselineType: input.baselineType, revision: 1 },
    },
    events: [{ type: "baseline_created", at: input.at, lifecycleId: input.lifecycle.id }],
  };
}

export function reviseBaseline(
  current: ConfigurationBaseline,
  lifecycle: DeliveryLifecycle,
  actorId: string,
  at: string,
): { baseline: ConfigurationBaseline; audit: AuditRecord; events: ProjectControlEvent[] } | { error: string } {
  if (current.frozen && current.revision < 1) return { error: "baseline_missing" };
  const baseline: ConfigurationBaseline = {
    ...current,
    revision: current.revision + 1,
    refs: refsOf(lifecycle),
    createdAt: at,
    createdBy: actorId,
    frozen: true,
  };
  return {
    baseline,
    audit: {
      action: "baseline_revision",
      at,
      actorId,
      detail: { previousRevision: current.revision, revision: baseline.revision },
    },
    events: [{ type: "baseline_revision", at, lifecycleId: lifecycle.id }],
  };
}

export function lifecycleAdvisory(lifecycle: DeliveryLifecycle): string {
  const gate = evaluateGate(lifecycle.criteria);
  const openAssumptions = lifecycle.assumptions.filter((item) => item.status === "open" || item.status === "blocking_next_stage");
  const openInterfaces = lifecycle.interfaces.filter((item) => item.acceptance === "pending");
  const activeChanges = lifecycle.changes.filter((item) => item.impactStatus !== "decided");
  const parts = [
    `Advisory only. Current stage is ${lifecycle.stage}.`,
    lifecycle.maturity ? `Maturity is ${lifecycle.maturity}. Maturity is not approval.` : "Maturity is not set. Maturity is not approval.",
    lifecycle.baselineId ? `Current baseline is ${lifecycle.baselineId}.` : "No configuration baseline is current.",
    openAssumptions.length
      ? `${openAssumptions.length} assumption(s) remain open.`
      : "No open assumptions are recorded on this lifecycle.",
    openInterfaces.length
      ? `${openInterfaces.length} interface(s) are unresolved.`
      : "No unresolved interfaces are recorded on this lifecycle.",
    activeChanges.length
      ? `${activeChanges.length} change(s) are active.`
      : "No active changes are recorded on this lifecycle.",
    gate.blockers.length
      ? `${gate.blockers.length} blocking gate criterion(s) prevent an ordinary transition.`
      : "No blocking gate criterion is currently unmet.",
    "This statement does not authorize a lifecycle transition.",
  ];
  return parts.join(" ");
}
