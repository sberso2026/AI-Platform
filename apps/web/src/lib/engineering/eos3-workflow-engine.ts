/**
 * EOS 3.5 governed workflow architecture — EVOLVE_EXISTING.
 * WORKFLOW_TRANSITION != ENGINEERING_APPROVAL
 * AI may recommend; humans retain checkpoint authority.
 */

import { buildEos3Provenance } from "../commerce/eos3-provenance";

export type WorkflowActorRole =
  | "creator"
  | "engineer"
  | "reviewer"
  | "receiver"
  | "decision_owner"
  | "approver"
  | "release_authority"
  | "freeze_authority"
  | "ai"
  | "operator";

export type WorkflowObjectType =
  | "Requirement"
  | "Interface"
  | "Review"
  | "Decision"
  | "OptimizationRun"
  | "Deliverable"
  | "Baseline"
  | "Change"
  | "Impact";

export type WorkflowTransitionDef = {
  from: string;
  to: string;
  requiredRoles: WorkflowActorRole[];
  humanCheckpoint: boolean;
  requiredEvidence?: string[];
  autoNonAuthoritative?: Array<"create_work_item" | "mark_stale" | "emit_event" | "invalidate_retrieval">;
};

export type Eos3WorkflowDefinition = {
  workflowId: string;
  version: string;
  objectType: WorkflowObjectType;
  states: string[];
  transitions: WorkflowTransitionDef[];
  jurisdictionContext: string | null;
  createdAt: string;
};

export type WorkflowTransitionRecord = {
  from: string;
  to: string;
  actorId: string;
  authorityRole: WorkflowActorRole;
  at: string;
  evidenceIds: string[];
  eventId: string | null;
  reason: string | null;
};

export type Eos3WorkflowInstance = {
  instanceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectId: string;
  objectType: WorkflowObjectType;
  revisionId: string | null;
  workflowId: string;
  workflowVersion: string;
  currentState: string;
  pendingActions: string[];
  requiredEvidence: string[];
  transitionHistory: WorkflowTransitionRecord[];
  provenance: Record<string, unknown>;
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }>;
  createdAt: string;
  updatedAt: string;
};

