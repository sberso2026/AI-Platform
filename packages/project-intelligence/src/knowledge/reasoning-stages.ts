/**
 * Phase 8H — Deterministic reasoning pipeline stages (pure functions).
 */
import type { EngineeringKnowledgeGraph } from "./graph";
import { hybridSearchNodes, type UnifiedSearchHit } from "./hybrid-search";
import type { KnowledgeCitation, KnowledgeNodeRef } from "./types";
import type {
  ConflictFinding,
  DrillDownLink,
  RankedEvidence,
  ReasoningIntent,
  ReasoningPermissionContext,
  ReasoningStep,
  StageTrace,
} from "./reasoning-types";

function nowIso(): string {
  return new Date().toISOString();
}

export function trace(
  stage: StageTrace["stage"],
  status: StageTrace["status"],
  detail: string,
): StageTrace {
  return { stage, status, detail, at: nowIso() };
}

export function normalizeQuestion(question: string): string {
  return question.trim().replace(/\s+/g, " ");
}

export function classifyIntent(question: string): { intent: ReasoningIntent; confidence: number } {
  const q = question.toLowerCase();
  if (/\b(conflict|contradict|disagree|inconsist)/i.test(q)) {
    return { intent: "conflict_probe", confidence: 0.9 };
  }
  if (/\b(impact|affect|depend|downstream|upstream|cascade)/i.test(q)) {
    return { intent: "impact", confidence: 0.88 };
  }
  if (/\b(related|neighbor|linked|connected|associated)/i.test(q)) {
    return { intent: "related", confidence: 0.85 };
  }
  if (/\b(summar|overview|roll-?up|what do we know)/i.test(q)) {
    return { intent: "summarize", confidence: 0.82 };
  }
  if (/\b(what|where|which|who|when|find|show|status|detail)/i.test(q) || q.length > 0) {
    return { intent: "lookup", confidence: q.length > 8 ? 0.75 : 0.55 };
  }
  return { intent: "unknown", confidence: 0.2 };
}

export function validatePermissions(permissions: ReasoningPermissionContext): {
  permitted: boolean;
  failure: string | null;
} {
  if (!permissions.tenantId || !permissions.workspaceId) {
    return { permitted: false, failure: "tenant_and_workspace_required" };
  }
  if (!permissions.seatAssigned) {
    return { permitted: false, failure: "seat_not_assigned" };
  }
  if (!permissions.workspaceAssigned) {
    return { permitted: false, failure: "workspace_not_assigned" };
  }
  if (!permissions.canReadKnowledge) {
    return { permitted: false, failure: "knowledge_read_denied" };
  }
  return { permitted: true, failure: null };
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1);
}

export function selectTraversalSeeds(
  question: string,
  nodes: readonly KnowledgeNodeRef[],
  seedRefIds: readonly string[] = [],
): string[] {
  if (seedRefIds.length) return [...new Set(seedRefIds)];
  const tokens = tokenize(question);
  const scored = nodes
    .map((n) => {
      const hay = `${n.title} ${n.snippet ?? ""}`.toLowerCase();
      const hits = tokens.filter((t) => hay.includes(t)).length;
      return { refId: n.refId, hits };
    })
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits);
  return scored.slice(0, 3).map((s) => s.refId);
}

export function traverseKnowledgeGraph(
  graph: EngineeringKnowledgeGraph,
  scope: { tenantId: string; workspaceId: string },
  seedRefIds: readonly string[],
  depth = 1,
): { nodeRefIds: string[]; nodes: KnowledgeNodeRef[] } {
  const seen = new Set<string>(seedRefIds);
  for (const seed of seedRefIds) {
    const { nodes } = graph.neighbors(seed, scope, depth);
    for (const n of nodes) seen.add(n.refId);
  }
  const nodes = [...seen]
    .map((id) => graph.getNode(id))
    .filter((n): n is KnowledgeNodeRef => Boolean(n));
  return { nodeRefIds: [...seen], nodes };
}

