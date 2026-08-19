import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id is required", code: "invalid_input" }, { status: 400 });
  try {
    const data = await ctx.business.businessRisk.detail(scope, id);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.view");
