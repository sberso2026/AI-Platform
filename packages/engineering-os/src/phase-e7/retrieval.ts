/**
 * Bounded, context-aware Engineering Memory retrieval.
 * Prefer current approved knowledge; surface conflicts; never inject whole-tenant corpus.
 */

import type {
  EngineeringMemoryHit,
  EngineeringMemoryRecord,
  EngineeringMemoryRetrievalQuery,
} from "./contracts";
import type { EngineeringMemoryStore } from "./store";
import { InMemoryEngineeringMemoryStore } from "./store";

const CURRENT_AUTH = new Set(["APPROVED", "REVIEWED", "OBSERVED"]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 2);
}

function scoreRecord(
  record: EngineeringMemoryRecord,
  query: EngineeringMemoryRetrievalQuery,
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (query.projectId && record.projectId === query.projectId) {
    score += 40;
    reasons.push("project_scope");
  }
  if (query.subjectObjectId && record.subject.objectId === query.subjectObjectId) {
    score += 35;
    reasons.push("same_subject");
  }
  if (
    query.subjectObjectType &&
    record.subject.objectType === query.subjectObjectType
  ) {
    score += 10;
    reasons.push("same_object_type");
  }
  if (query.sourceType && record.sourceType === query.sourceType) {
    score += 15;
    reasons.push("same_source_type");
  }

  if (record.authorityStatus === "APPROVED") {
    score += 25;
    reasons.push("approved");
  } else if (record.authorityStatus === "REVIEWED") {
    score += 15;
    reasons.push("reviewed");
  } else if (record.authorityStatus === "OBSERVED") {
    score += 5;
    reasons.push("observed");
  }

  if (record.authorityStatus === "SUPERSEDED") {
    score -= 20;
    reasons.push("superseded");
  }

  const tokens = tokenize(query.query ?? "");
  if (tokens.length) {
    const hay = `${record.summary} ${record.fact ?? ""}`.toLowerCase();
    let hits = 0;
    for (const t of tokens) {
      if (hay.includes(t)) hits += 1;
    }
    if (hits) {
      score += Math.min(30, hits * 8);
      reasons.push(`lexical_${hits}`);
    }
  }

  return { score, reason: reasons.join(",") || "baseline" };
}

function detectConflicts(records: EngineeringMemoryRecord[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const a = records[i]!;
      const b = records[j]!;
      if (a.subject.objectId !== b.subject.objectId) continue;
      if (a.authorityStatus === "SUPERSEDED" || b.authorityStatus === "SUPERSEDED") continue;
      if (a.summary.trim().toLowerCase() === b.summary.trim().toLowerCase()) continue;
      // Distinct decisions/outcomes on same subject → conflict surface
      if (
        CURRENT_AUTH.has(a.authorityStatus) &&
        CURRENT_AUTH.has(b.authorityStatus) &&
        a.summary.trim().toLowerCase() !== b.summary.trim().toLowerCase()
      ) {
        map.set(a.memoryId, [...(map.get(a.memoryId) ?? []), b.memoryId]);
        map.set(b.memoryId, [...(map.get(b.memoryId) ?? []), a.memoryId]);
      }
    }
  }
  return map;
}

export class EngineeringMemoryRetrievalService {
  constructor(
    private readonly store: EngineeringMemoryStore = new InMemoryEngineeringMemoryStore(),
  ) {}

  async retrieve(query: EngineeringMemoryRetrievalQuery): Promise<{
    hits: EngineeringMemoryHit[];
    limitations: string[];
    timingMs: { retrieveMs: number };
    stats: ReturnType<EngineeringMemoryStore["getStats"]>;
  }> {
    const t0 = Date.now();
    const limit = Math.min(Math.max(query.limit ?? 8, 1), 20);
    const limitations: string[] = [];

    // Cross-tenant hard block — store list is tenant-scoped; double-check.
    const all = (await this.store.list(query.tenantId, 200)).filter(
      (r) => r.tenantId === query.tenantId,
    );

    const authorised = new Set(query.authorisedSourceIds ?? []);
    const filtered = all.filter((r) => {
      if (r.tenantId !== query.tenantId) return false;
      if (query.workspaceId && r.workspaceId && r.workspaceId !== query.workspaceId) {
        return false;
      }
      if (query.projectId && r.projectId && r.projectId !== query.projectId) {
        return false;
      }
      if (r.access.revoked) return false;
      if (r.access.restricted) {
        if (query.authorisedSourceIds != null && !authorised.has(r.sourceId)) {
          return false;
        }
        if (
          r.access.authorizedUserIds?.length &&
          !r.access.authorizedUserIds.includes(query.userId)
        ) {
          return false;
        }
      }
      if (!query.includeDraft && r.authorityStatus === "DRAFT") return false;
      if (!query.includeRejected && r.authorityStatus === "REJECTED") return false;
      if (!query.includeSuperseded && r.authorityStatus === "SUPERSEDED") return false;
      if (query.memoryClasses?.length && !query.memoryClasses.includes(r.memoryClass)) {
        return false;
      }
      return true;
    });

    if (all.some((r) => r.access.revoked || r.authorityStatus === "DRAFT")) {
      // Do not disclose hidden/revoked/draft counts.
      limitations.push(
        "Some memory candidates were excluded by authority, revocation, or access policy.",
      );
    }

    const conflicts = detectConflicts(filtered);
    const scored = filtered
      .map((record) => {
        const { score, reason } = scoreRecord(record, query);
        const conflictWith = conflicts.get(record.memoryId) ?? [];
        return {
          record,
          score,
          rankReason: reason,
          conflictWithMemoryIds: conflictWith,
          presentedAsCurrent:
            record.authorityStatus !== "SUPERSEDED" &&
            record.authorityStatus !== "REJECTED" &&
            record.authorityStatus !== "DRAFT",
        } satisfies EngineeringMemoryHit;
      })
      .filter((h) => h.score > 0 || !query.query)
      .sort((a, b) => b.score - a.score || b.record.createdAt.localeCompare(a.record.createdAt))
      .slice(0, limit);

    if (scored.some((h) => h.conflictWithMemoryIds.length > 0)) {
      limitations.push("Conflicting memories detected for the same subject — surfaced, not merged.");
    }
    if (scored.some((h) => h.record.authorityStatus === "SUPERSEDED")) {
      limitations.push("Superseded memory included for traceability only — not presented as current.");
    }

    limitations.push("Memory is contextual evidence only — never automatic engineering authority.");

    return {
      hits: scored,
      limitations,
      timingMs: { retrieveMs: Date.now() - t0 },
      stats: this.store.getStats(),
    };
  }

  /** Precedent / similar previous decisions helper. */
  async findSimilarPrecedents(
    query: EngineeringMemoryRetrievalQuery,
  ): Promise<EngineeringMemoryHit[]> {
    const result = await this.retrieve({
      ...query,
      sourceType: query.sourceType ?? "decision",
      memoryClasses: query.memoryClasses ?? [
        "PROJECT_MEMORY",
        "ENGINEERING_KNOWLEDGE",
        "ORGANISATIONAL_KNOWLEDGE",
      ],
      includeDraft: false,
      includeRejected: false,
      limit: query.limit ?? 5,
    });
    return result.hits;
  }
}

export function memoryProvenanceLine(record: EngineeringMemoryRecord): string {
  return `Memory ${record.memoryId} (${record.memoryClass}/${record.authorityStatus}) from ${record.sourceType}:${record.sourceId}; captureHash ${record.provenance.captureHash}; platformMemoryOwner platform_kernel`;
}
