import { NextResponse } from "next/server";
import { PROJECT_REPORT_TYPES, type ProjectReportType } from "@rtb/project-intelligence";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { piProjectScopeResponse } from "@/lib/project-intelligence/pi-route";
import {
  exportGeneratedProjectReport,
  generateProjectReport,
} from "@/lib/project-intelligence/project-reporting-service";
import { lifecycleErrorResponse, lifecycleOkResponse } from "@/lib/lifecycle-api";

function parseReportType(value: unknown): ProjectReportType | null {
  return typeof value === "string" && (PROJECT_REPORT_TYPES as readonly string[]).includes(value)
    ? (value as ProjectReportType)
    : null;
}

export const GET = withEngineeringApiParams(
  "project-intelligence-reports",
  async (context, _request, { projectId }) => {
    requireProjectIntelligenceRead(context);
    return lifecycleOkResponse({
      projectId: projectId || undefined,
      reportTypes: PROJECT_REPORT_TYPES,
      persisted: false,
      readOnly: true,
      aiOptional: true,
      exportFormats: ["markdown"],
      mutationEnabled: false,
      autonomousApprovalEnabled: false,
    });
  },
);

export const POST = withEngineeringApiParams(
  "project-intelligence-reports",
  async (context, request, { projectId }) => {
    requireProjectIntelligenceRead(context);
    const denied = piProjectScopeResponse(context, projectId);
    if (denied) return denied;
    const body = (await request.json().catch(() => ({}))) as {
      reportType?: string;
      includeAi?: boolean;
      export?: string;
    };
    const reportType = parseReportType(body.reportType);
    if (!reportType) {
      return lifecycleErrorResponse(
        "report_type_required",
        "reportType must be project_status_report, executive_project_brief, or management_attention_report",
        400,
        context.correlationId,
      );
    }
    const snapshot = await generateProjectReport(context, projectId, reportType, {
      includeAi: body.includeAi !== false,
    });
    if (body.export === "markdown") {
      return new NextResponse(exportGeneratedProjectReport(snapshot), {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${snapshot.projectCode}-${snapshot.reportType}.md"`,
        },
      });
    }
    return lifecycleOkResponse(snapshot);
  },
);
