import { AuditService } from "@rtb/platform-core";
import {
  REPORT_NARRATIVE_QUESTIONS,
  assembleProjectReport,
  exportProjectReportMarkdown,
  finalizeProjectReport,
  reportOverlayIsMockSubstitution,
  type ProjectReportSnapshot,
  type ProjectReportType,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { overlayAnalystAnswer } from "./ai-project-analyst-service";
import { projectIntelligenceAccessContext } from "./access";
import { composeProjectCommandCentre } from "./command-centre-service";
import { loadHostedConnectorContext } from "./hosted-connector-context-source";

export async function generateProjectReport(
  context: CommerceHandlerContext,
  projectId: string,
  reportType: ProjectReportType,
  options: { includeAi?: boolean } = {},
): Promise<ProjectReportSnapshot> {
  const { view } = await composeProjectCommandCentre(context, projectId);
  const connectorContext = await loadHostedConnectorContext(context, projectId, {
    health: view.overallHealth,
    scheduleState: view.scheduleIntelligence.health.classification,
    scheduleAvailability: view.scheduleIntelligence.availability,
  });
  const snapshot = assembleProjectReport({
    view,
    connectorContext,
    reportType,
    context: projectIntelligenceAccessContext(context),
    requestedProjectId: projectId,
    generatedAt: view.generatedAt,
  });

  if (options.includeAi === false) {
    return finalizeProjectReport({ snapshot, skippedReason: "ai_not_requested" });
  }

  try {
    const answer = await overlayAnalystAnswer(
      context,
      projectId,
      REPORT_NARRATIVE_QUESTIONS[reportType],
      view,
      connectorContext,
    );
    if (reportOverlayIsMockSubstitution(answer.aiProvider, answer.aiAvailable)) {
      return finalizeProjectReport({ snapshot, skippedReason: "mock_provider_not_substituted" });
    }
    const finalized = finalizeProjectReport({
      snapshot,
      answer,
      aiSummaryText: answer.claims.find((claim) => claim.kind === "AI_SUMMARY")?.text,
    });

    try {
      const audit = new AuditService(context.ctx.supabase);
      await audit.log({
        tenantId: context.ctx.tenantId,
        workspaceId: context.ctx.workspaceId,
        userId: context.ctx.userId,
        action: "project_intelligence.project_reporting.generate",
        resourceType: "project",
        resourceId: projectId,
        metadata: {
          reportType,
          snapshotId: finalized.snapshotId,
          aiAvailable: finalized.narrative.available,
          overlaySkippedReason: finalized.narrative.skippedReason,
          connectorAvailability: connectorContext.availability,
          persisted: false,
          readOnly: true,
        },
      });
    } catch {
      // Existing Platform audit is best-effort.
    }

    return finalized;
  } catch (error) {
    const skippedReason = error instanceof Error ? `ai_unavailable:${error.message.slice(0, 80)}` : "ai_unavailable";
    return finalizeProjectReport({ snapshot, skippedReason });
  }
}

export function exportGeneratedProjectReport(snapshot: ProjectReportSnapshot): string {
  return exportProjectReportMarkdown(snapshot);
}
