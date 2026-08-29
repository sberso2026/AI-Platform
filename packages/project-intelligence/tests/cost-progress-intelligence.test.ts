import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  COST_PROGRESS_INTELLIGENCE_IMPLEMENTED,
  FORBIDDEN_COST_PROGRESS_ENGINE_TOKENS,
  InMemoryCommandCentreControlsPort,
  InMemoryCommandCentreCorePort,
  InMemoryCommandCentreKnowledgePort,
  InMemoryCostProgressIntelligencePort,
  PI_COST_MUTATION_ENABLED,
  PI_PROGRESS_MUTATION_ENABLED,
  PROJECT_HEALTH_DIMENSIONS,
  ProjectCommandCentreService,
  ProjectCostProgressIntelligenceService,
  SCHEMA_CHANGED,
  costSliceFrom,
  duplicateCostEngineDetected,
  duplicateEarnedValueEngineDetected,
  duplicateProgressEngineDetected,
  duplicateProjectControlsEngineDetected,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  interpretCostProgressIntelligence,
  progressSliceFrom,
  publishedControls,
  publishedCostEvidence,
  publishedCostState,
  publishedProgressAssessment,
  sampleProjectIdentity,
  snapshotFromCostProgress,
} from "../src";
import type { AccessContext } from "../src/security/access-guard";

const generatedAt = "2026-08-30T00:00:00.000Z";
const staleAt = "2026-06-01T00:00:00.000Z";

const access: AccessContext = {
  tenantId: "tenant",
  workspaceId: "workspace",
  principalId: "user",
  tenantActive: true,
  workspaceAssigned: true,
  subscriptionActive: true,
  licenceActive: true,
  engineeringOsInstalled: true,
  applicationInstalled: true,
  seatAssigned: true,
  roleAssigned: true,
  featureEnabled: true,
  permissions: ["read"],
};

function greenCore() {
  return {
    ...emptyCoreSnapshot(),
    project: { projectId: "p1", storesCanonicalCopy: false as const },
    risks: { bound: true as const, items: [] },
    issues: { bound: true as const, items: [] },
    decisions: { bound: true as const, items: [] },
    actions: { bound: true as const, items: [] },
    technicalQueries: { bound: true as const, items: [] },
    documents: { bound: true as const, items: [] },
    assets: { bound: true as const, items: [] },
  };
}

function greenKnowledge() {
  return {
    findings: { bound: true as const, items: [] },
    inspectionFindings: { bound: true as const, items: [] },
  };
}

function interpret(costLatest: Parameters<typeof costSliceFrom>[0], progressLatest: Parameters<typeof progressSliceFrom>[0], extra?: {
  cost?: Parameters<typeof costSliceFrom>[1];
  progress?: Parameters<typeof progressSliceFrom>[1];
}) {
  return interpretCostProgressIntelligence({
    projectId: "p1",
    tenantId: "tenant",
    workspaceId: "workspace",
    generatedAt,
    snapshot: snapshotFromCostProgress(
      costSliceFrom(costLatest, extra?.cost),
      progressSliceFrom(progressLatest, extra?.progress),
    ),
  });
}

