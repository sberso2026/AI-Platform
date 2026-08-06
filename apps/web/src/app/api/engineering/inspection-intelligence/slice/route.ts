import { NextResponse } from "next/server";
import { runVerticalSliceHappyPath } from "@rtb/inspection-intelligence/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("inspection-intelligence-slice", async (context) => {
  return NextResponse.json({
    moduleKey: "inspection_intelligence",
    version: "0.5.0-operational-workflows",
    verticalSliceReady: true,
    enterpriseFoundationReady: true,
    engineeringDomainComplete: true,
    operationalWorkflowsReady: true,
    couplesVia: "inspection_target",
    tenantId: context.ctx.tenantId,
    workspaceId: context.ctx.workspaceId,
  });
});

export const POST = withEngineeringApi("inspection-intelligence-slice", async (context) => {
  const store = runVerticalSliceHappyPath({
    tenantId: context.ctx.tenantId,
    workspaceId: context.ctx.workspaceId ?? "workspace-required",
  });
  return NextResponse.json(
    {
      ok: true,
      templateId: store.templates[0]?.id,
      planId: store.plans[0]?.id,
      sessionId: store.sessions[0]?.id,
      sessionStatus: store.sessions[0]?.status,
      evidenceHash: store.evidence[0]?.contentHash,
      eventCount: store.events.length,
    },
    { status: 201 },
  );
});
