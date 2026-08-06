/**
 * Phase 9E — Inspection operational workflows orchestrated via Engineering Workflow SDK.
 */
import {
  appendWorkflowAudit,
  assertEngineeringWorkflowSdkComplete,
  createApprovalRecord,
  createAssignment,
  createInProcessWorkflowEventBus,
  createReviewRecord,
  createSlaTimer,
  createVerificationRecord,
  createWorkflowEvent,
  createWorkflowInstance,
  ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS,
  evaluateSlaBreach,
  transitionWorkflowInstance,
  type EngineeringAssignment,
  type EngineeringApprovalRecord,
  type EngineeringReviewRecord,
  type EngineeringSlaTimer,
  type EngineeringVerificationRecord,
  type EngineeringWorkflowAuditEntry,
  type EngineeringWorkflowEvent,
  type EngineeringWorkflowInstance,
} from "@rtb/engineering-os";
import {
  INSPECTION_OPERATIONAL_WORKFLOW_DEFINITION,
  INSPECTION_OPERATIONAL_WORKFLOW_STEPS,
} from "./operational-workflow-definition";
import { buildWorkflowReportingOutputs } from "./reporting-preparation";

export type InspectionOperationalWorkflowResult = {
  instance: EngineeringWorkflowInstance;
  assignment: EngineeringAssignment;
  review: EngineeringReviewRecord;
  approval: EngineeringApprovalRecord;
  verification: EngineeringVerificationRecord;
  slaTimer: EngineeringSlaTimer;
  auditTrail: EngineeringWorkflowAuditEntry[];
  events: EngineeringWorkflowEvent[];
  stepsCompleted: typeof INSPECTION_OPERATIONAL_WORKFLOW_STEPS;
  reportingOutputs: ReturnType<typeof buildWorkflowReportingOutputs>;
  reportingOutputIds: string[];
};

const ACTION_BY_STATE: Record<string, string> = {
  planned: "plan",
  scheduled: "schedule",
  assigned: "assign",
  started: "start",
  completed: "complete_execution",
  submitted: "submit",
  reviewed: "review",
  approved: "approve",
  verified: "verify",
  closed: "close",
};

