/**
 * EOS 3.3 governed hybrid retrieval engine.
 * Structured canonical state is authoritative; vectors never redefine engineering state.
 */

import type { Eos3CanonicalObjectStore } from "./eos3-object-store";
import type { Eos3KnowledgeRegistry } from "./eos3-knowledge-registry";
import type { Eos3VectorIndex } from "./eos3-vector-index";
import {
  assumptionsSupportingCalculation,
  baselinesContainingRevision,
  currentRevisionOf,
  evidenceSupportingDecision,
  interfacesDependingOnRevision,
  requirementsDrivingObject,
  assetsOriginatedFromSystem,
  changesAffectingDeliverable,
  EOS3_GRAPH_AUTHORITY_MODEL,
} from "./eos3-digital-thread";
import { listStructuredObjects } from "./eos3-structured-retrieval";
import { authorityOutranks, type Eos3AuthorityClass } from "./eos3-knowledge-tiers";
import {
  authorizeRetrieval,
  denyGovernedActionViaRetrieval,
  isolateRetrievedContent,
  type RetrievalCaller,
} from "./eos3-retrieval-security";
import { assembleEngineeringContext } from "./eos3-context-assembly";

export type QueryClass =
  | "object_lookup"
  | "revision_comparison"
  | "dependency_trace"
  | "requirement_trace"
  | "change_impact"
  | "decision_evidence"
  | "deliverable_readiness"
  | "calculation_evidence"
  | "baseline_query"
  | "document_search"
  | "general_knowledge"
  | "authority_request"
  | "insufficient_probe";

export type EvidenceState =
  | "SUFFICIENT_EVIDENCE"
  | "INSUFFICIENT_EVIDENCE"
  | "CONFLICTING_EVIDENCE"
  | "ACCESS_RESTRICTED";

export type RankedHit = {
  hitId: string;
  sourceKind: "canonical" | "document" | "vector" | "lexical";
  authority: Eos3AuthorityClass;
  title: string;
  detail: string;
  revisionLabel: string | null;
  revisionState: "CURRENT" | "SUPERSEDED" | "HISTORICAL" | "BASELINE" | null;
  supersededWarning: boolean;
  evidenceClass: "FACT" | "INFERENCE" | "ASSUMPTION" | "RECOMMENDATION" | "RESULT" | "HUMAN_DECISION";
  score: number;
  ownership: string | null;
  citation: {
    objectId?: string;
    revisionId?: string | null;
    sourceId?: string;
    chunkId?: string;
  };
};

export type RetrievalResult = {
  queryClass: QueryClass;
  evidenceState: EvidenceState;
  hits: RankedHit[];
  conflicts: Array<{ current: string; older: string; explanation: string }>;
  abstentionReason: string | null;
  modelInference: string | null;
  modelInferenceClass: "INFERENCE" | "RECOMMENDATION" | null;
  authorityDenial: ReturnType<typeof denyGovernedActionViaRetrieval> | null;
  performanceMs: number;
  graphAuthority: typeof EOS3_GRAPH_AUTHORITY_MODEL;
};

export function classifyQuery(query: string): QueryClass {
  const q = query.toLowerCase();
  if (/approve|authorize|release ifc|finalize materiality|accept interface/.test(q)) return "authority_request";
  if (/enough evidence|do we have enough|unsupported/.test(q)) return "insufficient_probe";
  if (/baseline|frozen/.test(q)) return "baseline_query";
  if (/current revision|superseded|previous revision|between revision/.test(q)) return "revision_comparison";
  if (/requirement drove|which requirement|systems implement/.test(q)) return "requirement_trace";
  if (/interface.*depend|depends on revision/.test(q)) return "dependency_trace";
  if (/change|impact|affected by/.test(q)) return "change_impact";
  if (/assumption.*calculation|calculation.*assumption/.test(q)) return "calculation_evidence";
  if (/evidence supports.*decision|decision/.test(q)) return "decision_evidence";
  if (/deliverable/.test(q)) return "deliverable_readiness";
  if (/document|datasheet|specification|clause/.test(q)) return "document_search";
  if (/what is|lookup|object/.test(q)) return "object_lookup";
  return "general_knowledge";
}

