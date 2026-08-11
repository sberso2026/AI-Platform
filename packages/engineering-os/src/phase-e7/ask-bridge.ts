/**
 * Bridge E7 memory into Ask / E5 Why? as contextual evidence — never automatic authority.
 */

import type { EngineeringEvidence } from "../phase-e2/contracts";
import type { EngineeringReasoningResponse } from "../phase-e5/contracts";
import type { EngineeringMemoryHit, EngineeringMemoryRecord } from "./contracts";
import { memoryProvenanceLine } from "./retrieval";

const SOURCE_TYPE_MAP: Record<string, EngineeringEvidence["sourceType"]> = {
  decision: "decision",
  action: "action",
  lesson: "lesson",
  technical_query: "technical_query",
  document_relationship: "document",
  project_outcome: "project",
  engineering_conclusion: "decision",
  inspection_conclusion: "activity",
  tool_result: "activity",
  explicit_capture: "activity",
};

function mapAuthority(
  status: EngineeringMemoryRecord["authorityStatus"],
): EngineeringEvidence["authorityStatus"] {
  switch (status) {
    case "APPROVED":
      return "APPROVED";
    case "SUPERSEDED":
      return "SUPERSEDED";
    case "DRAFT":
      return "DRAFT";
    default:
      return "UNKNOWN";
  }
}

/** Convert memory hits to evidence-shaped context while preserving original source provenance. */
export function memoryHitsToEvidence(hits: EngineeringMemoryHit[]): EngineeringEvidence[] {
  return hits
    .filter((h) => h.presentedAsCurrent || h.record.authorityStatus === "SUPERSEDED")
    .map((h) => {
      const r = h.record;
      const sourceType = SOURCE_TYPE_MAP[r.sourceType] ?? "activity";
      return {
        sourceId: r.sourceId,
        sourceType,
        title: `[Memory] ${r.summary.slice(0, 120)}`,
        canonicalObjectId: r.subject.objectId,
        projectId: r.projectId ?? null,
        authorityStatus: mapAuthority(r.authorityStatus),
        sourceLocation: `engineering_memory:${r.memoryId}→${r.sourceType}:${r.sourceId}`,
        excerpt: r.fact ?? r.summary,
        retrievalScore: h.score,
        provenance: "engineering_os_native" as const,
        lastUpdated: r.createdAt,
        permissionsApplied: true as const,
        conflicting: h.conflictWithMemoryIds.length > 0,
        supersededWarning: r.authorityStatus === "SUPERSEDED",
      };
    });
}

export function applyMemoryToReasoning(
  reasoning: EngineeringReasoningResponse,
  hits: EngineeringMemoryHit[],
): EngineeringReasoningResponse {
  if (!hits.length) return reasoning;

  const memoryLines = hits.map((h) => memoryProvenanceLine(h.record));
  const conflictNote = hits.some((h) => h.conflictWithMemoryIds.length)
    ? ["Conflicting memories surfaced — engineer must resolve; memory is not automatic authority."]
    : [];

  const why = {
    ...reasoning.why,
    keyEvidence: [
      ...reasoning.why.keyEvidence,
      ...hits.slice(0, 3).map((h) => ({
        sourceId: h.record.sourceId,
        title: h.record.summary.slice(0, 120),
        provenance: "engineering_os_native" as const,
        authorityStatus: h.record.authorityStatus,
      })),
    ],
    ruleOrToolBasis: [
      ...reasoning.why.ruleOrToolBasis,
      ...memoryLines.map((l) => `E7 memory context: ${l}`),
    ],
    uncertaintyAndLimitations: [
      ...reasoning.why.uncertaintyAndLimitations,
      ...conflictNote,
      "Memory summaries cite original sources; they do not replace authoritative source records.",
    ],
    chainOfThoughtExposed: false as const,
    platformInternalsExposed: false as const,
  };

  const contextual =
    hits.length > 0
      ? `\n\nRelevant engineering memory (${hits.length}): ${hits
          .slice(0, 3)
          .map((h) => h.record.summary)
          .join(" · ")} — advisory context only.`
      : "";

  return {
    ...reasoning,
    answer: `${reasoning.answer}${contextual}`,
    limitations: [
      ...new Set([
        ...reasoning.limitations,
        "E7 memory used as context/evidence only — not automatic authority.",
        ...conflictNote,
      ]),
    ],
    why,
    authorityStatus: "REQUIRES_HUMAN_REVIEW",
  };
}

export type AskMemoryContextChips = {
  previousSimilarWork: boolean;
  relevantPrecedent: boolean;
  previousDecision: boolean;
  lessons: boolean;
  whyWasThisDone: boolean;
};

export function deriveMemoryContextChips(hits: EngineeringMemoryHit[]): AskMemoryContextChips {
  const types = new Set(hits.map((h) => h.record.sourceType));
  return {
    previousSimilarWork: hits.length > 0,
    relevantPrecedent: hits.some((h) =>
      ["decision", "lesson", "project_outcome"].includes(h.record.sourceType),
    ),
    previousDecision: types.has("decision"),
    lessons: types.has("lesson"),
    whyWasThisDone: hits.some((h) => h.record.evidenceRefs.length > 0 || Boolean(h.record.fact)),
  };
}
