/**
 * Phase 8D — Provider-neutral Meeting Intelligence ingestion readiness.
 * Teams live must not block production Meeting Intelligence readiness.
 */
export type MeetingIngestionSourceKind =
  | "manual_session"
  | "uploaded_transcript"
  | "uploaded_audio"
  | "uploaded_video"
  | "microsoft_teams_fixture"
  | "microsoft_teams_live"
  | "zoom"
  | "google_meet";

export type MeetingIngestionSourceStatus =
  | "certified"
  | "conditionally_deferred"
  | "unavailable"
  | "not_implemented";

export const MEETING_INGESTION_SOURCE_STATUS: Record<
  MeetingIngestionSourceKind,
  MeetingIngestionSourceStatus
> = {
  manual_session: "certified",
  /** Manual transcript append / RTB-owned transcript events cover this path. */
  uploaded_transcript: "certified",
  uploaded_audio: "not_implemented",
  uploaded_video: "not_implemented",
  microsoft_teams_fixture: "certified",
  microsoft_teams_live: "conditionally_deferred",
  zoom: "unavailable",
  google_meet: "unavailable",
};

export const MEETING_PROVIDER_NEUTRAL_CONTRACT = {
  featureKey: "meeting_intelligence" as const,
  moduleKey: "project_intelligence" as const,
  usableWithoutMicrosoftTeams: true as const,
  productionTeamsProviderReady: false as const,
  normalizedContracts: [
    "session",
    "participant",
    "consent",
    "transcript_segment",
    "transcript_revision",
    "event",
    "evidence",
    "provider_capability",
    "provider_health",
  ] as const,
};

export function assertProviderNeutralMeetingReadiness(): void {
  if (!MEETING_PROVIDER_NEUTRAL_CONTRACT.usableWithoutMicrosoftTeams) {
    throw new Error("Meeting Intelligence must remain usable without Microsoft Teams");
  }
  if (MEETING_PROVIDER_NEUTRAL_CONTRACT.productionTeamsProviderReady) {
    throw new Error("productionTeamsProviderReady must remain false until live certification");
  }
  if (MEETING_INGESTION_SOURCE_STATUS.manual_session !== "certified") {
    throw new Error("Manual session provider must remain certified");
  }
  if (MEETING_INGESTION_SOURCE_STATUS.microsoft_teams_live !== "conditionally_deferred") {
    throw new Error("Teams live must remain conditionally_deferred");
  }
  if (MEETING_INGESTION_SOURCE_STATUS.uploaded_audio === "certified") {
    throw new Error("Uploaded audio must not be claimed certified until implemented");
  }
  if (MEETING_INGESTION_SOURCE_STATUS.uploaded_video === "certified") {
    throw new Error("Uploaded video must not be claimed certified until implemented");
  }
}
