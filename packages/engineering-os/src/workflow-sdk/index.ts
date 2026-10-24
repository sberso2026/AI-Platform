/**
 * Engineering Workflow SDK — reusable orchestration for all Engineering OS modules.
 * Inspection Intelligence and future modules consume this instead of private workflow logic.
 */
export const ENGINEERING_WORKFLOW_SDK_VERSION = "0.5.0" as const;

export type EngineeringWorkflowDefinition = {
  slug: string;
  displayName: string;
  moduleKey: string;
  version: number;
  initialState: string;
  states: readonly string[];
  transitions: readonly EngineeringWorkflowTransition[];
};

export type EngineeringWorkflowTransition = {
  from: string;
  to: string;
  action: string;
  guards?: readonly EngineeringTransitionGuard[];
};

export type EngineeringTransitionGuard = {
  kind: "entitlement" | "role" | "condition" | "sla_clear" | "custom";
  key: string;
  detail?: string;
};

export type EngineeringWorkflowInstance = {
  instanceId: string;
  definitionSlug: string;
  definitionVersion: number;
  tenantId: string;
  workspaceId: string;
  moduleKey: string;
  entityType: string;
  entityId: string;
  state: string;
  startedAt: string;
  updatedAt: string;
  startedBy?: string;
  context: Record<string, unknown>;
};

export type EngineeringAssignment = {
  assignmentId: string;
  tenantId: string;
  workspaceId: string;
  moduleKey: string;
  entityType: string;
  entityId: string;
  assigneePersonId: string;
  assignedBy?: string;
  dueAt?: string;
  status: "open" | "accepted" | "in_progress" | "completed" | "reassigned" | "cancelled";
  createdAt: string;
};

export type EngineeringReviewRecord = {
  reviewId: string;
  instanceId: string;
  status: "pending" | "in_review" | "changes_requested" | "completed";
  reviewerPersonId?: string;
  outcome?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
};

export type EngineeringApprovalRecord = {
  approvalId: string;
  instanceId: string;
  status: "pending" | "approved" | "rejected";
  approverPersonId?: string;
  notes?: string;
  createdAt: string;
  decidedAt?: string;
};

export type EngineeringVerificationRecord = {
  verificationId: string;
  instanceId: string;
  status: "requested" | "in_progress" | "passed" | "failed";
  verifierPersonId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
};

export type EngineeringEscalationPolicy = {
  policyId: string;
  definitionSlug: string;
  afterHours: number;
  escalateToRole: string;
  notifyChannels: readonly string[];
};