export function runHybridRetrieval(input: {
  question: string;
  nodes: readonly KnowledgeNodeRef[];
  tenantId: string;
  workspaceId: string;
  allowedOwners?: readonly KnowledgeNodeRef["owner"][];
  allowedKinds?: readonly KnowledgeNodeRef["kind"][];
  limit?: number;
  vectorBoosts?: ReadonlyMap<string, number>;
}): { hits: readonly UnifiedSearchHit[]; retrievalTraceId: string } {
  const result = hybridSearchNodes(
    input.nodes,
    {
      query: input.question,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      owners: input.allowedOwners,
      kinds: input.allowedKinds,
      limit: input.limit ?? 20,
    },
    input.vectorBoosts ?? new Map(),
  );
  return { hits: result.hits, retrievalTraceId: result.retrievalTraceId };
}

export function rankEvidence(
  hits: readonly UnifiedSearchHit[],
  traversalNodeRefIds: ReadonlySet<string>,
  intent: ReasoningIntent,
): RankedEvidence[] {
  const intentBoost =
    intent === "impact" || intent === "related" ? 0.08 : intent === "conflict_probe" ? 0.05 : 0.02;
  const ranked = hits.map((hit) => {
    const graphProximity = traversalNodeRefIds.has(hit.refId) ? 0.12 : 0;
    const combinedScore = Math.min(1, hit.score + graphProximity + intentBoost * (hit.score > 0 ? 1 : 0));
    return { ...hit, graphProximity, combinedScore, rank: 0 };
  });
  ranked.sort((a, b) => b.combinedScore - a.combinedScore);
  return ranked.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function detectEvidenceConflicts(
  ranked: readonly RankedEvidence[],
  intent: ReasoningIntent,
): ConflictFinding[] {
  const conflicts: ConflictFinding[] = [];
  const byKind = new Map<string, RankedEvidence[]>();
  for (const e of ranked.slice(0, 8)) {
    const list = byKind.get(e.kind) ?? [];
    list.push(e);
    byKind.set(e.kind, list);
  }

  for (const [kind, group] of byKind) {
    if (group.length < 2) continue;
    const excerpts = new Set(group.map((g) => g.snippet.trim().toLowerCase()));
    if (excerpts.size >= 2 && /leak|risk|safe|fail|ok|approved|reject/i.test([...excerpts].join(" "))) {
      const neg = [...excerpts].some((x) => /no leak|not a risk|safe|approved/i.test(x));
      const pos = [...excerpts].some((x) => /leak|risk|hazard|reject|conflict/i.test(x));
      if (neg && pos) {
        conflicts.push({
          kind: "opposing_snippets",
          refIds: group.map((g) => g.refId),
          detail: `Opposing ${kind} evidence detected`,
        });
      }
    }
    const owners = new Set(group.map((g) => g.owner));
    if (owners.size > 1 && intent === "conflict_probe") {
      conflicts.push({
        kind: "owner_disagreement",
        refIds: group.map((g) => g.refId),
        detail: `Multiple owners for ${kind}: ${[...owners].join(", ")}`,
      });
    }
  }

  if (ranked.length === 1 && intent !== "lookup") {
    conflicts.push({
      kind: "insufficient_corroboration",
      refIds: [ranked[0]!.refId],
      detail: "Single evidence item without corroboration for non-lookup intent",
    });
  }

  return conflicts;
}

export function buildReasoningSteps(
  question: string,
  intent: ReasoningIntent,
  ranked: readonly RankedEvidence[],
  conflicts: readonly ConflictFinding[],
): ReasoningStep[] {
  const top = ranked.slice(0, 5);
  const steps: ReasoningStep[] = [
    {
      id: "r1",
      premise: `Intent classified as ${intent} for question: ${question}`,
      evidenceRefIds: [],
    },
  ];
  if (top.length) {
    steps.push({
      id: "r2",
      premise: `Primary evidence: ${top.map((e) => `${e.title} [${e.owner}/${e.kind}]`).join("; ")}`,
      evidenceRefIds: top.map((e) => e.refId),
    });
  }
  if (conflicts.length) {
    steps.push({
      id: "r3",
      premise: `Conflicts noted: ${conflicts.map((c) => c.detail).join("; ")}`,
      evidenceRefIds: conflicts.flatMap((c) => [...c.refIds]),
    });
  } else if (top.length >= 2) {
    steps.push({
      id: "r3",
      premise: "No material conflicts among top-ranked evidence",
      evidenceRefIds: top.map((e) => e.refId),
    });
  }
  return steps;
}

export function composeGroundedAnswer(input: {
  question: string;
  intent: ReasoningIntent;
  steps: readonly ReasoningStep[];
  ranked: readonly RankedEvidence[];
}): string {
  const top = input.ranked.slice(0, 5);
  if (!top.length) return "";
  const facts = top.map((e, i) => `(${i + 1}) ${e.title}: ${e.snippet}`).join(" ");
  return (
    `Deterministic ${input.intent} answer for “${input.question}”. ` +
    `Based on ${top.length} ranked evidence item(s): ${facts} ` +
    `Reasoning: ${input.steps.map((s) => s.premise).join(" → ")}`
  );
}

export function collectCitations(ranked: readonly RankedEvidence[], limit = 12): KnowledgeCitation[] {
  const out: KnowledgeCitation[] = [];
  for (const e of ranked) {
    for (const c of e.citations) {
      out.push({ ...c, score: e.combinedScore });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function computeConfidence(input: {
  ranked: readonly RankedEvidence[];
  conflicts: readonly ConflictFinding[];
  citations: readonly KnowledgeCitation[];
  intentConfidence: number;
}): number {
  if (!input.ranked.length || !input.citations.length) return 0;
  const top = input.ranked[0]!.combinedScore;
  const corroboration = Math.min(1, input.ranked.length / 3) * 0.2;
  const conflictPenalty = input.conflicts.some((c) => c.kind === "opposing_snippets")
    ? 0.35
    : input.conflicts.length
      ? 0.12
      : 0;
  return Math.max(
    0,
    Math.min(1, top * 0.55 + input.intentConfidence * 0.2 + corroboration - conflictPenalty),
  );
}

export function decideAbstention(input: {
  permitted: boolean;
  permissionFailure: string | null;
  citations: readonly KnowledgeCitation[];
  confidence: number;
  minConfidence: number;
  minCitations: number;
  scoreThreshold: number;
  ranked: readonly RankedEvidence[];
  conflicts: readonly ConflictFinding[];
}): { abstain: boolean; reason: string | null } {
  if (!input.permitted) {
    return { abstain: true, reason: input.permissionFailure ?? "permission_denied" };
  }
  if (input.conflicts.some((c) => c.kind === "opposing_snippets")) {
    return { abstain: true, reason: "material_conflict" };
  }
  if (input.citations.length < input.minCitations) {
    return { abstain: true, reason: "insufficient_citations" };
  }
  const maxScore = input.ranked[0]?.combinedScore ?? 0;
  if (maxScore < input.scoreThreshold) {
    return { abstain: true, reason: "below_score_threshold" };
  }
  if (input.confidence < input.minConfidence) {
    return { abstain: true, reason: "below_confidence_threshold" };
  }
  return { abstain: false, reason: null };
}

export function buildDrillDown(citations: readonly KnowledgeCitation[]): DrillDownLink[] {
  const seen = new Set<string>();
  const links: DrillDownLink[] = [];
  for (const c of citations) {
    if (seen.has(c.refId)) continue;
    seen.add(c.refId);
    links.push({
      refId: c.refId,
      label: `${c.kind}:${c.refId}`,
      path: c.drillDownPath,
      owner: c.owner,
      kind: c.kind,
    });
  }
  return links;
}
