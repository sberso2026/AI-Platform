import { failClosed } from "./errors";

/**
 * Privacy-conscious product metrics for pilot validation.
 * Events must not contain engineering document content, extracts, or secrets.
 */
export const REVIEW_PRODUCT_METRIC_NAMES = [
  "review_started",
  "review_completed",
  "review_failed",
  "finding_disposition",
] as const;

export type ReviewProductMetricName = (typeof REVIEW_PRODUCT_METRIC_NAMES)[number];

export type ReviewProductMetricEvent = {
  name: ReviewProductMetricName;
  at: string;
  actorId?: string;
  reviewPackageId?: string;
  reviewRunId?: string;
  findingId?: string;
  action?: string;
  errorCode?: string;
  durationMs?: number;
  documentCount?: number;
  findingCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
  modifiedCount?: number;
  timeToFirstDispositionMs?: number;
};

export interface ReviewProductTelemetry {
  record(event: ReviewProductMetricEvent): void;
}

export class InMemoryReviewProductTelemetry implements ReviewProductTelemetry {
  readonly events: ReviewProductMetricEvent[] = [];

  record(event: ReviewProductMetricEvent): void {
    assertTelemetryHasNoDocumentContent(event);
    this.events.push(event);
  }
}

const FORBIDDEN_TELEMETRY_KEYS = [
  "extractedtext",
  "extracted_text",
  "span",
  "content",
  "documenttext",
  "sourcecontent",
  "password",
  "secret",
  "service_role",
  "apikey",
  "api_key",
];

export function assertTelemetryHasNoDocumentContent(event: ReviewProductMetricEvent): void {
  const serialized = JSON.stringify(event);
  const lower = serialized.toLowerCase();
  for (const key of FORBIDDEN_TELEMETRY_KEYS) {
    if (lower.includes(key)) {
      failClosed("telemetry_content_forbidden", "Product telemetry must not include document content or secrets", {
        key,
      });
    }
  }
}

export type ReviewPilotRates = {
  engineer_confirmed_finding_rate: number | null;
  human_override_rate: number | null;
  review_time_saved: number | null;
  findings_generated: number;
  findings_accepted: number;
  findings_rejected: number;
  findings_modified: number;
  reviews_completed: number;
  documents_reviewed: number;
  average_review_duration_ms: number | null;
  average_time_to_first_disposition_ms: number | null;
};

/**
 * Pilot formulas (counts only — no document content):
 * - engineer_confirmed_finding_rate = accepted / findings_generated
 * - human_override_rate = (rejected + modified) / findings_generated
 * - review_time_saved is not claimed in ERA-5; duration is recorded so a later
 *   baseline comparison can be applied without inventing savings.
 */
export function computePilotRates(events: readonly ReviewProductMetricEvent[]): ReviewPilotRates {
  const completed = events.filter((event) => event.name === "review_completed");
  const dispositions = events.filter((event) => event.name === "finding_disposition");
  const findingsGenerated = completed.reduce((sum, event) => sum + (event.findingCount ?? 0), 0);
  const accepted = dispositions.filter((event) => event.action === "accept").length;
  const rejected = dispositions.filter((event) => event.action === "reject").length;
  const modified = dispositions.filter((event) => event.action === "modify").length;
  const documents = completed.reduce((sum, event) => sum + (event.documentCount ?? 0), 0);
  const durations = completed
    .map((event) => event.durationMs)
    .filter((value): value is number => typeof value === "number");
  const firstDisposition = dispositions
    .map((event) => event.timeToFirstDispositionMs)
    .filter((value): value is number => typeof value === "number");

  return {
    engineer_confirmed_finding_rate: findingsGenerated === 0 ? null : accepted / findingsGenerated,
    human_override_rate: findingsGenerated === 0 ? null : (rejected + modified) / findingsGenerated,
    review_time_saved: null,
    findings_generated: findingsGenerated,
    findings_accepted: accepted,
    findings_rejected: rejected,
    findings_modified: modified,
    reviews_completed: completed.length,
    documents_reviewed: documents,
    average_review_duration_ms:
      durations.length === 0 ? null : durations.reduce((sum, value) => sum + value, 0) / durations.length,
    average_time_to_first_disposition_ms:
      firstDisposition.length === 0
        ? null
        : firstDisposition.reduce((sum, value) => sum + value, 0) / firstDisposition.length,
  };
}
