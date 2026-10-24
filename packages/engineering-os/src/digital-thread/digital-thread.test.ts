import { describe, expect, it } from "vitest";
import { ANALYSIS_DEPENDENCY_GOVERNED_MAP } from "../analysis-intelligence/types";
import { toGovernedAnalysisLink } from "../analysis-intelligence/dependencies";
import { GOVERNED_RELATION_TYPES } from "../decision-intelligence/relations";
import { DISCOVERED_DEPENDENCY } from "../control-intelligence/invariants";
import { A7B_DEPENDENCY_DIRECTION } from "./a7b-direction";
import { evaluateThreadCoverage } from "./coverage";
import { AI_THREAD_BOUNDARY } from "./explain";
import {
  authorizedMemberContext,
  CRUSHER_FEED_OTHER_TENANT,
  CRUSHER_FEED_OTHER_WORKSPACE,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  crusherExpansionFeedFixture,
  cycleFixture,
} from "./fixture";
import { judgeRelationPair, GOVERNED_RELATION_SEMANTICS } from "./relation-semantics";
import {
  analysisTrace,
  changeTrace,
  configurationTrace,
  decisionTrace,
  requirementTrace,
} from "./traces";
import { clampThreadDepth, traverseThread } from "./traversal";
import { THREAD_HARD_MAX_DEPTH, THREAD_DEFAULT_MAX_DEPTH } from "./types";

