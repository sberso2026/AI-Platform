import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.businessRisk.settings(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.view");

export const PUT = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const data = await ctx.business.businessRisk.upsertSettings(scope, {
      defaultMaxAcceptableLevel:
        typeof body.defaultMaxAcceptableLevel === "string" ? (body.defaultMaxAcceptableLevel as never) : undefined,
      rules: Array.isArray(body.rules) ? (body.rules as never) : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
