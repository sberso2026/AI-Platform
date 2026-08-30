import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FORECAST_INTELLIGENCE_IMPLEMENTED,
  FORBIDDEN_FORECAST_ENGINE_TOKENS,
  InMemoryCommandCentreControlsPort,
  InMemoryCommandCentreCorePort,
  InMemoryCommandCentreKnowledgePort,
  InMemoryForecastIntelligencePort,
  PI_5_IMPLEMENTATION_FLAG_SEMANTICS_RECONCILED,
  PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED,
  PI_50_RECORD_LIMIT_AFFECTS_FORECASTING,
  PI_7_AI_PROJECT_ANALYST_READY,
  PI_HOSTED_LIST_COMPLETENESS_MODEL,
  PI_FORECAST_MUTATION_ENABLED,
  PI_PREDICTIVE_MODEL_IMPLEMENTED,
  PROJECT_HEALTH_DIMENSIONS,
  ProjectCommandCentreService,
  ProjectForecastIntelligenceService,
  QUERY_DECISION_INTELLIGENCE_IMPLEMENTED,
  SCHEMA_CHANGED,
  duplicateCostEngineDetected,
  duplicateForecastEngineDetected,
  duplicateProgressEngineDetected,
  duplicateProjectControlsEngineDetected,
  duplicateScheduleEngineDetected,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  forecastSliceFrom,
  interpretForecastIntelligence,
  publishedControls,
  publishedCurrentPosture,
  publishedForecastEvidence,
  publishedForecastState,
  sampleProjectIdentity,
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

function interpret(
  latest: Parameters<typeof publishedForecastState>[0] | null,
  extra?: Parameters<typeof forecastSliceFrom>[1],
) {
  return interpretForecastIntelligence({
    projectId: "p1",
    tenantId: "tenant",
    workspaceId: "workspace",
    generatedAt,
    snapshot: forecastSliceFrom(
      latest ? publishedForecastState(latest) : null,
      extra,
    ),
  });
}

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

describe("PI-5 implementation flag semantics", () => {
  it("keeps implementation state distinct from the PI-4 phase-ownership freeze", () => {
    expect(PI_5_IMPLEMENTATION_FLAG_SEMANTICS_RECONCILED).toBe(true);
    expect(QUERY_DECISION_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED).toBe(false);
  });
});

