import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  COMMAND_CENTRE_GA_DECLARED,
  FORBIDDEN_PROJECT_CONTROLS_ENGINE_IMPORTS,
  InMemoryCommandCentreControlsPort,
  InMemoryCommandCentreCorePort,
  InMemoryCommandCentreKnowledgePort,
  PI_AI_REQUIRED,
  PI_CANONICAL_MUTATION_BYPASS,
  PROJECT_HEALTH_DIMENSIONS,
  ProjectCommandCentreService,
  SCHEMA_CHANGED,
  buildAttentionItems,
  duplicateCanonicalProjectDomainDetected,
  duplicateProjectControlsEngineDetected,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  implementsOwnAiStack,
  publishedControls,
  sampleProjectIdentity,
  type CanonicalRegisterItemRef,
  type ProjectCoreSnapshot,
} from "../src";
import { requestProjectHealthExplanation } from "../src/project-health/ai-boundary";
import type { AccessContext } from "../src/security/access-guard";

const generatedAt = "2026-08-30T00:00:00.000Z";

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

function risk(overrides: Partial<CanonicalRegisterItemRef> & Pick<CanonicalRegisterItemRef, "id">): CanonicalRegisterItemRef {
  return {
    entityType: "risk",
    status: "open",
    open: true,
    storesCanonicalCopy: false,
    sourceTimestamp: "2026-08-20T00:00:00.000Z",
    priority: "low",
    score: 4,
    ...overrides,
  };
}

function greenCore(): ProjectCoreSnapshot {
  return {
    ...emptyCoreSnapshot(),
    project: { projectId: "p1", storesCanonicalCopy: false },
    risks: { bound: true, items: [] },
    issues: { bound: true, items: [] },
    decisions: { bound: true, items: [] },
    actions: { bound: true, items: [] },
    technicalQueries: { bound: true, items: [] },
    documents: { bound: true, items: [] },
    assets: { bound: true, items: [] },
  };
}

function greenControls() {
  return {
    ...emptyControlsSnapshot(),
    schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
    cost: publishedControls({ assessmentId: "c1", projectId: "p1", posture: "within_tolerance" }),
    progress: publishedControls({ assessmentId: "pr1", projectId: "p1", posture: "in_progress" }),
    change: publishedControls({ assessmentId: "ch1", projectId: "p1", posture: "approved_context" }),
    forecast: publishedControls({ assessmentId: "f1", projectId: "p1", posture: "stable" }),
  };
}

function greenKnowledge() {
  return {
    findings: { bound: true as const, items: [] },
    inspectionFindings: { bound: true as const, items: [] },
  };
}

function service(input?: {
  identity?: ReturnType<typeof sampleProjectIdentity> | null;
  core?: ProjectCoreSnapshot;
  controls?: ReturnType<typeof emptyControlsSnapshot>;
  knowledge?: ReturnType<typeof greenKnowledge>;
  coreFail?: "throw" | "forbidden_tenant" | "forbidden_workspace";
  controlsFail?: "throw" | Partial<Record<"schedule" | "cost" | "progress" | "change" | "forecast", "error" | "unavailable">>;
  knowledgeFail?: "throw";
}) {
  return new ProjectCommandCentreService({
    core: new InMemoryCommandCentreCorePort(
      input?.identity === undefined ? sampleProjectIdentity() : input.identity,
      input?.core ?? greenCore(),
      input?.coreFail,
    ),
    controls: new InMemoryCommandCentreControlsPort(
      input?.controls ?? greenControls(),
      undefined,
      input?.controlsFail,
    ),
    knowledge: new InMemoryCommandCentreKnowledgePort(
      input?.knowledge ?? greenKnowledge(),
      undefined,
      input?.knowledgeFail,
    ),
  });
}

