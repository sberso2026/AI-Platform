import { randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  assertCanIssueMinutes,
  assertMinutesStatusTransition,
  assertNoAutoIssue,
} from "./minutes-versioning";
import {
  asRecord,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type {
  MeetingMinutesStatus,
  MeetingProposalReviewState,
} from "./types";

export type ReviewActorKind = "human" | "ai" | "system";

export type MeetingReviewActor = ManualMeetingActor & {
  actorKind?: ReviewActorKind;
};

const PROPOSAL_REVIEW_TRANSITIONS: Record<
  MeetingProposalReviewState,
  readonly MeetingProposalReviewState[]
> = {
  proposed: ["under_review", "approved", "rejected", "changes_requested", "superseded"],
  under_review: ["approved", "rejected", "changes_requested", "superseded"],
  changes_requested: ["under_review", "proposed", "rejected", "superseded"],
  approved: ["converted_to_core", "superseded"],
  rejected: ["superseded"],
  superseded: [],
  converted_to_core: [],
};

export function canTransitionProposalReview(
  from: MeetingProposalReviewState,
  to: MeetingProposalReviewState,
): boolean {
  return PROPOSAL_REVIEW_TRANSITIONS[from].includes(to);
}

export function assertProposalReviewTransition(
  from: MeetingProposalReviewState,
  to: MeetingProposalReviewState,
): void {
  if (!canTransitionProposalReview(from, to)) {
    throw new MeetingIntelligenceError(
      "proposal_review_invalid",
      "Proposal review transition is not allowed",
      409,
      { from, to },
    );
  }
}

function assertHumanActor(actor: MeetingReviewActor): void {
  const kind = actor.actorKind ?? "human";
  if (kind !== "human") {
    throw new MeetingIntelligenceError(
      "meeting_ai_cannot_approve",
      "AI and system actors cannot approve, reject, or issue meeting artifacts",
      403,
      { actorKind: kind },
    );
  }
}

export class MeetingReviewService {
  private readonly meetings: ManualMeetingService;

  constructor(private readonly supabase: MeetingSupabaseClient) {
    this.meetings = new ManualMeetingService(supabase);
  }

  async approveProposal(actor: MeetingReviewActor, proposalId: string, notes?: string) {
    return this.transitionProposal(actor, proposalId, "approved", "proposal.approved", notes);
  }

  async rejectProposal(actor: MeetingReviewActor, proposalId: string, notes?: string) {
    return this.transitionProposal(actor, proposalId, "rejected", "proposal.rejected", notes);
  }

  async requestProposalChanges(actor: MeetingReviewActor, proposalId: string, notes?: string) {
    return this.transitionProposal(
      actor,
      proposalId,
      "changes_requested",
      "proposal.changes_requested",
      notes,
    );
  }

  async submitMinutesReview(actor: MeetingReviewActor, minutesId: string) {
    assertHumanActor(actor);
    const minutes = await this.loadMinutes(actor, minutesId);
    const from = minutes.status as MeetingMinutesStatus;
    assertMinutesStatusTransition(from, "review_pending");
    return this.updateMinutesStatus(actor, minutes, "review_pending", "minutes.review_submitted");
  }

  async approveMinutes(actor: MeetingReviewActor, minutesId: string) {
    assertHumanActor(actor);
    const minutes = await this.loadMinutes(actor, minutesId);
    const from = minutes.status as MeetingMinutesStatus;
    assertMinutesStatusTransition(from, "approved");
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_minutes")
      .update({
        status: "approved",
        approved_at: now,
        approved_by: actor.userId,
        updated_at: now,
      })
      .eq("id", minutesId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .select("*")
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "minutes_review_invalid",
        `Unable to approve minutes: ${error?.message ?? "missing row"}`,
        409,
      );
    }
    await this.insertAudit(actor, String(minutes.meeting_session_id), "minutes.approved", {
      minutesId,
    });
    await this.maybeAdvanceMeeting(actor, String(minutes.meeting_session_id), "approved");
    return asRecord(data);
  }

  async requestMinutesChanges(actor: MeetingReviewActor, minutesId: string, notes?: string) {
    assertHumanActor(actor);
    const minutes = await this.loadMinutes(actor, minutesId);
    assertMinutesStatusTransition(minutes.status as MeetingMinutesStatus, "changes_requested");
    const updated = await this.updateMinutesStatus(
      actor,
      minutes,
      "changes_requested",
      "minutes.changes_requested",
      notes,
    );
    return updated;
  }

  async issueMinutes(actor: MeetingReviewActor, minutesId: string) {
    assertHumanActor(actor);
    assertNoAutoIssue("human");
    const minutes = await this.loadMinutes(actor, minutesId);
    const status = minutes.status as MeetingMinutesStatus;
    assertCanIssueMinutes(status);
    if (status === "issued" || minutes.issued_at) {
      throw new MeetingIntelligenceError(
        "minutes_already_issued",
        "Minutes were already issued",
        409,
        { minutesId },
      );
    }
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_minutes")
      .update({
        status: "issued",
        issued_at: now,
        issued_by: actor.userId,
        updated_at: now,
      })
      .eq("id", minutesId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("status", "approved")
      .select("*")
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "minutes_review_invalid",
        `Unable to issue minutes: ${error?.message ?? "missing row"}`,
        409,
      );
    }
    await this.insertAudit(actor, String(minutes.meeting_session_id), "minutes.issued", {
      minutesId,
    });
    await this.maybeAdvanceMeeting(actor, String(minutes.meeting_session_id), "completed");
    return asRecord(data);
  }

  private async transitionProposal(
    actor: MeetingReviewActor,
    proposalId: string,
    to: MeetingProposalReviewState,
    eventType: string,
    notes?: string,
  ) {
    assertHumanActor(actor);
    const proposal = await this.loadProposal(actor, proposalId);
    const from = proposal.review_state as MeetingProposalReviewState;
    assertProposalReviewTransition(from, to);

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_proposals")
      .update({
        review_state: to,
        updated_at: new Date().toISOString(),
        payload: {
          ...asRecord(proposal.payload),
          reviewNotes: notes ?? null,
          reviewedBy: actor.userId,
          reviewedAt: new Date().toISOString(),
        },
      })
      .eq("id", proposalId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("review_state", from)
      .select("*")
      .maybeSingle();

    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "proposal_review_invalid",
        `Unable to update proposal review state: ${error?.message ?? "concurrency"}`,
        409,
        { proposalId, from, to },
      );
    }

    await this.insertAudit(actor, String(proposal.meeting_session_id), eventType, {
      proposalId,
      from,
      to,
      notes: notes ?? null,
    });

    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_review_items").insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        meeting_session_id: proposal.meeting_session_id,
        proposal_id: proposalId,
        status: to,
        reviewer_user_id: actor.userId,
        decision: to,
        notes: notes ?? null,
        correlation_id: actor.correlationId ?? randomUUID(),
      }),
    );

    return asRecord(data);
  }

  private async updateMinutesStatus(
    actor: MeetingReviewActor,
    minutes: Record<string, unknown>,
    to: MeetingMinutesStatus,
    eventType: string,
    notes?: string,
  ) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_minutes")
      .update({ status: to, updated_at: new Date().toISOString() })
      .eq("id", String(minutes.id))
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .select("*")
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "minutes_review_invalid",
        `Unable to update minutes status: ${error?.message ?? "missing row"}`,
        409,
      );
    }
    await this.insertAudit(actor, String(minutes.meeting_session_id), eventType, {
      minutesId: minutes.id,
      to,
      notes: notes ?? null,
    });
    return asRecord(data);
  }

  private async maybeAdvanceMeeting(
    actor: MeetingReviewActor,
    meetingId: string,
    toStatus: "approved" | "completed",
  ): Promise<void> {
    const meeting = await this.meetings.getMeeting(actor, meetingId);
    if (toStatus === "approved" && meeting.status === "review_pending") {
      await this.rawMeetingStatus(actor, meeting.id, meeting.state_version, meeting.status, "approved");
    }
    if (toStatus === "completed" && (meeting.status === "approved" || meeting.status === "review_pending")) {
      const from = meeting.status === "review_pending" ? "review_pending" : "approved";
      if (from === "review_pending") {
        await this.rawMeetingStatus(actor, meeting.id, meeting.state_version, "review_pending", "approved");
        const refreshed = await this.meetings.getMeeting(actor, meetingId);
        await this.rawMeetingStatus(
          actor,
          refreshed.id,
          refreshed.state_version,
          refreshed.status,
          "completed",
        );
      } else {
        await this.rawMeetingStatus(actor, meeting.id, meeting.state_version, "approved", "completed");
      }
    }
  }

  private async rawMeetingStatus(
    actor: MeetingReviewActor,
    meetingId: string,
    stateVersion: number,
    from: string,
    to: string,
  ): Promise<void> {
    await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_sessions")
        .update({
          status: to,
          state_version: stateVersion + 1,
          updated_by: actor.userId,
          correlation_id: actor.correlationId ?? randomUUID(),
        })
        .eq("id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .eq("state_version", stateVersion)
        .eq("status", from),
    );
  }

  private async loadProposal(actor: MeetingReviewActor, proposalId: string) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_proposals")
      .select("*")
      .eq("id", proposalId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError("proposal_not_found", "Proposal not found", 404, { proposalId });
    }
    return asRecord(data);
  }

  private async loadMinutes(actor: MeetingReviewActor, minutesId: string) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_minutes")
      .select("*")
      .eq("id", minutesId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError("minutes_not_found", "Minutes not found", 404, { minutesId });
    }
    return asRecord(data);
  }

  private async insertAudit(
    actor: MeetingReviewActor,
    meetingSessionId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const meeting = await this.meetings.getMeeting(actor, meetingSessionId);
    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: meetingSessionId,
        event_type: eventType,
        event_source: "human_review",
        actor_user_id: actor.userId,
        previous_state: meeting.status,
        new_state: meeting.status,
        payload,
        correlation_id: actor.correlationId ?? meeting.correlation_id ?? randomUUID(),
        occurred_at: new Date().toISOString(),
      }),
    );
  }
}
