import { NextResponse } from "next/server";
import { PROJECT_REPORT_TYPES, type ProjectReportType } from "@rtb/project-intelligence";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import {
  exportGeneratedProjectReport,
  generateProjectReport,
} from "@/lib/project-intelligence/project-reporting-service";
import { handleCommerceDomainError, lifecycleErrorResponse } from "@/lib/lifecycle-api";

function parseReportType(value: unknown): ProjectReportType | null {
  return typeof value === "string" && (PROJECT_REPORT_TYPES as readonly string[]).includes(value)
    ? (value as ProjectReportType)
    : null;
}

export const GET = withEngineeringApiParams(
  "project-intelligence-reports",
  async (context, _request, { projectId }) => {
    try {
      requireProjectIntelligenceRead(context);
      return NextResponse.json({
        data: {
          projectId: projectId || undefined,
          reportTypes: PROJECT_REPORT_TYPES,
          persisted: false,
          readOnly: true,
          aiOptional: true,
          exportFormats: ["markdown"],
          mutationEnabled: false,
          autonomousApprovalEnabled: false,
        },
      });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);

export const POST = withEngineeringApiParams(
  "project-intelligence-reports",
  async (context, request, { projectId }) => {
    try {
      requireProjectIntelligenceRead(context);
      if (!context.ctx.workspaceId) {
        return lifecycleErrorResponse(
          "workspace_not_assigned",
          "An assigned workspace is required",
          403,
          context.correlationId,
        );
      }
      if (!projectId) {
        return lifecycleErrorResponse("report_project_required", "projectId is required", 400, context.correlationId);
      }
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
      return NextResponse.json({ data: snapshot });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
