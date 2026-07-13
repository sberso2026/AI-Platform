import { DocumentIntelligenceError } from "../documents/errors";

/**
 * Meeting Intelligence domain errors reuse DocumentIntelligenceError envelope shape
 * for nested API contracts; codes are meeting_* namespaced.
 */
export type MeetingIntelligenceErrorCode =
  | "meeting_not_found"
  | "meeting_access_denied"
  | "meeting_transition_invalid"
  | "meeting_concurrency_conflict"
  | "meeting_consent_unresolved"
  | "meeting_validation_failed"
  | "meeting_provider_unavailable"
  | "meeting_participant_conflict"
  | "meeting_transcript_conflict"
  | "meeting_legal_hold";

const STATUS_BY_CODE: Record<MeetingIntelligenceErrorCode, number> = {
  meeting_not_found: 404,
  meeting_access_denied: 403,
  meeting_transition_invalid: 409,
  meeting_concurrency_conflict: 409,
  meeting_consent_unresolved: 403,
  meeting_validation_failed: 422,
  meeting_provider_unavailable: 422,
  meeting_participant_conflict: 409,
  meeting_transcript_conflict: 409,
  meeting_legal_hold: 409,
};

export class MeetingIntelligenceError extends Error {
  readonly name = "MeetingIntelligenceError";

  constructor(
    readonly code: MeetingIntelligenceErrorCode,
    message: string,
    readonly statusCode: number = STATUS_BY_CODE[code] ?? 400,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }

  toEnvelope(requestId?: string): {
    error: {
      code: MeetingIntelligenceErrorCode;
      message: string;
      requestId?: string;
      details: Record<string, unknown>;
    };
  } {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(requestId ? { requestId } : {}),
        details: this.details,
      },
    };
  }
}

/** Bridge to document-style handlers that only catch DocumentIntelligenceError. */
export function asDocumentStyleError(error: MeetingIntelligenceError): DocumentIntelligenceError {
  return new DocumentIntelligenceError(
    "document_transition_invalid",
    error.message,
    error.statusCode,
    { meetingCode: error.code, ...error.details },
  );
}
