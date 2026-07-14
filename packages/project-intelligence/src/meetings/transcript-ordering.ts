/**
 * Transcript ordering contract for Phase 6C-3C.
 *
 * Canonical display order:
 * 1. logical_sequence
 * 2. revision_number
 * 3. server_received_at (deterministic tie-breaker)
 */

export type TranscriptOrderingFields = {
  providerSequence: number | null;
  providerTimestamp: string | null;
  serverReceivedAt: string;
  logicalSequence: number;
  revisionNumber: number;
};

export type TranscriptSequenceGap = {
  afterLogicalSequence: number;
  beforeLogicalSequence: number;
  gapSize: number;
};

export function compareTranscriptOrder(
  a: TranscriptOrderingFields,
  b: TranscriptOrderingFields,
): number {
  if (a.logicalSequence !== b.logicalSequence) {
    return a.logicalSequence - b.logicalSequence;
  }
  if (a.revisionNumber !== b.revisionNumber) {
    return a.revisionNumber - b.revisionNumber;
  }
  return a.serverReceivedAt.localeCompare(b.serverReceivedAt);
}

export function sortTranscriptSegments<T extends TranscriptOrderingFields>(
  segments: readonly T[],
): T[] {
  return [...segments].sort(compareTranscriptOrder);
}

/**
 * Assign next logical sequence without renumbering history.
 * Late events still get a new monotonic logical sequence.
 */
export function nextLogicalSequence(existingMax: number | null | undefined): number {
  const max = typeof existingMax === "number" && Number.isFinite(existingMax) ? existingMax : -1;
  return max + 1;
}

export function detectSequenceGaps(
  logicalSequences: readonly number[],
): TranscriptSequenceGap[] {
  const unique = [...new Set(logicalSequences.filter((n) => Number.isFinite(n)))].sort(
    (a, b) => a - b,
  );
  const gaps: TranscriptSequenceGap[] = [];
  for (let i = 1; i < unique.length; i += 1) {
    const prev = unique[i - 1]!;
    const curr = unique[i]!;
    if (curr > prev + 1) {
      gaps.push({
        afterLogicalSequence: prev,
        beforeLogicalSequence: curr,
        gapSize: curr - prev - 1,
      });
    }
  }
  return gaps;
}

/** Reconnect backoff: exponential with jitter, bounded retries. */
export type ReconnectBackoffConfig = {
  baseMs: number;
  maxMs: number;
  maxAttempts: number;
  jitterRatio: number;
};

export const DEFAULT_RECONNECT_BACKOFF: ReconnectBackoffConfig = {
  baseMs: 250,
  maxMs: 15_000,
  maxAttempts: 8,
  jitterRatio: 0.2,
};

export function reconnectDelayMs(
  attempt: number,
  config: ReconnectBackoffConfig = DEFAULT_RECONNECT_BACKOFF,
  random: () => number = Math.random,
): number | null {
  if (attempt < 1 || attempt > config.maxAttempts) return null;
  const exp = Math.min(config.maxMs, config.baseMs * 2 ** (attempt - 1));
  const jitter = exp * config.jitterRatio * (random() * 2 - 1);
  return Math.max(0, Math.round(exp + jitter));
}

export type TranscriptResumeCursor = {
  meetingSessionId: string;
  lastAcknowledgedLogicalSequence: number;
  resumeToken: string;
};

export function buildResumeToken(cursor: Omit<TranscriptResumeCursor, "resumeToken">): string {
  return `pi-mt-v1:${cursor.meetingSessionId}:${cursor.lastAcknowledgedLogicalSequence}`;
}

export function parseResumeToken(token: string): TranscriptResumeCursor | null {
  const match = /^pi-mt-v1:([0-9a-f-]{36}):(-?\d+)$/i.exec(token.trim());
  if (!match) return null;
  return {
    meetingSessionId: match[1]!,
    lastAcknowledgedLogicalSequence: Number(match[2]),
    resumeToken: token.trim(),
  };
}
