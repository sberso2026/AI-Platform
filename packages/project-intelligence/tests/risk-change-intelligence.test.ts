import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FORBIDDEN_RISK_CHANGE_ENGINE_TOKENS,
  InMemoryCommandCentreControlsPort,
  InMemoryCommandCentreCorePort,
  InMemoryCommandCentreKnowledgePort,
  InMemoryRiskChangeIntelligencePort,
  PI_CHANGE_MUTATION_ENABLED,
  PI_RISK_MUTATION_ENABLED,
  PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED,
  PROJECT_HEALTH_DIMENSIONS,
  ProjectCommandCentreService,
  ProjectRiskChangeIntelligenceService,
  RISK_CHANGE_INTELLIGENCE_IMPLEMENTED,
  SCHEMA_CHANGED,
  canonicalRisk,
  canonicalRiskAction,
  changeSliceFrom,
  duplicateCanonicalProjectDomainDetected,
  duplicateChangeEngineDetected,
  duplicateProjectControlsEngineDetected,
  duplicateRiskDomainDetected,
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  interpretRiskChangeIntelligence,
  publishedChangeEvidence,
  publishedChangeState,
  publishedControls,
  riskSliceFrom,
  sampleProjectIdentity,
  snapshotFromRiskChange,
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

function interpret(
  risks: Parameters<typeof riskSliceFrom>[0],
  changeLatest: Parameters<typeof changeSliceFrom>[0],
  extra?: {
    risk?: Parameters<typeof riskSliceFrom>[1];
    change?: Parameters<typeof changeSliceFrom>[1];
  },
) {
  return interpretRiskChangeIntelligence({
    projectId: "p1",
    tenantId: "tenant",
    workspaceId: "workspace",
    generatedAt,
    snapshot: snapshotFromRiskChange(
      riskSliceFrom(risks, extra?.risk),
      changeSliceFrom(changeLatest, extra?.change),
    ),
  });
}

