import { MeetingIntelligenceError } from "../errors";
import {
  awaitList,
  awaitMutation,
  awaitSingle,
  type MeetingSupabaseClient,
} from "../supabase-types";
import type { MicrosoftGraphClientPort } from "./microsoft-graph-client";

export type MappedParticipant = {
  id: string;
  externalParticipantId: string;
  displayName: string;
  identityResolved: boolean;
};

export class TeamsParticipantMappingService {
  constructor(
    private readonly db: MeetingSupabaseClient,
    private readonly graph: MicrosoftGraphClientPort,
  ) {}

  async syncParticipants(input: {
    tenantId: string;
    workspaceId: string;
    meetingSessionId: string;
    engineeringProjectId: string | null;
    providerMeetingId: string;
    correlationId: string;
  }): Promise<MappedParticipant[]> {
    const remote = await this.graph.listParticipants(
      input.providerMeetingId,
      input.correlationId,
    );
    const results: MappedParticipant[] = [];

    for (const p of remote) {
      // Never merge solely by display name.
      const { data: existingRows, error: existingError } = await awaitList(
        this.db
          .from("project_intelligence_meeting_participants")
          .select("*")
          .eq("meeting_session_id", input.meetingSessionId)
          .eq("external_participant_id", p.providerParticipantId)
          .limit(1),
      );
      if (existingError) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to read participants: ${existingError.message}`,
          500,
        );
      }
      const existing = existingRows?.[0];

      const row = {
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        engineering_project_id: input.engineeringProjectId,
        meeting_session_id: input.meetingSessionId,
        display_name: p.displayName,
        external_participant_id: p.providerParticipantId,
        role: p.role ?? "attendee",
        source: "microsoft_teams",
        consent_status: "not_requested",
        metadata: {
          identityResolved: false,
          correlationId: input.correlationId,
          mergePolicy: "provider_participant_id_only",
        },
        updated_at: new Date().toISOString(),
      };

      let id: string;
      if (existing) {
        const { data: updated, error: updateError } = await awaitSingle(
          this.db
            .from("project_intelligence_meeting_participants")
            .update(row)
            .eq("id", String(existing.id))
            .select("id")
            .single(),
        );
        if (updateError || !updated) {
          throw new MeetingIntelligenceError(
            "meeting_validation_failed",
            `Unable to update participant: ${updateError?.message ?? "no row"}`,
            500,
          );
        }
        id = String(updated.id);
      } else {
        const { data: inserted, error: insertError } = await awaitSingle(
          this.db
            .from("project_intelligence_meeting_participants")
            .insert(row)
            .select("id")
            .single(),
        );
        if (insertError || !inserted) {
          throw new MeetingIntelligenceError(
            "meeting_validation_failed",
            `Unable to insert participant: ${insertError?.message ?? "no row"}`,
            500,
          );
        }
        id = String(inserted.id);
      }

      results.push({
        id,
        externalParticipantId: p.providerParticipantId,
        displayName: p.displayName,
        identityResolved: false,
      });
    }

    const { error: eventError } = await awaitMutation(
      this.db.from("project_intelligence_meeting_events").insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        meeting_session_id: input.meetingSessionId,
        event_type: "teams.participants_synced",
        actor_type: "system",
        correlation_id: input.correlationId,
        payload: { count: results.length },
      }),
    );
    if (eventError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to audit participant sync: ${eventError.message}`,
        500,
      );
    }

    return results;
  }
}
