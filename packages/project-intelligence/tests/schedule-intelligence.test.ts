import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FORBIDDEN_SCHEDULE_ENGINE_TOKENS,
  InMemoryScheduleIntelligencePort,
  PI_SCHEDULE_MUTATION_ENABLED,
  PROJECT_HEALTH_DIMENSIONS,
  ProjectCommandCentreService,
  ProjectScheduleIntelligenceService,
  SCHEDULE_INTELLIGENCE_IMPLEMENTED,
  SCHEMA_CHANGED,
  duplicateProjectControlsEngineDetected,
  duplicateScheduleEngineDetected,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  interpretScheduleIntelligence,
  publishedControls,
  publishedMilestoneEvidence,
  publishedScheduleAssessment,
  relatedContextFromEvidence,
  sampleProjectIdentity,
  snapshotFrom,
  InMemoryCommandCentreControlsPort,
  InMemoryCommandCentreCorePort,
  InMemoryCommandCentreKnowledgePort,
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

describe("PI-2 schedule intelligence", () => {
  it("classifies source-unavailable as UNKNOWN without inventing health", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(null, { availability: "unavailable" }),
    });
    expect(view.availability).toBe("unavailable");
    expect(view.health.classification).toBe("UNKNOWN");
    expect(view.dataQuality.freshness).toBe("UNAVAILABLE");
  });

  it("fails closed on forbidden dedicated schedule reads", async () => {
    await expect(
      new ProjectScheduleIntelligenceService(
        new InMemoryScheduleIntelligencePort(snapshotFrom(null, { availability: "forbidden" })),
      ).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden" });
  });

  it("maps published on_track schedule to GREEN", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(publishedScheduleAssessment({ assessmentId: "s1", projectId: "p1", posture: "on_track" })),
    });
    expect(view.health.classification).toBe("GREEN");
    expect(view.aiRequired).toBe(false);
    expect(view.mutatesSchedule).toBe(false);
    expect(view.criticalPath.published).toBe(false);
    expect(view.float.published).toBe(false);
    expect(view.forecast.computedCompletionPublished).toBe(false);
  });

  it("maps published at_risk schedule to AMBER", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(publishedScheduleAssessment({ assessmentId: "s1", projectId: "p1", posture: "at_risk" })),
    });
    expect(view.health.classification).toBe("AMBER");
  });

  it("maps published missed schedule to RED", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(publishedScheduleAssessment({ assessmentId: "s1", projectId: "p1", posture: "missed" })),
    });
    expect(view.health.classification).toBe("RED");
    expect(view.attentionItems.some((item) => item.reasonCode === "schedule_milestone_missed")).toBe(true);
  });

  it("maps missing assessment to UNKNOWN", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(null),
    });
    expect(view.health.classification).toBe("UNKNOWN");
    expect(view.availability).toBe("no_data");
    expect(view.attentionItems.some((item) => item.reasonCode === "missing_published_schedule_assessment")).toBe(true);
  });

  it("classifies stale published schedule as STALE", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(
        publishedScheduleAssessment({
          assessmentId: "s1",
          projectId: "p1",
          posture: "on_track",
          publishedAt: staleAt,
          assessedAt: staleAt,
        }),
      ),
    });
    expect(view.dataQuality.freshness).toBe("STALE");
    expect(view.attentionItems.some((item) => item.reasonCode === "stale_schedule_data")).toBe(true);
  });

  it("surfaces milestone slip from published evidence without computing CPM", () => {
    const assessment = publishedScheduleAssessment({
      assessmentId: "s1",
      projectId: "p1",
      posture: "at_risk",
      declaredDateDeltaDays: 12,
      declaredBaselineDate: "2026-07-01",
      declaredCurrentDate: "2026-07-13",
    });
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(assessment, {
        evidence: [
          publishedMilestoneEvidence({
            evidenceId: "e1",
            assessmentId: "s1",
            title: "Mechanical completion",
            declaredPosture: "missed",
            sourceKey: "ms-1",
          }),
        ],
      }),
    });
    expect(view.milestones[0]?.publishedStatus).toBe("missed");
    expect(view.milestones[0]?.publishedVarianceDays).toBe(12);
    expect(view.milestones[0]?.criticalityPublished).toBe(false);
    expect(view.attentionItems.some((item) => item.reasonCode === "critical_milestone_late")).toBe(true);
    expect(view.attentionItems.some((item) => item.reasonCode === "published_declared_date_slip")).toBe(true);
  });

  it("leaves unsupported metrics unknown", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(publishedScheduleAssessment({ assessmentId: "s1", projectId: "p1" })),
    });
    expect(view.criticalPath).toEqual({
      published: false,
      state: "unknown",
      limitation: "critical_path_not_published",
    });
    expect(view.float.limitation).toBe("float_not_published");
    expect(view.dataQuality.limitations).toContain("computed_forecast_completion_not_published");
  });

  it("returns trend only when two published assessments exist", () => {
    const none = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(publishedScheduleAssessment({ assessmentId: "s2", projectId: "p1", posture: "at_risk" })),
    });
    expect(none.trend.available).toBe(false);

    const later = publishedScheduleAssessment({ assessmentId: "s2", projectId: "p1", posture: "missed", declaredDateDeltaDays: 10 });
    const earlier = publishedScheduleAssessment({ assessmentId: "s1", projectId: "p1", posture: "on_track", declaredDateDeltaDays: 0 });
    const withHistory = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(later, { history: [later, earlier] }),
    });
    expect(withHistory.trend.available).toBe(true);
    if (withHistory.trend.available) {
      expect(withHistory.trend.fromPosture).toBe("on_track");
      expect(withHistory.trend.toPosture).toBe("missed");
      expect(withHistory.trend.healthChange).toBe("deteriorated");
    }
  });

  it("does not invent causal links without an explicit canonical relationship", () => {
    const implicit = relatedContextFromEvidence(
      publishedMilestoneEvidence({
        evidenceId: "e1",
        assessmentId: "s1",
        sourceType: "manual_engineering_assessment",
        sourceKey: "unrelated-key",
      }),
    );
    expect(implicit).toEqual([]);

    const explicit = relatedContextFromEvidence(
      publishedMilestoneEvidence({
        evidenceId: "e2",
        assessmentId: "s1",
        sourceType: "project_intelligence",
        sourceKey: "finding-1",
        sourceReference: "action:act-9",
      }),
    );
    expect(explicit).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entityType: "finding", entityId: "finding-1", linkKind: "explicit_source_key" }),
        expect.objectContaining({ entityType: "action", entityId: "act-9", linkKind: "explicit_source_reference" }),
      ]),
    );
  });

  it("preserves evidence references without copying canonical records", () => {
    const view = interpretScheduleIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFrom(publishedScheduleAssessment({ assessmentId: "sched-9", projectId: "p1", posture: "missed" })),
    });
    expect(view.evidenceReferences[0]).toEqual(
      expect.objectContaining({
        sourceDomain: "project_controls",
        entityType: "schedule_assessment",
        entityId: "sched-9",
        storesCanonicalCopy: false,
      }),
    );
    expect(JSON.stringify(view.evidenceReferences)).not.toMatch(/narrative|description/);
  });

  it("denies cross-tenant and cross-workspace through Command Centre identity checks", async () => {
    const service = new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity({ tenantId: "other-tenant" }), greenCore()),
      controls: new InMemoryCommandCentreControlsPort({
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
      }),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
    });
    await expect(service.compose({ projectId: "p1", context: access, generatedAt })).rejects.toMatchObject({
      code: "project_forbidden",
    });

    const workspace = new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity({ workspaceId: "other-workspace" }), greenCore()),
      controls: new InMemoryCommandCentreControlsPort({
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
      }),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
    });
    await expect(workspace.compose({ projectId: "p1", context: access, generatedAt })).rejects.toMatchObject({
      details: { reason: "cross_workspace" },
    });
  });

  it("works with AI disabled and isolates schedule source failure", async () => {
    const view = await new ProjectScheduleIntelligenceService(
      new InMemoryScheduleIntelligencePort(undefined, "throw"),
    ).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.aiRequired).toBe(false);
    expect(view.availability).toBe("error");
    expect(view.health.classification).toBe("UNKNOWN");

    const cc = await new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity(), greenCore()),
      controls: new InMemoryCommandCentreControlsPort({
        ...emptyControlsSnapshot(),
        cost: publishedControls({ assessmentId: "c1", projectId: "p1", posture: "within_tolerance" }),
        progress: publishedControls({ assessmentId: "pr1", projectId: "p1", posture: "in_progress" }),
        change: publishedControls({ assessmentId: "ch1", projectId: "p1", posture: "approved_context" }),
      }),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
      schedule: new InMemoryScheduleIntelligencePort(undefined, "throw"),
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(cc.cost.availability).toBe("ok");
    expect(cc.scheduleIntelligence.availability).toBe("error");
    expect(cc.healthDimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
  });

  it("does not duplicate Project Controls schedule computation", () => {
    expect(duplicateProjectControlsEngineDetected).toBe(false);
    expect(duplicateScheduleEngineDetected).toBe(false);
    expect(SCHEDULE_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(PI_SCHEDULE_MUTATION_ENABLED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    const dir = resolve(__dirname, "../src/schedule-intelligence");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts") || file === "ownership.ts") continue;
      const source = readFileSync(resolve(dir, file), "utf8");
      expect(source).not.toMatch(/@rtb\/project-controls/);
      expect(source).not.toMatch(/createScheduleIntelligenceEngine\(/);
      for (const token of FORBIDDEN_SCHEDULE_ENGINE_TOKENS) {
        if (token === "createScheduleIntelligenceEngine") continue;
        expect(source).not.toContain(token);
      }
    }
  });
});
