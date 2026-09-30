import { describe, expect, it } from "vitest";
import { DISCOVERED_DEPENDENCY } from "../control-intelligence/invariants";
import { ASSURANCE_RULE_CATALOG } from "./catalog";
import { evaluateAssurance } from "./evaluate";
import { fingerprintAssuranceCondition } from "./fingerprint";
import {
  crusherAssuranceFixture,
  withDecisionEvidence,
  withInterfaceInformationStatus,
  withRequirementAllocated,
} from "./fixture";
import { MemoryAssuranceStore } from "./memory-store";
import { reconcileAssuranceConditions } from "./reconcile";
import { FORBIDDEN_ASSURANCE_SCORE_NAMES, summarizeAssuranceConditions } from "./summary";
import { AI_ASSURANCE_BOUNDARY, ASSURANCE_AUTHORITY } from "./types";

function byRule(rows: ReturnType<typeof evaluateAssurance>, ruleId: string) {
  return rows.filter((row) => row.ruleId === ruleId);
}

describe("EOS-A8C Engineering Assurance Intelligence", () => {
  const input = crusherAssuranceFixture();

  it("detects the bounded Crusher Expansion FEED certification cases", () => {
    const detections = evaluateAssurance(input);
    expect(byRule(detections, "A8C-REQ-001").some((row) => row.rootObjectId === "req-unallocated")).toBe(true);
    expect(byRule(detections, "A8C-REQ-001").some((row) => row.rootObjectId === "req-draft-unallocated")).toBe(false);
    expect(byRule(detections, "A8C-DEC-001").some((row) => row.rootObjectId === "dec-no-evidence")).toBe(true);
    expect(byRule(detections, "A8C-DEC-001").some((row) => row.rootObjectId === "dec-informational")).toBe(false);
    const staleDecision = byRule(detections, "A8C-DEC-002").find((row) => row.rootObjectId === "dec-support-frame");
    expect(staleDecision).toBeTruthy();
    expect(staleDecision?.digitalThreadPath).toMatch(/decision/i);
    expect(staleDecision?.evidencePath.some((step) => step.objectType === "analysis_result")).toBe(true);
    expect(staleDecision?.evidencePath.some((step) => String(step.note ?? "").includes("STALE_REQUIREMENT_CHANGED"))).toBe(true);
    expect(byRule(detections, "A8C-IFC-001").some((row) => row.conditionType === "CROSS_DISCIPLINE_INFORMATION_GAP")).toBe(true);
    expect(byRule(detections, "A8C-CHG-001")[0]?.conditionType).toBe("UNRESOLVED_CHANGE_IMPACT_CANDIDATE");
    expect(byRule(detections, "A8C-CFG-001").some((row) => row.rootObjectId === "ci-orphan")).toBe(true);
    expect(byRule(detections, "A8C-ANL-001").some((row) => row.rootObjectId === "res-unreviewed")).toBe(true);
    expect(byRule(detections, "A8C-ANL-002").some((row) => row.rootObjectId === "res-synthetic-struct")).toBe(true);
    expect(byRule(detections, "A8C-AST-001").some((row) => row.rootObjectId === "asm-expired")).toBe(true);
    expect(detections.every((row) => row.fingerprint.length === 64)).toBe(true);
    expect(detections.some((row) => row.rootObjectId === "ar-structural-blocked" && row.ruleId.startsWith("A8C"))).toBe(false);
  });

  it("does not create confirmed Impact, findings, issues, or universal scores", () => {
    const detections = evaluateAssurance(input);
    const change = byRule(detections, "A8C-CHG-001")[0];
    expect(change?.explanation).toMatch(/not confirmed impacts/i);
    expect(input.graph.nodes.some((node) => node.objectType === "impact" && node.status === "confirmed")).toBe(false);
    expect(DISCOVERED_DEPENDENCY).toBe("DISCOVERED_DEPENDENCY");
    const summary = summarizeAssuranceConditions([]);
    expect(summary.universalAssuranceScore).toBe(false);
    expect(summary.engineeringQualityScore).toBe(false);
    expect(FORBIDDEN_ASSURANCE_SCORE_NAMES.length).toBeGreaterThan(3);
    expect(AI_ASSURANCE_BOUNDARY.mayCreateAuthoritativeConditions).toBe(false);
    expect(AI_ASSURANCE_BOUNDARY.mayResolveConditions).toBe(false);
    expect(AI_ASSURANCE_BOUNDARY.mayApproveEngineering).toBe(false);
    expect(AI_ASSURANCE_BOUNDARY.mayDeclareCompliance).toBe(false);
    expect(AI_ASSURANCE_BOUNDARY.mayConfirmChangeImpact).toBe(false);
    expect(ASSURANCE_AUTHORITY.conditionsAreNotReviewFindings).toBe(true);
    expect(ASSURANCE_AUTHORITY.conditionsAreNotIssues).toBe(true);
    expect(ASSURANCE_AUTHORITY.platformKgIsNotAssuranceAuthority).toBe(true);
  });

  it("is idempotent and auto-resolves when canonical state changes without duplicating fingerprints", () => {
    const first = evaluateAssurance(input);
    const second = evaluateAssurance(input);
    expect(first.map((row) => row.fingerprint).sort().join()).toBe(second.map((row) => row.fingerprint).sort().join());
    const storePass = reconcileAssuranceConditions({
      existing: [],
      detections: first,
      now: "2026-09-30T00:00:00.000Z",
      newId: () => "id-1",
    });
    const again = reconcileAssuranceConditions({
      existing: storePass.conditions,
      detections: second,
      now: "2026-09-30T01:00:00.000Z",
    });
    expect(again.created).toBe(0);
    expect(again.conditions.filter((row) => row.status === "OPEN").length).toBe(storePass.conditions.length);
    expect(again.conditions.every((row) => row.detectedAt === "2026-09-30T00:00:00.000Z")).toBe(true);

    const allocated = evaluateAssurance(withRequirementAllocated(input));
    const afterAlloc = reconcileAssuranceConditions({
      existing: again.conditions,
      detections: allocated,
      now: "2026-09-30T02:00:00.000Z",
    });
    const req = afterAlloc.conditions.find((row) => row.rootObjectId === "req-unallocated" && row.ruleId === "A8C-REQ-001");
    expect(req?.status).toBe("RESOLVED");
    expect(req?.resolutionSource).toBe("CANONICAL_STATE_CHANGED");
    expect(afterAlloc.conditions.filter((row) => row.rootObjectId === "req-unallocated" && row.ruleId === "A8C-REQ-001")).toHaveLength(1);

    const evidenced = evaluateAssurance(withDecisionEvidence(input));
    const afterEvidence = reconcileAssuranceConditions({
      existing: afterAlloc.conditions,
      detections: evidenced,
      now: "2026-09-30T03:00:00.000Z",
    });
    const decision = afterEvidence.conditions.find((row) => row.rootObjectId === "dec-no-evidence" && row.ruleId === "A8C-DEC-001");
    expect(decision?.status).toBe("RESOLVED");
  });

  it("reopens the same fingerprint when interface information becomes incomplete again", () => {
    const open = evaluateAssurance(input);
    const stored = reconcileAssuranceConditions({ existing: [], detections: open, now: "2026-09-30T00:00:00.000Z" });
    const provided = evaluateAssurance(withInterfaceInformationStatus(input, "PROVIDED"));
    const resolved = reconcileAssuranceConditions({
      existing: stored.conditions,
      detections: provided,
      now: "2026-09-30T04:00:00.000Z",
    });
    const iface = resolved.conditions.find((row) => row.ruleId === "A8C-IFC-001");
    expect(iface?.status).toBe("RESOLVED");
    const superseded = evaluateAssurance(withInterfaceInformationStatus(input, "SUPERSEDED"));
    const reopened = reconcileAssuranceConditions({
      existing: resolved.conditions,
      detections: superseded,
      now: "2026-09-30T05:00:00.000Z",
    });
    const same = reopened.conditions.find((row) => row.ruleId === "A8C-IFC-001");
    expect(same?.status).toBe("OPEN");
    expect(same?.id).toBe(iface?.id);
    expect(same?.detectedAt).toBe(iface?.detectedAt);
    expect(reopened.conditions.filter((row) => row.ruleId === "A8C-IFC-001")).toHaveLength(1);
  });

  it("does not reset human disposition on repeated evaluation", () => {
    const detections = evaluateAssurance(input);
    const initial = reconcileAssuranceConditions({ existing: [], detections, now: "2026-09-30T00:00:00.000Z" });
    const justified = initial.conditions.map((row, index) =>
      index === 0
        ? {
            ...row,
            status: "ACCEPTED_WITH_JUSTIFICATION" as const,
            disposition: "ACCEPT" as const,
            dispositionBy: "engineer-a1",
            dispositionRationale: "FEED residual accepted by discipline lead",
          }
        : row,
    );
    const again = reconcileAssuranceConditions({
      existing: justified,
      detections,
      now: "2026-09-30T06:00:00.000Z",
    });
    expect(again.conditions[0]?.status).toBe("ACCEPTED_WITH_JUSTIFICATION");
    expect(again.conditions[0]?.dispositionRationale).toBe("FEED residual accepted by discipline lead");
    expect(again.conditions[0]?.detectedAt).toBe(justified[0]?.detectedAt);
  });

  it("evaluates the synthetic workspace in bounded time without a universal score", () => {
    const started = Date.now();
    const detections = evaluateAssurance(input);
    const durationMs = Date.now() - started;
    expect(durationMs).toBeLessThan(2000);
    expect(detections.length).toBeGreaterThan(5);
    expect(summarizeAssuranceConditions([]).universalAssuranceScore).toBe(false);
  });

  it("fingerprints from identity, not display text", () => {
    const a = fingerprintAssuranceCondition({
      ruleId: "A8C-REQ-001",
      workspaceId: "ws",
      rootObjectType: "requirement",
      rootObjectId: "req-unallocated",
    });
    const b = fingerprintAssuranceCondition({
      ruleId: "A8C-REQ-001",
      workspaceId: "ws",
      rootObjectType: "requirement",
      rootObjectId: "req-unallocated",
    });
    expect(a).toBe(b);
    expect(ASSURANCE_RULE_CATALOG).toHaveLength(9);
  });

  it("memory store upserts by fingerprint without deleting history", async () => {
    const store = new MemoryAssuranceStore();
    const detections = evaluateAssurance(input);
    const first = reconcileAssuranceConditions({ existing: [], detections, now: "2026-09-30T00:00:00.000Z" });
    await store.upsertMany(first.conditions);
    const resolved = reconcileAssuranceConditions({
      existing: await store.list(input.tenantId, input.workspaceId),
      detections: evaluateAssurance(withRequirementAllocated(input)),
      now: "2026-09-30T07:00:00.000Z",
    });
    await store.upsertMany(resolved.conditions);
    const listed = await store.list(input.tenantId, input.workspaceId);
    expect(listed.some((row) => row.rootObjectId === "req-unallocated" && row.status === "RESOLVED")).toBe(true);
    expect(listed.length).toBe(resolved.conditions.length);
  });
});
