import { describe, expect, it } from "vitest";
import {
  EXECUTIVE_DASHBOARD_WIDGET_IDS,
  assertNoDuplicateWidgetStorage,
  assertReportingIntelligenceSharedServices,
  buildExecutiveDashboardSnapshot,
  generateExecutiveSummaryDraft,
  publishExecutiveSummary,
} from "../src/index";

describe("Executive Intelligence Dashboard", () => {
  it("binds shared reporting services and forbids duplicate widget storage", () => {
    expect(() => assertReportingIntelligenceSharedServices()).not.toThrow();
    expect(() => assertNoDuplicateWidgetStorage()).not.toThrow();
    expect(EXECUTIVE_DASHBOARD_WIDGET_IDS).toContain("ai_executive_summary");
    expect(EXECUTIVE_DASHBOARD_WIDGET_IDS).toContain("project_health");
  });

  it("builds live aggregation snapshots with drill-downs", () => {
    const snapshot = buildExecutiveDashboardSnapshot({
      tenantId: "t1",
      workspaceId: "w1",
      counts: {
        activeProjects: 2,
        highRiskAssets: 1,
        openFindings: 3,
        convertedFindings: 1,
        openRisks: 4,
        openIssues: 2,
        openActions: 5,
        openTechnicalQueries: 1,
        lessons: 2,
        meetingSessions: 6,
        documentsReady: 10,
        documentsProcessing: 1,
        approvalQueue: 2,
        evidenceCoverageRatio: 0.8,
        auditEventsRecent: 3,
        timelineEventsRecent: 4,
      },
    });
    expect(snapshot.liveAggregation).toBe(true);
    expect(snapshot.duplicateStorage).toBe(false);
    expect(snapshot.widgets.length).toBe(EXECUTIVE_DASHBOARD_WIDGET_IDS.length);
    expect(snapshot.widgets.find((w) => w.widgetId === "open_findings")?.drillDownPath).toContain(
      "/findings",
    );
  });

  it("requires human review before publishing AI executive summary", () => {
    const draft = generateExecutiveSummaryDraft({
      metricsSummary: "openFindings=3; openRisks=4",
      citations: [{ source: "findings_intelligence", refId: "findings.open" }],
      traceId: "trace-1",
    });
    expect(draft.humanReviewRequired).toBe(true);
    expect(draft.mayPublishWithoutHuman).toBe(false);
    expect(draft.usesPlatformAiRuntime).toBe(true);
    expect(() =>
      publishExecutiveSummary({ draft, reviewerUserId: "" }),
    ).toThrow(/Human reviewer/);
    const published = publishExecutiveSummary({ draft, reviewerUserId: "reviewer-1" });
    expect(published.status).toBe("published");
    expect(published.citations.length).toBeGreaterThan(0);
  });
});
