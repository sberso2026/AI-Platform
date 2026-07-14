import { describe, expect, it } from "vitest";
import {
  assertMinutesStatusTransition,
  assertMinutesVersionMutable,
  assertNoAutoIssue,
  buildDeterministicMinutesSections,
  canTransitionMinutesStatus,
  hashMinutesContent,
  nextMinutesVersionNumber,
  assertProposalReviewTransition,
  canTransitionProposalReview,
  assertProposalConvertible,
  assertUserCannotSetWorkerOwnedStatus,
  assertWorkerMeetingTransition,
  canTransitionMeetingStatus,
  normalizeTranscriptSegments,
  normalizeTranscriptWhitespace,
  extractProposalsFromTranscript,
  mapProposalType,
  DeterministicMeetingAiAdapter,
  MeetingDocumentGroundingAdapter,
  MEETING_JOB_TYPES,
  MEETING_JOB_STATUSES,
  MeetingIntelligenceError,
  compareTranscriptOrder,
  detectSequenceGaps,
  nextLogicalSequence,
  reconnectDelayMs,
  buildResumeToken,
  parseResumeToken,
  sortTranscriptSegments,
} from "@rtb/project-intelligence/server";

/**
 * Offline unit coverage for Gates D–N (CERT not required).
 * Hosted durability remains proven under CERT=1 via schema/RLS/browser jobs.
 */
describe("Gate D — realtime transcript durability contracts", () => {
  it("orders by logical_sequence then revision then server_received_at", () => {
    const ordered = sortTranscriptSegments([
      {
        logicalSequence: 1,
        revisionNumber: 1,
        serverReceivedAt: "2026-07-14T10:00:02Z",
        providerSequence: null,
        providerTimestamp: null,
      },
      {
        logicalSequence: 0,
        revisionNumber: 2,
        serverReceivedAt: "2026-07-14T10:00:01Z",
        providerSequence: null,
        providerTimestamp: null,
      },
      {
        logicalSequence: 0,
        revisionNumber: 1,
        serverReceivedAt: "2026-07-14T10:00:00Z",
        providerSequence: null,
        providerTimestamp: null,
      },
    ]);
    expect(ordered.map((s) => `${s.logicalSequence}.${s.revisionNumber}`)).toEqual([
      "0.1",
      "0.2",
      "1.1",
    ]);
    expect(
      compareTranscriptOrder(ordered[0]!, ordered[1]!),
    ).toBeLessThan(0);
  });
});

describe("Gate E — sequence and reconnect recovery", () => {
  it("assigns monotonic logical sequences and detects gaps", () => {
    expect(nextLogicalSequence(null)).toBe(0);
    expect(nextLogicalSequence(4)).toBe(5);
    expect(detectSequenceGaps([0, 1, 3, 5])).toEqual([
      { afterLogicalSequence: 1, beforeLogicalSequence: 3, gapSize: 1 },
      { afterLogicalSequence: 3, beforeLogicalSequence: 5, gapSize: 1 },
    ]);
  });

  it("builds resume tokens and reconnect backoff delays", () => {
    const token = buildResumeToken({
      meetingSessionId: "11111111-1111-4111-8111-111111111111",
      lastAcknowledgedLogicalSequence: 2,
    });
    expect(parseResumeToken(token)?.lastAcknowledgedLogicalSequence).toBe(2);
    expect(reconnectDelayMs(1, undefined, () => 0.5)).toBeGreaterThan(0);
    expect(reconnectDelayMs(99)).toBeNull();
  });
});

describe("Gate F — processing jobs and transactional outbox surfaces", () => {
  it("defines process_transcript and related job types", () => {
    expect(MEETING_JOB_TYPES[0]).toBe("project_intelligence.meeting.process_transcript");
    expect(MEETING_JOB_TYPES).toContain("project_intelligence.meeting.generate_minutes");
    expect(MEETING_JOB_TYPES).toContain("project_intelligence.meeting.extract_proposals");
    expect(MEETING_JOB_STATUSES).toContain("queued");
    expect(MEETING_JOB_STATUSES).toContain("dead_letter");
  });
});

describe("Gate G — worker lease, retry and dead-letter contracts", () => {
  it("blocks users from worker-owned statuses and allows worker pipeline", () => {
    expect(() => assertUserCannotSetWorkerOwnedStatus("processing")).toThrow(MeetingIntelligenceError);
    expect(() => assertWorkerMeetingTransition("ended", "processing")).not.toThrow();
    expect(() => assertWorkerMeetingTransition("processing", "minutes_draft")).not.toThrow();
    expect(canTransitionMeetingStatus("failed", "processing")).toBe(true);
  });
});

