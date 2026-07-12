import type { DocumentCitation } from "./types";

export interface RevisionComparisonInput {
  engineeringDocumentId: string;
  baseRevision: string;
  targetRevision: string;
  baseText: string;
  targetText: string;
}

export interface RevisionChange {
  kind: "added" | "removed" | "changed";
  section?: string;
  excerpt: string;
}

export interface DocumentComparisonResult {
  engineeringDocumentId: string;
  baseRevision: string;
  targetRevision: string;
  changes: readonly RevisionChange[];
  evidence: readonly DocumentCitation[];
  impactCandidates: readonly string[];
  requiresHumanReview: true;
}

function lineSet(text: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of text.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)) {
    map.set(line, (map.get(line) ?? 0) + 1);
  }
  return map;
}

export class ProjectIntelligenceDocumentComparisonService {
  compare(input: RevisionComparisonInput): DocumentComparisonResult {
    const base = lineSet(input.baseText);
    const target = lineSet(input.targetText);
    const changes: RevisionChange[] = [];

    for (const [line, count] of target) {
      const prior = base.get(line) ?? 0;
      if (prior < count) {
        changes.push({ kind: prior === 0 ? "added" : "changed", excerpt: line });
      }
    }
    for (const [line, count] of base) {
      const next = target.get(line) ?? 0;
      if (next < count) {
        changes.push({ kind: "removed", excerpt: line });
      }
    }

    const evidence: DocumentCitation[] = changes.slice(0, 20).map((change, index) => ({
      engineeringDocumentId: input.engineeringDocumentId,
      revision: change.kind === "removed" ? input.baseRevision : input.targetRevision,
      excerpt: change.excerpt.slice(0, 400),
      evidenceScore: 1,
      chunkId: `compare-${index}`,
    }));

    return {
      engineeringDocumentId: input.engineeringDocumentId,
      baseRevision: input.baseRevision,
      targetRevision: input.targetRevision,
      changes,
      evidence,
      impactCandidates: changes.length ? ["possible_requirement_change"] : [],
      requiresHumanReview: true,
    };
  }
}
