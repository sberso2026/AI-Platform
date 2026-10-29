/**
 * Governed action proposal lifecycle: create → review → execute via domain services.
 */

import type {
  CreateEngineeringActionProposalInput,
  EngineeringActionProposal,
  EngineeringActionProposalState,
} from "./contracts";
import { defaultAuthorityForAction } from "./contracts";
import type {
  EngineeringDomainExecutor,
  PlatformEventBridge,
  PlatformWorkflowBridge,
} from "./domain-executor";
import { FixtureEngineeringDomainExecutor } from "./domain-executor";
import {
  hashPayload,
  InMemoryEngineeringActionProposalStore,
  newFreshnessToken,
  newProposalId,
  type EngineeringActionProposalStore,
} from "./store";

const TERMINAL = new Set<EngineeringActionProposalState>([
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
]);

function hasPermission(
  required: string[],
  granted: string[] | undefined,
): boolean {
  if (!required.length) return true;
  const set = new Set(granted ?? []);
  return required.every((p) => set.has(p) || set.has("engineering_action.execute"));
}

export class EngineeringActionProposalService {
  constructor(
    private readonly store: EngineeringActionProposalStore = new InMemoryEngineeringActionProposalStore(),
    private readonly executor: EngineeringDomainExecutor = new FixtureEngineeringDomainExecutor(),
    private readonly events: PlatformEventBridge = {},
    private readonly workflow: PlatformWorkflowBridge = {},
    private readonly permissionGate?: {
      hasPermission: (input: {
        tenantId: string;
        userId: string;
        action: string;
      }) => Promise<boolean>;
    },
  ) {}

  getStore(): EngineeringActionProposalStore {
    return this.store;
  }

