import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET(request: Request) {
  const started = Date.now();
  const ctx = await getAuthContext();
  const afterAuth = Date.now();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [product, engineering] = await Promise.all([
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
  ]);
  const afterEntitlement = Date.now();

  const payload = {
    data: {
      engineering_os: product,
      project_intelligence: engineering,
    },
  };
  if (new URL(request.url).searchParams.get("profile") !== "1") {
    return NextResponse.json(payload);
  }

  return NextResponse.json({
    ...payload,
    profile: {
      security: {
        getAuthContextMs: afterAuth - started,
        entitlementMs: afterEntitlement - afterAuth,
        totalMs: afterEntitlement - started,
        auth: ctx.authProfile,
        entitlement: ctx.commerce.entitlements.lastProfile ?? undefined,
      },
      domainMs: 0,
    },
  });
}
