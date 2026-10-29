/**
 * Domain/workflow execution adapters — invoke existing registers/workflows only.
 * No parallel action/decision/risk/issue stores.
 */

import type { EngineeringActionProposal } from "./contracts";

export type DomainExecutionResult = {
  ok: boolean;
  domainResultType?: string;
  domainResultId?: string;
  workflowInstanceId?: string | null;
  failureReason?: string;
  /** Draft text never implies issued/approved. */
  issuedOrApprovedImplied: false;
};

export type EngineeringDomainExecutor = {
  execute(proposal: EngineeringActionProposal): Promise<DomainExecutionResult>;
};

export type FixtureDomainCall = {
  at: string;
  actionType: string;
  proposalId: string;
  payload: Record<string, unknown>;
};

/**
 * Deterministic fixture executor for certification.
 * Simulates existing register/domain creates without inventing new SoR tables.
 */
export class FixtureEngineeringDomainExecutor implements EngineeringDomainExecutor {
  readonly calls: FixtureDomainCall[] = [];
  failNext = false;
  workflowOutage = false;
  externalWriteEnabled = false;

  async execute(proposal: EngineeringActionProposal): Promise<DomainExecutionResult> {
    if (this.failNext) {
      this.failNext = false;
      return {
        ok: false,
        failureReason: "domain_service_failure",
        issuedOrApprovedImplied: false,
      };
    }
    if (this.workflowOutage && proposal.actionType === "CREATE_DECISION_DRAFT") {
      return {
        ok: false,
        failureReason: "workflow_outage",
        issuedOrApprovedImplied: false,
      };
    }
    if (proposal.actionType === "PREPARE_EXTERNAL_WRITE") {
      if (!this.externalWriteEnabled) {
        return {
          ok: false,
          failureReason: "external_write_disabled_by_default",
          issuedOrApprovedImplied: false,
        };
      }
    }

    const id = `dom_${proposal.actionType.toLowerCase()}_${proposal.proposalId.slice(-8)}`;
    const typeMap: Record<string, string> = {
      CREATE_ACTION: "action",
      CREATE_DECISION_DRAFT: "decision",
      CREATE_RISK_DRAFT: "risk",
      CREATE_ISSUE_DRAFT: "issue",
      DRAFT_TQ_RESPONSE: "technical_query_draft_response",
      DRAFT_REPORT: "action",
      PROPOSE_INTERVENTION: "action",
      ASSIGN_REVIEW: "assignment",
      LINK_EVIDENCE: "relationship",
      PREPARE_REGISTER_ENTRY: "action",
      PREPARE_EXTERNAL_WRITE: "external_write_proposal",
    };

    this.calls.push({
      at: new Date().toISOString(),
      actionType: proposal.actionType,
      proposalId: proposal.proposalId,
      payload: { ...proposal.proposedPayload, status: proposal.proposedPayload.status ?? "draft" },
    });

    // AI drafts remain draft — never imply issued/approved.
    if (
      proposal.actionType === "DRAFT_TQ_RESPONSE" ||
      proposal.actionType === "DRAFT_REPORT" ||
      proposal.actionType === "CREATE_DECISION_DRAFT"
    ) {
      const status = String(proposal.proposedPayload.status ?? "draft").toLowerCase();
      if (status === "approved" || status === "issued" || status === "closed") {
        return {
          ok: false,
          failureReason: "ai_draft_cannot_imply_issued_or_approved_status",
          issuedOrApprovedImplied: false,
        };
      }
    }

    return {
      ok: true,
      domainResultType: typeMap[proposal.actionType] ?? "action",
      domainResultId: id,
      workflowInstanceId:
        proposal.actionType === "CREATE_DECISION_DRAFT"
          ? `wf_${proposal.proposalId.slice(-8)}`
          : null,
      issuedOrApprovedImplied: false,
    };
  }
}

export type PlatformWorkflowBridge = {
  start?: (input: {
    tenantId: string;
    workspaceId?: string | null;
    definitionSlug: string;
    context?: Record<string, unknown>;
    startedBy?: string;
  }) => Promise<{ id: string }>;
};

export type PlatformEventBridge = {
  publish?: (input: {
    tenantId: string;
    workspaceId?: string | null;
    eventType: string;
    source?: string;
    payload?: Record<string, unknown>;
  }) => Promise<unknown>;
};
