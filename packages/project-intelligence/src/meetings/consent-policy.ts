import { MeetingIntelligenceError } from "./errors";
import type { ConsentStatus, MeetingStatus, RecordingNoticeRequirement } from "./types";

const RECORDING_OR_LIVE: ReadonlySet<MeetingStatus> = new Set([
  "recording",
  "transcribing",
  "live",
  "paused",
]);

const RESOLVED_CONSENT: ReadonlySet<ConsentStatus> = new Set([
  "granted",
  "not_applicable",
]);

/**
 * When recording notice is required, consent must be resolved before recording/live.
 * No universal legal rule — callers supply tenant policy values.
 */
export function assertConsentAllowsLifecycleTransition(input: {
  recordingNoticeRequired: RecordingNoticeRequirement;
  consentStatus: ConsentStatus;
  toStatus: MeetingStatus;
}): void {
  if (!RECORDING_OR_LIVE.has(input.toStatus)) return;
  if (input.recordingNoticeRequired !== "required") return;
  if (RESOLVED_CONSENT.has(input.consentStatus)) return;
  throw new MeetingIntelligenceError(
    "meeting_consent_unresolved",
    "Recording or live capture requires resolved consent under the meeting consent policy",
    403,
    {
      recordingNoticeRequired: input.recordingNoticeRequired,
      consentStatus: input.consentStatus,
      toStatus: input.toStatus,
    },
  );
}

export function canEnterRecordingOrLive(
  recordingNoticeRequired: RecordingNoticeRequirement,
  consentStatus: ConsentStatus,
): boolean {
  try {
    assertConsentAllowsLifecycleTransition({
      recordingNoticeRequired,
      consentStatus,
      toStatus: "live",
    });
    return true;
  } catch {
    return false;
  }
}
