/**
 * Engineering evidence mapping & grounded answer synthesis (E2).
 * Pure helpers — no provider-specific types.
 */

import {
  classifyEvidenceState,
  mapDocumentAuthorityStatus,
  resolveSearchScope,
  type EngineeringEvidence,
  type EngineeringEvidenceState,
  type EngineeringGroundedAnswer,
  type EngineeringRetrievalMode,
  type EngineeringSearchableSourceType,
  type EngineeringSearchQuery,
  type EngineeringGroundedSearchResult,
  type EngineeringSearchScope,
} from "../phase-e2/contracts";
import { buildDocumentGroundedAnswer, isDocumentBodyEvidence } from "./document-grounded-answer";

export function sourceTypeHref(
  sourceType: EngineeringSearchableSourceType,
  sourceId: string,
): string {
  switch (sourceType) {
    case "project":
      return `/engineering/projects/${sourceId}`;
    case "asset":
      return `/engineering/assets/${sourceId}`;
    case "document":
      return `/engineering/documents/${sourceId}`;
    case "decision":
      return `/engineering/decisions`;
    case "action":
      return `/engineering/actions`;
    case "risk":
      return `/engineering/risks`;
    case "issue":
      return `/engineering/issues`;
    case "technical_query":
      return `/engineering/technical-queries`;
    case "lesson":
      return `/engineering/lessons`;
    case "inspection":
      return `/engineering/apps/inspection-intelligence`;
    case "timeline":
      return `/engineering/timeline`;
    case "activity":
      return `/engineering/activity`;
    default:
      return "/engineering/explore";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickText(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

const LEXICAL_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "me",
  "my",
  "of",
  "on",
  "or",
  "please",
  "show",
  "tell",
  "that",
  "the",
  "this",
  "to",
  "was",
  "were",
  "what",
  "which",
  "who",
]);

/** Natural-language register questions must retrieve authorised project records, not ILIKE the whole sentence. */
export function isOperationalRegisterQuery(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q || q === "*") return true;
  if (q.split(/\s+/).length < 3 && !q.includes("?")) return false;
  return /\b(risks?|tqs?|technical quer(?:y|ies)|actions?|decisions?|documents?|inspections?|findings?|attention|weekly|outstanding|unresolved)\b/.test(
    q,
  );
}

function significantTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9_-]/g, ""))
    .filter((t) => t.length > 1 && !LEXICAL_STOPWORDS.has(t));
}

function lexicalScore(query: string, haystack: string): number {
  const q = query.trim().toLowerCase();
  const h = haystack.toLowerCase();
  if (!q || !h) return 0;
  if (h === q) return 1000;
  if (h.startsWith(q)) return 800;
  const tokens = significantTokens(q);
  if (tokens.length > 1 && tokens.every((t) => h.includes(t))) return 600;
  if (h.includes(q)) return 500;
  return tokens.some((t) => h.includes(t)) ? 200 : 0;
}

export function mapRowToEvidence(input: {
  row: unknown;
  sourceType: EngineeringSearchableSourceType;
  query: string;
  projectFilter?: string | null;
}): EngineeringEvidence | null {
  const row = asRecord(input.row);
  const id = String(row.id ?? "");
  if (!id) return null;

  const projectId =
    (row.engineering_project_id as string | null | undefined) ??
    (row.project_id as string | null | undefined) ??
    null;

  if (input.projectFilter && projectId && projectId !== input.projectFilter) {
    return null;
  }
  if (input.projectFilter && input.sourceType === "project" && id !== input.projectFilter) {
    return null;
  }

  const title =
    pickText(row, [
      "title",
      "project_name",
      "asset_name",
      "decision_title",
      "action_title",
      "risk_title",
      "issue_title",
      "lesson",
    ]) || `${input.sourceType} ${id.slice(0, 8)}`;

  const excerpt =
    pickText(row, [
      "recommendation",
      "rationale",
      "description",
      "question",
      "mitigation",
      "impact",
      "lesson",
      "summary",
      "body",
      "client_name",
      "system",
      "title",
    ]) || title;

  const status = pickText(row, ["status"]);
  const revision = pickText(row, ["revision"]) || null;
  const authorityStatus = mapDocumentAuthorityStatus({
    status,
    revision,
    isSuperseded: status.toLowerCase() === "superseded",
  });

  const haystack = `${title} ${excerpt} ${status} ${pickText(row, ["project_code", "asset_tag", "document_number", "decision_number", "tq_number", "risk_number", "issue_number", "action_number", "lesson_number", "checklist_item_type"])}`;
  const score = lexicalScore(input.query, haystack);
  // Always keep rows when query is a wildcard / empty object-context probe.
  const keepSparseContext =
    !input.query.trim() ||
    input.query.trim() === "*" ||
    input.query.trim().toLowerCase() === "context";
  if (score <= 0 && !keepSparseContext) {
    return null;
  }

  return {
    sourceId: id,
    sourceType: input.sourceType,
    title,
    canonicalObjectId: id,
    projectId,
    revision,
    authorityStatus,
    sourceLocation: sourceTypeHref(input.sourceType, id),
    excerpt: excerpt.slice(0, 400),
    retrievalScore: score,
    provenance: "engineering_os_native",
    lastUpdated:
      (row.updated_at as string | null | undefined) ??
      (row.created_at as string | null | undefined) ??
      null,
    permissionsApplied: true,
    supersededWarning: authorityStatus === "SUPERSEDED",
  };
}

