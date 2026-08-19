import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";
import type { BusinessContextNodeType } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const params = new URL(request.url).searchParams;
  const entityType = (params.get("type") ?? "customer") as BusinessContextNodeType;
  const entityId = params.get("id") ?? "";
  if (!entityId) return NextResponse.json({ error: "id is required", code: "invalid_input" }, { status: 400 });
  try {
    const data = await ctx.business.businessContextGraph.explain(scope, { entityType, entityId });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_context.view");
