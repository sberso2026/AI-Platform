import { createHash, randomUUID } from "node:crypto";

import { DeterministicMeetingAiAdapter, type MeetingAiPort } from "./deterministic-meeting-ai-adapter";
import { MeetingIntelligenceError } from "./errors";
import {
  assertMeetingFindingsHandoffCannotMutateCore,
  createMeetingFindingsHandoff,
} from "./findings-handoff";
import type { ManualMeetingActor } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type { MeetingProposalType } from "./types";
import { MEETING_PROPOSAL_TYPES } from "./types";

export type TranscriptCueSegment = {
  id: string;
  text: string;
  speakerId?: string | null;
  speakerLabel?: string | null;
  startTimeMs?: number | null;
  endTimeMs?: number | null;
  logicalSequence?: number;
};

export type ExtractedProposalDraft = {
  proposalType: MeetingProposalType;
  title: string;
  description: string;
  ownerCandidate: string | null;
  dueDateCandidate: string | null;
  priority: string | null;
  severity: string | null;
  transcriptSegmentIds: string[];
  startTimeMs: number | null;
  endTimeMs: number | null;
  speakerIds: string[];
  confidence: number;
  payload: Record<string, unknown>;
};

const CUE_PATTERNS: ReadonlyArray<{ type: MeetingProposalType; re: RegExp }> = [
  { type: "action", re: /^\s*(?:ACTION|TODO|FOLLOW[- ]?UP)\s*[:\-]\s*(.+)$/i },
  { type: "decision", re: /^\s*(?:DECIDE|DECISION|AGREED|WE DECIDED)\s*[:\-]\s*(.+)$/i },
  { type: "risk", re: /^\s*(?:RISK)\s*[:\-]\s*(.+)$/i },
  { type: "issue", re: /^\s*(?:ISSUE|PROBLEM)\s*[:\-]\s*(.+)$/i },
  { type: "technical_query", re: /^\s*(?:TQ|TECHNICAL[- ]?QUERY|QUERY)\s*[:\-]\s*(.+)$/i },
  { type: "lesson_learned", re: /^\s*(?:LESSON|LESSON[- ]?LEARNED|LL)\s*[:\-]\s*(.+)$/i },
  { type: "finding", re: /^\s*(?:FINDING|FIND)\s*[:\-]\s*(.+)$/i },
];

/** Map legacy/cue aliases onto DB CHECK proposal_type including lesson_learned. */
export function mapProposalType(raw: string): MeetingProposalType | null {
  const normalized = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "lesson" || normalized === "lessons_learned") return "lesson_learned";
  if ((MEETING_PROPOSAL_TYPES as readonly string[]).includes(normalized)) {
    return normalized as MeetingProposalType;
  }
  return null;
}

export function extractProposalsFromTranscript(
  segments: readonly TranscriptCueSegment[],
): ExtractedProposalDraft[] {
  const drafts: ExtractedProposalDraft[] = [];
  for (const segment of segments) {
    const lines = String(segment.text ?? "").split(/\r?\n/);
    for (const line of lines) {
      for (const cue of CUE_PATTERNS) {
        const match = cue.re.exec(line);
        if (!match) continue;
        const body = match[1]!.trim();
        if (!body) continue;
        const ownerMatch = /\bowner\s*[:=]\s*([^;,.]+)/i.exec(body);
        const dueMatch = /\bdue\s*[:=]\s*(\d{4}-\d{2}-\d{2})/i.exec(body);
        drafts.push({
          proposalType: cue.type,
          title: body.slice(0, 240),
          description: body,
          ownerCandidate: ownerMatch?.[1]?.trim() ?? null,
          dueDateCandidate: dueMatch?.[1] ?? null,
          priority: null,
          severity: cue.type === "risk" || cue.type === "issue" ? "medium" : null,
          transcriptSegmentIds: [segment.id],
          startTimeMs: segment.startTimeMs ?? null,
          endTimeMs: segment.endTimeMs ?? null,
          speakerIds: segment.speakerId ? [segment.speakerId] : [],
          confidence: 0.72,
          payload: {
            extraction: "deterministic_cue",
            cueType: cue.type,
            sourceText: line.trim(),
            logicalSequence: segment.logicalSequence ?? null,
            speakerLabel: segment.speakerLabel ?? null,
            fabricatedCitations: false,
          },
        });
      }
    }
  }
  return drafts;
}

export function proposalEvidenceChecksum(segmentIds: readonly string[]): string {
  return createHash("sha256").update([...segmentIds].sort().join("|")).digest("hex");
}

export type PersistedProposal = ExtractedProposalDraft & {
  id: string;
  reviewState: "proposed";
};

export class MeetingProposalExtractionService {
  private readonly meetings: ManualMeetingService;
  private readonly ai: MeetingAiPort;

  constructor(
    private readonly supabase: MeetingSupabaseClient,
    ai?: MeetingAiPort,
  ) {
    this.meetings = new ManualMeetingService(supabase);
    this.ai = ai ?? new DeterministicMeetingAiAdapter();
  }

