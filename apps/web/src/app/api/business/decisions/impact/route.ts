import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessDecisionImpactInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const optionId = new URL(request.url).searchParams.get("optionId") ?? "";
  try {
    const data = await ctx.business.decisionAction.repository.listImpacts(scope, optionId ? [optionId] : undefined);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  if (!body.optionId || !body.dimension) {
    return NextResponse.json({ error: "optionId and dimension are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.decisionAction.recordImpact(scope, body as unknown as BusinessDecisionImpactInput);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.manage");
