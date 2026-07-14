import { createHash } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import {
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import { detectSequenceGaps } from "./transcript-ordering";

export const TRANSCRIPT_NORMALIZATION_VERSION = "meeting-norm-v1";

export type NormalizationSegmentInput = {
  id: string;
  text: string;
  logicalSequence: number;
  speakerId?: string | null;
  speakerLabel?: string | null;
};

export type NormalizedSegmentResult = {
  id: string;
  originalText: string;
  normalizedText: string;
  contentChecksum: string;
  warnings: string[];
  logicalSequence: number;
};

export type MeetingTranscriptNormalizationResult = {
  segments: NormalizedSegmentResult[];
  transcriptChecksum: string;
  warnings: string[];
  sequenceGaps: ReturnType<typeof detectSequenceGaps>;
  unresolvedSpeakers: string[];
  normalizationVersion: string;
};

/** Whitespace normalize while preserving original text separately. */
export function normalizeTranscriptWhitespace(text: string): { normalized: string; warnings: string[] } {
  const warnings: string[] = [];
  let normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/\t/.test(normalized)) {
    warnings.push("tabs_expanded");
    normalized = normalized.replace(/\t/g, " ");
  }
  if (/ {2,}/.test(normalized)) {
    warnings.push("collapsed_runs");
    normalized = normalized.replace(/ {2,}/g, " ");
  }
  const trimmed = normalized.split("\n").map((line) => line.trimEnd()).join("\n").trim();
  if (trimmed !== text.trim()) warnings.push("whitespace_normalized");
  return { normalized: trimmed, warnings };
}

export function checksumText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function normalizeTranscriptSegments(
  segments: readonly NormalizationSegmentInput[],
): MeetingTranscriptNormalizationResult {
  const normalizedSegments: NormalizedSegmentResult[] = [];
  const unresolved = new Set<string>();
  const globalWarnings: string[] = [];

  for (const segment of segments) {
    const { normalized, warnings } = normalizeTranscriptWhitespace(segment.text);
    if (!segment.speakerId && !segment.speakerLabel) {
      unresolved.add(segment.id);
      warnings.push("unresolved_speaker");
    }
    normalizedSegments.push({
      id: segment.id,
      originalText: segment.text,
      normalizedText: normalized,
      contentChecksum: checksumText(normalized),
      warnings,
      logicalSequence: segment.logicalSequence,
    });
  }

  const gaps = detectSequenceGaps(segments.map((s) => s.logicalSequence));
  if (gaps.length) globalWarnings.push("sequence_gaps_detected");
  if (unresolved.size) globalWarnings.push("unresolved_speakers");

  const transcriptChecksum = checksumText(
    normalizedSegments.map((s) => `${s.logicalSequence}:${s.contentChecksum}`).join("\n"),
  );

  return {
    segments: normalizedSegments,
    transcriptChecksum,
    warnings: globalWarnings,
    sequenceGaps: gaps,
    unresolvedSpeakers: [...unresolved],
    normalizationVersion: TRANSCRIPT_NORMALIZATION_VERSION,
  };
}

export class MeetingTranscriptNormalizationService {
  constructor(private readonly supabase: MeetingSupabaseClient) {}

  async normalizeMeetingTranscript(input: {
    tenantId: string;
    workspaceId: string;
    meetingSessionId: string;
  }): Promise<MeetingTranscriptNormalizationResult> {
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("id,text,logical_sequence,sequence_number,speaker_id,speaker_label")
        .eq("meeting_session_id", input.meetingSessionId)
        .eq("tenant_id", input.tenantId)
        .eq("workspace_id", input.workspaceId)
        .eq("status", "active")
        .order("logical_sequence", { ascending: true }),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load transcript for normalization: ${error.message}`,
        500,
      );
    }

    const inputs: NormalizationSegmentInput[] = (data ?? []).map((row) => ({
      id: String(row.id),
      text: String(row.text ?? ""),
      logicalSequence: Number(row.logical_sequence ?? row.sequence_number ?? 0),
      speakerId: row.speaker_id == null ? null : String(row.speaker_id),
      speakerLabel: row.speaker_label == null ? null : String(row.speaker_label),
    }));

    const result = normalizeTranscriptSegments(inputs);

    for (const segment of result.segments) {
      const { error: updateError } = await awaitMutation(
        this.supabase
          .from("project_intelligence_transcript_segments")
          .update({
            normalized_text: segment.normalizedText,
            normalization_version: result.normalizationVersion,
            normalization_warnings: segment.warnings,
            content_checksum: segment.contentChecksum,
            // Preserve original `text` column unchanged.
          })
          .eq("id", segment.id)
          .eq("tenant_id", input.tenantId)
          .eq("workspace_id", input.workspaceId),
      );
      if (updateError) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to persist normalized transcript: ${updateError.message}`,
          500,
          { segmentId: segment.id },
        );
      }
    }

    return result;
  }
}
