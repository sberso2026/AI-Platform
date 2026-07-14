import { randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  asRecord,
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type { MeetingProposalReviewState, MeetingProposalType } from "./types";

export type CoreWriteRequest = {
  tenantId: string;
  workspaceId: string;
  engineeringProjectId: string | null;
  proposalId: string;
  proposalType: MeetingProposalType;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  meetingSessionId: string;
  correlationId: string;
  actorUserId: string;
};

export type CoreWriteResult = {
  coreRecordId: string;
  coreRecordType: string;
};

/** Injected port so unit tests never need live Engineering OS. */
export interface CoreWritePort {
  createFromApprovedProposal(request: CoreWriteRequest): Promise<CoreWriteResult>;
}

/**
 * Supabase stub: stores a metadata/backlink payload when Engineering OS client is unavailable.
 * Does not invent authoritative register writes.
 */
export class SupabaseCoreWriteStub implements CoreWritePort {
  constructor(private readonly supabase: MeetingSupabaseClient) {}

  async createFromApprovedProposal(request: CoreWriteRequest): Promise<CoreWriteResult> {
    const coreRecordId = randomUUID();
    const coreRecordType = mapProposalToCoreType(request.proposalType);
    const { error } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: request.tenantId,
        workspace_id: request.workspaceId,
        engineering_project_id: request.engineeringProjectId,
        meeting_session_id: request.meetingSessionId,
        event_type: "proposal.converted_to_core",
        event_source: "core_write_stub",
        actor_user_id: request.actorUserId,
        payload: {
          stub: true,
          coreRecordId,
          coreRecordType,
          proposalId: request.proposalId,
          title: request.title,
        },
        correlation_id: request.correlationId,
        occurred_at: new Date().toISOString(),
      }),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "proposal_conversion_failed",
        `Core write stub failed: ${error.message}`,
        500,
      );
    }
    return { coreRecordId, coreRecordType };
  }
}

export function mapProposalToCoreType(proposalType: MeetingProposalType): string {
  switch (proposalType) {
    case "decision":
      return "engineering_decision";
    case "action":
      return "engineering_action";
    case "risk":
      return "engineering_risk";
    case "issue":
      return "engineering_issue";
    case "technical_query":
      return "engineering_technical_query";
    case "lesson_learned":
      return "engineering_lesson_learned";
    case "finding":
      return "engineering_finding";
    default:
      return "engineering_record";
  }
}

/** Pure gate used by tests and adapter. */
export function assertProposalConvertible(input: {
  reviewState: MeetingProposalReviewState | string;
  coreRecordId?: string | null;
  transcriptSegmentIds: readonly string[];
}): void {
  if (input.reviewState === "converted_to_core" || input.coreRecordId) {
    throw new MeetingIntelligenceError(
      "proposal_already_converted",
      "Proposal was already converted to Engineering Core",
      409,
      { reviewState: input.reviewState, coreRecordId: input.coreRecordId },
    );
  }
  if (input.reviewState !== "approved") {
    throw new MeetingIntelligenceError(
      "proposal_not_approved",
      "Only human-approved proposals can write to Engineering Core",
      409,
      { reviewState: input.reviewState },
    );
  }
  if (!input.transcriptSegmentIds.length) {
    throw new MeetingIntelligenceError(
      "proposal_evidence_missing",
      "Approved proposals require transcript evidence before Core write",
      422,
    );
  }
}

export class MeetingEngineeringCoreWriteAdapter {
  private readonly meetings: ManualMeetingService;
  private readonly coreWrite: CoreWritePort;

  constructor(
    private readonly supabase: MeetingSupabaseClient,
    coreWrite?: CoreWritePort,
  ) {
    this.meetings = new ManualMeetingService(supabase);
    this.coreWrite = coreWrite ?? new SupabaseCoreWriteStub(supabase);
  }

