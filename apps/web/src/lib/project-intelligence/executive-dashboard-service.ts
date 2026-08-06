import { createClient } from "@supabase/supabase-js";
import {
  buildExecutiveDashboardSnapshot,
  generateExecutiveSummaryDraft,
  publishExecutiveSummary,
  type ExecutiveDashboardSnapshot,
  type ExecutiveSummaryDraft,
  type ExecutiveSummaryPublished,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";

function requireWorkspace(context: CommerceHandlerContext): string {
  if (!context.ctx.workspaceId) {
    throw new Error("workspace_not_assigned");
  }
  return context.ctx.workspaceId;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service configuration missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function countRows(
  table: string,
  tenantId: string,
  workspaceId: string,
  filters?: Record<string, string>,
): Promise<number> {
  const supabase = serviceClient();
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
  }
  const { count, error } = await query;
  if (error) {
    // Table may be absent before migration apply — live aggregation degrades to zero.
    if (/does not exist|schema cache|Could not find/i.test(error.message)) return 0;
    throw error;
  }
  return count ?? 0;
}

export async function loadExecutiveDashboard(
  context: CommerceHandlerContext,
): Promise<ExecutiveDashboardSnapshot> {
  const workspaceId = requireWorkspace(context);
  const tenantId = context.ctx.tenantId;
  const commerce = context.commerce;

  const dashboard = await context.ctx.engineering.dashboard.getDashboard(commerce, tenantId);

  const [
    meetingSessions,
    documentsReady,
    documentsProcessing,
    openFindings,
    convertedFindings,
    approvalQueue,
  ] = await Promise.all([
    countRows("project_intelligence_meeting_sessions", tenantId, workspaceId),
    countRows("project_intelligence_document_ingestions", tenantId, workspaceId, {
      status: "ready",
    }),
    countRows("project_intelligence_document_ingestions", tenantId, workspaceId, {
      status: "queued",
    }),
    countRows("project_intelligence_document_findings", tenantId, workspaceId, {
      review_state: "pending",
    }),
    countRows("project_intelligence_document_findings", tenantId, workspaceId, {
      review_state: "approved",
    }),
    countRows("project_intelligence_document_review_items", tenantId, workspaceId, {
      review_state: "pending",
    }),
  ]);

  const evidenceTotal =
    (await countRows("project_intelligence_document_citations", tenantId, workspaceId)) || 1;
  const evidenceAnswered = await countRows(
    "project_intelligence_document_answer_traces",
    tenantId,
    workspaceId,
    { answer_status: "answered" },
  );

  return buildExecutiveDashboardSnapshot({
    tenantId,
    workspaceId,
    counts: {
      activeProjects: dashboard.activeProjects.length,
      highRiskAssets: dashboard.highRiskAssets.length,
      openFindings,
      convertedFindings,
      openRisks: dashboard.openRisksCount,
      openIssues: dashboard.openIssuesCount,
      openActions: dashboard.openActionsCount,
      openTechnicalQueries: dashboard.openTechnicalQueriesCount,
      lessons: dashboard.lessonsCount,
      meetingSessions,
      documentsReady,
      documentsProcessing,
      approvalQueue: approvalQueue + dashboard.reviewRequiredCount,
      evidenceCoverageRatio: Math.min(1, evidenceAnswered / evidenceTotal),
      auditEventsRecent: 0,
      timelineEventsRecent: 0,
    },
  });
}

export function draftExecutiveSummaryFromSnapshot(
  snapshot: ExecutiveDashboardSnapshot,
  traceId: string,
): ExecutiveSummaryDraft {
  const parts = snapshot.widgets
    .filter((w) => w.widgetId !== "ai_executive_summary")
    .slice(0, 8)
    .map((w) => `${w.label}=${w.value}`)
    .join("; ");
  const citations = snapshot.widgets.flatMap((w) =>
    (w.citations ?? []).map((c) => ({
      source: c.source as
        | "document_intelligence"
        | "meeting_intelligence"
        | "findings_intelligence"
        | "engineering_core",
      refId: c.refId,
      excerpt: c.excerpt,
    })),
  );
  const fallbackCitations =
    citations.length > 0
      ? citations
      : [
          {
            source: "engineering_core" as const,
            refId: "dashboard.live",
            excerpt: "Live Engineering Core aggregation",
          },
        ];
  return generateExecutiveSummaryDraft({
    metricsSummary: parts || "No metrics available",
    citations: fallbackCitations,
    traceId,
  });
}

export function publishExecutiveSummaryDraft(
  draft: ExecutiveSummaryDraft,
  reviewerUserId: string,
): ExecutiveSummaryPublished {
  return publishExecutiveSummary({ draft, reviewerUserId });
}
