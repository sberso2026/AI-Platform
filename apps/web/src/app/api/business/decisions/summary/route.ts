import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const includeAi = new URL(request.url).searchParams.get("narrative") === "true";
    const data = await ctx.business.decisionAction.summary(scope);
    const narrative = includeAi ? await ctx.business.decisionAction.explain(scope) : null;
    return NextResponse.json({ data: { ...data, narrative } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.view");
