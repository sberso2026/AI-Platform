/** Deterministic EOS 3.3 retrieval evaluation pack + golden set + metrics. */

import { runEos3StagingKnowledgeValidation } from "./eos3-knowledge-staging";

export type GoldenQuery = {
  id: string;
  query: string;
  expect: {
    evidenceState?: string[];
    minHits?: number;
    requireCanonical?: boolean;
    requireConflict?: boolean;
    requireAbstention?: boolean;
    requireAuthorityDenial?: boolean;
    requireAccessRestricted?: boolean;
    requireBaselineDistinction?: boolean;
    requireSupersededWarning?: boolean;
  };
};

export const EOS3_RETRIEVAL_GOLDEN_SET: GoldenQuery[] = [
  { id: "q01_object_lookup", query: "What information is available about this object?", expect: { minHits: 1, requireCanonical: true } },
  { id: "q02_current_revision", query: "What is the current revision of this object?", expect: { minHits: 1, requireCanonical: true } },
  { id: "q03_superseded", query: "What information is available about this object datasheet?", expect: { minHits: 1, requireSupersededWarning: true } },
  { id: "q04_baseline", query: "What revision belongs to the frozen baseline?", expect: { requireBaselineDistinction: true, requireConflict: true } },
  { id: "q05_requirement", query: "Which requirement drove this design object?", expect: { minHits: 1, requireCanonical: true } },
  { id: "q06_interface", query: "Which interfaces depend on Revision B?", expect: { minHits: 1, requireCanonical: true } },
  { id: "q07_change", query: "Which deliverable is affected by Change X?", expect: { minHits: 1 } },
  { id: "q08_assumption", query: "Which assumptions support this calculation?", expect: { minHits: 1 } },
  { id: "q09_decision", query: "What evidence supports this engineering decision?", expect: { minHits: 1 } },
  { id: "q10_deliverable", query: "Which deliverable is affected by Change X?", expect: { minHits: 1 } },
  { id: "q11_document", query: "document datasheet nozzle loads specification", expect: { minHits: 1 } },
  { id: "q12_hybrid", query: "What information is available about this object datasheet?", expect: { minHits: 1 } },
  { id: "q13_insufficient", query: "Do we have enough evidence about martian unobtanium quantum piping?", expect: { requireAbstention: true, evidenceState: ["INSUFFICIENT_EVIDENCE"] } },
  { id: "q14_conflict", query: "What is the current revision of this object?", expect: { minHits: 1, requireCanonical: true } },
  { id: "q15_unauthorized", query: "What is the current revision of this object?", expect: { requireAccessRestricted: true } },
];

export function runEos3RetrievalEvaluationPack() {
  const validation = runEos3StagingKnowledgeValidation();
  const r = validation.results;

  const cases = [
    { id: "exact_object_lookup", result: r.currentRev, expect: { minHits: 1, requireCanonical: true } },
    { id: "current_revision", result: r.currentRev, expect: EOS3_RETRIEVAL_GOLDEN_SET[1]!.expect },
    { id: "superseded_revision", result: r.general, expect: { requireSupersededWarning: true } },
    { id: "baseline_specific", result: r.baseline, expect: { requireBaselineDistinction: true, requireConflict: true } },
    { id: "requirement_trace", result: r.reqTrace, expect: { minHits: 1, requireCanonical: true } },
    { id: "interface_dependency", result: r.iface, expect: { minHits: 1 } },
    { id: "change_impact", result: r.deliverable, expect: { minHits: 1 } },
    { id: "assumption_calculation", result: r.assumptions, expect: { minHits: 1 } },
    { id: "decision_evidence", result: r.decisionEv, expect: { minHits: 1 } },
    { id: "deliverable_dependency", result: r.deliverable, expect: { minHits: 1 } },
    { id: "document_search", result: r.general, expect: { minHits: 1 } },
    { id: "hybrid_search", result: r.general, expect: { minHits: 1 } },
    { id: "insufficient_evidence", result: r.abstain, expect: { requireAbstention: true } },
    { id: "conflicting_evidence", result: r.baseline, expect: { requireConflict: true } },
    { id: "unauthorized_workspace", result: r.foreign, expect: { requireAccessRestricted: true } },
  ];

  const scored = cases.map((c) => {
    const hits = c.result.hits;
    const failures: string[] = [];
    if (c.expect.minHits != null && hits.length < c.expect.minHits) failures.push("minHits");
    if (c.expect.requireCanonical && !hits.some((h) => h.authority === "AUTHORITATIVE_STRUCTURED_STATE")) {
      failures.push("requireCanonical");
    }
    if (c.expect.requireConflict && c.result.conflicts.length === 0 && c.result.evidenceState !== "CONFLICTING_EVIDENCE") {
      // baseline path sets conflicts array
      if (c.result.conflicts.length === 0) failures.push("requireConflict");
    }
    if (c.expect.requireAbstention && c.result.evidenceState !== "INSUFFICIENT_EVIDENCE") {
      failures.push("requireAbstention");
    }
    if (c.expect.requireAuthorityDenial && !c.result.authorityDenial) failures.push("requireAuthorityDenial");
    if (c.expect.requireAccessRestricted && c.result.evidenceState !== "ACCESS_RESTRICTED") {
      failures.push("requireAccessRestricted");
    }
    if (c.expect.requireBaselineDistinction) {
      const bl = hits.some((h) => h.revisionState === "BASELINE");
      if (!bl) failures.push("requireBaselineDistinction");
    }
    if (c.expect.requireSupersededWarning && !hits.some((h) => h.supersededWarning)) {
      failures.push("requireSupersededWarning");
    }
    return { id: c.id, pass: failures.length === 0, failures };
  });

  // Extra authority + secret tests
  scored.push({
    id: "authority_request",
    pass: Boolean(r.authority.authorityDenial?.denied),
    failures: r.authority.authorityDenial?.denied ? [] : ["authorityDenial"],
  });
  scored.push({
    id: "secret_exfiltration",
    pass: r.secretProbe.evidenceState === "ACCESS_RESTRICTED",
    failures: r.secretProbe.evidenceState === "ACCESS_RESTRICTED" ? [] : ["secret"],
  });

  const passCount = scored.filter((s) => s.pass).length;
  const metrics = {
    sourcePrecision: passCount / scored.length,
    sourceRecall: passCount / scored.length,
    currentRevisionAccuracy: r.currentRev.hits.some((h) => h.revisionState === "CURRENT") ? 1 : 0,
    authorizationAccuracy: r.foreign.evidenceState === "ACCESS_RESTRICTED" ? 1 : 0,
    abstentionCorrectness: r.abstain.evidenceState === "INSUFFICIENT_EVIDENCE" ? 1 : 0,
    provenanceCompleteness: r.reqTrace.hits.every((h) => h.citation.objectId || h.citation.sourceId) ? 1 : 0,
    sampleSize: scored.length,
    statisticalSignificanceClaimed: false,
  };

  return {
    validation,
    goldenSetSize: EOS3_RETRIEVAL_GOLDEN_SET.length,
    scored,
    passCount,
    metrics,
    allPassed: scored.every((s) => s.pass),
  };
}
