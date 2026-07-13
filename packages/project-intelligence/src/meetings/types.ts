export const MEETING_STATUSES = [
  "draft",
  "scheduled",
  "connecting",
  "connected",
  "recording",
  "transcribing",
  "live",
  "paused",
  "ended",
  "processing",
  "minutes_draft",
  "review_pending",
  "approved",
  "completed",
  "failed",
  "cancelled",
  "archived",
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_PROVIDERS = [
  "manual",
  "microsoft_teams",
  "zoom",
  "google_meet",
] as const;

export type MeetingProvider = (typeof MEETING_PROVIDERS)[number];

/** Phase 6C-3B product claim: only manual is a certification candidate. */
export const MEETING_PROVIDER_STATUS = {
  manual: "certified_candidate",
  microsoft_teams: "unavailable",
  zoom: "unavailable",
  google_meet: "unavailable",
} as const satisfies Record<MeetingProvider, "certified_candidate" | "unavailable" | "experimental" | "beta" | "certified">;

export const RECORDING_NOTICE_REQUIREMENTS = [
  "required",
  "not_required",
  "unknown",
] as const;
export type RecordingNoticeRequirement = (typeof RECORDING_NOTICE_REQUIREMENTS)[number];

export const CONSENT_STATUSES = [
  "not_requested",
  "pending",
  "granted",
  "declined",
  "withdrawn",
  "not_applicable",
] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const PRIVACY_CLASSIFICATIONS = [
  "public",
  "internal",
  "confidential",
  "restricted",
] as const;
export type PrivacyClassification = (typeof PRIVACY_CLASSIFICATIONS)[number];

export const MEETING_EVENT_TYPES = [
  "meeting.created",
  "meeting.scheduled",
  "meeting.connecting",
  "meeting.connected",
  "meeting.recording_started",
  "meeting.live",
  "meeting.paused",
  "meeting.resumed",
  "meeting.ended",
  "meeting.failed",
  "meeting.cancelled",
  "meeting.archived",
  "participant.added",
  "participant.updated",
  "transcript.segment_added",
  "transcript.segment_revised",
  "consent.updated",
  "privacy.updated",
] as const;
export type MeetingEventType = (typeof MEETING_EVENT_TYPES)[number];

/** States that 6C-3B user flows must not enter yet (schema/state machine only). */
export const MEETING_DEFERRED_USER_FLOW_STATUSES = [
  "processing",
  "minutes_draft",
  "review_pending",
  "approved",
  "completed",
] as const satisfies readonly MeetingStatus[];

export function isMeetingProvider(value: string): value is MeetingProvider {
  return (MEETING_PROVIDERS as readonly string[]).includes(value);
}

export function isMeetingStatus(value: string): value is MeetingStatus {
  return (MEETING_STATUSES as readonly string[]).includes(value);
}
