import { DocumentIntelligenceError } from "../documents/errors";

/**
 * Meeting Intelligence domain errors reuse DocumentIntelligenceError envelope shape
 * for nested API contracts; codes are meeting_* / proposal_* / minutes_* / processing_* namespaced.
 * Teams-specific codes are not first-class here — throwTeamsError bridges them via details.teamsCode.
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
  | "meeting_legal_hold"
  | "meeting_worker_owned_transition"
  | "meeting_ai_cannot_approve"
  | "proposal_not_found"
  | "proposal_review_invalid"
  | "proposal_not_approved"
  | "proposal_already_converted"
  | "proposal_evidence_missing"
  | "proposal_conversion_failed"
  | "minutes_not_found"
  | "minutes_review_invalid"
  | "minutes_already_issued"
  | "minutes_immutable_version"
  | "processing_not_found"
  | "processing_invalid_state"
  | "processing_already_active"
  | "processing_retry_invalid"
  | "processing_ai_unavailable"
  | "processing_failed";

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
  meeting_worker_owned_transition: 409,
  meeting_ai_cannot_approve: 403,
  proposal_not_found: 404,
  proposal_review_invalid: 409,
  proposal_not_approved: 409,
  proposal_already_converted: 409,
  proposal_evidence_missing: 422,
  proposal_conversion_failed: 500,
  minutes_not_found: 404,
  minutes_review_invalid: 409,
  minutes_already_issued: 409,
  minutes_immutable_version: 409,
  processing_not_found: 404,
  processing_invalid_state: 409,
  processing_already_active: 409,
  processing_retry_invalid: 409,
  processing_ai_unavailable: 503,
  processing_failed: 500,
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

export function meetingErrorStatus(code: MeetingIntelligenceErrorCode): number {
  return STATUS_BY_CODE[code] ?? 400;
}
