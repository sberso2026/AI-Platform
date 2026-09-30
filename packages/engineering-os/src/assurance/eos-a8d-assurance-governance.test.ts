import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { ASSURANCE_RULE_CATALOG } from "./catalog";
import { completenessFromScan, conclusiveZeroConditionsAllowed } from "./completeness";
import { evaluateAssurance } from "./evaluate";
import { fingerprintAssuranceRuleset } from "./fingerprint";
import { crusherAssuranceFixture, withTruncatedScan } from "./fixture";
import { MemoryAssuranceStore } from "./memory-store";
import { reconcileAssuranceConditions } from "./reconcile";
import { composeConditionReviewThread } from "./review-composition";
import { MemoryReviewGateway } from "./review-gateway";
import { EngineeringAssuranceService } from "./service";
import { effectiveRuleCatalog, unknownRuleRejected } from "./settings";

function actorCommerce(action: "analysis.read" | "analysis.write" | "settings.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return {
    from() {
      return {
        insert: async () => ({ error: null }),
        select() {
          return this;
        },
        eq() {
          return this;
        },
        limit: async () => ({ data: [], error: null }),
      };
    },
  } as never;
}

function stubThread(graph = crusherAssuranceFixture().graph, truncated = false) {
  return {
    loadAuthorizedWorkspaceGraph: async () => graph,
    loadAuthorizedWorkspaceGraphMeta: async () => ({
      graph,
      truncated,
      linkCount: graph.links.length,
      linkLimit: truncated ? Math.max(1, graph.links.length) : 2000,
      remainingScopeUnknown: truncated,
    }),
  } as never;
}

