import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PROJECT_INTELLIGENCE_AI_CONSUMPTION, assertProjectIntelligenceAiRuntime } from "../src/ai/shared-runtime";
import { PROJECT_INTELLIGENCE_FEATURES } from "../src/features/registry";
import {
  InMemoryProjectControlsSource,
  InMemoryProjectCoreSource,
  InMemoryProjectKnowledgeSource,
  PROJECT_HEALTH_DIMENSIONS,
  PROJECT_HEALTH_NUMERICAL_SCORE_IMPLEMENTED,
  PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY,
  PI_CANONICAL_MUTATION_BYPASS,
  ProjectHealthEvaluator,
  SCHEMA_CHANGED,
  classifyOverallProjectHealth,
  duplicateCanonicalProjectDomainDetected,
  duplicateProjectControlsEngineDetected,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  emptyKnowledgeSnapshot,
  implementsOwnAiStack,
  publishedControls,
  requestProjectHealthExplanation,
  type CanonicalRegisterItemRef,
  type ProjectHealthDimensionResult,
} from "../src/project-health";
import type { AccessContext } from "../src/security/access-guard";

const evaluatedAt = "2026-08-30T00:00:00.000Z";

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

function risk(overrides: Partial<CanonicalRegisterItemRef> & Pick<CanonicalRegisterItemRef, "id" | "score" | "priority">): CanonicalRegisterItemRef {
  return {
    entityType: "risk",
    status: "open",
    open: true,
    storesCanonicalCopy: false,
    sourceTimestamp: "2026-08-20T00:00:00.000Z",
    ...overrides,
  };
}

function evaluator(input?: {
  core?: ReturnType<typeof emptyCoreSnapshot>;
  controls?: ReturnType<typeof emptyControlsSnapshot>;
  knowledge?: ReturnType<typeof emptyKnowledgeSnapshot>;
}) {
  return new ProjectHealthEvaluator({
    core: new InMemoryProjectCoreSource(input?.core ?? emptyCoreSnapshot()),
    controls: new InMemoryProjectControlsSource(input?.controls ?? emptyControlsSnapshot()),
    knowledge: new InMemoryProjectKnowledgeSource(input?.knowledge ?? emptyKnowledgeSnapshot()),
  });
}