describe("PI-6 forecast intelligence", () => {
  it("passes published qualitative forecast through without inventing quantitative values", () => {
    const view = interpret({
      stateId: "f1",
      projectId: "p1",
      posture: "stable",
      confidenceClass: "medium",
      dataSufficiency: "sufficient",
      contributingContributors: [
        {
          contributorKey: "schedule_intelligence",
          stateId: "s1",
          status: "published",
          abstained: false,
          postureOrIndication: "stable",
        },
      ],
    });
    expect(view.readiness).toBe("QUALITATIVE_ONLY");
    expect(view.publicationKind).toBe("QUALITATIVE_PUBLISHED");
    expect(view.health.posture).toBe("stable");
    expect(view.unsupported.completionDate).toBe("unavailable");
    expect(view.unsupported.monetaryAmount).toBe("unavailable");
    expect(view.unsupported.probability).toBe("unavailable");
    expect(view.domains.find((row) => row.domain === "completion")?.publicationKind).toBe("UNSUPPORTED");
    expect(view.domains.find((row) => row.domain === "schedule")?.publicationKind).toBe("QUALITATIVE_PUBLISHED");
    expect(view.dataQuality.limitations).toContain("probability_not_published");
    expect(view.dataQuality.confidenceClass).toBe("medium");
  });

  it("maps missing forecast to NOT_PRODUCED and does not treat it as healthy", () => {
    const view = interpret(null);
    expect(view.readiness).toBe("NOT_PRODUCED");
    expect(view.health.classification).toBe("UNKNOWN");
    expect(view.health.classification).not.toBe("GREEN");
    expect(view.dataQuality.forecastProduced).toBe(false);
    expect(view.attentionItems.some((item) => item.reasonCode === "forecast_not_produced")).toBe(true);
  });

  it("maps abstained or insufficient data away from available/healthy", () => {
    const view = interpret({
      stateId: "f-abs",
      projectId: "p1",
      abstained: true,
      posture: "unknown",
      dataSufficiency: "insufficient",
    });
    expect(view.readiness).toBe("INSUFFICIENT_DATA");
    expect(view.health.classification).toBe("UNKNOWN");
    expect(view.attentionItems.some((item) => item.reasonCode === "forecast_insufficient_data")).toBe(true);
  });

  it("surfaces stale forecast and does not treat it as current", () => {
    const view = interpret({
      stateId: "f-stale",
      projectId: "p1",
      posture: "favourable",
      publishedAt: staleAt,
      assessedAt: staleAt,
    });
    expect(view.readiness).toBe("STALE");
    expect(view.dataQuality.freshness).toBe("STALE");
    expect(view.attentionItems.some((item) => item.reasonCode === "forecast_stale")).toBe(true);
  });

  it("requires at least two comparable published outputs for trend", () => {
    const one = interpret({ stateId: "f1", projectId: "p1", posture: "stable", version: 1 });
    expect(one.trend.available).toBe(false);

    const two = interpret(
      { stateId: "f2", projectId: "p1", posture: "deteriorating", version: 2, publishedAt: "2026-08-20T00:00:00.000Z" },
      {
        history: [
          publishedForecastState({
            stateId: "f2",
            projectId: "p1",
            posture: "deteriorating",
            version: 2,
            publishedAt: "2026-08-20T00:00:00.000Z",
          }),
          publishedForecastState({
            stateId: "f1",
            projectId: "p1",
            posture: "stable",
            version: 1,
            publishedAt: "2026-08-01T00:00:00.000Z",
          }),
        ],
      },
    );
    expect(two.trend.available).toBe(true);
    expect(two.trend.direction).toBe("worsened");
    expect(two.attentionItems.some((item) => item.reasonCode === "forecast_deterioration")).toBe(true);
  });

  it("preserves scenario identity as unpublished and does not merge scenarios", () => {
    const view = interpret({ stateId: "f1", projectId: "p1", scenarioIdPublished: false });
    expect(view.unsupported.scenarioSelection).toBe("unavailable");
    expect(view.dataQuality.limitations).toContain("scenario_identity_not_published");
  });

  it("emits cross-domain observations only when both sources exist", () => {
    const linked = interpret(
      { stateId: "f1", projectId: "p1", posture: "deteriorating" },
      {
        currentStates: [
          publishedCurrentPosture({ domain: "schedule", posture: "at_risk", assessmentId: "s1" }),
          publishedCurrentPosture({ domain: "cost", posture: "within_tolerance", assessmentId: "c1" }),
        ],
      },
    );
    expect(linked.observations.some((row) => row.reasonCode === "current_schedule_concern_and_forecast_deteriorating")).toBe(
      true,
    );
    expect(linked.observations.some((row) => row.reasonCode === "current_cost_stable_and_forecast_worsening")).toBe(true);

    const unlinked = interpret({ stateId: "f1", projectId: "p1", posture: "deteriorating" });
    expect(unlinked.observations).toHaveLength(0);
  });

  it("isolates forecast source failure from Command Centre health dimensions", async () => {
    const view = await new ProjectForecastIntelligenceService(
      new InMemoryForecastIntelligencePort(undefined, "throw"),
    ).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.aiRequired).toBe(false);
    expect(view.mutatesForecast).toBe(false);
    expect(view.availability).toBe("error");

    const cc = await new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity(), greenCore()),
      controls: new InMemoryCommandCentreControlsPort({
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
      }),
      knowledge: new InMemoryCommandCentreKnowledgePort({
        findings: { bound: true, items: [] },
        inspectionFindings: { bound: true, items: [] },
      }),
      forecast: new InMemoryForecastIntelligencePort(undefined, "throw"),
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(cc.forecastIntelligence.availability).toBe("no_data");
    expect(cc.healthDimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
    expect(cc.healthDimensions.some((row) => row.dimension === "schedule")).toBe(true);
  });

  it("fails closed on forbidden dedicated forecast reads", async () => {
    await expect(
      new ProjectForecastIntelligenceService(
        new InMemoryForecastIntelligencePort(forecastSliceFrom(null, { availability: "forbidden" })),
      ).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden" });
  });

  it("denies cross-tenant through Command Centre identity checks", async () => {
    const service = new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity({ tenantId: "other-tenant" }), greenCore()),
      controls: new InMemoryCommandCentreControlsPort(emptyControlsSnapshot()),
      knowledge: new InMemoryCommandCentreKnowledgePort({
        findings: { bound: true, items: [] },
        inspectionFindings: { bound: true, items: [] },
      }),
    });
    await expect(service.compose({ projectId: "p1", context: access, generatedAt })).rejects.toMatchObject({
      code: "project_forbidden",
    });
  });

  it("does not implement a duplicate forecast or Project Controls engine", () => {
    expect(duplicateForecastEngineDetected).toBe(false);
    expect(duplicateProjectControlsEngineDetected).toBe(false);
    expect(duplicateScheduleEngineDetected).toBe(false);
    expect(duplicateCostEngineDetected).toBe(false);
    expect(duplicateProgressEngineDetected).toBe(false);
    expect(PI_FORECAST_MUTATION_ENABLED).toBe(false);
    expect(PI_PREDICTIVE_MODEL_IMPLEMENTED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(FORECAST_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(PI_7_AI_PROJECT_ANALYST_READY).toBe(false);
    expect(PI_50_RECORD_LIMIT_AFFECTS_FORECASTING).toBe(false);
    expect(PI_HOSTED_LIST_COMPLETENESS_MODEL).toContain("forecast_lists_exhaustive");
    const dir = resolve(__dirname, "../src/forecast-intelligence");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts") || file === "ownership.ts") continue;
      const source = readFileSync(resolve(dir, file), "utf8");
      expect(source).not.toMatch(/\.insert\(/);
      expect(source).not.toMatch(/\.update\(/);
      for (const token of FORBIDDEN_FORECAST_ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
    }
  });

  it("traces evidence without copying the forecast register", () => {
    const view = interpret(
      { stateId: "f-ref", projectId: "p1" },
      { evidence: [publishedForecastEvidence({ evidenceId: "e1", forecastStateId: "f-ref" })] },
    );
    expect(view.evidenceReferences[0]).toEqual(
      expect.objectContaining({
        sourceDomain: "project_controls",
        entityType: "forecast_state",
        entityId: "f-ref",
        storesCanonicalCopy: false,
      }),
    );
    expect(view.persisted).toBe(false);
    expect(view.readOnly).toBe(true);
  });
});