describe("EOS-A8D Assurance governance, Review composition, completeness", () => {
  const write = actorCommerce("analysis.write");
  const read = actorCommerce("analysis.read");
  const admin = actorCommerce("settings.write");

  it("A/B/C — Create Review from Condition cites the package and creates zero Findings", async () => {
    const store = new MemoryAssuranceStore();
    const reviews = new MemoryReviewGateway();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, reviews);
    const detections = evaluateAssurance(crusherAssuranceFixture());
    const seeded = reconcileAssuranceConditions({
      existing: [],
      detections,
      now: "2026-09-30T08:00:00.000Z",
      newId: () => crypto.randomUUID(),
    });
    await store.upsertMany(seeded.conditions);
    const condition = seeded.conditions.find((row) => row.ruleId === "A8C-DEC-001")!;
    const created = await service.createReviewFromCondition(write, CRUSHER_FEED_TENANT, condition.id, {
      projectId: "proj-crusher-feed",
      name: "FEED Decision evidence review",
      documentIds: ["doc-feed-01"],
      actorId: "engineer-a1",
    });
    expect(created?.reviewPackage.id).toBeTruthy();
    expect(created?.condition?.status).toBe("UNDER_REVIEW");
    expect(created?.condition?.reviewPackageId).toBe(created?.reviewPackage.id);
    expect(created?.findings).toEqual([]);
    expect(created?.automaticFinding).toBe(false);
    expect(reviews.createdFindingCount).toBe(0);
    expect(reviews.findings).toHaveLength(0);
    const linked = await service.linkedReviews(read, CRUSHER_FEED_TENANT, condition.id);
    expect(linked.packages[0]?.id).toBe(created?.reviewPackage.id);
    expect(linked.thread?.path).toMatch(/assurance_condition:/);
    expect(linked.thread?.path).toMatch(/review_package:/);
    expect(linked.thread?.automaticFinding).toBe(false);
  });

  it("D/E — human Finding composes Condition → Review → Finding without Assurance owning Findings", async () => {
    const store = new MemoryAssuranceStore();
    const reviews = new MemoryReviewGateway();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, reviews);
    const detections = evaluateAssurance(crusherAssuranceFixture());
    const seeded = reconcileAssuranceConditions({ existing: [], detections, now: "2026-09-30T08:00:00.000Z" });
    await store.upsertMany(seeded.conditions);
    const condition = seeded.conditions.find((row) => row.ruleId === "A8C-REQ-001" && row.rootObjectId === "req-unallocated")!;
    const created = await service.createReviewFromCondition(write, CRUSHER_FEED_TENANT, condition.id, {
      projectId: "proj-crusher-feed",
      name: "Requirement allocation review",
      documentIds: ["doc-feed-01"],
      actorId: "engineer-a1",
    });
    const finding = reviews.addHumanFinding(created!.reviewPackage.id, "Human reviewer finding");
    const linked = await service.linkedReviews(read, CRUSHER_FEED_TENANT, condition.id);
    expect(linked.findings.map((row) => row.id)).toContain(finding.id);
    expect(linked.findings.every((row) => row.ownedBy === "engineering-review")).toBe(true);
    const composed = composeConditionReviewThread({
      condition: created!.condition!,
      citations: linked.citations,
      findings: linked.findings,
    });
    expect(composed.path).toMatch(/review_finding:/);
    expect(composed.findingOwnedBy).toBe("engineering-review");
  });

  it("denies cross-workspace and cross-tenant Review links and does not mint Findings", async () => {
    const store = new MemoryAssuranceStore();
    const reviews = new MemoryReviewGateway();
    reviews.addPackage({
      id: "pkg-other-ws",
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: "00000000-0000-0000-0000-000000000099",
      name: "Other workspace package",
    });
    reviews.addPackage({
      id: "pkg-other-tenant",
      tenantId: "00000000-0000-0000-0000-000000000098",
      workspaceId: CRUSHER_FEED_WORKSPACE,
      name: "Other tenant package",
    });
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, reviews);
    const detections = evaluateAssurance(crusherAssuranceFixture());
    const seeded = reconcileAssuranceConditions({ existing: [], detections, now: "2026-09-30T08:00:00.000Z" });
    await store.upsertMany(seeded.conditions);
    const condition = seeded.conditions[0]!;
    await expect(service.linkReview(write, CRUSHER_FEED_TENANT, condition.id, "pkg-other-ws", "engineer-a1")).rejects.toThrow(
      "cross_workspace_review_link_denied",
    );
    await expect(service.linkReview(write, CRUSHER_FEED_TENANT, condition.id, "pkg-other-tenant", "engineer-a1")).rejects.toThrow(
      "cross_tenant_review_link_denied",
    );
    await expect(service.linkReview(write, CRUSHER_FEED_TENANT, condition.id, "missing-pkg", "engineer-a1")).rejects.toThrow(
      "review_package_not_found",
    );
    expect(reviews.findings).toHaveLength(0);
  });

  it("F/G/H/I/J — disable retains history, is not engineering resolution, re-enable is idempotent", async () => {
    const store = new MemoryAssuranceStore();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, new MemoryReviewGateway());
    const input = crusherAssuranceFixture();
    const first = await service.evaluateFromInput(input);
    const req = first.conditions.find((row) => row.ruleId === "A8C-REQ-001" && row.rootObjectId === "req-unallocated")!;
    expect(req.status).toBe("OPEN");
    const opt = first.conditions.find((row) => row.ruleId === "A8D-OPT-001");
    expect(opt).toBeTruthy();

    await service.updateRuleSetting(admin, CRUSHER_FEED_TENANT, {
      ruleId: "A8C-REQ-001",
      ruleVersion: "v1",
      enabled: false,
      actorId: "admin-a",
    });
    const disabled = await service.evaluateFromInput(input);
    const retained = disabled.conditions.find((row) => row.fingerprint === req.fingerprint)!;
    expect(retained.status).toBe("OPEN");
    expect(retained.resolutionSource).not.toBe("CANONICAL_STATE_CHANGED");
    expect(disabled.detections.some((row) => row.ruleId === "A8C-REQ-001")).toBe(false);
    expect(disabled.conditions.filter((row) => row.fingerprint === req.fingerprint)).toHaveLength(1);

    await service.updateRuleSetting(admin, CRUSHER_FEED_TENANT, {
      ruleId: "A8C-REQ-001",
      ruleVersion: "v1",
      enabled: true,
      actorId: "admin-a",
    });
    const reenabled = await service.evaluateFromInput(input);
    expect(reenabled.conditions.filter((row) => row.fingerprint === req.fingerprint)).toHaveLength(1);
    expect(reenabled.created).toBe(0);
    expect(reenabled.conditions.find((row) => row.fingerprint === req.fingerprint)?.status).toBe("OPEN");
  });

  it("rule settings are version-aware and unknown IDs fail closed", async () => {
    expect(unknownRuleRejected("A8C-DEC-001", "v1")).toBe(false);
    expect(unknownRuleRejected("A8C-DEC-001", "v2")).toBe(true);
    expect(unknownRuleRejected("MADE-UP-RULE", "v1")).toBe(true);
    const catalog = effectiveRuleCatalog([
      {
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        ruleId: "A8C-DEC-001",
        ruleVersion: "v1",
        enabled: false,
        configuredAt: "2026-09-30T08:00:00.000Z",
      },
    ]);
    expect(catalog.find((row) => row.ruleId === "A8C-DEC-001" && row.ruleVersion === "v1")?.effectiveEnabled).toBe(false);
    expect(catalog.find((row) => row.ruleId === "A8D-OPT-001")?.effectiveEnabled).toBe(true);
    const store = new MemoryAssuranceStore();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, new MemoryReviewGateway());
    await expect(
      service.updateRuleSetting(admin, CRUSHER_FEED_TENANT, {
        ruleId: "A8C-DEC-001",
        ruleVersion: "v2",
        enabled: false,
        actorId: "admin-a",
      }),
    ).rejects.toThrow("unknown_assurance_rule");
  });

  it("ordinary engineers cannot mutate rule governance", async () => {
    const store = new MemoryAssuranceStore();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, new MemoryReviewGateway());
    await expect(
      service.updateRuleSetting(write, CRUSHER_FEED_TENANT, {
        ruleId: "A8C-DEC-001",
        ruleVersion: "v1",
        enabled: false,
        actorId: "engineer-a1",
      }),
    ).rejects.toThrow();
    const rules = await service.effectiveRules(read, CRUSHER_FEED_TENANT);
    expect(rules).toHaveLength(ASSURANCE_RULE_CATALOG.length);
  });

  it("K/L/M — PARTIAL evaluation is explicit, never conclusive-zero, never auto-resolves unseen OPEN conditions", async () => {
    const store = new MemoryAssuranceStore();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, new MemoryReviewGateway());
    const complete = await service.evaluateFromInput(crusherAssuranceFixture());
    expect(complete.completeness).toBe("COMPLETE");
    expect(complete.conclusiveZeroConditions).toBe(false);
    const unseen = complete.conditions.find((row) => row.ruleId === "A8C-CFG-001")!;
    expect(unseen.status).toBe("OPEN");

    const truncatedInput = {
      ...withTruncatedScan(crusherAssuranceFixture(), 1),
      graph: {
        nodes: crusherAssuranceFixture().graph.nodes.filter((node) => node.objectId !== "ci-orphan"),
        links: crusherAssuranceFixture().graph.links.slice(0, 1),
      },
    };
    const partial = await service.evaluateFromInput(truncatedInput);
    expect(partial.completeness).toBe("PARTIAL");
    expect(partial.truncated).toBe(true);
    expect(partial.conclusiveZeroConditions).toBe(false);
    expect(conclusiveZeroConditionsAllowed("PARTIAL")).toBe(false);
    const afterPartial = partial.conditions.find((row) => row.fingerprint === unseen.fingerprint)!;
    expect(afterPartial.status).toBe("OPEN");
    expect(afterPartial.resolutionSource).not.toBe("CANONICAL_STATE_CHANGED");
  });

  it("COMPLETE evaluation with no detections may conclude zero conditions; PARTIAL empty may not", () => {
    expect(completenessFromScan({ truncated: false }).completeness).toBe("COMPLETE");
    expect(completenessFromScan({ truncated: true }).completeness).toBe("PARTIAL");
    expect(completenessFromScan({ failed: true }).completeness).toBe("FAILED");
    expect(conclusiveZeroConditionsAllowed("COMPLETE")).toBe(true);
    expect(conclusiveZeroConditionsAllowed("PARTIAL")).toBe(false);
    expect(conclusiveZeroConditionsAllowed("FAILED")).toBe(false);
  });

  it("records a deterministic ruleset fingerprint that changes when a versioned rule is disabled", () => {
    const all = fingerprintAssuranceRuleset(ASSURANCE_RULE_CATALOG.map((rule) => rule.ruleId));
    const withoutReq = fingerprintAssuranceRuleset(
      ASSURANCE_RULE_CATALOG.filter((rule) => rule.ruleId !== "A8C-REQ-001").map((rule) => rule.ruleId),
    );
    expect(all).toHaveLength(64);
    expect(all).not.toBe(withoutReq);
  });

  it("Review completion alone does not resolve the Assurance Condition", async () => {
    const store = new MemoryAssuranceStore();
    const reviews = new MemoryReviewGateway();
    const service = new EngineeringAssuranceService(stubClient(), stubThread(), store, reviews);
    const detections = evaluateAssurance(crusherAssuranceFixture());
    const seeded = reconcileAssuranceConditions({ existing: [], detections, now: "2026-09-30T08:00:00.000Z" });
    await store.upsertMany(seeded.conditions);
    const condition = seeded.conditions.find((row) => row.ruleId === "A8C-ANL-001")!;
    const created = await service.createReviewFromCondition(write, CRUSHER_FEED_TENANT, condition.id, {
      projectId: "proj-crusher-feed",
      name: "Analysis review",
      documentIds: ["doc-feed-01"],
      actorId: "engineer-a1",
    });
    reviews.packages[0]!.status = "completed";
    const again = await service.evaluateFromInput(crusherAssuranceFixture());
    const still = again.conditions.find((row) => row.fingerprint === condition.fingerprint)!;
    expect(still.status).toBe("UNDER_REVIEW");
    expect(still.reviewPackageId).toBe(created?.reviewPackage.id);
  });
});
