import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const params = new URL(request.url).searchParams;
  const entityType = params.get("type") ?? "";
  const entityId = params.get("id") ?? "";
  const depth = params.get("depth") ? Number(params.get("depth")) : undefined;
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "type and id are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.businessContextGraph.neighbourhood(scope, { entityType, entityId, depth });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_context.view");
