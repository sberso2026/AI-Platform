/**
 * Phase 8E — Typed handoff to Reporting Intelligence (no broad report authoring).
 */
export type FindingsReportingHandoff = {
  kind: "findings_intelligence.reporting_handoff";
  featureKey: "findings_intelligence";
  targetFeatureKey: "reporting_intelligence";
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  metrics: {
    findingSummaryCount: number;
    openFindings: number;
    overdueReview: number;
    severityDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    convertedFindings: number;
    recurringPatterns: number;
    unresolvedConflicts: number;
    evidenceCoverageRatio: number;
    reviewPerformance: { completed: number; pending: number };
  };
  generatedAt: string;
  mayAuthorReports: false;
};

export function createFindingsReportingHandoff(input: {
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  metrics: FindingsReportingHandoff["metrics"];
  now?: string;
}): FindingsReportingHandoff {
  return {
    kind: "findings_intelligence.reporting_handoff",
    featureKey: "findings_intelligence",
    targetFeatureKey: "reporting_intelligence",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    metrics: input.metrics,
    generatedAt: input.now ?? new Date().toISOString(),
    mayAuthorReports: false,
  };
}
