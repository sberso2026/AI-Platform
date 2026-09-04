import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

const OPEN_STATUSES = new Set([
  "candidate",
  "triage_pending",
  "under_review",
  "changes_requested",
  "accepted",
  "conversion_proposed",
  "reopened",
]);

export const GET = withEngineeringApi("project-intelligence-findings", async (context, request) => {
  try {
    requireProjectIntelligenceRead(context);
    if (!context.ctx.workspaceId) {
      return NextResponse.json({ data: [] });
    }
    const projectId = new URL(request.url).searchParams.get("projectId");
    let query = context.ctx.supabase
      .from("project_intelligence_findings")
      .select(
        "id,title,status,proposed_severity,confirmed_severity,proposed_priority,updated_at,created_at,engineering_project_id,conflict_state",
      )
      .eq("tenant_id", context.ctx.tenantId)
      .eq("workspace_id", context.ctx.workspaceId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (projectId) query = query.eq("engineering_project_id", projectId);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({
      data: (data ?? []).map((row) => {
        const status = String(row.status ?? "candidate");
        const severity = String(row.confirmed_severity ?? row.proposed_severity ?? "medium");
        return {
          id: String(row.id),
          title: String(row.title ?? "Finding"),
          status,
          severity,
          priority: row.proposed_priority ? String(row.proposed_priority) : null,
          open: OPEN_STATUSES.has(status),
          conflict: String(row.conflict_state ?? "none"),
          updatedAt: row.updated_at ? String(row.updated_at) : null,
          createdAt: row.created_at ? String(row.created_at) : null,
        };
      }),
    });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