export function markConflicts(evidence: EngineeringEvidence[]): EngineeringEvidence[] {
  const byTopic = new Map<string, EngineeringEvidence[]>();
  for (const item of evidence) {
    const key = item.title.toLowerCase().replace(/\s+/g, " ").slice(0, 48);
    const list = byTopic.get(key) ?? [];
    list.push(item);
    byTopic.set(key, list);
  }
  return evidence.map((item) => {
    const peers = byTopic.get(item.title.toLowerCase().replace(/\s+/g, " ").slice(0, 48)) ?? [];
    const statuses = new Set(peers.map((p) => p.authorityStatus));
    const conflicting =
      peers.length > 1 &&
      ((statuses.has("APPROVED") && statuses.has("SUPERSEDED")) ||
        (statuses.has("CURRENT") && statuses.has("SUPERSEDED")) ||
        (statuses.has("DRAFT") && statuses.has("APPROVED")));
    return { ...item, conflicting: conflicting || item.conflicting };
  });
}

export function preferAuthority(evidence: EngineeringEvidence[]): EngineeringEvidence[] {
  const rank: Record<string, number> = {
    APPROVED: 5,
    CURRENT: 4,
    UNKNOWN: 3,
    DRAFT: 2,
    SUPERSEDED: 1,
  };
  return [...evidence].sort((a, b) => {
    const auth = (rank[b.authorityStatus] ?? 0) - (rank[a.authorityStatus] ?? 0);
    if (auth !== 0) return auth;
    return (b.retrievalScore ?? 0) - (a.retrievalScore ?? 0);
  });
}

export function synthesizeGroundedAnswer(input: {
  query: string;
  evidence: EngineeringEvidence[];
  evidenceState: EngineeringEvidenceState;
  scope: EngineeringSearchScope;
  limitations: string[];
  retrievalMode: EngineeringRetrievalMode;
  generationAvailable: boolean;
}): EngineeringGroundedAnswer {
  const generatedAt = new Date().toISOString();
  const abstained =
    input.evidenceState === "INSUFFICIENT" || input.evidence.length === 0;

  if (abstained) {
    return {
      answer:
        "Engineering OS does not have enough authorised evidence to answer this reliably.",
      evidence: input.evidence,
      scope: input.scope,
      limitations: [
        ...input.limitations,
        "MISSING EVIDENCE: no adequate authorised native Engineering OS evidence matched this query.",
        `Searched scope: ${input.scope}.`,
      ],
      evidenceState: "INSUFFICIENT",
      retrievalMode: input.retrievalMode,
      generatedAt,
      generationAvailable: input.generationAvailable,
      abstained: true,
      requiresReview: false,
    };
  }

  if (isDocumentBodyEvidence(input.evidence)) {
    const grounded = buildDocumentGroundedAnswer({ query: input.query, evidence: input.evidence });
    return {
      answer: grounded.answer,
      evidence: input.evidence,
      scope: input.scope,
      limitations: [...input.limitations, ...grounded.limitations],
      evidenceState: grounded.abstained ? "INSUFFICIENT" : input.evidenceState,
      retrievalMode: input.retrievalMode,
      generatedAt,
      generationAvailable: input.generationAvailable,
      abstained: grounded.abstained,
      requiresReview: true,
    };
  }

  const lines = input.evidence.slice(0, 6).map((e, i) => {
    const auth =
      e.authorityStatus !== "UNKNOWN" ? ` [${e.authorityStatus}]` : "";
    const rev = e.revision ? ` rev ${e.revision}` : "";
    return `${i + 1}. ${e.title}${rev}${auth} — ${e.excerpt}`;
  });

  const conflictNote = input.evidence.some((e) => e.conflicting)
    ? "\n\nConflicting evidence was detected; review sources before relying on this summary."
    : "";
  const supersededNote = input.evidence.some((e) => e.supersededWarning)
    ? "\n\nOne or more supporting sources are superseded."
    : "";

  const answer = [
    `Based on authorised Engineering OS records (scope: ${input.scope}):`,
    ...lines,
    "",
    "This answer is advisory. Humans retain engineering authority. Fact statements above are limited to retrieved source excerpts; no approvals or calculations were invented.",
  ].join("\n") + conflictNote + supersededNote;

  return {
    answer,
    evidence: input.evidence,
    scope: input.scope,
    limitations: input.limitations,
    evidenceState: input.evidenceState,
    retrievalMode: input.retrievalMode,
    generatedAt,
    generationAvailable: input.generationAvailable,
    abstained: false,
    requiresReview: true,
  };
}

