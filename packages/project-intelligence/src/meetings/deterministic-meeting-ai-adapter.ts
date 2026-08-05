import {
  buildDeterministicMinutesSections,
  hashMinutesContent,
} from "./minutes-versioning";
import {
  extractProposalsFromTranscript,
  type ExtractedProposalDraft,
  type TranscriptCueSegment,
} from "./proposal-extraction-service";
import {
  normalizeTranscriptSegments,
  type MeetingTranscriptNormalizationResult,
  type NormalizationSegmentInput,
} from "./transcript-normalization-service";

export type MeetingAiNormalizeInput = {
  segments: readonly NormalizationSegmentInput[];
};

export type MeetingAiExtractInput = {
  segments: readonly TranscriptCueSegment[];
};

export type MeetingAiMinutesInput = {
  title: string;
  transcriptLines: readonly string[];
  proposals: readonly ExtractedProposalDraft[];
};

export type MeetingAiMinutesOutput = {
  markdown: string;
  bodyJson: Record<string, unknown>;
  contentHash: string;
  model: string;
  promptVersion: string;
};

/**
 * Local cert-safe meeting AI port implementation — no network.
 * Consumes Engineering Intelligence Framework ports; not an independent AI stack.
 * Does not fabricate document citations.
 */
export interface MeetingAiPort {
  normalize(input: MeetingAiNormalizeInput): Promise<MeetingTranscriptNormalizationResult>;
  extractProposals(input: MeetingAiExtractInput): Promise<ExtractedProposalDraft[]>;
  generateMinutes(input: MeetingAiMinutesInput): Promise<MeetingAiMinutesOutput>;
}

export class DeterministicMeetingAiAdapter implements MeetingAiPort {
  readonly provider = "deterministic-local";
  readonly model = "meeting-deterministic-v1";
  readonly promptVersion = "cert-fixtures-v1";

  async normalize(input: MeetingAiNormalizeInput): Promise<MeetingTranscriptNormalizationResult> {
    return normalizeTranscriptSegments(input.segments);
  }

  async extractProposals(input: MeetingAiExtractInput): Promise<ExtractedProposalDraft[]> {
    return extractProposalsFromTranscript(input.segments).map((draft) => ({
      ...draft,
      payload: {
        ...draft.payload,
        model: this.model,
        promptVersion: this.promptVersion,
        provider: this.provider,
        documentCitations: [],
      },
    }));
  }

  async generateMinutes(input: MeetingAiMinutesInput): Promise<MeetingAiMinutesOutput> {
    const built = buildDeterministicMinutesSections({
      title: input.title,
      transcriptLines: input.transcriptLines,
      proposalSummaries: input.proposals.map((p) => ({
        type: p.proposalType,
        title: p.title,
      })),
    });
    return {
      markdown: built.markdown,
      bodyJson: {
        ...built.bodyJson,
        model: this.model,
        promptVersion: this.promptVersion,
        provider: this.provider,
      },
      contentHash: hashMinutesContent(built.markdown, built.bodyJson),
      model: this.model,
      promptVersion: this.promptVersion,
    };
  }
}

/** Resolve governed AI or fail closed to deterministic cert adapter. */
export function resolveMeetingAiAdapter(governed: MeetingAiPort | null | undefined): MeetingAiPort {
  return governed ?? new DeterministicMeetingAiAdapter();
}