  async create(
    input: CreateEngineeringActionProposalInput,
  ): Promise<EngineeringActionProposal> {
    const t0 = Date.now();
    if (input.targetObject && input.targetObject.tenantId !== input.tenantId) {
      throw new Error("cross_tenant_target_blocked");
    }

    const perms = input.permissions ?? ["engineering_action.propose"];
    if (!hasPermission(["engineering_action.propose"], perms)) {
      throw new Error("unauthorized_proposal_create");
    }
    if (this.permissionGate) {
      const ok = await this.permissionGate.hasPermission({
        tenantId: input.tenantId,
        userId: input.userId,
        action: "engineering_action.propose",
      });
      if (!ok) throw new Error("unauthorized_proposal_create");
    }

    const authority =
      input.authorityRequired ?? defaultAuthorityForAction(input.actionType);
    const freshness =
      input.sourceContext.contextFreshnessToken ??
      newFreshnessToken({
        tenantId: input.tenantId,
        projectId: input.projectId ?? input.sourceContext.projectId,
        objectId: input.sourceContext.objectId,
        resolvedAt: input.sourceContext.contextResolvedAt,
      });

    // Prefill known context — do not force re-entry.
    const payload = {
      title: input.proposedPayload.title ?? null,
      description: input.proposedPayload.description ?? null,
      status: input.proposedPayload.status ?? "draft",
      projectId: input.proposedPayload.projectId ?? input.projectId ?? null,
      objectType:
        input.proposedPayload.objectType ?? input.sourceContext.objectType ?? null,
      objectId:
        input.proposedPayload.objectId ?? input.sourceContext.objectId ?? null,
      assigneeId: input.proposedPayload.assigneeId ?? null,
      evidenceRefs: input.evidenceRefs ?? [],
      ...input.proposedPayload,
    };

    const now = new Date().toISOString();
    const proposal: EngineeringActionProposal = {
      proposalId: newProposalId(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId ?? null,
      projectId: input.projectId ?? input.sourceContext.projectId ?? null,
      sourceContext: {
        tenantId: input.tenantId,
        workspaceId: input.workspaceId ?? input.sourceContext.workspaceId ?? null,
        projectId: input.projectId ?? input.sourceContext.projectId ?? null,
        objectType: input.sourceContext.objectType ?? null,
        objectId: input.sourceContext.objectId ?? null,
        askQuery: input.sourceContext.askQuery ?? null,
        contextResolvedAt: input.sourceContext.contextResolvedAt ?? now,
        contextFreshnessToken: freshness,
      },
      actionType: input.actionType,
      targetObject: input.targetObject ?? null,
      proposedPayload: payload,
      evidenceRefs: input.evidenceRefs ?? [],
      reasoningRef: input.reasoningRef ?? null,
      toolResultRefs: input.toolResultRefs ?? [],
      memoryRefs: input.memoryRefs ?? [],
      authorityRequired: authority,
      approvalState: "READY_FOR_REVIEW",
      riskClass:
        input.riskClass ??
        (authority === "SAFETY_CRITICAL" ? "SAFETY_CRITICAL" : "MEDIUM"),
      sensitivityClass: input.sensitivityClass ?? "general",
      provenance: {
        mechanism: input.toolResultRefs?.length
          ? "TOOL_PREFILL"
          : input.llmGeneratedDraft
            ? "ASK_PROPOSAL"
            : "MANUAL",
        platformWorkflowOwner: "platform_kernel",
        llmGeneratedDraft: Boolean(input.llmGeneratedDraft),
        autonomousApproval: false,
        payloadHash: hashPayload(payload),
        evidenceRefs: input.evidenceRefs ?? [],
        toolResultRefs: input.toolResultRefs ?? [],
        memoryRefs: input.memoryRefs ?? [],
        reasoningRef: input.reasoningRef ?? null,
        createdBy: input.userId,
      },
      createdAt: now,
      updatedAt: now,
      expiresAt: input.expiresAt ?? null,
      timingMs: { proposalCreateMs: Date.now() - t0 },
      auditTrail: [
        {
          at: now,
          actorId: input.userId,
          action: "create",
          detail: input.actionType,
        },
      ],
    };

    const saved = await this.store.upsert(proposal);
    await this.events.publish?.({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      eventType: "engineering.action_proposal.created",
      source: "engineering-os",
      payload: {
        proposal_id: saved.proposalId,
        action_type: saved.actionType,
        approval_state: saved.approvalState,
      },
    });
    return saved;
  }

  async getForReview(
    tenantId: string,
    proposalId: string,
  ): Promise<EngineeringActionProposal | null> {
    const t0 = Date.now();
    const proposal = await this.store.get(tenantId, proposalId);
    if (!proposal) return null;
    proposal.timingMs = {
      ...proposal.timingMs,
      reviewLoadMs: Date.now() - t0,
    };
    return this.store.upsert(proposal);
  }

  async edit(input: {
    tenantId: string;
    proposalId: string;
    userId: string;
    proposedPayload: Record<string, unknown>;
    expectedPayloadHash: string;
  }): Promise<EngineeringActionProposal> {
    const existing = await this.requireOpen(input.tenantId, input.proposalId);
    if (existing.provenance.payloadHash !== input.expectedPayloadHash) {
      throw new Error("payload_tamper_detected");
    }
    const nextPayload = { ...existing.proposedPayload, ...input.proposedPayload };
    const now = new Date().toISOString();
    const updated: EngineeringActionProposal = {
      ...existing,
      proposedPayload: nextPayload,
      provenance: {
        ...existing.provenance,
        payloadHash: hashPayload(nextPayload),
        autonomousApproval: false,
      },
      approvalState: "READY_FOR_REVIEW",
      updatedAt: now,
      auditTrail: [
        ...existing.auditTrail,
        { at: now, actorId: input.userId, action: "edit" },
      ],
    };
    return this.store.upsert(updated);
  }

  async reject(input: {
    tenantId: string;
    proposalId: string;
    userId: string;
    note?: string;
  }): Promise<EngineeringActionProposal> {
    const existing = await this.requireOpen(input.tenantId, input.proposalId);
    const now = new Date().toISOString();
    const updated: EngineeringActionProposal = {
      ...existing,
      approvalState: "REJECTED",
      reviewedBy: input.userId,
      reviewedAt: now,
      reviewNote: input.note ?? null,
      updatedAt: now,
      auditTrail: [
        ...existing.auditTrail,
        { at: now, actorId: input.userId, action: "reject", detail: input.note },
      ],
    };
    const saved = await this.store.upsert(updated);
    await this.events.publish?.({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      eventType: "engineering.action_proposal.rejected",
      source: "engineering-os",
      payload: { proposal_id: saved.proposalId },
    });
    return saved;
  }

  async approve(input: {
    tenantId: string;
    proposalId: string;
    userId: string;
    expectedPayloadHash: string;
    permissions?: string[];
    note?: string;
  }): Promise<EngineeringActionProposal> {
    const existing = await this.requireOpen(input.tenantId, input.proposalId);
    if (existing.provenance.payloadHash !== input.expectedPayloadHash) {
      throw new Error("payload_tamper_detected");
    }
    if (existing.authorityRequired === "SAFETY_CRITICAL") {
      // Explicit authorised reviewer required — never AI approval role.
      if (input.userId === "llm" || input.userId === "ai-agent") {
        throw new Error("safety_critical_requires_human_reviewer");
      }
      if (!hasPermission(["engineering_action.approve_safety"], input.permissions ?? ["engineering_action.approve_safety"])) {
        throw new Error("safety_critical_unauthorized_approver");
      }
    } else if (
      existing.authorityRequired === "APPROVAL_REQUIRED" ||
      existing.authorityRequired === "EXTERNAL_WRITE"
    ) {
      if (!hasPermission(["engineering_action.approve"], input.permissions ?? ["engineering_action.approve"])) {
        throw new Error("approval_required_unauthorized");
      }
    }

    const now = new Date().toISOString();
    const updated: EngineeringActionProposal = {
      ...existing,
      approvalState: "APPROVED",
      reviewedBy: input.userId,
      reviewedAt: now,
      reviewNote: input.note ?? null,
      updatedAt: now,
      auditTrail: [
        ...existing.auditTrail,
        { at: now, actorId: input.userId, action: "approve", detail: input.note },
      ],
    };
    const saved = await this.store.upsert(updated);
    await this.events.publish?.({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      eventType: "engineering.action_proposal.approved",
      source: "engineering-os",
      payload: { proposal_id: saved.proposalId },
    });
    return saved;
  }

  async execute(input: {
    tenantId: string;
    proposalId: string;
    userId: string;
    permissions?: string[];
    idempotencyKey?: string;
    contextFreshnessToken?: string;
    externalWritePolicyEnabled?: boolean;
  }): Promise<EngineeringActionProposal> {
    const existing = await this.store.get(input.tenantId, input.proposalId);
    if (!existing) throw new Error("proposal_not_found");

    if (input.idempotencyKey) {
      const prior = await this.store.findByIdempotencyKey(
        input.tenantId,
        input.idempotencyKey,
      );
      if (prior && prior.approvalState === "COMPLETED") {
        return prior;
      }
      if (
        existing.executionIdempotencyKey === input.idempotencyKey &&
        existing.approvalState === "COMPLETED"
      ) {
        return existing;
      }
    }

    if (TERMINAL.has(existing.approvalState) && existing.approvalState !== "APPROVED") {
      if (existing.approvalState === "COMPLETED") return existing;
      throw new Error(`proposal_${existing.approvalState.toLowerCase()}`);
    }

    if (existing.approvalState !== "APPROVED") {
      throw new Error("proposal_not_approved");
    }

    // No autonomous approval / execution.
    if (existing.authorityRequired === "SAFETY_CRITICAL" && !existing.reviewedBy) {
      throw new Error("safety_critical_never_auto_execute");
    }

    if (
      input.contextFreshnessToken &&
      input.contextFreshnessToken !== existing.sourceContext.contextFreshnessToken
    ) {
      const now = new Date().toISOString();
      const stale: EngineeringActionProposal = {
        ...existing,
        approvalState: "READY_FOR_REVIEW",
        failureReason: "stale_context_requires_refresh_review",
        updatedAt: now,
        auditTrail: [
          ...existing.auditTrail,
          {
            at: now,
            actorId: input.userId,
            action: "fail",
            detail: "stale_context",
          },
        ],
      };
      return this.store.upsert(stale);
    }

    if (this.permissionGate) {
      const ok = await this.permissionGate.hasPermission({
        tenantId: input.tenantId,
        userId: input.userId,
        action: "engineering_action.execute",
      });
      if (!ok) throw new Error("unauthorized_execution");
    }
    if (!hasPermission(["engineering_action.execute"], input.permissions ?? ["engineering_action.execute"])) {
      throw new Error("unauthorized_execution");
    }

    if (existing.targetObject && existing.targetObject.tenantId !== existing.tenantId) {
      throw new Error("cross_tenant_target_blocked");
    }

    if (existing.actionType === "PREPARE_EXTERNAL_WRITE") {
      if (!input.externalWritePolicyEnabled) {
        const now = new Date().toISOString();
        return this.store.upsert({
          ...existing,
          approvalState: "FAILED",
          failureReason: "external_write_blocked_governed_policy",
          updatedAt: now,
          auditTrail: [
            ...existing.auditTrail,
            {
              at: now,
              actorId: input.userId,
              action: "fail",
              detail: "external_write_blocked",
            },
          ],
        });
      }
    }

    const t0 = Date.now();
    const executing: EngineeringActionProposal = {
      ...existing,
      approvalState: "EXECUTING",
      executionIdempotencyKey:
        input.idempotencyKey ?? existing.executionIdempotencyKey ?? existing.proposalId,
      updatedAt: new Date().toISOString(),
    };
    await this.store.upsert(executing);

    const wfT0 = Date.now();
    if (executing.actionType === "CREATE_DECISION_DRAFT" && this.workflow.start) {
      try {
        await this.workflow.start({
          tenantId: executing.tenantId,
          workspaceId: executing.workspaceId,
          definitionSlug: "engineering-decision-approval",
          context: {
            proposal_id: executing.proposalId,
            payload: executing.proposedPayload,
          },
          startedBy: input.userId,
        });
      } catch {
        // Domain executor may still report workflow_outage.
      }
    }
    const workflowEventMs = Date.now() - wfT0;

    const result = await this.executor.execute(executing);
    const now = new Date().toISOString();

    if (!result.ok) {
      const failed: EngineeringActionProposal = {
        ...executing,
        approvalState: "FAILED",
        failureReason: result.failureReason ?? "domain_execution_failed",
        timingMs: {
          ...executing.timingMs,
          executionMs: Date.now() - t0,
          workflowEventMs,
        },
        updatedAt: now,
        auditTrail: [
          ...executing.auditTrail,
          {
            at: now,
            actorId: input.userId,
            action: "fail",
            detail: result.failureReason,
          },
        ],
      };
      const saved = await this.store.upsert(failed);
      await this.events.publish?.({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        eventType: "engineering.action_proposal.failed",
        source: "engineering-os",
        payload: {
          proposal_id: saved.proposalId,
          reason: saved.failureReason,
        },
      });
      return saved;
    }

    const completed: EngineeringActionProposal = {
      ...executing,
      approvalState: "COMPLETED",
      domainResultId: result.domainResultId ?? null,
      domainResultType: result.domainResultType ?? null,
      failureReason: null,
      timingMs: {
        ...executing.timingMs,
        executionMs: Date.now() - t0,
        workflowEventMs,
      },
      updatedAt: now,
      auditTrail: [
        ...executing.auditTrail,
        {
          at: now,
          actorId: input.userId,
          action: "execute",
          detail: result.domainResultId,
        },
      ],
    };
    const saved = await this.store.upsert(completed);
    await this.events.publish?.({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      eventType: "engineering.action_proposal.completed",
      source: "engineering-os",
      payload: {
        proposal_id: saved.proposalId,
        domain_result_id: saved.domainResultId,
        domain_result_type: saved.domainResultType,
      },
    });
    return saved;
  }

  private async requireOpen(
    tenantId: string,
    proposalId: string,
  ): Promise<EngineeringActionProposal> {
    const existing = await this.store.get(tenantId, proposalId);
    if (!existing) throw new Error("proposal_not_found");
    if (TERMINAL.has(existing.approvalState)) {
      throw new Error(`proposal_${existing.approvalState.toLowerCase()}`);
    }
    return existing;
  }
}
