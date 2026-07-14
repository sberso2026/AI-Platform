export type TranscriptLatencyClass =
  | "unavailable"
  | "under_5_minutes"
  | "5_to_15_minutes"
  | "15_to_60_minutes"
  | "over_60_minutes"
  | "manual_intervention_required";

export type TeamsLatencyMetrics = {
  webhookDeliveryMs: number | null;
  subscriptionCreateMs: number | null;
  subscriptionRenewMs: number | null;
  subscriptionRevokeMs: number | null;
  meetingEndedAt: string | null;
  firstTranscriptAvailableAt: string | null;
  transcriptRetrievalStartedAt: string | null;
  transcriptRetrievalCompletedAt: string | null;
  transcriptPersistedAt: string | null;
  processingJobEnqueuedAt: string | null;
  minutesProposalsGeneratedAt: string | null;
  reviewItemCreatedAt: string | null;
  transcriptAvailabilityClass: TranscriptLatencyClass;
  notes: string[];
};

export function classifyTranscriptAvailabilityLatency(
  meetingEndedAt: string | null,
  firstAvailableAt: string | null,
): TranscriptLatencyClass {
  if (!meetingEndedAt || !firstAvailableAt) return "unavailable";
  const ended = Date.parse(meetingEndedAt);
  const available = Date.parse(firstAvailableAt);
  if (!Number.isFinite(ended) || !Number.isFinite(available) || available < ended) {
    return "manual_intervention_required";
  }
  const deltaMs = available - ended;
  if (deltaMs < 5 * 60_000) return "under_5_minutes";
  if (deltaMs < 15 * 60_000) return "5_to_15_minutes";
  if (deltaMs < 60 * 60_000) return "15_to_60_minutes";
  return "over_60_minutes";
}

export function emptyLatencyMetrics(notes: string[] = []): TeamsLatencyMetrics {
  return {
    webhookDeliveryMs: null,
    subscriptionCreateMs: null,
    subscriptionRenewMs: null,
    subscriptionRevokeMs: null,
    meetingEndedAt: null,
    firstTranscriptAvailableAt: null,
    transcriptRetrievalStartedAt: null,
    transcriptRetrievalCompletedAt: null,
    transcriptPersistedAt: null,
    processingJobEnqueuedAt: null,
    minutesProposalsGeneratedAt: null,
    reviewItemCreatedAt: null,
    transcriptAvailabilityClass: "unavailable",
    notes,
  };
}

export async function measureLatencyMs<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; latencyMs: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, latencyMs: Date.now() - start };
}
