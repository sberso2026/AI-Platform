import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertForecastAdvisoryOnly,
  assertForecastPublishable,
  assertNoEarnedValueOrCpm,
  assertNoPredictiveScheduling,
  assertNoReservedCapabilities,
  assertOwnershipLock,
  assertProjectContextCompositionReady,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  FORECAST_REVIEW_WORKFLOW,
  createForecastIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectContextCompositionEngine,
  createProjectControlsEngine,
  createReservedForecastProvider,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_FORECAST_TABLES,
  PROJECT_CONTROLS_EVENTS,
  startForecastReview,
  transitionForecastReview,
  type ForecastControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function forecastControlContext(): ForecastControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    trajectoryUnitId: "traj-001",
    trajectoryUnitLabel: "Delivery thread A",
  };
}

function memoryEngine() {
  const store = createDurableProjectControlsMemoryStore();
  const repository = new MemoryProjectControlsRepository(store);
  const events = createInProcessProjectControlsEventPipeline();
  const projectDomainPort = createInMemorySharedProjectDomainPort({
    projects: [
      createProjectReferenceFixture({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        projectCode: "PRJ-001",
        projectName: "Berth 7 Upgrade",
      }),
    ],
  });
  const engine = createProjectControlsEngine({ projectDomainPort, repository, events });
  return { store, repository, events, engine };
}

describe("Phase 11G forecast intelligence engine", () => {
  it("abstains without published composed contributors", () => {
    const outcome = createForecastIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: forecastControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.forecastPosture).toBe("unknown");
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("keeps predictive scheduling and EV forbidden", () => {
    expect(assertNoPredictiveScheduling().forecastEngineImplemented).toBe(false);
    expect(assertNoEarnedValueOrCpm().earnedValueImplemented).toBe(false);
    expect(assertForecastAdvisoryOnly().advisoryOnly).toBe(true);
  });
});

describe("Phase 11G project context composition", () => {
  it("composes contributor refs without opaque score", () => {
    const result = createProjectContextCompositionEngine().compose({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      progress: [],
      asOf: AS_OF,
      requirePublished: false,
    });
    expect(result.context.opaqueScoreProduced).toBe(false);
    expect(result.context.mutatesUpstreamContributors).toBe(false);
    expect(assertProjectContextCompositionReady().ownership).toBe("project_controls");
  });
});

describe("Phase 11G forecast review workflow", () => {
  it("defines forecast_review and forbids self-approval", () => {
    expect(FORECAST_REVIEW_WORKFLOW.slug).toBe("project_controls.forecast_review");
    const started = startForecastReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertForecastPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/forecast_self_approval_forbidden/);
    const approved = transitionForecastReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11G project context with forecast", () => {
  it("lists seven active contributors including forecast", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(8);
    expect(check.activeContributorKeys).toContain("forecast");
    expect(check.activeContributorKeys).toContain("decision_support");
  });
});

describe("Phase 11G locks", () => {
  it("enumerates forecast events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.forecast.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.forecast.published");
  });

  it("keeps forecast intelligence owned by project_controls", () => {
    const lock = assertOwnershipLock();
    expect(lock.forecastIntelligenceOwnership).toBe("project_controls");
  });

  it("keeps ForecastProvider predictive methods not_implemented", async () => {
    const provider = createReservedForecastProvider();
    await expect(
      provider.getCompletionForecast({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        scope: { kind: "project", projectId: PROJECT },
      }),
    ).rejects.toThrow(/not_implemented/);
  });

  it("grants forecast assessment capabilities", () => {
    expect(assertNoReservedCapabilities().ok).toBe(true);
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
  });

  it("declares Phase 11G forecast tables", () => {
    expect(PROJECT_CONTROLS_FORECAST_TABLES).toEqual([
      "project_controls_forecast_states",
      "project_controls_forecast_evidence",
      "project_controls_forecast_reviews",
      "project_controls_forecast_confidence",
    ]);
  });
});

describe("Phase 11G forecast orchestration", () => {
  it("persists forecast state through assess path", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessForecast({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: forecastControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.forecastStates.length).toBe(1);
    expect(result.state.completionDatePredicted).toBe(false);
  });
});
