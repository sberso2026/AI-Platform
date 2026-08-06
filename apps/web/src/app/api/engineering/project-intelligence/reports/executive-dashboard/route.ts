import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import {
  draftExecutiveSummaryFromSnapshot,
  loadExecutiveDashboard,
  publishExecutiveSummaryDraft,
} from "@/lib/project-intelligence/executive-dashboard-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("project-intelligence-reports", async (context) => {
  try {
    requireProjectIntelligenceRead(context);
    const data = await loadExecutiveDashboard(context);
    return NextResponse.json({ data, correlationId: context.correlationId });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});

export const POST = withEngineeringApi("project-intelligence-reports", async (context, request) => {
  try {
    requireProjectIntelligenceRead(context);
    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "generate_summary";

    if (action === "generate_summary") {
      const snapshot = await loadExecutiveDashboard(context);
      const data = draftExecutiveSummaryFromSnapshot(snapshot, context.correlationId);
      return NextResponse.json({ data, correlationId: context.correlationId }, { status: 201 });
    }

    if (action === "publish_summary") {
      if (!body.draft || typeof body.draft !== "object") {
        return NextResponse.json(
          {
            error: {
              code: "executive_summary_draft_required",
              message: "Draft payload is required to publish",
              requestId: context.correlationId,
              details: {},
            },
          },
          { status: 400 },
        );
      }
      const data = publishExecutiveSummaryDraft(body.draft, context.ctx.userId);
      return NextResponse.json({ data, correlationId: context.correlationId });
    }

    return NextResponse.json(
      {
        error: {
          code: "executive_dashboard_action_invalid",
          message: "Unsupported executive dashboard action",
          requestId: context.correlationId,
          details: { action },
        },
      },
      { status: 400 },
    );
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
