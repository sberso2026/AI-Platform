const PROJECT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveDashboardProjectFilter(raw?: string | null): {
  projectId?: string;
  forceEmpty: boolean;
} {
  const id = raw?.trim();
  if (!id || id.toLowerCase() === "all") {
    return { forceEmpty: false };
  }
  if (!PROJECT_ID_RE.test(id)) {
    return { forceEmpty: true };
  }
  return { projectId: id, forceEmpty: false };
}

export function emptyEngineeringDashboard() {
  return {
    activeProjects: [] as Array<{ id: string; status?: string }>,
    highRiskAssets: [] as unknown[],
    recentDocuments: [] as unknown[],
    recentAiRuns: [] as unknown[],
    applications: [] as unknown[],
    reviewRequiredCount: 0,
    openActionsCount: 0,
    pendingDecisionsCount: 0,
    openRisksCount: 0,
    openIssuesCount: 0,
    openTechnicalQueriesCount: 0,
    lessonsCount: 0,
    platformHealth: {
      engineeringOs: "operational",
      aiDirector: "operational",
      knowledgeGraph: "operational",
      digitalTwin: "operational",
    },
  };
}
