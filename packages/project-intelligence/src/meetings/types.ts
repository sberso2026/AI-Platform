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

/** Phase 6C-3D: manual provider certified; microsoft_teams certified via runtime capability report when configured; zoom/google unavailable. */
export const MEETING_PROVIDER_STATUS = {
  manual: "certified",
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
  "meeting.processing_enqueued",
  "meeting.processing_completed",
  "meeting.processing_failed",
  "proposal.created",
  "proposal.updated",
  "proposal.approved",
  "proposal.rejected",
  "proposal.changes_requested",
  "proposal.converted_to_core",
  "minutes.generated",
  "minutes.review_submitted",
  "minutes.approved",
  "minutes.changes_requested",
  "minutes.issued",
] as const;
export type MeetingEventType = (typeof MEETING_EVENT_TYPES)[number];

export const MEETING_JOB_TYPES = [
  "project_intelligence.meeting.process_transcript",
  "project_intelligence.meeting.generate_minutes",
  "project_intelligence.meeting.extract_proposals",
  "project_intelligence.meeting.refresh_evidence",
  "project_intelligence.meeting.retry",
  "project_intelligence.meeting.cleanup",
] as const;
export type MeetingJobType = (typeof MEETING_JOB_TYPES)[number];

export const MEETING_JOB_STATUSES = [
  "queued",
  "claimed",
  "running",
  "retry_pending",
  "completed",
  "failed",
  "dead_letter",
  "cancelled",
  "superseded",
] as const;
export type MeetingJobStatus = (typeof MEETING_JOB_STATUSES)[number];

export const MEETING_PROPOSAL_TYPES = [
  "decision",
  "action",
  "risk",
  "issue",
  "technical_query",
  "lesson_learned",
  "finding",
] as const;
export type MeetingProposalType = (typeof MEETING_PROPOSAL_TYPES)[number];

export const MEETING_PROPOSAL_REVIEW_STATES = [
  "proposed",
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
  "superseded",
  "converted_to_core",
] as const;
export type MeetingProposalReviewState = (typeof MEETING_PROPOSAL_REVIEW_STATES)[number];

export const MEETING_MINUTES_STATUSES = [
  "draft",
  "generated",
  "review_pending",
  "changes_requested",
  "approved",
  "issued",
  "superseded",
  "archived",
] as const;
export type MeetingMinutesStatus = (typeof MEETING_MINUTES_STATUSES)[number];

/** User clients must not submit worker-owned pipeline states directly. */
export const MEETING_WORKER_OWNED_STATUSES = [
  "processing",
  "minutes_draft",
] as const satisfies readonly MeetingStatus[];

/** States that remain deferred for direct user transition APIs (workers/admin review only). */
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
