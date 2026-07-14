import { MeetingIntelligenceError } from "../errors";
import {
  awaitList,
  awaitMutation,
  awaitSingle,
  type MeetingSupabaseClient,
} from "../supabase-types";
import { throwTeamsError } from "./capability-contract";
import type { MicrosoftGraphClientPort } from "./microsoft-graph-client";
import { validateTeamsMeetingUrl } from "./teams-url-validation";

export type ProviderMapping = {
  id: string;
  meetingSessionId: string;
  providerMeetingId: string;
  mappingStatus: string;
  confidence: number;
  joinUrlHash: string | null;
};

function mapRow(row: Record<string, unknown>): ProviderMapping {
  return {
    id: String(row.id),
    meetingSessionId: String(row.meeting_session_id),
    providerMeetingId: String(row.provider_meeting_id),
    mappingStatus: String(row.mapping_status),
    confidence: Number(row.confidence ?? 1),
    joinUrlHash: row.provider_join_url_hash == null ? null : String(row.provider_join_url_hash),
  };
}

export class TeamsMeetingMappingService {
  constructor(
    private readonly db: MeetingSupabaseClient,
    private readonly graph: MicrosoftGraphClientPort,
  ) {}

  async mapMeeting(input: {
    tenantId: string;
    workspaceId: string;
    meetingSessionId: string;
    providerConnectionId: string;
    providerTenantId: string;
    teamsJoinUrl?: string | null;
    providerMeetingId?: string | null;
    correlationId: string;
    requireVerification?: boolean;
  }): Promise<ProviderMapping> {
    let providerMeetingId = input.providerMeetingId?.trim() || null;
    let joinUrlHash: string | null = null;
    let confidence = 1;

    if (input.teamsJoinUrl) {
      const validated = validateTeamsMeetingUrl(input.teamsJoinUrl);
      joinUrlHash = validated.joinUrlHash;
      if (!providerMeetingId && validated.meetingIdHint) {
        providerMeetingId = validated.meetingIdHint;
        confidence = 0.7;
      }
    }

    if (!providerMeetingId) {
      throwTeamsError("teams_meeting_url_invalid", "Unable to resolve Teams meeting id");
    }

    const discovered = await this.graph.getOnlineMeeting(providerMeetingId, input.correlationId);
    if (!discovered) {
      throwTeamsError("teams_meeting_not_found", "Teams meeting was not found", {
        providerMeetingId,
      });
    }

    const { data: conflictRows, error: conflictError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_mappings")
        .select("*")
        .eq("tenant_id", input.tenantId)
        .eq("provider", "microsoft_teams")
        .eq("provider_meeting_id", providerMeetingId)
        .in("mapping_status", ["pending", "mapped", "verified"])
        .neq("meeting_session_id", input.meetingSessionId)
        .limit(1),
    );
    if (conflictError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to check mapping conflicts: ${conflictError.message}`,
        500,
      );
    }
    if (conflictRows?.[0]) {
      throwTeamsError("teams_meeting_mapping_conflict", "Teams meeting already mapped", {
        providerMeetingId,
      });
    }

    const status =
      input.requireVerification || confidence < 0.85 ? "pending" : "mapped";

    const { data: existingRows, error: existingError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_mappings")
        .select("*")
        .eq("meeting_session_id", input.meetingSessionId)
        .eq("provider", "microsoft_teams")
        .limit(1),
    );
    if (existingError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read existing mapping: ${existingError.message}`,
        500,
      );
    }
    const existing = existingRows?.[0];

    const payload = {
      tenant_id: input.tenantId,
      workspace_id: input.workspaceId,
      meeting_session_id: input.meetingSessionId,
      provider_connection_id: input.providerConnectionId,
      provider: "microsoft_teams",
      provider_tenant_id: input.providerTenantId,
      provider_meeting_id: providerMeetingId,
      provider_join_url_hash: joinUrlHash,
      provider_organizer_id: discovered.organizerId,
      mapping_status: status,
      mapping_source: input.teamsJoinUrl ? "manual" : "discovery",
      confidence,
      verified_at: status === "mapped" ? new Date().toISOString() : null,
      last_sync_at: new Date().toISOString(),
      last_sync_status: "ok",
      metadata: {
        correlationId: input.correlationId,
        subject: discovered.subject,
      },
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { data: updated, error: updateError } = await awaitSingle(
        this.db
          .from("project_intelligence_meeting_provider_mappings")
          .update(payload)
          .eq("id", String(existing.id))
          .select("*")
          .single(),
      );
      if (updateError || !updated) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to update mapping: ${updateError?.message ?? "no row"}`,
          500,
        );
      }
      await this.stampSession(input.meetingSessionId, providerMeetingId);
      return mapRow(updated);
    }

    const { data: inserted, error: insertError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_provider_mappings")
        .insert(payload)
        .select("*")
        .single(),
    );
    if (insertError || !inserted) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to insert mapping: ${insertError?.message ?? "no row"}`,
        500,
      );
    }
    await this.stampSession(input.meetingSessionId, providerMeetingId);
    return mapRow(inserted);
  }

  private async stampSession(meetingSessionId: string, providerMeetingId: string): Promise<void> {
    const { error } = await awaitMutation(
      this.db
        .from("project_intelligence_meeting_sessions")
        .update({
          provider: "microsoft_teams",
          provider_meeting_id: providerMeetingId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", meetingSessionId),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to stamp meeting session: ${error.message}`,
        500,
      );
    }
  }

  async getByMeeting(meetingSessionId: string): Promise<ProviderMapping | null> {
    const { data, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_mappings")
        .select("*")
        .eq("meeting_session_id", meetingSessionId)
        .eq("provider", "microsoft_teams")
        .limit(1),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read mapping: ${error.message}`,
        500,
      );
    }
    const row = data?.[0];
    return row ? mapRow(row) : null;
  }
}
