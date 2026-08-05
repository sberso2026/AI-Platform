/**
 * Phase 8D — Typed handoff from Meeting Intelligence → Findings Intelligence.
 * Meetings emit candidates only; no Engineering Core mutation.
 */
import type { DocumentCitation } from "../documents/types";

export type MeetingFindingsCandidateHandoff = {
  kind: "meeting_intelligence.candidate_finding";
  featureKey: "meeting_intelligence";
  targetFeatureKey: "findings_intelligence";
  candidateFindingId: string;
  meetingSessionId: string;
  title: string;
  description?: string;
  severitySuggestion: "low" | "medium" | "high" | "critical";
  confidence: number;
  evidence: readonly DocumentCitation[];
  transcriptReferences: readonly string[];
  engineeringProjectId?: string;
  traceId: string;
  mayMutateEngineeringCore: false;
};

export function createMeetingFindingsHandoff(input: {
  id: string;
  meetingSessionId: string;
  title: string;
  description?: string;
  severitySuggestion?: MeetingFindingsCandidateHandoff["severitySuggestion"];
  confidence: number;
  evidence?: readonly DocumentCitation[];
  transcriptReferences?: readonly string[];
  engineeringProjectId?: string;
  traceId: string;
}): MeetingFindingsCandidateHandoff {
  return {
    kind: "meeting_intelligence.candidate_finding",
    featureKey: "meeting_intelligence",
    targetFeatureKey: "findings_intelligence",
    candidateFindingId: input.id,
    meetingSessionId: input.meetingSessionId,
    title: input.title,
    description: input.description,
    severitySuggestion: input.severitySuggestion ?? "medium",
    confidence: input.confidence,
    evidence: input.evidence ?? [],
    transcriptReferences: input.transcriptReferences ?? [],
    engineeringProjectId: input.engineeringProjectId,
    traceId: input.traceId,
    mayMutateEngineeringCore: false,
  };
}

export function assertMeetingFindingsHandoffCannotMutateCore(
  handoff: MeetingFindingsCandidateHandoff,
): void {
  if (handoff.mayMutateEngineeringCore !== false) {
    throw new Error("Meeting findings handoff must not mutate Engineering Core");
  }
  if (handoff.targetFeatureKey !== "findings_intelligence") {
    throw new Error("Meeting findings handoff target must be findings_intelligence");
  }
}