describe("PI-4 risk and change intelligence", () => {
  it("maps critical open canonical risk to RED attention", () => {
    const view = interpret([canonicalRisk({ id: "r-red", priority: "critical", score: 20 })], null);
    expect(view.risk.health.classification).toBe("RED");
    expect(view.risk.attentionItems.some((item) => item.reasonCode === "open_critical_risk")).toBe(true);
    expect(view.risk.attentionItems[0]?.canonicalRiskId).toBe("r-red");
  });

  it("maps high open canonical risk to AMBER", () => {
    const view = interpret([canonicalRisk({ id: "r-high", priority: "high", score: 12 })], null);
    expect(view.risk.health.classification).toBe("AMBER");
    expect(view.risk.attentionItems.some((item) => item.reasonCode === "open_high_risk")).toBe(true);
  });

  it("surfaces overdue mitigation and unowned and stale review", () => {
    const view = interpret(
      [
        canonicalRisk({
          id: "r-due",
          priority: "medium",
          dueAt: "2026-08-01",
          ownerId: undefined,
          assignedTo: undefined,
          updatedAt: staleAt,
        }),
      ],
      null,
      {
        risk: {
          actions: [
            canonicalRiskAction({
              id: "a1",
              originatingObjectType: "risk",
              originatingObjectId: "r-due",
              dueAt: "2026-07-01",
            }),
          ],
        },
      },
    );
    expect(view.risk.attentionItems.some((item) => item.reasonCode === "overdue_risk_treatment")).toBe(true);
    expect(view.risk.attentionItems.some((item) => item.reasonCode === "unowned_risk")).toBe(true);
    expect(view.risk.attentionItems.some((item) => item.reasonCode === "stale_risk_review")).toBe(true);
    expect(view.risk.portfolio.overdueMitigationCount).toBeGreaterThan(0);
    expect(view.risk.portfolio.unownedCount).toBe(1);
    expect(view.risk.portfolio.staleReviewCount).toBe(1);
  });

  it("does not treat an unread register as GREEN and treats a complete empty read as GREEN", () => {
    const empty = interpret([], null);
    expect(empty.risk.health.classification).toBe("GREEN");
    expect(empty.risk.health.reasonCodes).toContain("no_open_elevated_risks");

    const unread = interpret([], null, { risk: { availability: "no_data", bound: false } });
    expect(unread.risk.health.classification).toBe("UNKNOWN");
    expect(unread.risk.health.classification).not.toBe("GREEN");
    expect(unread.risk.health.reasonCodes).toContain("unread_risk_register");

    const unknownCompleteness = interpret([], null, {
      risk: { availability: "ok", bound: true, completeness: "unknown" },
    });
    expect(unknownCompleteness.risk.health.classification).toBe("UNKNOWN");
    expect(unknownCompleteness.risk.health.reasonCodes).toContain("risk_register_completeness_unknown");
  });

  it("does not silently normalize incompatible risk matrices", () => {
    const view = interpret(
      [
        canonicalRisk({ id: "r1", matrixId: "matrix-a", score: 20, priority: "critical" }),
        canonicalRisk({ id: "r2", matrixId: "matrix-b", score: 4, priority: "low" }),
      ],
      null,
    );
    expect(view.risk.matrix.compatible).toBe(false);
    expect(view.risk.matrix.silentlyNormalized).toBe(false);
    expect(view.risk.matrix.independentScoringImplemented).toBe(false);
    expect(view.risk.portfolio.matricesNormalized).toBe(false);
    expect(view.risk.portfolio.numericalScoreImplemented).toBe(false);
    expect(Object.keys(view.risk.portfolio.categoryCounts)).toHaveLength(0);
  });

  it("maps published change GREEN, AMBER, and missing UNKNOWN without inventing RED", () => {
    expect(
      interpret([], publishedChangeState({ stateId: "ch1", projectId: "p1", statusContext: "approved_context" })).change
        .health.classification,
    ).toBe("GREEN");
    expect(
      interpret([], publishedChangeState({ stateId: "ch1", projectId: "p1", statusContext: "pending" })).change.health
        .classification,
    ).toBe("AMBER");
    const missing = interpret([], null);
    expect(missing.change.health.classification).toBe("UNKNOWN");
    expect(missing.change.availability).toBe("no_data");
    const pending = interpret([], publishedChangeState({ stateId: "ch1", projectId: "p1", statusContext: "pending" }));
    expect(pending.change.health.classification).not.toBe("RED");
    expect(pending.unsupportedImpacts.redPosture).toBe("unavailable");
  });

  it("surfaces stale change and published schedule/cost implications without inventing amounts", () => {
    const view = interpret(
      [],
      publishedChangeState({
        stateId: "ch1",
        projectId: "p1",
        statusContext: "pending",
        publishedAt: staleAt,
        assessedAt: staleAt,
        impact: { schedule: "supported", cost: "suspected" },
      }),
    );
    expect(view.change.dataQuality.freshness).toBe("STALE");
    expect(view.change.attentionItems.some((item) => item.reasonCode === "stale_change_assessment")).toBe(true);
    expect(view.change.implications.schedule).toBe("supported");
    expect(view.change.implications.cost).toBe("suspected");
    expect(view.change.implications.monetaryAmountPublished).toBe(false);
    expect(view.change.implications.scheduleDaysPublished).toBe(false);
    expect(view.change.implications.forecastPublished).toBe(false);
    expect(view.change.portfolio.monetaryImpactsSummed).toBe(false);
    expect(view.change.portfolio.exposureInvented).toBe(false);
    expect(view.unsupportedImpacts.monetaryAmount).toBe("unavailable");
  });

  it("creates a cross-signal only for explicit canonical links", () => {
    const linked = interpret(
      [canonicalRisk({ id: "r-link", priority: "high", score: 12 })],
      publishedChangeState({ stateId: "ch1", projectId: "p1", statusContext: "pending" }),
      {
        risk: {
          actions: [
            canonicalRiskAction({
              id: "a-link",
              originatingObjectType: "risk",
              originatingObjectId: "r-link",
            }),
          ],
        },
        change: {
          evidence: [
            publishedChangeEvidence({
              evidenceId: "e-link",
              changeStateId: "ch1",
              sourceRef: "risk:r-link",
              sourceKey: "r-link",
            }),
          ],
        },
      },
    );
    expect(linked.linkedSignals.some((row) => row.reasonCode === "risk_linked_to_canonical_action")).toBe(true);
    expect(linked.linkedSignals.some((row) => row.reasonCode === "change_linked_to_canonical_risk")).toBe(true);

    const unlinked = interpret(
      [canonicalRisk({ id: "r-a", category: "schedule" })],
      publishedChangeState({
        stateId: "ch1",
        projectId: "p1",
        changeClass: "schedule",
        impact: { schedule: "supported" },
      }),
    );
    expect(unlinked.linkedSignals).toHaveLength(0);
  });

  it("isolates risk failure from change and change failure from risk", () => {
    const riskFail = interpretRiskChangeIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFromRiskChange(
        riskSliceFrom([], { availability: "error", bound: false }),
        changeSliceFrom(publishedChangeState({ stateId: "ch1", projectId: "p1", statusContext: "approved_context" })),
      ),
    });
    expect(riskFail.risk.availability).toBe("error");
    expect(riskFail.change.health.classification).toBe("GREEN");

    const changeFail = interpretRiskChangeIntelligence({
      projectId: "p1",
      tenantId: "tenant",
      workspaceId: "workspace",
      generatedAt,
      snapshot: snapshotFromRiskChange(
        riskSliceFrom([canonicalRisk({ id: "r1", priority: "critical", score: 20 })]),
        changeSliceFrom(null, { availability: "error" }),
      ),
    });
    expect(changeFail.change.availability).toBe("error");
    expect(changeFail.risk.health.classification).toBe("RED");
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

    const workspace = new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity({ workspaceId: "other-ws" }), greenCore()),
      controls: new InMemoryCommandCentreControlsPort(emptyControlsSnapshot()),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
    });
    await expect(workspace.compose({ projectId: "p1", context: access, generatedAt })).rejects.toMatchObject({
      code: "project_forbidden",
    });
  });

  it("works with AI disabled and isolates a throwing risk/change source on Command Centre", async () => {
    const view = await new ProjectRiskChangeIntelligenceService(
      new InMemoryRiskChangeIntelligencePort(undefined, "throw"),
    ).compose({ projectId: "p1", context: access, generatedAt });
    expect(view.aiRequired).toBe(false);
    expect(view.mutatesRisk).toBe(false);
    expect(view.mutatesChange).toBe(false);
    expect(view.risk.availability).toBe("error");
    expect(view.change.availability).toBe("error");

    const cc = await new ProjectCommandCentreService({
      core: new InMemoryCommandCentreCorePort(sampleProjectIdentity(), greenCore()),
      controls: new InMemoryCommandCentreControlsPort({
        ...emptyControlsSnapshot(),
        schedule: publishedControls({ assessmentId: "s1", projectId: "p1", posture: "on_track" }),
        change: publishedControls({ assessmentId: "ch1", projectId: "p1", posture: "approved_context" }),
      }),
      knowledge: new InMemoryCommandCentreKnowledgePort(greenKnowledge()),
      riskChange: new InMemoryRiskChangeIntelligencePort(
        snapshotFromRiskChange(
          riskSliceFrom([], { availability: "error", bound: false }),
          changeSliceFrom(publishedChangeState({ stateId: "ch1", projectId: "p1", statusContext: "approved_context" })),
        ),
      ),
    }).compose({ projectId: "p1", context: access, generatedAt });
    expect(cc.riskChangeIntelligence.risk.availability).toBe("error");
    expect(cc.riskChangeIntelligence.change.health.classification).toBe("GREEN");
    expect(cc.healthDimensions).toHaveLength(PROJECT_HEALTH_DIMENSIONS.length);
  });

  it("fails closed on forbidden dedicated risk/change reads", async () => {
    await expect(
      new ProjectRiskChangeIntelligenceService(
        new InMemoryRiskChangeIntelligencePort(
          snapshotFromRiskChange(
            riskSliceFrom([], { availability: "forbidden", bound: false }),
            changeSliceFrom(null),
          ),
        ),
      ).compose({ projectId: "p1", context: access, generatedAt }),
    ).rejects.toMatchObject({ code: "project_forbidden" });
  });

  it("preserves quality boundary and evidence without copying the register", () => {
    const view = interpret([canonicalRisk({ id: "r-ref", title: "Do not persist" })], null);
    expect(view.qualityBoundary.inspectionIntegrated).toBe(false);
    expect(view.risk.evidenceReferences[0]).toEqual(
      expect.objectContaining({
        sourceDomain: "engineering_core",
        entityType: "risk",
        entityId: "r-ref",
        storesCanonicalCopy: false,
      }),
    );
    expect(view.persisted).toBe(false);
    expect(view.readOnly).toBe(true);
    expect(view.risk.trend).toBe("unavailable");
  });

  it("does not implement a duplicate risk, change, or Project Controls engine", () => {
    expect(duplicateRiskDomainDetected).toBe(false);
    expect(duplicateChangeEngineDetected).toBe(false);
    expect(duplicateProjectControlsEngineDetected).toBe(false);
    expect(duplicateCanonicalProjectDomainDetected).toBe(false);
    expect(PI_RISK_MUTATION_ENABLED).toBe(false);
    expect(PI_CHANGE_MUTATION_ENABLED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(RISK_CHANGE_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED).toBe(false);
    const dir = resolve(__dirname, "../src/risk-change-intelligence");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".ts") || file === "ownership.ts") continue;
      const source = readFileSync(resolve(dir, file), "utf8");
      expect(source).not.toMatch(/@rtb\/project-controls/);
      expect(source).not.toMatch(/\.insert\(/);
      expect(source).not.toMatch(/\.update\(/);
      for (const token of FORBIDDEN_RISK_CHANGE_ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
    }
  });
});