describe("Gate H — transcript normalization", () => {
  it("normalizes whitespace while preserving original text", () => {
    const { normalized, warnings } = normalizeTranscriptWhitespace("  hello\tworld  \n\n");
    expect(normalized).toBe("hello world");
    expect(warnings.length).toBeGreaterThan(0);
    const result = normalizeTranscriptSegments([
      { id: "s1", text: "ACTION:  Fix  pipe", logicalSequence: 0, speakerId: "u1" },
      { id: "s2", text: "DECIDE: ship", logicalSequence: 2 },
    ]);
    expect(result.segments[0]!.originalText).toBe("ACTION:  Fix  pipe");
    expect(result.sequenceGaps).toHaveLength(1);
    expect(result.transcriptChecksum).toHaveLength(64);
  });
});

describe("Gate I — Document Intelligence grounding and citations", () => {
  it("abstains without fabricated citations when retrieval is not configured", async () => {
    const adapter = new MeetingDocumentGroundingAdapter(null);
    const result = await adapter.groundClaim(
      {
        tenantId: "t",
        workspaceId: "w",
        engineeringProjectId: "p",
        allowedProjectIds: ["p"],
        authorized: true,
      },
      { query: "spec thickness" },
    );
    expect(result.abstained).toBe(true);
    expect(result.citations).toEqual([]);
    expect(result.abstentionReason).toBe("document_retrieval_adapter_not_configured");

    const ai = new DeterministicMeetingAiAdapter();
    const proposals = await ai.extractProposals({
      segments: [{ id: "1", text: "FINDING: Weld undercut" }],
    });
    expect(proposals[0]?.payload.documentCitations).toEqual([]);
  });
});

describe("Gate J — minutes generation", () => {
  it("builds deterministic minutes sections without auto-issue", async () => {
    const built = buildDeterministicMinutesSections({
      title: "Kickoff",
      transcriptLines: ["Hello"],
      proposalSummaries: [{ type: "action", title: "Do thing" }],
    });
    expect(built.markdown).toContain("Kickoff");
    const ai = new DeterministicMeetingAiAdapter();
    const minutes = await ai.generateMinutes({
      title: "QA",
      transcriptLines: ["FINDING: Weld undercut"],
      proposals: [],
    });
    expect(minutes.bodyJson.autoIssued).toBe(false);
  });
});

describe("Gate K — minutes versioning", () => {
  it("hashes content and blocks immutable issued versions", () => {
    const built = buildDeterministicMinutesSections({
      title: "Kickoff",
      transcriptLines: ["Hello"],
      proposalSummaries: [],
    });
    const hash = hashMinutesContent(built.markdown, built.bodyJson);
    expect(hash).toBe(hashMinutesContent(built.markdown, built.bodyJson));
    expect(nextMinutesVersionNumber(1)).toBe(2);
    expect(canTransitionMinutesStatus("generated", "review_pending")).toBe(true);
    expect(() => assertMinutesVersionMutable({ status: "issued", issuedAt: "2026-01-01" })).toThrow(
      /immutable/,
    );
    expect(() => assertNoAutoIssue("ai")).toThrow(MeetingIntelligenceError);
    expect(() => assertMinutesStatusTransition("draft", "issued")).toThrow(MeetingIntelligenceError);
  });
});

describe("Gate L — proposal extraction", () => {
  it("extracts cue-tagged proposals including lesson_learned", () => {
    expect(mapProposalType("lesson learned")).toBe("lesson_learned");
    const drafts = extractProposalsFromTranscript([
      { id: "a", text: "ACTION: Order fittings owner: Sam due: 2026-08-01" },
      { id: "b", text: "DECIDE: Use SS316\nRISK: Schedule slip\nLESSON: Check isometric first" },
    ]);
    expect(drafts.map((d) => d.proposalType).sort()).toEqual([
      "action",
      "decision",
      "lesson_learned",
      "risk",
    ]);
  });
});

describe("Gate M — human review proposal state machine", () => {
  it("enforces proposal review transitions", () => {
    expect(canTransitionProposalReview("proposed", "approved")).toBe(true);
    expect(canTransitionProposalReview("rejected", "approved")).toBe(false);
    expect(() => assertProposalReviewTransition("converted_to_core", "approved")).toThrow(
      MeetingIntelligenceError,
    );
  });
});

describe("Gate N — approved Engineering Core write asserts", () => {
  it("requires approved + evidence and rejects already converted", () => {
    expect(() =>
      assertProposalConvertible({
        reviewState: "proposed",
        transcriptSegmentIds: ["s1"],
      }),
    ).toThrow(/proposal_not_approved|approved/i);

    expect(() =>
      assertProposalConvertible({
        reviewState: "approved",
        transcriptSegmentIds: [],
      }),
    ).toThrow(/proposal_evidence_missing|evidence/i);

    expect(() =>
      assertProposalConvertible({
        reviewState: "converted_to_core",
        coreRecordId: "c1",
        transcriptSegmentIds: ["s1"],
      }),
    ).toThrow(/proposal_already_converted|already converted/i);

    expect(() =>
      assertProposalConvertible({
        reviewState: "approved",
        transcriptSegmentIds: ["s1"],
      }),
    ).not.toThrow();
  });
});