export type EngineeringWorkflowNotification = {
  notificationId: string;
  tenantId: string;
  workspaceId?: string;
  channel: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type EngineeringSlaTimer = {
  timerId: string;
  instanceId: string;
  dueAt: string;
  breached: boolean;
  breachedAt?: string;
};

export type EngineeringWorkflowAuditEntry = {
  auditId: string;
  instanceId: string;
  action: string;
  fromState?: string;
  toState?: string;
  actorPersonId?: string;
  at: string;
  detail?: Record<string, unknown>;
};

export type EngineeringWorkflowEventType =
  | "engineering.workflow.started"
  | "engineering.workflow.transitioned"
  | "engineering.workflow.completed"
  | "engineering.workflow.failed"
  | "engineering.workflow.assignment.created"
  | "engineering.workflow.review.completed"
  | "engineering.workflow.approval.decided"
  | "engineering.workflow.verification.completed"
  | "engineering.workflow.escalated"
  | "engineering.workflow.sla.breached"
  | "engineering.workflow.notification.queued";

export type EngineeringWorkflowEvent = {
  type: EngineeringWorkflowEventType;
  tenantId: string;
  workspaceId?: string;
  source: "engineering_workflow_sdk";
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type EngineeringWorkflowEventPublishPort = {
  publish(event: EngineeringWorkflowEvent): Promise<void>;
};

export const ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS = [
  "definitions",
  "stateMachines",
  "assignments",
  "reviews",
  "approvals",
  "verification",
  "escalation",
  "notifications",
  "slaTimers",
  "auditTrails",
  "transitionGuards",
] as const;

export type EngineeringWorkflowSdkCapability =
  (typeof ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS)[number];

export function assertEngineeringWorkflowSdkComplete(
  keys: readonly string[] = ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS,
): void {
  for (const key of ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS) {
    if (!keys.includes(key)) {
      throw new Error(`engineering_workflow_sdk_missing:${key}`);
    }
  }
}

export function assertTransitionAllowed(
  definition: EngineeringWorkflowDefinition,
  from: string,
  to: string,
  action: string,
): EngineeringWorkflowTransition {
  const match = definition.transitions.find(
    (t) => t.from === from && t.to === to && t.action === action,
  );
  if (!match) {
    throw new Error(`workflow_transition_denied:${definition.slug}:${from}->${to}:${action}`);
  }
  return match;
}

export function evaluateTransitionGuards(
  transition: EngineeringWorkflowTransition,
  context: {
    entitlements?: readonly string[];
    roles?: readonly string[];
    conditions?: Record<string, boolean>;
  },
): void {
  for (const guard of transition.guards ?? []) {
    if (guard.kind === "entitlement") {
      if (!context.entitlements?.includes(guard.key)) {
        throw new Error(`workflow_guard_failed:entitlement:${guard.key}`);
      }
    } else if (guard.kind === "role") {
      if (!context.roles?.includes(guard.key)) {
        throw new Error(`workflow_guard_failed:role:${guard.key}`);
      }
    } else if (guard.kind === "condition") {
      if (!context.conditions?.[guard.key]) {
        throw new Error(`workflow_guard_failed:condition:${guard.key}`);
      }
    } else if (guard.kind === "sla_clear") {
      if (context.conditions?.[guard.key] === false) {
        throw new Error(`workflow_guard_failed:sla:${guard.key}`);
      }
    }
  }
}

export function createWorkflowInstance(input: {
  definition: EngineeringWorkflowDefinition;
  tenantId: string;
  workspaceId: string;
  entityType: string;
  entityId: string;
  startedBy?: string;
  context?: Record<string, unknown>;
  instanceId?: string;
}): EngineeringWorkflowInstance {
  const now = new Date().toISOString();
  return {
    instanceId: input.instanceId ?? `wf_${input.definition.slug}_${Date.now()}`,
    definitionSlug: input.definition.slug,
    definitionVersion: input.definition.version,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    moduleKey: input.definition.moduleKey,
    entityType: input.entityType,
    entityId: input.entityId,
    state: input.definition.initialState,
    startedAt: now,
    updatedAt: now,
    startedBy: input.startedBy,
    context: input.context ?? {},
  };
}

export function transitionWorkflowInstance(input: {
  definition: EngineeringWorkflowDefinition;
  instance: EngineeringWorkflowInstance;
  to: string;
  action: string;
  entitlements?: readonly string[];
  roles?: readonly string[];
  conditions?: Record<string, boolean>;
}): EngineeringWorkflowInstance {
  const transition = assertTransitionAllowed(
    input.definition,
    input.instance.state,
    input.to,
    input.action,
  );
  evaluateTransitionGuards(transition, {
    entitlements: input.entitlements,
    roles: input.roles,
    conditions: input.conditions,
  });
  return {
    ...input.instance,
    state: input.to,
    updatedAt: new Date().toISOString(),
  };
}

export function createAssignment(input: {
  tenantId: string;
  workspaceId: string;
  moduleKey: string;
  entityType: string;
  entityId: string;
  assigneePersonId: string;
  assignedBy?: string;
  dueAt?: string;
}): EngineeringAssignment {
  return {
    assignmentId: `asg_${Date.now()}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    moduleKey: input.moduleKey,
    entityType: input.entityType,
    entityId: input.entityId,
    assigneePersonId: input.assigneePersonId,
    assignedBy: input.assignedBy,
    dueAt: input.dueAt,
    status: "open",
    createdAt: new Date().toISOString(),
  };
}

export function createReviewRecord(input: {
  instanceId: string;
  reviewerPersonId?: string;
}): EngineeringReviewRecord {
  return {
    reviewId: `rev_${Date.now()}`,
    instanceId: input.instanceId,
    status: "pending",
    reviewerPersonId: input.reviewerPersonId,
    createdAt: new Date().toISOString(),
  };
}

export function createApprovalRecord(input: {
  instanceId: string;
  approverPersonId?: string;
}): EngineeringApprovalRecord {
  return {
    approvalId: `apr_${Date.now()}`,
    instanceId: input.instanceId,
    status: "pending",
    approverPersonId: input.approverPersonId,
    createdAt: new Date().toISOString(),
  };
}

export function createVerificationRecord(input: {
  instanceId: string;
  verifierPersonId?: string;
}): EngineeringVerificationRecord {
  return {
    verificationId: `ver_${Date.now()}`,
    instanceId: input.instanceId,
    status: "requested",
    verifierPersonId: input.verifierPersonId,
    createdAt: new Date().toISOString(),
  };
}

export function createSlaTimer(input: {
  instanceId: string;
  dueAt: string;
}): EngineeringSlaTimer {
  return {
    timerId: `sla_${Date.now()}`,
    instanceId: input.instanceId,
    dueAt: input.dueAt,
    breached: false,
  };
}

export function evaluateSlaBreach(
  timer: EngineeringSlaTimer,
  nowIso: string = new Date().toISOString(),
): EngineeringSlaTimer {
  if (timer.breached) return timer;
  if (nowIso > timer.dueAt) {
    return { ...timer, breached: true, breachedAt: nowIso };
  }
  return timer;
}

export function appendWorkflowAudit(input: {
  instanceId: string;
  action: string;
  fromState?: string;
  toState?: string;
  actorPersonId?: string;
  detail?: Record<string, unknown>;
}): EngineeringWorkflowAuditEntry {
  return {
    auditId: `aud_${Date.now()}`,
    instanceId: input.instanceId,
    action: input.action,
    fromState: input.fromState,
    toState: input.toState,
    actorPersonId: input.actorPersonId,
    at: new Date().toISOString(),
    detail: input.detail,
  };
}

export function createWorkflowEvent(
  partial: Omit<EngineeringWorkflowEvent, "source" | "occurredAt"> & {
    occurredAt?: string;
  },
): EngineeringWorkflowEvent {
  return {
    ...partial,
    source: "engineering_workflow_sdk",
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
  };
}

/** In-process event log until host wires Platform Event Bus. */
export function createInProcessWorkflowEventBus(): EngineeringWorkflowEventPublishPort & {
  events: EngineeringWorkflowEvent[];
} {
  const events: EngineeringWorkflowEvent[] = [];
  return {
    events,
    async publish(event) {
      events.push(event);
    },
  };
}

export function createEngineeringWorkflowSdkSkeleton() {
  return {
    version: ENGINEERING_WORKFLOW_SDK_VERSION,
    capabilities: ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS,
    createWorkflowInstance,
    transitionWorkflowInstance,
    createAssignment,
    createReviewRecord,
    createApprovalRecord,
    createVerificationRecord,
    createSlaTimer,
    evaluateSlaBreach,
    appendWorkflowAudit,
    createWorkflowEvent,
    createInProcessWorkflowEventBus,
  };
}