describe("PI-1 command centre composition", () => {
  it("loads an authorized project command centre", async () => {
    const view = await service().compose({ projectId: "p1", context: access, generatedAt });
    expect(view.project.projectId).toBe("p1");
    expect(view.project.storesCanonicalCopy).toBe(false);
    expect(view.overallHealth).toBe("GREEN");
    expect(view.healthDimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
    expect(view.readOnly).toBe(true);
    expect(view.persisted).toBe(false);
    expect(view.aiRequired).toBe(false);
    expect(view.canonicalMutation).toBe(false);
    expect(view.generatedAt).toBe(generatedAt);
  });

  it("denies a cross-tenant project", async () => {
    await expect(
      service({
        identity: sampleProjectIdentity({ tenantId: "other-tenant" }),
      }).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden", statusCode: 403, details: { reason: "cross_tenant" } });
  });

  it("denies a cross-workspace project", async () => {
    await expect(
      service({
        identity: sampleProjectIdentity({ workspaceId: "other-workspace" }),
      }).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden", statusCode: 403, details: { reason: "cross_workspace" } });
  });

  it("denies a missing project", async () => {
    await expect(
      service({ identity: null }).compose({ projectId: "missing", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_not_found", statusCode: 404 });
  });

  it("classifies all green dimensions as GREEN", async () => {
    const view = await service().compose({ projectId: "p1", context: access, generatedAt });
    expect(view.healthDimensions.every((row) => row.state === "green")).toBe(true);
    expect(view.overallHealth).toBe("GREEN");
    expect(view.attentionItems.filter((item) => item.severity !== "info")).toEqual([]);
  });

  it("classifies a red source as RED", async () => {
    const view = await service({
      controls: {
        ...greenControls(),
        schedule: publishedControls({ assessmentId: "s-red", projectId: "p1", posture: "missed" }),
      },
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.healthDimensions.find((row) => row.dimension === "schedule")?.state).toBe("red");
    expect(view.overallHealth).toBe("RED");
    expect(view.attentionItems.some((item) => item.reasonCode === "schedule_milestone_missed" && item.severity === "red")).toBe(true);
  });

  it("preserves UNKNOWN for partial evidence", async () => {
    const view = await service({
      controls: {
        ...greenControls(),
        schedule: null,
      },
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.healthDimensions.find((row) => row.dimension === "schedule")?.state).toBe("unknown");
    expect(view.healthDimensions.find((row) => row.dimension === "cost")?.state).toBe("green");
    expect(view.overallHealth).toBe("UNKNOWN");
    expect(view.schedule.availability).toBe("no_data");
    expect(view.attentionItems.some((item) => item.severity === "info" && item.reasonCode.includes("schedule"))).toBe(true);
  });

  it("builds deterministic attention items", async () => {
    const core: ProjectCoreSnapshot = {
      ...greenCore(),
      actions: {
        bound: true,
        items: [
          {
            id: "a1",
            entityType: "action",
            status: "open",
            open: true,
            dueAt: "2026-08-01T00:00:00.000Z",
            storesCanonicalCopy: false,
          },
        ],
      },
      risks: { bound: true, items: [risk({ id: "r1", priority: "critical", score: 20 })] },
    };
    const first = await service({ core }).compose({ projectId: "p1", context: access, generatedAt });
    const second = await service({ core }).compose({ projectId: "p1", context: access, generatedAt });
    expect(first.attentionItems).toEqual(second.attentionItems);
    expect(first.attentionItems.some((item) => item.reasonCode === "overdue_open_action")).toBe(true);
    expect(first.attentionItems.every((item) => item.sourceReference.storesCanonicalCopy === false)).toBe(true);
    const rebuilt = buildAttentionItems({
      dimensions: first.healthDimensions,
      core,
      controls: greenControls(),
      generatedAt,
    });
    expect(rebuilt).toEqual(first.attentionItems);
  });

  it("keeps other sections when schedule source is absent", async () => {
    const view = await service({
      controls: { ...greenControls(), schedule: null },
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.schedule.availability).toBe("no_data");
    expect(view.cost.availability).toBe("ok");
    expect(view.progress.availability).toBe("ok");
    expect(view.risk.availability).toBe("ok");
    expect(view.project.projectId).toBe("p1");
  });

  it("isolates knowledge source failure", async () => {
    const view = await service({ knowledgeFail: "throw" }).compose({
      projectId: "p1",
      context: access,
      generatedAt,
    });
    expect(view.knowledge.availability).toBe("error");
    expect(view.overallHealth).toBeDefined();
    expect(view.schedule.availability).toBe("ok");
    expect(view.cost.availability).toBe("ok");
    expect(view.project.projectId).toBe("p1");
  });

  it("fails the request when Core source fails", async () => {
    await expect(
      service({ coreFail: "throw" }).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "core_source_failed", statusCode: 502 });
  });

  it("preserves evidence references without copying canonical records", async () => {
    const view = await service({
      controls: {
        ...greenControls(),
        cost: publishedControls({ assessmentId: "cost-9", projectId: "p1", posture: "over" }),
      },
    }).compose({ projectId: "p1", context: access, generatedAt });
    const costRef = view.evidenceReferences.find((ref) => ref.entityId === "cost-9");
    expect(costRef).toEqual(
      expect.objectContaining({
        sourceDomain: "project_controls",
        entityType: "cost_state",
        entityId: "cost-9",
        storesCanonicalCopy: false,
      }),
    );
    expect(JSON.stringify(view.cost.evidenceReferences)).not.toMatch(/narrative|description/);
    expect(view.cost.evidenceReferences[0]?.storesCanonicalCopy).toBe(false);
  });

  it("does not mutate canonical snapshots", async () => {
    const core = greenCore();
    const frozen = JSON.stringify(core);
    await service({ core }).compose({ projectId: "p1", context: access, generatedAt });
    expect(JSON.stringify(core)).toBe(frozen);
    expect(PI_CANONICAL_MUTATION_BYPASS).toBe(false);
  });

  it("does not duplicate Project Controls engines", async () => {
    expect(duplicateProjectControlsEngineDetected).toBe(false);
    expect(duplicateCanonicalProjectDomainDetected).toBe(false);
    const controls = greenControls();
    expect(controls.invokedScheduleEngine).toBe(false);
    expect(controls.invokedEarnedValueEngine).toBe(false);
  });

  it("functions with AI disabled", async () => {
    expect(PI_AI_REQUIRED).toBe(false);
    expect(implementsOwnAiStack).toBe(false);
    const view = await service().compose({ projectId: "p1", context: access, generatedAt });
    expect(view.aiRequired).toBe(false);
    const explanation = requestProjectHealthExplanation({
      assessment: {
        projectId: view.project.projectId,
        tenantId: view.project.tenantId,
        workspaceId: view.project.workspaceId,
        evaluatedAt: generatedAt,
        dimensions: view.healthDimensions,
        overall: {
          classification: view.overallHealth,
          contributingDimensions: view.healthDimensions,
          unknownDimensions: [],
          knownRedDimensions: [],
          knownAmberDimensions: [],
          knownGreenDimensions: PROJECT_HEALTH_DIMENSIONS.slice(),
          policyId: "project_health_overall_v1",
          numericalScoreImplemented: false,
        },
        limitations: view.limitations,
        readOnly: true,
        persisted: false,
      },
      intent: "summarize_health",
    });
    expect(explanation.abstained).toBe(true);
    expect(view.overallHealth).toBe("GREEN");
  });

  it("isolates a schedule section error without breaking cost", async () => {
    const view = await service({
      controlsFail: { schedule: "error" },
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.schedule.availability).toBe("error");
    expect(view.cost.availability).toBe("ok");
    expect(view.knowledge.availability).toBe("ok");
  });

  it("does not declare Command Centre GA or schema change", () => {
    expect(COMMAND_CENTRE_GA_DECLARED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
  });

  it("locks PI-1 against Project Controls engine imports", () => {
    const dir = resolve(__dirname, "../src/command-centre");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts")) continue;
      if (file === "ownership.ts") continue;
      const source = readFileSync(resolve(dir, file), "utf8");
      expect(source).not.toMatch(/@rtb\/project-controls/);
      expect(source).not.toMatch(/from ["']@rtb\/project-controls["']/);
      expect(source).not.toMatch(/createScheduleIntelligenceEngine\(/);
      expect(source).not.toMatch(/createCostIntelligenceEngine\(/);
      expect(source).not.toMatch(/createProgressIntelligenceEngine\(/);
    }
    expect(FORBIDDEN_PROJECT_CONTROLS_ENGINE_IMPORTS).toContain("createScheduleIntelligenceEngine");
  });
});