describe("EOS-A8A Engineering Digital Thread", () => {
  const graph = crusherExpansionFeedFixture();
  const auth = authorizedMemberContext(graph);
  const query = {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    root: { objectType: "requirement", objectId: "req-r001" },
  };

  it("clamps traversal depth and documents hard maximum 8", () => {
    expect(THREAD_DEFAULT_MAX_DEPTH).toBe(4);
    expect(THREAD_HARD_MAX_DEPTH).toBe(8);
    expect(clampThreadDepth(99)).toBe(8);
    expect(clampThreadDepth(0)).toBe(4);
  });

  it("registers semantics for every governed relation without inventing new verbs", () => {
    for (const code of GOVERNED_RELATION_TYPES) {
      expect(GOVERNED_RELATION_SEMANTICS[code]?.code).toBe(code);
      expect(GOVERNED_RELATION_SEMANTICS[code].direction).toBe("from→to");
    }
    expect(judgeRelationPair("requirement", "ALLOCATED_TO", "system").judgement).toBe("ALLOWED");
    expect(judgeRelationPair("decision", "SUPPORTED_BY", "analysis_result").judgement).toBe("ALLOWED");
    expect(judgeRelationPair("interface", "CONNECTS", "asset").judgement).toBe("ALLOWED");
    expect(judgeRelationPair("change", "AFFECTS", "system").judgement).toBe("ALLOWED");
    expect(judgeRelationPair("configuration_baseline", "CONTAINS", "configuration_item").judgement).toBe("ALLOWED");
    expect(judgeRelationPair("analysis_request", "DEPENDS_ON", "analysis_result").judgement).toBe("ALLOWED");
    expect(judgeRelationPair("requirement", "CONNECTS", "decision").judgement).toBe("FORBIDDEN");
  });

  it("verifies A7B REQUIRES_RESULT_FROM as DEPENDS_ON and migrates USES_RESULT_FROM to USES", () => {
    expect(A7B_DEPENDENCY_DIRECTION.REQUIRES_RESULT_FROM.verified).toBe("CORRECT");
    expect(ANALYSIS_DEPENDENCY_GOVERNED_MAP.REQUIRES_RESULT_FROM).toBe("DEPENDS_ON");
    expect(toGovernedAnalysisLink({
      fromRequestId: "down",
      toRequestId: "up",
      semantic: "REQUIRES_RESULT_FROM",
      requiredAcceptance: "ACCEPTED",
    }).relationship).toBe("DEPENDS_ON");
    expect(ANALYSIS_DEPENDENCY_GOVERNED_MAP.USES_RESULT_FROM).toBe("USES");
    expect(toGovernedAnalysisLink({
      fromRequestId: "down",
      toRequestId: "up",
      toResultId: "res-up",
      semantic: "USES_RESULT_FROM",
      requiredAcceptance: "ACCEPTED",
    })).toMatchObject({
      relationship: "USES",
      fromType: "analysis_request",
      fromId: "down",
      toType: "analysis_result",
      toId: "res-up",
    });
    expect(A7B_DEPENDENCY_DIRECTION.USES_RESULT_FROM.previousGoverned).toBe("USED_BY");
  });

  it("traces requirement allocation through analysis, review, and decision without fabricating edges", () => {
    const started = Date.now();
    const trace = requirementTrace(graph, { ...query, maxDepth: 8 }, auth);
    expect(Date.now() - started).toBeLessThan(250);
    expect(trace.traversal.relationships.some((r) => r.relationship === "ALLOCATED_TO" && r.toType === "system")).toBe(true);
    expect(trace.traversal.nodes.some((n) => n.objectType === "system" && n.objectId === "sys-primary-crushing")).toBe(true);
    expect(trace.traversal.nodes.some((n) => n.objectType === "analysis_request")).toBe(true);
    expect(trace.traversal.nodes.some((n) => n.objectType === "analysis_result")).toBe(true);
    expect(trace.traversal.nodes.some((n) => n.objectType === "review_package")).toBe(true);
    expect(trace.traversal.nodes.some((n) => n.objectType === "decision")).toBe(true);
    expect(trace.explanations.some((line) => line.includes("allocated to"))).toBe(true);
    expect(trace.gaps.every((g) => g.reason === "MISSING_RELATION")).toBe(true);
  });

  it("does not leak unauthorized workspace or tenant objects", () => {
    const result = traverseThread(graph, { ...query, direction: "both", maxDepth: 4 }, auth);
    const ids = result.nodes.map((n) => n.objectId);
    const titles = result.nodes.map((n) => n.title ?? "");
    const codes = result.nodes.map((n) => n.objectCode ?? "");
    expect(ids).not.toContain("req-hidden-ws");
    expect(ids).not.toContain("sys-other-tenant");
    expect(titles.join(" ")).not.toMatch(/Unauthorized|Other tenant/i);
    expect(codes).not.toContain("R-HIDDEN");
    expect(codes).not.toContain("SYS-OTHER");
    expect(result.relationships.some((r) => r.toId === "req-hidden-ws" || r.toId === "sys-other-tenant")).toBe(false);
    expect(CRUSHER_FEED_OTHER_WORKSPACE).toBeTruthy();
    expect(CRUSHER_FEED_OTHER_TENANT).toBeTruthy();
  });

  it("denies anonymous traversal without leaking existence", () => {
    const anon = { ...auth, role: "anonymous" as const, allowedWorkspaceIds: [] as const };
    const result = traverseThread(graph, query, anon);
    expect(result.nodes).toEqual([]);
    expect(result.relationships).toEqual([]);
  });

  it("keeps admin inside authorized workspaces (fail-closed)", () => {
    const admin = { ...auth, role: "admin" as const };
    const result = traverseThread(graph, query, admin);
    expect(result.nodes.some((n) => n.objectId === "req-hidden-ws")).toBe(false);
    expect(result.nodes.some((n) => n.objectId === "sys-other-tenant")).toBe(false);
  });

  it("terminates cycles, deduplicates, and respects depth", () => {
    const cyclic = cycleFixture();
    const cyclicAuth = authorizedMemberContext(cyclic);
    const result = traverseThread(
      cyclic,
      { tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, root: { objectType: "system", objectId: "sys-a" }, maxDepth: 6 },
      cyclicAuth,
    );
    expect(result.cycleDetected).toBe(true);
    expect(result.nodes.map((n) => n.objectId).sort()).toEqual(["sys-a", "sys-b", "sys-c"]);
    expect(result.nodes.length).toBe(3);
  });

  it("surfaces a blocked SPACE GASS analysis with no fabricated result", () => {
    const trace = analysisTrace(
      graph,
      { ...query, root: { objectType: "analysis_request", objectId: "ar-structural-blocked" } },
      auth,
    );
    expect(trace.blockedAnalysis?.fabricatedResult).toBe(false);
    expect(trace.blockedAnalysis?.capability).toBe("LINEAR_STRUCTURAL_ANALYSIS");
    expect(trace.blockedAnalysis?.toolBinding).toMatch(/SPACEGASS/);
    expect(trace.blockedAnalysis?.reasons.length).toBeGreaterThan(0);
    expect(trace.traversal.nodes.some((n) => n.objectType === "analysis_result" && n.provenance?.sourceAnalysisId === "ar-structural-blocked")).toBe(false);
    expect(graph.nodes.some((n) => n.objectType === "analysis_result" && n.provenance?.sourceAnalysisId === "ar-structural-blocked")).toBe(false);
    expect(trace.gaps.some((g) => g.expectedStep === "analysis result")).toBe(true);
  });

  it("demonstrates cross-discipline process → mechanical → structural thread", () => {
    const process = analysisTrace(graph, { ...query, root: { objectType: "analysis_request", objectId: "ar-process" } }, auth);
    const mechanical = analysisTrace(graph, { ...query, root: { objectType: "analysis_request", objectId: "ar-mechanical" } }, auth);
    const structural = analysisTrace(graph, { ...query, root: { objectType: "analysis_request", objectId: "ar-structural-blocked" } }, auth);
    expect(process.traversal.nodes.some((n) => n.objectType === "requirement")).toBe(true);
    expect(mechanical.traversal.relationships.some((r) => r.relationship === "DEPENDS_ON" && r.toId === "res-process")).toBe(true);
    expect(structural.traversal.relationships.some((r) => r.relationship === "DEPENDS_ON" && r.toId === "res-mechanical")).toBe(true);
    expect(structural.traversal.relationships.some((r) => r.relationship === "USES" && r.toId === "res-mechanical")).toBe(true);
    expect(structural.blockedAnalysis?.fabricatedResult).toBe(false);
  });

  it("traces decisions, configuration snapshots, and changes without auto-confirming impacts", () => {
    const decision = decisionTrace(graph, { ...query, root: { objectType: "decision", objectId: "dec-support-frame" } }, auth);
    expect(decision.traversal.nodes.some((n) => n.objectType === "analysis_result")).toBe(true);
    expect(decision.traversal.nodes.some((n) => n.objectId === "asm-a12")).toBe(true);
    expect(decision.traversal.relationships.some((r) => r.relationship === "SUPERSEDES")).toBe(true);
    expect(decision.explanations.some((line) => /supported by/i.test(line))).toBe(true);

    const configuration = configurationTrace(graph, { ...query, root: { objectType: "configuration_baseline", objectId: "bl-feed-02" } }, auth);
    expect(configuration.configurationAvailability).toBe("SNAPSHOT_EVIDENCE_AVAILABLE");
    expect(configuration.composedBindings.some((b) => b.field.includes("baseline_id"))).toBe(true);
    expect(configuration.traversal.relationships.some((r) => r.relationship === "SUPERSEDES")).toBe(true);

    const change = changeTrace(graph, { ...query, root: { objectType: "change", objectId: "chg-vendor-mass" } }, auth);
    expect(change.impactCandidates.length).toBeGreaterThan(0);
    expect(change.impactCandidates.every((c) => c.kind === DISCOVERED_DEPENDENCY && c.confirmedImpact === false)).toBe(true);
  });

  it("surfaces canonical staleness reasons and supersession without a new engine", () => {
    const result = traverseThread(graph, { ...query, root: { objectType: "analysis_result", objectId: "res-synthetic-struct" } }, auth);
    const stale = result.nodes.find((n) => n.objectId === "res-synthetic-struct");
    expect(stale?.stale).toBe(true);
    expect(stale?.staleReasons).toContain("STALE_REQUIREMENT_CHANGED");
    expect(result.nodes.some((n) => n.objectId === "dec-support-frame")).toBe(true);
  });

  it("reports bounded assurance gaps and never a universal score", () => {
    const coverage = evaluateThreadCoverage(graph);
    expect(coverage.universalTraceabilityScore).toBe(false);
    expect(coverage.maturityModel).toBe("EOS-A1");
    expect(coverage.findings.some((f) => f.code === "STALE_RESULT_REFERENCED_BY_ACTIVE_DECISION")).toBe(true);
    expect(coverage.findings.every((f) => f.automaticDefect === false && f.reviewRequired === true)).toBe(true);
    expect(AI_THREAD_BOUNDARY.mayInventMissingRelations).toBe(false);
    expect(AI_THREAD_BOUNDARY.mayConfirmImpactsAutomatically).toBe(false);
    expect(AI_THREAD_BOUNDARY.mayDeclareEngineeringCorrectness).toBe(false);
  });
});
