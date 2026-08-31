import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [product, engineering, documents, inspection, controls, ai] = await Promise.all([
    ctx.commerce.entitlements.check({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      productKey: "engineering-os",
      action: "access",
    }),
    ctx.commerce.entitlements.check({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      productKey: "engineering-os",
      applicationKey: "project_intelligence",
      action: "access",
    }),
    ctx.commerce.entitlements.check({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      productKey: "engineering-os",
      applicationKey: "documents",
      action: "access",
    }),
    ctx.commerce.entitlements.check({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      productKey: "engineering-os",
      applicationKey: "inspection_intelligence",
      action: "access",
    }),
    ctx.commerce.entitlements.check({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      productKey: "engineering-os",
      applicationKey: "project_controls",
      action: "access",
    }),
    ctx.commerce.entitlements.check({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      productKey: "engineering-os",
      featureKey: "ai_assistant",
      action: "ai.execute",
    }),
  ]);

  return NextResponse.json({
    data: {
      engineering_os: product,
      project_intelligence: engineering,
      documents,
      inspection_intelligence: inspection,
      project_controls: controls,
      ai_assistant: ai,
    },
  });
}
