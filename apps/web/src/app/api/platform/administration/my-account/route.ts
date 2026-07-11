import { NextResponse } from "next/server";
import { buildMyAccountView, mapUsageMetrics } from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [productDecision, piDecision, usageAgg, workspacesRes] = await Promise.all([
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
    ctx.commerce.usage.aggregateByTenant(ctx.tenantId, monthStart, new Date().toISOString()),
    ctx.supabase
      .from("workspaces")
      .select("id, name")
      .eq("tenant_id", ctx.tenantId)
      .eq("status", "active"),
  ]);

  const workspaces = (workspacesRes.data ?? []).map((w) => ({
    id: w.id as string,
    name: w.name as string,
  }));

  const view = buildMyAccountView({
    entitlements: {
      engineeringOs: productDecision.allowed ? { allowed: true } : undefined,
      applications: piDecision.allowed
        ? [
            {
              appKey: "project_intelligence",
              name: "Project Intelligence",
              allowed: true,
              openHref: "/engineering/project-intelligence",
            },
          ]
        : [],
    },
    workspaces,
    personalUsage: mapUsageMetrics(usageAgg),
  });

  return NextResponse.json({ data: view });
}
