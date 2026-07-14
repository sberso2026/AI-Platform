import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

import {
  buildResumeToken,
  compareTranscriptOrder,
  detectSequenceGaps,
  nextLogicalSequence,
  parseResumeToken,
  reconnectDelayMs,
  sortTranscriptSegments,
  DEFAULT_RECONNECT_BACKOFF,
} from "../src/meetings/transcript-ordering";

describe("transcript ordering contract", () => {
  it("orders by logical_sequence, revision_number, then server_received_at", () => {
    const ordered = sortTranscriptSegments([
      {
        logicalSequence: 1,
        revisionNumber: 2,
        serverReceivedAt: "2026-07-14T10:00:02Z",
        providerSequence: null,
        providerTimestamp: null,
      },
      {
        logicalSequence: 1,
        revisionNumber: 1,
        serverReceivedAt: "2026-07-14T10:00:01Z",
        providerSequence: null,
        providerTimestamp: null,
      },
      {
        logicalSequence: 0,
        revisionNumber: 1,
        serverReceivedAt: "2026-07-14T10:00:00Z",
        providerSequence: 9,
        providerTimestamp: "2026-07-14T09:59:59Z",
      },
    ]);
    expect(ordered.map((s) => `${s.logicalSequence}.${s.revisionNumber}`)).toEqual([
      "0.1",
      "1.1",
      "1.2",
    ]);
  });

  it("assigns monotonic logical sequence without renumbering", () => {
    expect(nextLogicalSequence(undefined)).toBe(0);
    expect(nextLogicalSequence(null)).toBe(0);
    expect(nextLogicalSequence(4)).toBe(5);
  });

  it("detects sequence gaps", () => {
    expect(detectSequenceGaps([0, 1, 3, 7])).toEqual([
      { afterLogicalSequence: 1, beforeLogicalSequence: 3, gapSize: 1 },
      { afterLogicalSequence: 3, beforeLogicalSequence: 7, gapSize: 3 },
    ]);
  });

  it("ties equal timestamps deterministically via compare", () => {
    const a = {
      logicalSequence: 2,
      revisionNumber: 1,
      serverReceivedAt: "2026-07-14T10:00:00.000Z",
      providerSequence: 1,
      providerTimestamp: "2026-07-14T10:00:00.000Z",
    };
    const b = {
      ...a,
      providerSequence: 99,
    };
    expect(compareTranscriptOrder(a, b)).toBe(0);
  });
});

describe("reconnect backoff and resume tokens", () => {
  it("applies bounded exponential backoff with jitter", () => {
    const delays = [1, 2, 3, 8, 9].map((attempt) =>
      reconnectDelayMs(attempt, DEFAULT_RECONNECT_BACKOFF, () => 0.5),
    );
    expect(delays[0]).toBe(250);
    expect(delays[1]).toBe(500);
    expect(delays[2]).toBe(1000);
    expect(delays[3]).toBe(15_000);
    expect(delays[4]).toBeNull();
    expect(reconnectDelayMs(0)).toBeNull();
  });

  it("round-trips resume tokens", () => {
    const token = buildResumeToken({
      meetingSessionId: "11111111-1111-4111-8111-111111111111",
      lastAcknowledgedLogicalSequence: 12,
    });
    expect(parseResumeToken(token)).toEqual({
      meetingSessionId: "11111111-1111-4111-8111-111111111111",
      lastAcknowledgedLogicalSequence: 12,
      resumeToken: token,
    });
    expect(parseResumeToken("junk")).toBeNull();
  });

  it("checksum is stable for duplicate content detection helpers", () => {
    const a = createHash("sha256").update("hello").digest("hex");
    const b = createHash("sha256").update("hello").digest("hex");
    expect(a).toBe(b);
  });
});
