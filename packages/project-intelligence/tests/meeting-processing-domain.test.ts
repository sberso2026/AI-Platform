import { describe, expect, it } from "vitest";
import {
  assertMinutesStatusTransition,
  assertMinutesVersionMutable,
  assertNoAutoIssue,
  buildDeterministicMinutesSections,
  canTransitionMinutesStatus,
  hashMinutesContent,
  nextMinutesVersionNumber,
} from "../src/meetings/minutes-versioning";
import { MeetingIntelligenceError } from "../src/meetings/errors";
import {
  normalizeTranscriptSegments,
  normalizeTranscriptWhitespace,
} from "../src/meetings/transcript-normalization-service";
import {
  extractProposalsFromTranscript,
  mapProposalType,
} from "../src/meetings/proposal-extraction-service";
import {
  assertProposalReviewTransition,
  canTransitionProposalReview,
} from "../src/meetings/meeting-review-service";
import {
  assertProposalConvertible,
} from "../src/meetings/meeting-core-write-adapter";
import {
  assertUserCannotSetWorkerOwnedStatus,
  assertWorkerMeetingTransition,
  canTransitionMeetingStatus,
} from "../src/meetings/meeting-state-machine";
import { DeterministicMeetingAiAdapter } from "../src/meetings/deterministic-meeting-ai-adapter";
import { MeetingDocumentGroundingAdapter } from "../src/meetings/meeting-document-grounding-adapter";
import { MEETING_JOB_TYPES } from "../src/meetings/types";

describe("meeting worker-owned transitions", () => {
  it("blocks users from setting processing / minutes_draft", () => {
    expect(() => assertUserCannotSetWorkerOwnedStatus("processing")).toThrow(MeetingIntelligenceError);
    expect(() => assertUserCannotSetWorkerOwnedStatus("minutes_draft")).toThrow(/worker-owned/);
    expect(() => assertUserCannotSetWorkerOwnedStatus("ended")).not.toThrow();
  });

  it("allows 6C-3C worker pipeline transitions", () => {
    expect(() => assertWorkerMeetingTransition("ended", "processing")).not.toThrow();
    expect(() => assertWorkerMeetingTransition("processing", "minutes_draft")).not.toThrow();
    expect(() => assertWorkerMeetingTransition("minutes_draft", "review_pending")).not.toThrow();
    expect(canTransitionMeetingStatus("failed", "processing")).toBe(true);
  });

  it("defines process_transcript job type", () => {
    expect(MEETING_JOB_TYPES[0]).toBe("project_intelligence.meeting.process_transcript");
  });
});

describe("transcript normalization", () => {
  it("normalizes whitespace while preserving original separately", () => {
    const { normalized, warnings } = normalizeTranscriptWhitespace("  hello\tworld  \n\n");
    expect(normalized).toBe("hello world");
    expect(warnings.length).toBeGreaterThan(0);

    const result = normalizeTranscriptSegments([
      { id: "s1", text: "ACTION:  Fix  pipe", logicalSequence: 0, speakerId: "u1" },
      { id: "s2", text: "DECIDE: ship", logicalSequence: 2 },
    ]);
    expect(result.segments[0]!.originalText).toBe("ACTION:  Fix  pipe");
    expect(result.segments[0]!.normalizedText).toContain("Fix");
    expect(result.sequenceGaps).toHaveLength(1);
    expect(result.unresolvedSpeakers).toContain("s2");
    expect(result.transcriptChecksum).toHaveLength(64);
  });
});

describe("minutes versioning immutability", () => {
  it("hashes content deterministically and blocks mutating issued versions", () => {
    const built = buildDeterministicMinutesSections({
      title: "Kickoff",
      transcriptLines: ["Hello"],
      proposalSummaries: [{ type: "action", title: "Do thing" }],
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

describe("proposal extraction and review state machine", () => {
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
    expect(drafts.every((d) => d.transcriptSegmentIds.length > 0)).toBe(true);
  });

  it("enforces proposal review transitions and AI cannot approve path", () => {
    expect(canTransitionProposalReview("proposed", "approved")).toBe(true);
    expect(canTransitionProposalReview("rejected", "approved")).toBe(false);
    expect(() => assertProposalReviewTransition("converted_to_core", "approved")).toThrow(
      MeetingIntelligenceError,
    );
  });
});

describe("core write permission gates", () => {
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

describe("deterministic meeting AI + document grounding fail-closed", () => {
  it("generates minutes without network or fabricated citations", async () => {
    const ai = new DeterministicMeetingAiAdapter();
    const proposals = await ai.extractProposals({
      segments: [{ id: "1", text: "FINDING: Weld undercut" }],
    });
    expect(proposals[0]?.payload.documentCitations).toEqual([]);
    const minutes = await ai.generateMinutes({
      title: "QA",
      transcriptLines: ["FINDING: Weld undercut"],
      proposals,
    });
    expect(minutes.markdown).toContain("QA");
    expect(minutes.bodyJson.autoIssued).toBe(false);
  });

  it("abstains when retrieval adapter is not configured", async () => {
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
  });
});