export type Eos3WorkItem = {
  workItemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectId: string;
  type: "review_required" | "impact_assessment_required" | "interface_acceptance_required" | "assumption_validation_required" | "decision_required";
  assignedTo: { kind: "user" | "role" | "team"; value: string };
  status: "OPEN" | "DONE" | "CANCELLED";
  dueAt: string | null;
  priority: "low" | "normal" | "high";
  /** Assignment does not confer engineering authority. */
  assignmentGrantsAuthority: false;
  escalation: { enabled: boolean; escalateAuthority: false; reminderHours: number | null };
  createdAt: string;
  completedAt: string | null;
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

export const EOS3_WORKFLOW_DEFINITIONS: Eos3WorkflowDefinition[] = [
  {
    workflowId: "wf.interface.v1",
    version: "1.0.0",
    objectType: "Interface",
    states: ["DRAFT", "ISSUED", "RECEIVED", "ACCEPTED", "REJECTED", "SUPERSEDED"],
    transitions: [
      { from: "DRAFT", to: "ISSUED", requiredRoles: ["creator", "engineer"], humanCheckpoint: true },
      { from: "ISSUED", to: "RECEIVED", requiredRoles: ["receiver"], humanCheckpoint: true },
      { from: "RECEIVED", to: "ACCEPTED", requiredRoles: ["receiver"], humanCheckpoint: true },
      { from: "RECEIVED", to: "REJECTED", requiredRoles: ["receiver"], humanCheckpoint: true },
      { from: "ISSUED", to: "SUPERSEDED", requiredRoles: ["engineer"], humanCheckpoint: true },
      { from: "ACCEPTED", to: "SUPERSEDED", requiredRoles: ["engineer"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
  {
    workflowId: "wf.decision.v1",
    version: "1.0.0",
    objectType: "Decision",
    states: ["DRAFT", "ANALYSIS", "READY_FOR_HUMAN_DECISION", "DECIDED", "SUPERSEDED"],
    transitions: [
      { from: "DRAFT", to: "ANALYSIS", requiredRoles: ["engineer", "decision_owner", "ai"], humanCheckpoint: false },
      { from: "ANALYSIS", to: "READY_FOR_HUMAN_DECISION", requiredRoles: ["engineer", "decision_owner", "ai"], humanCheckpoint: false },
      { from: "READY_FOR_HUMAN_DECISION", to: "DECIDED", requiredRoles: ["decision_owner"], humanCheckpoint: true },
      { from: "DECIDED", to: "SUPERSEDED", requiredRoles: ["decision_owner"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
  {
    workflowId: "wf.optimization.v1",
    version: "1.0.0",
    objectType: "OptimizationRun",
    states: ["DEFINED", "READY", "RUNNING", "COMPLETED", "FAILED", "SUPERSEDED"],
    transitions: [
      { from: "DEFINED", to: "READY", requiredRoles: ["engineer"], humanCheckpoint: false },
      { from: "READY", to: "RUNNING", requiredRoles: ["engineer", "operator"], humanCheckpoint: false },
      { from: "RUNNING", to: "COMPLETED", requiredRoles: ["engineer", "operator", "ai"], humanCheckpoint: false },
      { from: "RUNNING", to: "FAILED", requiredRoles: ["engineer", "operator", "ai"], humanCheckpoint: false },
      { from: "COMPLETED", to: "SUPERSEDED", requiredRoles: ["engineer"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
  {
    workflowId: "wf.deliverable.v1",
    version: "1.0.0",
    objectType: "Deliverable",
    states: ["DRAFT", "REVIEW", "APPROVED", "RELEASED", "STALE", "SUPERSEDED"],
    transitions: [
      { from: "DRAFT", to: "REVIEW", requiredRoles: ["creator", "engineer"], humanCheckpoint: true },
      { from: "REVIEW", to: "APPROVED", requiredRoles: ["approver"], humanCheckpoint: true },
      { from: "APPROVED", to: "RELEASED", requiredRoles: ["release_authority"], humanCheckpoint: true },
      { from: "DRAFT", to: "STALE", requiredRoles: ["engineer", "operator", "ai"], humanCheckpoint: false, autoNonAuthoritative: ["create_work_item"] },
      { from: "REVIEW", to: "STALE", requiredRoles: ["engineer", "operator", "ai"], humanCheckpoint: false },
      { from: "APPROVED", to: "STALE", requiredRoles: ["engineer", "operator", "ai"], humanCheckpoint: false },
      { from: "RELEASED", to: "STALE", requiredRoles: ["engineer", "operator", "ai"], humanCheckpoint: false },
      { from: "STALE", to: "REVIEW", requiredRoles: ["engineer"], humanCheckpoint: true },
      { from: "APPROVED", to: "SUPERSEDED", requiredRoles: ["approver"], humanCheckpoint: true },
      { from: "RELEASED", to: "SUPERSEDED", requiredRoles: ["release_authority"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
  {
    workflowId: "wf.baseline.v1",
    version: "1.0.0",
    objectType: "Baseline",
    states: ["DRAFT", "READY", "FROZEN", "SUPERSEDED"],
    transitions: [
      { from: "DRAFT", to: "READY", requiredRoles: ["engineer"], humanCheckpoint: false },
      { from: "READY", to: "FROZEN", requiredRoles: ["freeze_authority"], humanCheckpoint: true },
      { from: "FROZEN", to: "SUPERSEDED", requiredRoles: ["freeze_authority"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
  {
    workflowId: "wf.review.v1",
    version: "1.0.0",
    objectType: "Review",
    states: ["DRAFT", "IN_REVIEW", "ACCEPTED", "REJECTED"],
    transitions: [
      { from: "DRAFT", to: "IN_REVIEW", requiredRoles: ["engineer", "ai"], humanCheckpoint: false },
      { from: "IN_REVIEW", to: "ACCEPTED", requiredRoles: ["reviewer"], humanCheckpoint: true },
      { from: "IN_REVIEW", to: "REJECTED", requiredRoles: ["reviewer"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
  {
    workflowId: "wf.requirement.v1",
    version: "1.0.0",
    objectType: "Requirement",
    states: ["DRAFT", "APPROVED", "SUPERSEDED"],
    transitions: [
      { from: "DRAFT", to: "APPROVED", requiredRoles: ["approver", "engineer"], humanCheckpoint: true },
      { from: "APPROVED", to: "SUPERSEDED", requiredRoles: ["engineer"], humanCheckpoint: true },
    ],
    jurisdictionContext: null,
    createdAt: now(),
  },
];

export function getWorkflowDefinition(objectType: WorkflowObjectType, version?: string): Eos3WorkflowDefinition {
  const defs = EOS3_WORKFLOW_DEFINITIONS.filter((d) => d.objectType === objectType);
  const def = version ? defs.find((d) => d.version === version) : defs[0];
  if (!def) throw new Error("workflow_definition_not_found");
  return def;
}

export function createWorkflowInstance(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectId: string;
  objectType: WorkflowObjectType;
  revisionId?: string | null;
  initialState?: string;
}): Eos3WorkflowInstance {
  const def = getWorkflowDefinition(input.objectType);
  const initial = input.initialState ?? def.states[0]!;
  if (!def.states.includes(initial)) throw new Error("invalid_initial_state");
  const instanceId = id();
  return {
    instanceId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectId: input.objectId,
    objectType: input.objectType,
    revisionId: input.revisionId ?? null,
    workflowId: def.workflowId,
    workflowVersion: def.version,
    currentState: initial,
    pendingActions: [],
    requiredEvidence: [],
    transitionHistory: [],
    provenance: buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: input.objectId,
      revisionId: input.revisionId ?? null,
      source: "eos3.workflow.engine",
      actorId: null,
      authority: null,
      method: "createWorkflowInstance",
      toolOrModel: null,
      evidenceClassification: "FACT",
      qualificationState: null,
    }),
    audit: [{ action: "instance_created", actorId: null, at: now(), detail: { initial } }],
    createdAt: now(),
    updatedAt: now(),
  };
}

export function authorizeWorkflowAccess(
  caller: {
    authenticated: boolean;
    tenantId: string | null;
    workspaceId: string | null;
    eos3Entitled: boolean;
    eos3Enrolled: boolean;
    productionEnvironment?: boolean;
  },
  instance: Eos3WorkflowInstance,
): { allowed: boolean; reason?: string } {
  if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
  if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
  if (caller.tenantId !== instance.tenantId) return { allowed: false, reason: "tenant_mismatch" };
  if (caller.workspaceId !== instance.workspaceId) return { allowed: false, reason: "workspace_mismatch" };
  return { allowed: true };
}

export function transitionWorkflow(
  instance: Eos3WorkflowInstance,
  input: {
    to: string;
    actorId: string;
    authorityRole: WorkflowActorRole;
    evidenceIds?: string[];
    reason?: string | null;
    eventId?: string | null;
    /** Client-claimed event cannot grant authority. */
    clientSubmittedEvent?: boolean;
  },
): Eos3WorkflowInstance {
  if (input.clientSubmittedEvent && input.authorityRole !== "ai") {
    // still validate role; client event alone is never trusted as authority upgrade
  }
  const def = getWorkflowDefinition(instance.objectType, instance.workflowVersion);
  const edge = def.transitions.find((t) => t.from === instance.currentState && t.to === input.to);
  if (!edge) throw new Error("invalid_transition");
  if (input.authorityRole === "ai" && edge.humanCheckpoint) {
    throw new Error("ai_workflow_authority_denied");
  }
  if (!edge.requiredRoles.includes(input.authorityRole)) {
    throw new Error("insufficient_workflow_role");
  }
  if (edge.humanCheckpoint && input.authorityRole === "ai") {
    throw new Error("human_checkpoint_required");
  }

  const record: WorkflowTransitionRecord = {
    from: instance.currentState,
    to: input.to,
    actorId: input.actorId,
    authorityRole: input.authorityRole,
    at: now(),
    evidenceIds: input.evidenceIds ?? [],
    eventId: input.eventId ?? null,
    reason: input.reason ?? null,
  };

  const pendingActions = [...instance.pendingActions];
  if (edge.autoNonAuthoritative?.includes("create_work_item")) {
    pendingActions.push("create_work_item");
  }

  return {
    ...instance,
    currentState: input.to,
    pendingActions,
    transitionHistory: [...instance.transitionHistory, record],
    updatedAt: now(),
    audit: [
      ...instance.audit,
      {
        action: "transition",
        actorId: input.actorId,
        at: now(),
        detail: { from: record.from, to: record.to, role: input.authorityRole, eventId: record.eventId },
      },
    ],
  };
}

export function createWorkItem(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectId: string;
  type: Eos3WorkItem["type"];
  assignedTo: Eos3WorkItem["assignedTo"];
  dueAt?: string | null;
  priority?: Eos3WorkItem["priority"];
}): Eos3WorkItem {
  return {
    workItemId: id(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectId: input.objectId,
    type: input.type,
    assignedTo: input.assignedTo,
    status: "OPEN",
    dueAt: input.dueAt ?? null,
    priority: input.priority ?? "normal",
    assignmentGrantsAuthority: false,
    escalation: { enabled: true, escalateAuthority: false, reminderHours: 48 },
    createdAt: now(),
    completedAt: null,
  };
}

export function completeWorkItem(item: Eos3WorkItem): Eos3WorkItem {
  return { ...item, status: "DONE", completedAt: now() };
}

/** Completing a work item does not auto-approve engineering transitions. */
export function workItemCompletionGrantsApproval(): false {
  return false;
}
