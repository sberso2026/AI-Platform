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
  filters: Record<string, string>,
): Promise<number> {
  const supabase = serviceClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { count, error } = await query;
  if (error) {
    if (/does not exist|schema cache|Could not find/i.test(error.message)) return 0;
    return 0;
  }
  return count ?? 0;
}

export async function loadExecutiveDashboard(
  context: CommerceHandlerContext,
): Promise<ExecutiveDashboardSnapshot> {
  const workspaceId = requireWorkspace(context);
  const tenantId = context.ctx.tenantId;

  const scoped = { tenant_id: tenantId, workspace_id: workspaceId };
  const tenantScoped = { tenant_id: tenantId };

  const [
    activeProjects,
    openRisks,
    openIssues,
    openActions,
    openTechnicalQueries,
    lessons,
    meetingSessions,
    documentsReady,
    documentsProcessing,
    openFindings,
    convertedFindings,
    approvalQueue,
    evidenceAnswered,
    evidenceCitations,
  ] = await Promise.all([
    countRows("engineering_projects", { ...tenantScoped, status: "active" }),
    countRows("engineering_risks", tenantScoped),
    countRows("engineering_issues", tenantScoped),
    countRows("engineering_actions", tenantScoped),
    countRows("engineering_technical_queries", tenantScoped),
    countRows("engineering_lessons", tenantScoped),
    countRows("project_intelligence_meeting_sessions", scoped),
    countRows("project_intelligence_document_ingestions", { ...scoped, status: "ready" }),
    countRows("project_intelligence_document_ingestions", { ...scoped, status: "queued" }),
    countRows("project_intelligence_document_findings", { ...scoped, review_state: "pending" }),
    countRows("project_intelligence_document_findings", { ...scoped, review_state: "approved" }),
    countRows("project_intelligence_document_review_items", { ...scoped, review_state: "pending" }),
    countRows("project_intelligence_document_answer_traces", {
      ...scoped,
      answer_status: "answered",
    }),
    countRows("project_intelligence_document_citations", scoped),
  ]);

  const evidenceTotal = Math.max(1, evidenceCitations);

  return buildExecutiveDashboardSnapshot({
    tenantId,
    workspaceId,
    counts: {
      activeProjects,
      highRiskAssets: 0,
      openFindings,
      convertedFindings,
      openRisks,
      openIssues,
      openActions,
      openTechnicalQueries,
      lessons,
      meetingSessions,
      documentsReady,
      documentsProcessing,
      approvalQueue,
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
      source: (["document_intelligence", "meeting_intelligence", "findings_intelligence", "engineering_core"].includes(
        c.source,
      )
        ? c.source
        : "engineering_core") as
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