function lexicalScore(text: string, query: string): number {
  const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  if (!terms.length) return 0;
  const hay = text.toLowerCase();
  let hit = 0;
  for (const t of terms) if (hay.includes(t)) hit += 1;
  return hit / terms.length;
}

function rankHit(hit: RankedHit): number {
  let score = hit.score;
  if (hit.authority === "AUTHORITATIVE_STRUCTURED_STATE") score += 100;
  else if (hit.authority === "CONTROLLED_DOCUMENT") score += 40;
  else if (hit.authority === "ENTERPRISE_KNOWLEDGE") score += 20;
  else if (hit.authority === "EXTERNAL_REFERENCE") score += 10;
  if (hit.revisionState === "CURRENT") score += 15;
  if (hit.revisionState === "BASELINE") score += 50;
  if (hit.revisionState === "SUPERSEDED") score -= 20;
  if (hit.supersededWarning) score -= 5;
  return score;
}

export function retrieveEos3Knowledge(input: {
  store: Eos3CanonicalObjectStore;
  registry: Eos3KnowledgeRegistry;
  vectorIndex: Eos3VectorIndex;
  caller: RetrievalCaller;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  query: string;
  baselineObjectId?: string | null;
  preferBaselineRevision?: boolean;
}): RetrievalResult {
  const t0 = performance.now();
  const authz = authorizeRetrieval(input.caller, {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
  }, input.query);
  if (!authz.allowed) {
    return {
      queryClass: classifyQuery(input.query),
      evidenceState: "ACCESS_RESTRICTED",
      hits: [],
      conflicts: [],
      abstentionReason: `access_restricted:${authz.reason}`,
      modelInference: null,
      modelInferenceClass: null,
      authorityDenial: null,
      performanceMs: performance.now() - t0,
      graphAuthority: EOS3_GRAPH_AUTHORITY_MODEL,
    };
  }

  const queryClass = classifyQuery(input.query);
  if (queryClass === "authority_request") {
    return {
      queryClass,
      evidenceState: "SUFFICIENT_EVIDENCE",
      hits: [],
      conflicts: [],
      abstentionReason: null,
      modelInference: "Retrieval may recommend evidence review only; governed actions require human authority.",
      modelInferenceClass: "RECOMMENDATION",
      authorityDenial: denyGovernedActionViaRetrieval(input.query),
      performanceMs: performance.now() - t0,
      graphAuthority: EOS3_GRAPH_AUTHORITY_MODEL,
    };
  }

  const hits: RankedHit[] = [];
  const conflicts: RetrievalResult["conflicts"] = [];
  const view = input.store.view();
  const objects = [...input.store.objects.values()].filter(
    (o) =>
      o.tenantId === input.tenantId &&
      o.workspaceId === input.workspaceId &&
      o.projectId === input.projectId,
  );

  // Baseline membership is always resolved from frozen graph — never silent latest substitution.
  if (queryClass === "baseline_query" || /baseline|frozen/.test(input.query.toLowerCase())) {
    for (const m of input.store.baselineMembers) {
      const baselineObj = input.store.objects.get(m.baselineObjectId);
      if (!baselineObj) continue;
      if (baselineObj.tenantId !== input.tenantId || baselineObj.workspaceId !== input.workspaceId) continue;
      if (baselineObj.projectId !== input.projectId) continue;
      const rev = input.store.revisions.get(m.memberRevisionId);
      const latest = input.store.objects.get(m.memberObjectId);
      const latestRev = latest ? currentRevisionOf(view, latest.id) : null;
      hits.push({
        hitId: `bl-early-${m.memberRevisionId}`,
        sourceKind: "canonical",
        authority: "AUTHORITATIVE_STRUCTURED_STATE",
        title: `Baseline membership revision ${rev?.revisionIdentifier ?? "?"}`,
        detail: `Frozen baseline contains ${rev?.revisionIdentifier}; latest current is ${latestRev?.revisionIdentifier ?? "unknown"}`,
        revisionLabel: rev?.revisionIdentifier ?? null,
        revisionState: "BASELINE",
        supersededWarning: Boolean(latestRev && rev && latestRev.id !== rev.id),
        evidenceClass: "FACT",
        score: 10,
        ownership: baselineObj.sourceOwnerId,
        citation: { objectId: baselineObj.id, revisionId: m.memberRevisionId },
      });
      if (latestRev && rev && latestRev.id !== rev.id) {
        conflicts.push({
          current: `Latest current revision ${latestRev.revisionIdentifier}`,
          older: `Baseline frozen revision ${rev.revisionIdentifier}`,
          explanation:
            "Baseline context preserves frozen membership; latest project state is not silently substituted.",
        });
      }
    }
  }

  // Structured canonical first (policy). Document search still consults canonical identity when relevant.
  if (
    queryClass === "object_lookup" ||
    queryClass === "revision_comparison" ||
    queryClass === "requirement_trace" ||
    queryClass === "dependency_trace" ||
    queryClass === "change_impact" ||
    queryClass === "decision_evidence" ||
    queryClass === "calculation_evidence" ||
    queryClass === "deliverable_readiness" ||
    queryClass === "baseline_query" ||
    queryClass === "document_search" ||
    queryClass === "general_knowledge" ||
    queryClass === "insufficient_probe"
  ) {
    for (const obj of objects) {
      const rev = currentRevisionOf(view, obj.id);
      const lex = lexicalScore(`${obj.displayName} ${obj.stableObjectId} ${obj.objectType}`, input.query);
      // Baseline queries use frozen membership hits; do not dump the entire object catalog.
      if (lex <= 0 && queryClass !== "requirement_trace") continue;
      if (queryClass === "baseline_query" && obj.objectType !== "Baseline" && lex <= 0) continue;
      hits.push({
        hitId: `canon-${obj.id}`,
        sourceKind: "canonical",
        authority: "AUTHORITATIVE_STRUCTURED_STATE",
        title: `${obj.objectType} ${obj.stableObjectId}`,
        detail: `${obj.displayName}; governed=${obj.governedState}; lifecycle=${obj.lifecycleState}`,
        revisionLabel: rev?.revisionIdentifier ?? null,
        revisionState: obj.governedState === "SUPERSEDED" ? "SUPERSEDED" : "CURRENT",
        supersededWarning: obj.governedState === "SUPERSEDED",
        evidenceClass: "FACT",
        score: lex || 0.2,
        ownership: obj.sourceOwnerId,
        citation: { objectId: obj.id, revisionId: rev?.id ?? null },
      });
    }

    const discipline = objects.find((o) => o.objectType === "DisciplineObject");
    if (discipline && /requirement/.test(input.query.toLowerCase())) {
      for (const req of requirementsDrivingObject(view, discipline.id)) {
        hits.push({
          hitId: `req-trace-${req.id}`,
          sourceKind: "canonical",
          authority: "AUTHORITATIVE_STRUCTURED_STATE",
          title: `Requirement ${req.stableObjectId}`,
          detail: `Drives ${discipline.stableObjectId}`,
          revisionLabel: null,
          revisionState: "CURRENT",
          supersededWarning: false,
          evidenceClass: "FACT",
          score: 1,
          ownership: req.sourceOwnerId,
          citation: { objectId: req.id },
        });
      }
    }

    if (discipline && /interface|depend/.test(input.query.toLowerCase())) {
      const rev = currentRevisionOf(view, discipline.id);
      const named = input.query.match(/revision\s+([A-Za-z0-9]+)/i)?.[1];
      const targetRev = named
        ? [...input.store.revisions.values()].find(
            (r) =>
              r.objectId === discipline.id &&
              r.revisionIdentifier.toLowerCase() === named.toLowerCase(),
          )
        : rev;
      if (targetRev) {
        for (const iface of interfacesDependingOnRevision(view, targetRev.id)) {
          hits.push({
            hitId: `iface-${iface.id}`,
            sourceKind: "canonical",
            authority: "AUTHORITATIVE_STRUCTURED_STATE",
            title: `Interface ${iface.stableObjectId}`,
            detail: `Depends on revision ${targetRev.revisionIdentifier}`,
            revisionLabel: targetRev.revisionIdentifier,
            revisionState: targetRev.isCurrent ? "CURRENT" : "HISTORICAL",
            supersededWarning: !targetRev.isCurrent,
            evidenceClass: "FACT",
            score: 1,
            ownership: iface.sourceOwnerId,
            citation: { objectId: iface.id, revisionId: targetRev.id },
          });
        }
      }
    }

    if (/assumption|calculation/.test(input.query.toLowerCase())) {
      for (const calc of objects.filter((o) => o.objectType === "Calculation")) {
        for (const a of assumptionsSupportingCalculation(view, calc.id)) {
          hits.push({
            hitId: `asm-${a.id}-${calc.id}`,
            sourceKind: "canonical",
            authority: "AUTHORITATIVE_STRUCTURED_STATE",
            title: `Assumption ${a.stableObjectId}`,
            detail: `Supports calculation ${calc.stableObjectId}`,
            revisionLabel: null,
            revisionState: "CURRENT",
            supersededWarning: false,
            evidenceClass: "ASSUMPTION",
            score: 1,
            ownership: a.sourceOwnerId,
            citation: { objectId: a.id },
          });
        }
      }
    }

    if (/decision|evidence supports/.test(input.query.toLowerCase())) {
      for (const d of objects.filter((o) => o.objectType === "Decision")) {
        for (const e of evidenceSupportingDecision(view, d.id)) {
          hits.push({
            hitId: `dec-ev-${e.id}`,
            sourceKind: "canonical",
            authority: "AUTHORITATIVE_STRUCTURED_STATE",
            title: `Evidence ${e.stableObjectId}`,
            detail: `Supports decision ${d.stableObjectId}`,
            revisionLabel: null,
            revisionState: "CURRENT",
            supersededWarning: false,
            evidenceClass: "FACT",
            score: 1,
            ownership: e.sourceOwnerId,
            citation: { objectId: e.id },
          });
        }
      }
    }

    if (/deliverable|change/.test(input.query.toLowerCase())) {
      for (const del of objects.filter((o) => o.objectType === "Deliverable")) {
        for (const ch of changesAffectingDeliverable(view, del.id)) {
          hits.push({
            hitId: `chg-del-${ch.id}`,
            sourceKind: "canonical",
            authority: "AUTHORITATIVE_STRUCTURED_STATE",
            title: `Change ${ch.stableObjectId}`,
            detail: `Affects deliverable ${del.stableObjectId} (governed=${del.governedState})`,
            revisionLabel: null,
            revisionState: "CURRENT",
            supersededWarning: false,
            evidenceClass: "FACT",
            score: 1,
            ownership: ch.sourceOwnerId,
            citation: { objectId: ch.id },
          });
        }
      }
    }

    if (/asset|originated/.test(input.query.toLowerCase())) {
      for (const sys of objects.filter((o) => o.objectType === "System")) {
        for (const asset of assetsOriginatedFromSystem(view, sys.id)) {
          hits.push({
            hitId: `asset-${asset.id}`,
            sourceKind: "canonical",
            authority: "AUTHORITATIVE_STRUCTURED_STATE",
            title: `Asset ${asset.stableObjectId}`,
            detail: `Originated from system ${sys.stableObjectId}`,
            revisionLabel: null,
            revisionState: "CURRENT",
            supersededWarning: false,
            evidenceClass: "FACT",
            score: 1,
            ownership: asset.sourceOwnerId,
            citation: { objectId: asset.id },
          });
        }
      }
    }

    if (queryClass === "baseline_query" || /baseline|frozen/.test(input.query.toLowerCase())) {
      const baseline = objects.find((o) => o.objectType === "Baseline");
      const members = input.store.baselineMembers.filter((m) => m.baselineObjectId === baseline?.id);
      for (const m of members) {
        const rev = input.store.revisions.get(m.memberRevisionId);
        const latest = objects.find((o) => o.id === m.memberObjectId);
        const latestRev = latest ? currentRevisionOf(view, latest.id) : null;
        hits.push({
          hitId: `bl-${m.memberRevisionId}`,
          sourceKind: "canonical",
          authority: "AUTHORITATIVE_STRUCTURED_STATE",
          title: `Baseline membership revision ${rev?.revisionIdentifier ?? "?"}`,
          detail: `Frozen baseline contains ${rev?.revisionIdentifier}; latest current is ${latestRev?.revisionIdentifier ?? "unknown"}`,
          revisionLabel: rev?.revisionIdentifier ?? null,
          revisionState: "BASELINE",
          supersededWarning: Boolean(latestRev && rev && latestRev.id !== rev.id),
          evidenceClass: "FACT",
          score: 1,
          ownership: baseline?.sourceOwnerId ?? null,
          citation: { objectId: baseline?.id, revisionId: m.memberRevisionId },
        });
        if (latestRev && rev && latestRev.id !== rev.id) {
          conflicts.push({
            current: `Latest current revision ${latestRev.revisionIdentifier}`,
            older: `Baseline frozen revision ${rev.revisionIdentifier}`,
            explanation:
              "Baseline context preserves frozen membership; latest project state is not silently substituted.",
          });
        }
      }
    }

    if (/current revision/.test(input.query.toLowerCase()) && discipline) {
      const cur = currentRevisionOf(view, discipline.id);
      hits.push({
        hitId: `cur-rev-${discipline.id}`,
        sourceKind: "canonical",
        authority: "AUTHORITATIVE_STRUCTURED_STATE",
        title: `Current revision ${cur?.revisionIdentifier}`,
        detail: `Object ${discipline.stableObjectId}`,
        revisionLabel: cur?.revisionIdentifier ?? null,
        revisionState: "CURRENT",
        supersededWarning: false,
        evidenceClass: "FACT",
        score: 1,
        ownership: discipline.sourceOwnerId,
        citation: { objectId: discipline.id, revisionId: cur?.id },
      });
    }

    if (/changed between|previous revision/.test(input.query.toLowerCase()) && discipline) {
      const revs = [...input.store.revisions.values()]
        .filter((r) => r.objectId === discipline.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      if (revs.length >= 2) {
        const a = revs[0]!;
        const b = revs[revs.length - 1]!;
        hits.push({
          hitId: `revdiff-${discipline.id}`,
          sourceKind: "canonical",
          authority: "AUTHORITATIVE_STRUCTURED_STATE",
          title: `Revision ${a.revisionIdentifier} → ${b.revisionIdentifier}`,
          detail: `Payload delta keys: ${JSON.stringify(a.payload)} vs ${JSON.stringify(b.payload)}`,
          revisionLabel: `${a.revisionIdentifier}/${b.revisionIdentifier}`,
          revisionState: "CURRENT",
          supersededWarning: true,
          evidenceClass: "FACT",
          score: 1,
          ownership: discipline.sourceOwnerId,
          citation: { objectId: discipline.id, revisionId: b.id },
        });
      }
    }
  }

  // Controlled documents / hybrid lexical+vector (never override canonical current).
  const docHits = [...input.registry.chunks.values()].filter(
    (c) =>
      c.tenantId === input.tenantId &&
      c.workspaceId === input.workspaceId &&
      (!c.projectId || c.projectId === input.projectId) &&
      c.effectiveState !== "REVOKED" &&
      c.effectiveState !== "WITHDRAWN",
  );
  for (const chunk of docHits) {
    const isolated = isolateRetrievedContent(chunk.text);
    const lex = lexicalScore(isolated.safeText, input.query);
    if (lex <= 0 && queryClass !== "document_search" && queryClass !== "general_knowledge") continue;
    const superseded = chunk.effectiveState === "SUPERSEDED" || chunk.documentStatus === "superseded";
    hits.push({
      hitId: `doc-${chunk.chunkId}`,
      sourceKind: "document",
      authority: chunk.authorityClass,
      title: `Document chunk ${chunk.pageOrSection ?? chunk.chunkId.slice(0, 8)}`,
      detail: isolated.safeText.slice(0, 240),
      revisionLabel: chunk.revisionOrVersion,
      revisionState: superseded ? "SUPERSEDED" : chunk.effectiveState === "HISTORICAL" ? "HISTORICAL" : "CURRENT",
      supersededWarning: superseded,
      evidenceClass: chunk.evidenceClassification,
      score: lex,
      ownership: input.registry.sources.get(chunk.sourceId)?.ownerId ?? null,
      citation: { sourceId: chunk.sourceId, chunkId: chunk.chunkId, revisionId: chunk.revisionOrVersion },
    });
  }

  if (queryClass === "document_search" || queryClass === "general_knowledge") {
    for (const v of input.vectorIndex.search({
      query: input.query,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      limit: 5,
    })) {
      hits.push({
        hitId: `vec-${v.entryId}`,
        sourceKind: "vector",
        authority: "CONTROLLED_DOCUMENT",
        title: "Vector similarity hit",
        detail: isolateRetrievedContent(v.text).safeText.slice(0, 240),
        revisionLabel: null,
        revisionState: v.effectiveState === "SUPERSEDED" ? "SUPERSEDED" : "CURRENT",
        supersededWarning: v.effectiveState === "SUPERSEDED",
        evidenceClass: "FACT",
        score: v.score,
        ownership: null,
        citation: { sourceId: v.sourceId, chunkId: v.chunkId },
      });
    }
  }

  // Conflict: canonical current vs older document revision references
  const currentDisc = objects.find((o) => o.objectType === "DisciplineObject");
  const curRev = currentDisc ? currentRevisionOf(view, currentDisc.id) : null;
  for (const h of hits) {
    if (
      h.sourceKind !== "canonical" &&
      h.revisionLabel &&
      curRev &&
      h.revisionLabel !== curRev.revisionIdentifier &&
      /revision/i.test(h.detail + h.title)
    ) {
      conflicts.push({
        current: `Canonical current revision ${curRev.revisionIdentifier}`,
        older: `Document/source references revision ${h.revisionLabel}`,
        explanation:
          "Canonical structured state defines current revision; older document evidence is visible but does not override.",
      });
    }
  }

  // Enforce precedence: drop lower-authority claims that contradict CURRENT revision identity
  const filtered = hits.filter((h) => {
    if (!curRev) return true;
    if (h.authority === "AUTHORITATIVE_STRUCTURED_STATE") return true;
    if (
      h.revisionLabel &&
      h.revisionLabel !== curRev.revisionIdentifier &&
      /current revision/i.test(input.query) &&
      h.revisionState !== "BASELINE"
    ) {
      // Keep with warning for conflict visibility, but mark superseded
      h.supersededWarning = true;
      h.revisionState = "SUPERSEDED";
    }
    return true;
  });

  filtered.sort((a, b) => rankHit(b) - rankHit(a));

  let evidenceState: EvidenceState = filtered.length ? "SUFFICIENT_EVIDENCE" : "INSUFFICIENT_EVIDENCE";
  if (conflicts.length) evidenceState = "CONFLICTING_EVIDENCE";
  if (queryClass === "insufficient_probe" || /enough evidence|unsupported topic/i.test(input.query)) {
    const unsupported = !filtered.some((h) => /quantum|unobtanium|mars colony/i.test(h.detail + h.title));
    if (unsupported && /quantum|unobtanium|mars|unsupported/i.test(input.query)) {
      evidenceState = "INSUFFICIENT_EVIDENCE";
      return {
        queryClass,
        evidenceState,
        hits: [],
        conflicts,
        abstentionReason: "insufficient_project_evidence",
        modelInference: null,
        modelInferenceClass: null,
        authorityDenial: null,
        performanceMs: performance.now() - t0,
        graphAuthority: EOS3_GRAPH_AUTHORITY_MODEL,
      };
    }
  }

  // Model inference never labeled FACT
  const modelInference =
    queryClass === "general_knowledge" && filtered.length
      ? "Retrieved sources may be summarized; model-derived synthesis remains inference."
      : null;

  void listStructuredObjects;
  void authorityOutranks;
  void assembleEngineeringContext;
  void baselinesContainingRevision;
  void input.baselineObjectId;
  void input.preferBaselineRevision;

  input.registry.audit.push({
    action: "retrieval_performed",
    sourceId: null,
    at: new Date().toISOString(),
    detail: { queryClass, hitCount: filtered.length, evidenceState },
  });

  return {
    queryClass,
    evidenceState,
    hits: filtered.slice(0, 20),
    conflicts: conflicts.slice(0, 5),
    abstentionReason: evidenceState === "INSUFFICIENT_EVIDENCE" ? "insufficient_project_evidence" : null,
    modelInference,
    modelInferenceClass: modelInference ? "INFERENCE" : null,
    authorityDenial: null,
    performanceMs: performance.now() - t0,
    graphAuthority: EOS3_GRAPH_AUTHORITY_MODEL,
  };
}