  async extractAndPersist(input: {
    actor: ManualMeetingActor;
    meetingId: string;
    processingRunId: string;
  }): Promise<PersistedProposal[]> {
    const meeting = await this.meetings.getMeeting(input.actor, input.meetingId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("id,text,normalized_text,speaker_id,speaker_label,start_time_ms,end_time_ms,logical_sequence")
        .eq("meeting_session_id", meeting.id)
        .eq("tenant_id", meeting.tenant_id)
        .eq("workspace_id", meeting.workspace_id)
        .eq("status", "active")
        .order("logical_sequence", { ascending: true }),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load transcript for proposal extraction: ${error.message}`,
        500,
      );
    }

    const segments: TranscriptCueSegment[] = (data ?? []).map((row) => ({
      id: String(row.id),
      text: String(row.normalized_text ?? row.text ?? ""),
      speakerId: row.speaker_id == null ? null : String(row.speaker_id),
      speakerLabel: row.speaker_label == null ? null : String(row.speaker_label),
      startTimeMs: row.start_time_ms == null ? null : Number(row.start_time_ms),
      endTimeMs: row.end_time_ms == null ? null : Number(row.end_time_ms),
      logicalSequence: Number(row.logical_sequence ?? 0),
    }));

    const drafts = await this.ai.extractProposals({ segments });
    const correlationId = input.actor.correlationId ?? meeting.correlation_id ?? randomUUID();
    const persisted: PersistedProposal[] = [];

    for (const draft of drafts) {
      const id = randomUUID();
      const evidenceIds = draft.transcriptSegmentIds;
      if (!evidenceIds.length) {
        throw new MeetingIntelligenceError(
          "proposal_evidence_missing",
          "Extracted proposals require transcript_segment_ids",
          422,
        );
      }

      const { error: insertError } = await awaitMutation(
        this.supabase.from("project_intelligence_meeting_proposals").insert({
          id,
          tenant_id: meeting.tenant_id,
          workspace_id: meeting.workspace_id,
          meeting_session_id: meeting.id,
          engineering_project_id: meeting.engineering_project_id,
          proposal_type: draft.proposalType,
          review_state: "proposed",
          title: draft.title,
          description: draft.description,
          owner_candidate: draft.ownerCandidate,
          due_date_candidate: draft.dueDateCandidate,
          priority: draft.priority,
          severity: draft.severity,
          transcript_segment_ids: evidenceIds,
          start_time_ms: draft.startTimeMs,
          end_time_ms: draft.endTimeMs,
          speaker_ids: draft.speakerIds,
          document_citations: [],
          processing_run_id: input.processingRunId,
          meeting_state_version: meeting.state_version,
          payload: {
            ...draft.payload,
            evidenceChecksum: proposalEvidenceChecksum(evidenceIds),
          },
          confidence: draft.confidence,
          provider: "deterministic-local",
          model: String(draft.payload.model ?? "meeting-deterministic-v1"),
          prompt_version: String(draft.payload.promptVersion ?? "cert-fixtures-v1"),
          correlation_id: correlationId,
        }),
      );
      if (insertError) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to persist proposal: ${insertError.message}`,
          500,
        );
      }

      for (const segmentId of evidenceIds) {
        await awaitMutation(
          this.supabase.from("project_intelligence_meeting_evidence").insert({
            tenant_id: meeting.tenant_id,
            workspace_id: meeting.workspace_id,
            meeting_session_id: meeting.id,
            evidence_type: "transcript_segment",
            transcript_segment_id: segmentId,
            processing_run_id: input.processingRunId,
            evidence_version: "v1",
            payload: { proposalId: id },
            correlation_id: correlationId,
          }),
        );
      }

      const eventPayload: Record<string, unknown> = {
        proposalId: id,
        proposalType: draft.proposalType,
      };
      if (draft.proposalType === "finding") {
        const handoff = createMeetingFindingsHandoff({
          id,
          meetingSessionId: meeting.id,
          title: draft.title,
          description: draft.description ?? undefined,
          severitySuggestion:
            draft.severity === "critical" ||
            draft.severity === "high" ||
            draft.severity === "medium" ||
            draft.severity === "low"
              ? draft.severity
              : "medium",
          confidence: draft.confidence ?? 0.5,
          transcriptReferences: evidenceIds,
          engineeringProjectId: meeting.engineering_project_id ?? undefined,
          traceId: correlationId,
        });
        assertMeetingFindingsHandoffCannotMutateCore(handoff);
        eventPayload.findingsHandoff = handoff;
      }

      await awaitMutation(
        this.supabase.from("project_intelligence_meeting_events").insert({
          tenant_id: meeting.tenant_id,
          workspace_id: meeting.workspace_id,
          engineering_project_id: meeting.engineering_project_id,
          meeting_session_id: meeting.id,
          event_type: "proposal.created",
          event_source: "processing",
          actor_user_id: input.actor.userId,
          previous_state: meeting.status,
          new_state: meeting.status,
          payload: eventPayload,
          correlation_id: correlationId,
          occurred_at: new Date().toISOString(),
        }),
      );

      persisted.push({ ...draft, id, reviewState: "proposed" });
    }

    return persisted;
  }
}
