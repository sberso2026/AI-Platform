import { MeetingIntelligenceError, type MeetingIntelligenceErrorCode } from "../errors";

export type TeamsCapabilityName =
  | "meeting_url_validation"
  | "meeting_discovery"
  | "session_mapping"
  | "webhook_events"
  | "participant_metadata"
  | "transcript_retrieval"
  | "live_transcript"
  | "recording_access"
  | "bot_join"
  | "meeting_end_detection"
  | "subscription_renewal";

export type TeamsCapabilityStatus =
  | "unsupported"
  | "unconfigured"
  | "configured"
  | "experimental"
  | "certified";

export type TeamsTranscriptMode = "realtime" | "near_realtime" | "post_meeting" | "unsupported";

export type TeamsCapabilityMap = Record<TeamsCapabilityName, TeamsCapabilityStatus>;

export const DEFAULT_TEAMS_CAPABILITIES: TeamsCapabilityMap = {
  meeting_url_validation: "unconfigured",
  meeting_discovery: "unconfigured",
  session_mapping: "unconfigured",
  webhook_events: "unconfigured",
  participant_metadata: "unconfigured",
  transcript_retrieval: "unconfigured",
  live_transcript: "unsupported",
  recording_access: "unsupported",
  bot_join: "unsupported",
  meeting_end_detection: "unconfigured",
  subscription_renewal: "unconfigured",
};

/** Capabilities that remain unavailable unless separately proven. */
export const HARD_UNSUPPORTED_TEAMS_CAPABILITIES: TeamsCapabilityName[] = [
  "live_transcript",
  "recording_access",
  "bot_join",
];

export const CERTIFIED_TEAMS_CAPABILITY_SUBSET: TeamsCapabilityMap = {
  meeting_url_validation: "certified",
  meeting_discovery: "certified",
  session_mapping: "certified",
  webhook_events: "certified",
  participant_metadata: "certified",
  transcript_retrieval: "certified",
  live_transcript: "unsupported",
  recording_access: "unsupported",
  bot_join: "unsupported",
  meeting_end_detection: "certified",
  subscription_renewal: "certified",
};

export type TeamsProviderStatusReport = {
  provider: "microsoft_teams";
  status: "unavailable" | "experimental" | "beta" | "certified" | "certified_candidate";
  capabilities: TeamsCapabilityMap;
  transcriptMode: TeamsTranscriptMode;
  graphMode: "live" | "fixture" | "unconfigured";
};

export function overallTeamsProviderStatus(
  capabilities: TeamsCapabilityMap,
): TeamsProviderStatusReport["status"] {
  const required: TeamsCapabilityName[] = [
    "meeting_url_validation",
    "session_mapping",
    "webhook_events",
    "subscription_renewal",
  ];
  if (required.every((c) => capabilities[c] === "certified")) {
    return "certified";
  }
  if (Object.values(capabilities).some((s) => s === "configured" || s === "experimental")) {
    return "experimental";
  }
  return "unavailable";
}

export function countUnsupportedCapabilities(capabilities: TeamsCapabilityMap): number {
  return Object.values(capabilities).filter((s) => s === "unsupported").length;
}

export type TeamsErrorCode =
  | "teams_provider_not_configured"
  | "teams_provider_consent_required"
  | "teams_provider_auth_failed"
  | "teams_provider_permission_missing"
  | "teams_meeting_url_invalid"
  | "teams_meeting_not_found"
  | "teams_meeting_mapping_conflict"
  | "teams_tenant_mismatch"
  | "teams_subscription_failed"
  | "teams_subscription_expired"
  | "teams_webhook_validation_failed"
  | "teams_webhook_replay_detected"
  | "teams_transcript_unavailable"
  | "teams_transcript_access_denied"
  | "teams_rate_limited"
  | "teams_capability_not_certified";

const TEAMS_STATUS: Record<TeamsErrorCode, number> = {
  teams_provider_not_configured: 422,
  teams_provider_consent_required: 403,
  teams_provider_auth_failed: 401,
  teams_provider_permission_missing: 403,
  teams_meeting_url_invalid: 422,
  teams_meeting_not_found: 404,
  teams_meeting_mapping_conflict: 409,
  teams_tenant_mismatch: 403,
  teams_subscription_failed: 422,
  teams_subscription_expired: 409,
  teams_webhook_validation_failed: 401,
  teams_webhook_replay_detected: 409,
  teams_transcript_unavailable: 422,
  teams_transcript_access_denied: 403,
  teams_rate_limited: 429,
  teams_capability_not_certified: 422,
};

/** Map Teams codes onto MeetingIntelligenceError using meeting_validation_failed when needed. */
export function throwTeamsError(
  code: TeamsErrorCode,
  message: string,
  details: Record<string, unknown> = {},
): never {
  const status = TEAMS_STATUS[code];
  const bridgeCode: MeetingIntelligenceErrorCode =
    code === "teams_meeting_not_found"
      ? "meeting_not_found"
      : code === "teams_provider_auth_failed"
        ? "meeting_access_denied"
        : code.startsWith("teams_") && status === 403
          ? "meeting_access_denied"
          : code === "teams_meeting_mapping_conflict" || code === "teams_webhook_replay_detected"
            ? "meeting_concurrency_conflict"
            : "meeting_validation_failed";

  throw new MeetingIntelligenceError(bridgeCode, message, status, {
    teamsCode: code,
    ...details,
  });
}

export function teamsErrorHttpStatus(code: TeamsErrorCode): number {
  return TEAMS_STATUS[code];
}