  async convertApprovedProposal(
    actor: ManualMeetingActor,
    proposalId: string,
  ): Promise<{ proposalId: string; coreRecordId: string; coreRecordType: string; idempotent: boolean }> {
    const proposal = await this.loadProposal(actor, proposalId);

    if (proposal.review_state === "converted_to_core" && proposal.core_record_id) {
      return {
        proposalId,
        coreRecordId: String(proposal.core_record_id),
        coreRecordType: String(proposal.core_record_type ?? "engineering_record"),
        idempotent: true,
      };
    }

    const segmentIds = Array.isArray(proposal.transcript_segment_ids)
      ? proposal.transcript_segment_ids.map(String)
      : [];

    assertProposalConvertible({
      reviewState: String(proposal.review_state),
      coreRecordId: proposal.core_record_id == null ? null : String(proposal.core_record_id),
      transcriptSegmentIds: segmentIds,
    });

    await this.assertEvidenceRows(actor, proposalId, String(proposal.meeting_session_id), segmentIds);

    const meeting = await this.meetings.getMeeting(actor, String(proposal.meeting_session_id));
    const correlationId = actor.correlationId ?? meeting.correlation_id ?? randomUUID();
    const payload = asRecord(proposal.payload);

    const write = await this.coreWrite.createFromApprovedProposal({
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      engineeringProjectId: meeting.engineering_project_id,
      proposalId,
      proposalType: proposal.proposal_type as MeetingProposalType,
      title: String(proposal.title ?? payload.title ?? "Untitled proposal"),
      description: proposal.description == null ? null : String(proposal.description),
      payload,
      meetingSessionId: meeting.id,
      correlationId,
      actorUserId: actor.userId,
    });

    const coreBacklink = {
      meetingSessionId: meeting.id,
      proposalId,
      convertedAt: new Date().toISOString(),
      convertedBy: actor.userId,
      coreRecordId: write.coreRecordId,
      coreRecordType: write.coreRecordType,
    };

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_proposals")
      .update({
        review_state: "converted_to_core",
        core_record_id: write.coreRecordId,
        core_record_type: write.coreRecordType,
        payload: { ...payload, coreBacklink },
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("review_state", "approved")
      .select("*")
      .maybeSingle();

    if (error) {
      throw new MeetingIntelligenceError(
        "proposal_conversion_failed",
        `Unable to mark proposal converted: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      // Concurrent conversion — reload for idempotent success
      const again = await this.loadProposal(actor, proposalId);
      if (again.review_state === "converted_to_core" && again.core_record_id) {
        return {
          proposalId,
          coreRecordId: String(again.core_record_id),
          coreRecordType: String(again.core_record_type ?? write.coreRecordType),
          idempotent: true,
        };
      }
      throw new MeetingIntelligenceError(
        "proposal_conversion_failed",
        "Proposal conversion lost a concurrency race",
        409,
      );
    }

    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: meeting.id,
        event_type: "proposal.converted_to_core",
        event_source: "human_review",
        actor_user_id: actor.userId,
        payload: coreBacklink,
        correlation_id: correlationId,
        occurred_at: new Date().toISOString(),
      }),
    );

    return {
      proposalId,
      coreRecordId: write.coreRecordId,
      coreRecordType: write.coreRecordType,
      idempotent: false,
    };
  }

  private async loadProposal(actor: ManualMeetingActor, proposalId: string) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_proposals")
      .select("*")
      .eq("id", proposalId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load proposal: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError("proposal_not_found", "Proposal not found", 404, { proposalId });
    }
    return asRecord(data);
  }

  private async assertEvidenceRows(
    actor: ManualMeetingActor,
    proposalId: string,
    meetingSessionId: string,
    segmentIds: readonly string[],
  ): Promise<void> {
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_evidence")
        .select("id,transcript_segment_id,payload")
        .eq("meeting_session_id", meetingSessionId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to validate proposal evidence: ${error.message}`,
        500,
      );
    }
    const rows = data ?? [];
    const linked = new Set(
      rows
        .filter((row) => asRecord(row.payload).proposalId === proposalId)
        .map((row) => String(row.transcript_segment_id ?? ""))
        .filter(Boolean),
    );
    const missing = segmentIds.filter((id) => !linked.has(id));
    if (!segmentIds.length || missing.length > 0) {
      throw new MeetingIntelligenceError(
        "proposal_evidence_missing",
        "Proposal evidence rows are required before Core write",
        422,
        { proposalId, missing },
      );
    }
  }
}