export async function runInspectionOperationalWorkflowHappyPath(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  actorUserId: string;
  assigneePersonId?: string;
}): Promise<InspectionOperationalWorkflowResult> {
  assertEngineeringWorkflowSdkComplete(ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS);

  const bus = createInProcessWorkflowEventBus();
  const auditTrail: EngineeringWorkflowAuditEntry[] = [];

  let instance = createWorkflowInstance({
    definition: INSPECTION_OPERATIONAL_WORKFLOW_DEFINITION,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "inspection_session",
    entityId: input.sessionId,
    startedBy: input.actorUserId,
    context: { steps: [...INSPECTION_OPERATIONAL_WORKFLOW_STEPS] },
  });

  await bus.publish(
    createWorkflowEvent({
      type: "engineering.workflow.started",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: {
        instanceId: instance.instanceId,
        definitionSlug: instance.definitionSlug,
        entityId: input.sessionId,
      },
    }),
  );
  auditTrail.push(
    appendWorkflowAudit({
      instanceId: instance.instanceId,
      action: "started",
      toState: instance.state,
      actorPersonId: input.actorUserId,
    }),
  );

  const path = [
    "planned",
    "scheduled",
    "assigned",
    "started",
    "completed",
    "submitted",
    "reviewed",
    "approved",
    "verified",
    "closed",
  ] as const;

  let assignment: EngineeringAssignment | null = null;
  let review: EngineeringReviewRecord | null = null;
  let approval: EngineeringApprovalRecord | null = null;
  let verification: EngineeringVerificationRecord | null = null;
  let slaTimer: EngineeringSlaTimer | null = null;

  for (const to of path) {
    const from = instance.state;
    const action = ACTION_BY_STATE[to];
    const entitlements =
      to === "reviewed"
        ? (["inspection.review"] as const)
        : to === "approved" || to === "verified"
          ? (["inspection.approve"] as const)
          : to === "closed"
            ? (["inspection.admin"] as const)
            : (["inspection.write"] as const);

    instance = transitionWorkflowInstance({
      definition: INSPECTION_OPERATIONAL_WORKFLOW_DEFINITION,
      instance,
      to,
      action,
      entitlements,
      conditions: { corrective_actions_verified: true },
    });

    auditTrail.push(
      appendWorkflowAudit({
        instanceId: instance.instanceId,
        action,
        fromState: from,
        toState: to,
        actorPersonId: input.actorUserId,
      }),
    );

    await bus.publish(
      createWorkflowEvent({
        type: "engineering.workflow.transitioned",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        payload: {
          instanceId: instance.instanceId,
          from,
          to,
          action,
        },
      }),
    );

    if (to === "assigned") {
      assignment = createAssignment({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        moduleKey: "inspection_intelligence",
        entityType: "inspection_session",
        entityId: input.sessionId,
        assigneePersonId: input.assigneePersonId ?? input.actorUserId,
        assignedBy: input.actorUserId,
        dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      slaTimer = createSlaTimer({
        instanceId: instance.instanceId,
        dueAt: assignment.dueAt!,
      });
      await bus.publish(
        createWorkflowEvent({
          type: "engineering.workflow.assignment.created",
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          payload: { assignmentId: assignment.assignmentId, entityId: input.sessionId },
        }),
      );
    }

    if (to === "reviewed") {
      review = {
        ...createReviewRecord({
          instanceId: instance.instanceId,
          reviewerPersonId: input.actorUserId,
        }),
        status: "completed",
        outcome: "accepted",
        completedAt: new Date().toISOString(),
      };
      await bus.publish(
        createWorkflowEvent({
          type: "engineering.workflow.review.completed",
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          payload: { reviewId: review.reviewId, instanceId: instance.instanceId },
        }),
      );
    }

    if (to === "approved") {
      approval = {
        ...createApprovalRecord({
          instanceId: instance.instanceId,
          approverPersonId: input.actorUserId,
        }),
        status: "approved",
        decidedAt: new Date().toISOString(),
      };
      await bus.publish(
        createWorkflowEvent({
          type: "engineering.workflow.approval.decided",
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          payload: { approvalId: approval.approvalId, status: "approved" },
        }),
      );
    }

    if (to === "verified") {
      verification = {
        ...createVerificationRecord({
          instanceId: instance.instanceId,
          verifierPersonId: input.actorUserId,
        }),
        status: "passed",
        completedAt: new Date().toISOString(),
      };
      await bus.publish(
        createWorkflowEvent({
          type: "engineering.workflow.verification.completed",
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          payload: { verificationId: verification.verificationId, status: "passed" },
        }),
      );
    }

    if (to === "closed") {
      await bus.publish(
        createWorkflowEvent({
          type: "engineering.workflow.completed",
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          payload: {
            instanceId: instance.instanceId,
          },
        }),
      );
    }
  }

  if (!assignment || !review || !approval || !verification || !slaTimer) {
    throw new Error("operational_workflow_incomplete");
  }

  // SLA evaluated but not breached on happy path
  slaTimer = evaluateSlaBreach(slaTimer, new Date().toISOString());

  const reportingOutputs = buildWorkflowReportingOutputs({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    workflowInstanceId: instance.instanceId,
    auditEntryCount: auditTrail.length,
  });

  return {
    instance,
    assignment,
    review,
    approval,
    verification,
    slaTimer,
    auditTrail,
    events: bus.events,
    stepsCompleted: INSPECTION_OPERATIONAL_WORKFLOW_STEPS,
    reportingOutputs,
    reportingOutputIds: reportingOutputs.map((o) => o.outputId),
  };
}