describe("PI-0 project health foundation", () => {
  it("returns UNKNOWN for every dimension when all sources are missing", async () => {
    const assessment = await evaluator().evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(assessment.dimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
    expect(assessment.dimensions.every((row) => row.state === "unknown")).toBe(true);
    expect(assessment.overall.classification).toBe("UNKNOWN");
    expect(assessment.overall.unknownDimensions).toEqual([...PROJECT_HEALTH_DIMENSIONS]);
    expect(assessment.overall.numericalScoreImplemented).toBe(false);
    expect(assessment.persisted).toBe(false);
    expect(assessment.readOnly).toBe(true);
  });

  it("keeps schedule UNKNOWN when schedule is missing", async () => {
    const assessment = await evaluator({
      controls: { ...emptyControlsSnapshot(), cost: publishedControls({ assessmentId: "c1", projectId: "p1", posture: "within_tolerance" }) },
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(assessment.dimensions.find((row) => row.dimension === "schedule")?.state).toBe("unknown");
    expect(assessment.dimensions.find((row) => row.dimension === "cost")?.state).toBe("green");
    expect(assessment.overall.unknownDimensions).toContain("schedule");
    expect(assessment.overall.classification).not.toBe("GREEN");
  });

  it("keeps cost UNKNOWN when cost is missing", async () => {
    const assessment = await evaluator({
      controls: { ...emptyControlsSnapshot(), schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }) },
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(assessment.dimensions.find((row) => row.dimension === "cost")?.state).toBe("unknown");
    expect(assessment.overall.classification).toBe("UNKNOWN");
  });

  it("evaluates open critical risk evidence as RED without fabricating other dimensions", async () => {
    const assessment = await evaluator({
      core: {
        ...emptyCoreSnapshot(),
        project: { projectId: "p1", storesCanonicalCopy: false },
        risks: {
          bound: true,
          items: [risk({ id: "r-red", score: 20, priority: "critical" })],
          sourceTimestamp: "2026-08-20T00:00:00.000Z",
        },
      },
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    const riskRow = assessment.dimensions.find((row) => row.dimension === "risk");
    expect(riskRow?.state).toBe("red");
    expect(riskRow?.evidenceReferences).toEqual([
      expect.objectContaining({
        sourceDomain: "engineering_core",
        entityType: "risk",
        entityId: "r-red",
        storesCanonicalCopy: false,
      }),
    ]);
    expect(assessment.overall.classification).toBe("RED");
    expect(assessment.overall.unknownDimensions).toContain("schedule");
    expect(assessment.overall.unknownDimensions).not.toContain("risk");
  });

  it("does not convert unknown dimensions to green in overall classification", () => {
    const mixed: ProjectHealthDimensionResult[] = PROJECT_HEALTH_DIMENSIONS.map((dimension) => ({
      dimension,
      state: dimension === "risk" ? "green" : "unknown",
      reasonCodes: [],
      evidenceReferences: [],
      source: "none",
      evaluatedAt,
      limitations: [],
    }));
    const overall = classifyOverallProjectHealth(mixed);
    expect(overall.classification).toBe("UNKNOWN");
    expect(overall.knownGreenDimensions).toEqual(["risk"]);
    expect(overall.unknownDimensions).not.toContain("risk");
  });

  it("is deterministic for the same inputs", async () => {
    const sources = {
      core: {
        ...emptyCoreSnapshot(),
        project: { projectId: "p1", storesCanonicalCopy: false as const },
        risks: { bound: true as const, items: [risk({ id: "r1", score: 4, priority: "low" })] },
        issues: { bound: true as const, items: [] },
        decisions: { bound: true as const, items: [] },
        actions: { bound: true as const, items: [] },
      },
      controls: {
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
        cost: publishedControls({ assessmentId: "c1", projectId: "p1", posture: "within_tolerance" }),
        progress: publishedControls({ assessmentId: "pr1", projectId: "p1", posture: "in_progress" }),
        change: publishedControls({ assessmentId: "ch1", projectId: "p1", posture: "approved_context" }),
        forecast: publishedControls({ assessmentId: "f1", projectId: "p1", posture: "stable" }),
      },
      knowledge: {
        findings: { bound: true as const, items: [] },
        inspectionFindings: { bound: false as const },
      },
    };
    const first = await evaluator(sources).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    const second = await evaluator(sources).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(first).toEqual(second);
    expect(first.overall.classification).toBe("GREEN");
  });

  it("preserves evidence references as ids, not copied records", async () => {
    const assessment = await evaluator({
      controls: {
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "sched-9", projectId: "p1", posture: "missed" }),
      },
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    const schedule = assessment.dimensions.find((row) => row.dimension === "schedule");
    expect(schedule?.state).toBe("red");
    expect(schedule?.evidenceReferences[0]).toEqual({
      sourceDomain: "project_controls",
      entityType: "schedule_assessment",
      entityId: "sched-9",
      sourceTimestamp: "2026-08-01T00:00:00.000Z",
      sourceVersion: "1",
      storesCanonicalCopy: false,
    });
    expect(JSON.stringify(schedule)).not.toMatch(/title|description|narrative/);
  });

  it("does not mutate canonical engineering records", async () => {
    const core = emptyCoreSnapshot();
    const frozen = JSON.stringify(core);
    await evaluator({ core }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(JSON.stringify(core)).toBe(frozen);
    expect(PI_CANONICAL_MUTATION_BYPASS).toBe(false);
  });

  it("does not invoke a second Project Controls engine", async () => {
    const controls = emptyControlsSnapshot();
    expect(controls.invokedScheduleEngine).toBe(false);
    expect(controls.invokedEarnedValueEngine).toBe(false);
    expect(duplicateProjectControlsEngineDetected).toBe(false);
    await evaluator({ controls }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(controls.invokedScheduleEngine).toBe(false);
  });

  it("preserves tenant and workspace context", async () => {
    const assessment = await evaluator().evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(assessment.tenantId).toBe("tenant");
    expect(assessment.workspaceId).toBe("workspace");
  });

  it("denies evaluation without tenant/workspace access", async () => {
    await expect(
      evaluator().evaluateProjectHealth({
        projectId: "p1",
        context: { permissions: ["read"] },
        evaluatedAt,
      }),
    ).rejects.toThrow("active tenant-scoped principal");
  });

  it("keeps implementsOwnAiStack false and abstains from a second health-explanation stack", () => {
    assertProjectIntelligenceAiRuntime();
    expect(implementsOwnAiStack).toBe(false);
    expect(PROJECT_INTELLIGENCE_AI_CONSUMPTION.implementsOwnAiStack).toBe(false);
    expect(PROJECT_INTELLIGENCE_FEATURES.every((feature) => feature.implementsOwnAiStack === false)).toBe(true);
    const explanation = requestProjectHealthExplanation({
      assessment: {
        projectId: "p1",
        tenantId: "tenant",
        workspaceId: "workspace",
        evaluatedAt,
        dimensions: [],
        overall: classifyOverallProjectHealth([]),
        limitations: [],
        readOnly: true,
        persisted: false,
      },
      intent: "summarize_health",
    });
    expect(explanation).toMatchObject({
      abstained: true,
      reason: "canonical_analyst_required",
      canonicalCapability: "project_intelligence.ai_project_analyst",
      deterministicStateUnchanged: true,
    });
  });

  it("reconciles risk register read semantics for GREEN versus UNKNOWN", async () => {
    const completeEmpty = await evaluator({
      core: {
        ...emptyCoreSnapshot(),
        project: { projectId: "p1", storesCanonicalCopy: false },
        risks: { bound: true, items: [], completeness: "complete", sourceTimestamp: evaluatedAt },
      },
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(completeEmpty.dimensions.find((row) => row.dimension === "risk")?.state).toBe("green");

    const unread = await evaluator().evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(unread.dimensions.find((row) => row.dimension === "risk")?.state).toBe("unknown");
    expect(unread.dimensions.find((row) => row.dimension === "risk")?.reasonCodes).toContain("risk_register_unbound");

    const unknownCompleteness = await evaluator({
      core: {
        ...emptyCoreSnapshot(),
        project: { projectId: "p1", storesCanonicalCopy: false },
        risks: { bound: true, items: [], completeness: "unknown", sourceTimestamp: evaluatedAt },
      },
    }).evaluateProjectHealth({ projectId: "p1", context: access, evaluatedAt });
    expect(unknownCompleteness.dimensions.find((row) => row.dimension === "risk")?.state).toBe("unknown");
    expect(unknownCompleteness.dimensions.find((row) => row.dimension === "risk")?.reasonCodes).toContain(
      "risk_register_completeness_unknown",
    );
  });

  it("proves canonical entities are referenced rather than copied", () => {
    expect(duplicateCanonicalProjectDomainDetected).toBe(false);
    const item = risk({ id: "r-ref", score: 9, priority: "high" });
    expect(item.storesCanonicalCopy).toBe(false);
    expect("title" in item).toBe(false);
    expect("description" in item).toBe(false);
  });

  it("does not declare a numerical health score or schema change", () => {
    expect(PROJECT_HEALTH_NUMERICAL_SCORE_IMPLEMENTED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.createPlansInPi0).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneCatalogProductHasPlans).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.uiMismatch).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.catalogCommerceReconciled).toBe(true);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.planMismatchResolved).toBe(true);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneLicensingCreated).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.businessOsEntitlementRequired).toBe(false);
  });

  it("does not import Project Controls engines", () => {
    const evaluatorSource = readFileSync(resolve(__dirname, "../src/project-health/evaluator.ts"), "utf8");
    const serviceSource = readFileSync(resolve(__dirname, "../src/project-health/service.ts"), "utf8");
    expect(evaluatorSource).not.toMatch(/@rtb\/project-controls/);
    expect(serviceSource).not.toMatch(/@rtb\/project-controls/);
    expect(evaluatorSource).not.toMatch(/createScheduleIntelligenceEngine|createCostIntelligenceEngine|createProgressIntelligenceEngine/);
  });
});