describe("PI-3 cost and progress intelligence", () => {
  it("maps published cost postures to GREEN, AMBER, and RED", () => {
    expect(
      interpret(publishedCostState({ stateId: "c1", projectId: "p1", posture: "within_tolerance" }), null).cost.health
        .classification,
    ).toBe("GREEN");
    expect(
      interpret(publishedCostState({ stateId: "c1", projectId: "p1", posture: "under" }), null).cost.health
        .classification,
    ).toBe("GREEN");
    expect(
      interpret(publishedCostState({ stateId: "c1", projectId: "p1", posture: "attention_required" }), null).cost.health
        .classification,
    ).toBe("AMBER");
    expect(
      interpret(publishedCostState({ stateId: "c1", projectId: "p1", posture: "over" }), null).cost.health.classification,
    ).toBe("RED");
  });

  it("maps missing cost to UNKNOWN", () => {
    const view = interpret(null, null);
    expect(view.cost.health.classification).toBe("UNKNOWN");
    expect(view.cost.availability).toBe("no_data");
  });

  it("maps published progress GREEN and AMBER and does not invent RED", () => {
    expect(
      interpret(null, publishedProgressAssessment({ assessmentId: "pr1", projectId: "p1", trendDirection: "stable" }))
        .progress.health.classification,
    ).toBe("GREEN");
    const amber = interpret(
      null,
      publishedProgressAssessment({ assessmentId: "pr1", projectId: "p1", trendDirection: "declining" }),
    );
    expect(amber.progress.health.classification).toBe("AMBER");
    expect(amber.progress.health.classification).not.toBe("RED");
  });

  it("maps missing progress to UNKNOWN", () => {
    const view = interpret(null, null);
    expect(view.progress.health.classification).toBe("UNKNOWN");
  });

  it("surfaces published cost variance attribution without inventing amounts", () => {
    const view = interpret(
      publishedCostState({
        stateId: "c1",
        projectId: "p1",
        posture: "over",
        varianceAttribution: "unexplained_movement",
        currencyCode: "AUD",
      }),
      null,
    );
    expect(view.cost.metrics.varianceAttribution).toBe("unexplained_movement");
    expect(view.cost.metrics.monetaryVariancePublished).toBe(false);
    expect(view.cost.attentionItems.some((item) => item.reasonCode === "published_cost_variance_attribution")).toBe(
      true,
    );
    expect(view.cost.money.currencyCode).toBe("AUD");
  });

  it("surfaces published progress trend and indicated completion without calculating plan variance", () => {
    const view = interpret(
      null,
      publishedProgressAssessment({
        assessmentId: "pr1",
        projectId: "p1",
        indicatedCompletion: 0.42,
        trendDirection: "declining",
      }),
    );
    expect(view.progress.metrics.indicatedCompletion).toBe(0.42);
    expect(view.progress.metrics.plannedProgressPublished).toBe(false);
    expect(view.progress.metrics.progressVarianceVersusPlanPublished).toBe(false);
    expect(view.progress.metrics.summary).toContain("0.42");
  });

  it("leaves unsupported earned-value metrics unavailable", () => {
    const view = interpret(
      publishedCostState({ stateId: "c1", projectId: "p1" }),
      publishedProgressAssessment({ assessmentId: "pr1", projectId: "p1" }),
    );
    expect(view.earnedValue).toEqual({
      published: false,
      ev: "unavailable",
      pv: "unavailable",
      ac: "unavailable",
      cpi: "unavailable",
      spi: "unavailable",
      eac: "unavailable",
      etc: "unavailable",
      vac: "unavailable",
      limitation: "earned_value_metrics_not_published",
    });
  });

  it("preserves currency and does not aggregate incompatible currencies", () => {
    const mixed = interpret(
      publishedCostState({ stateId: "c1", projectId: "p1", currencyCode: "AUD" }),
      null,
      {
        cost: {
          evidence: [
            publishedCostEvidence({
              evidenceId: "e1",
              costStateId: "c1",
              currencyCode: "USD",
            }),
          ],
        },
      },
    );
    expect(mixed.cost.money.currencyCode).toBe("AUD");
    expect(mixed.cost.money.compatible).toBe(false);
    expect(mixed.cost.money.mixedCurrenciesAggregated).toBe(false);
    expect(mixed.cost.money.exchangeRateInferred).toBe(false);
    expect(mixed.cost.money.amountsPublished).toBe(false);
  });

  it("classifies stale cost and progress as STALE", () => {
    const view = interpret(
      publishedCostState({ stateId: "c1", projectId: "p1", publishedAt: staleAt, assessedAt: staleAt }),
      publishedProgressAssessment({
        assessmentId: "pr1",
        projectId: "p1",
        publishedAt: staleAt,
        assessedAt: staleAt,
      }),
    );
    expect(view.cost.dataQuality.freshness).toBe("STALE");
    expect(view.progress.dataQuality.freshness).toBe("STALE");
    expect(view.cost.attentionItems.some((item) => item.reasonCode === "stale_cost_data")).toBe(true);
    expect(view.progress.attentionItems.some((item) => item.reasonCode === "stale_progress_data")).toBe(true);
  });

  it("emits a consistency signal only when both published sources exist", () => {
    const missing = interpret(
      publishedCostState({ stateId: "c1", projectId: "p1", posture: "over" }),
      null,
    );
    expect(missing.consistency.available).toBe(false);

    const inconsistent = interpret(
      publishedCostState({ stateId: "c1", projectId: "p1", posture: "over" }),
      publishedProgressAssessment({
        assessmentId: "pr1",
        projectId: "p1",
        band: "early",
        trendDirection: "declining",
      }),
    );
    expect(inconsistent.consistency.available).toBe(true);
    if (inconsistent.consistency.available) {
      expect(inconsistent.consistency.consistent).toBe(false);
      expect(inconsistent.consistency.explanation).toContain("Cost and progress signals are inconsistent");
    }

    const aligned = interpret(
      publishedCostState({ stateId: "c1", projectId: "p1", posture: "within_tolerance" }),
      publishedProgressAssessment({ assessmentId: "pr1", projectId: "p1", trendDirection: "stable" }),
    );
    expect(aligned.consistency.available).toBe(true);
    if (aligned.consistency.available) {
      expect(aligned.consistency.consistent).toBe(true);
      expect(aligned.consistency.explanation).not.toContain("caused");
    }
  });

  it("preserves evidence references without copying canonical records", () => {
    const view = interpret(publishedCostState({ stateId: "cost-9", projectId: "p1" }), null);
    expect(view.cost.evidenceReferences[0]).toEqual(
      expect.objectContaining({
        sourceDomain: "project_controls",
        entityType: "cost_state",
        entityId: "cost-9",
        storesCanonicalCopy: false,
      }),
    );
  });

  it("isolates cost failure from progress and progress failure from cost", async () => {
    const costFail = interpretCostProgressIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFromCostProgress(
        costSliceFrom(null, { availability: "error" }),
        progressSliceFrom(publishedProgressAssessment({ assessmentId: "pr1", projectId: "p1" })),
      ),
    });
    expect(costFail.cost.availability).toBe("error");
    expect(costFail.progress.health.classification).toBe("GREEN");

    const progressFail = interpretCostProgressIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFromCostProgress(
        costSliceFrom(publishedCostState({ stateId: "c1", projectId: "p1" })),
        progressSliceFrom(null, { availability: "error" }),
      ),
    });
    expect(progressFail.progress.availability).toBe("error");
    expect(progressFail.cost.health.classification).toBe("GREEN");
  });

  it("denies cross-tenant and cross-workspace through Command Centre identity checks", async () => {
    const service = new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity({ tenantId: "other-tenant" }), greenCore()),
      controls: new InMemoryCommandCentreControlsPort(emptyControlsSnapshot()),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
    });
    await expect(service.compose({ projectId: "p1", context: access, generatedAt })).rejects.toMatchObject({
      code: "project_forbidden",
    });
  });

  it("works with AI disabled and isolates a throwing cost/progress source", async () => {
    const view = await new ProjectCostProgressIntelligenceService(
      new InMemoryCostProgressIntelligencePort(undefined, "throw"),
    ).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.aiRequired).toBe(false);
    expect(view.mutatesCost).toBe(false);
    expect(view.mutatesProgress).toBe(false);
    expect(view.cost.availability).toBe("error");
    expect(view.progress.availability).toBe("error");

    const cc = await new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity(), greenCore()),
      controls: new InMemoryCommandCentreControlsPort({
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
      }),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
      costProgress: new InMemoryCostProgressIntelligencePort(
        snapshotFromCostProgress(
          costSliceFrom(null, { availability: "error" }),
          progressSliceFrom(publishedProgressAssessment({ assessmentId: "pr1", projectId: "p1" })),
        ),
      ),
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(cc.scheduleIntelligence.health.classification).toBe("GREEN");
    expect(cc.costProgressIntelligence.cost.availability).toBe("error");
    expect(cc.costProgressIntelligence.progress.health.classification).toBe("GREEN");
    expect(cc.healthDimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
  });

  it("fails closed on forbidden dedicated cost/progress reads", async () => {
    await expect(
      new ProjectCostProgressIntelligenceService(
        new InMemoryCostProgressIntelligencePort(
          snapshotFromCostProgress(
            costSliceFrom(null, { availability: "forbidden" }),
            progressSliceFrom(null),
          ),
        ),
      ).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden" });
  });

  it("does not duplicate Project Controls cost, progress, or earned-value engines", () => {
    expect(duplicateProjectControlsEngineDetected).toBe(false);
    expect(duplicateCostEngineDetected).toBe(false);
    expect(duplicateProgressEngineDetected).toBe(false);
    expect(duplicateEarnedValueEngineDetected).toBe(false);
    expect(PI_COST_MUTATION_ENABLED).toBe(false);
    expect(PI_PROGRESS_MUTATION_ENABLED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(COST_PROGRESS_INTELLIGENCE_IMPLEMENTED).toBe(true);
    const dir = resolve(__dirname, "../src/cost-progress-intelligence");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts") || file === "ownership.ts") continue;
      const source = readFileSync(resolve(dir, file), "utf8");
      expect(source).not.toMatch(/@rtb\/project-controls/);
      for (const token of FORBIDDEN_COST_PROGRESS_ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
    }
  });
});