export type SearchBuckets = {
  projects?: unknown[];
  assets?: unknown[];
  documents?: unknown[];
  decisions?: unknown[];
  actions?: unknown[];
  risks?: unknown[];
  issues?: unknown[];
  technicalQueries?: unknown[];
  lessons?: unknown[];
  inspections?: unknown[];
};

export function bucketsToEvidence(
  buckets: SearchBuckets,
  query: EngineeringSearchQuery,
): EngineeringEvidence[] {
  const projectFilter = query.projectId ?? null;
  const mapped: EngineeringEvidence[] = [];
  const mappingQuery =
    query.objectId || !query.query.trim() || isOperationalRegisterQuery(query.query)
      ? "*"
      : query.query;

  const push = (rows: unknown[] | undefined, type: EngineeringSearchableSourceType) => {
    for (const row of rows ?? []) {
      const ev = mapRowToEvidence({
        row,
        sourceType: type,
        query: mappingQuery,
        projectFilter: query.scope === "workspace" ? null : projectFilter,
      });
      if (ev) {
        // Re-score against the real user query when we used a wildcard probe.
        if (mappingQuery === "*" && query.query.trim() && query.query.trim() !== "*") {
          const rescored = mapRowToEvidence({
            row,
            sourceType: type,
            query: query.query,
            projectFilter: query.scope === "workspace" ? null : projectFilter,
          });
          mapped.push(
            rescored
              ? rescored
              : { ...ev, retrievalScore: ev.retrievalScore ?? 1 },
          );
        } else {
          mapped.push(ev);
        }
      }
    }
  };

  push(buckets.projects, "project");
  push(buckets.assets, "asset");
  push(buckets.documents, "document");
  push(buckets.decisions, "decision");
  push(buckets.actions, "action");
  push(buckets.risks, "risk");
  push(buckets.issues, "issue");
  push(buckets.technicalQueries, "technical_query");
  push(buckets.lessons, "lesson");
  push(buckets.inspections, "inspection");

  let filtered = mapped;
  if (query.objectId && query.objectType) {
    const objectType = query.objectType as EngineeringSearchableSourceType;
    const exact = mapped.filter(
      (e) => e.canonicalObjectId === query.objectId || e.sourceId === query.objectId,
    );
    if (exact.length > 0) {
      filtered = exact;
    } else if (
      objectType === "asset" ||
      objectType === "document" ||
      objectType === "project"
    ) {
      filtered = mapped.filter((e) => e.sourceType === objectType);
    }
  }

  return preferAuthority(markConflicts(filtered));
}

export function buildSearchResultEnvelope(input: {
  query: EngineeringSearchQuery;
  evidence: EngineeringEvidence[];
  retrievalMode: EngineeringRetrievalMode;
  limitations: string[];
  retrievalMs: number;
  semanticAttempted: boolean;
  semanticAvailable: boolean;
}): EngineeringGroundedSearchResult {
  const scope = resolveSearchScope(input.query);
  const limit = Math.min(Math.max(input.query.limit ?? 12, 1), 30);
  return {
    query: input.query.query,
    scope,
    retrievalMode: input.retrievalMode,
    evidence: input.evidence.slice(0, limit),
    searchedSourceTypes: [
      "project",
      "asset",
      "document",
      "decision",
      "action",
      "risk",
      "issue",
      "technical_query",
      "lesson",
      "inspection",
    ],
    limitations: input.limitations,
    timingMs: {
      retrievalMs: input.retrievalMs,
      semanticAttempted: input.semanticAttempted,
      semanticAvailable: input.semanticAvailable,
    },
    tenantId: input.query.tenantId,
    workspaceId: input.query.workspaceId ?? null,
  };
}

export function assertTenantIsolation(
  queryTenantId: string,
  evidenceTenantId: string | null | undefined,
): boolean {
  if (!evidenceTenantId) return true;
  return queryTenantId === evidenceTenantId;
}

export { classifyEvidenceState, resolveSearchScope };
