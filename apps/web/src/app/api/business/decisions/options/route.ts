import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import { BUSINESS_DECISION_OPTION_STATUSES, type BusinessDecisionOptionInput, type BusinessDecisionOptionStatus } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const decisionId = new URL(request.url).searchParams.get("decisionId") ?? "";
  try {
    const data = await ctx.business.decisionAction.repository.listOptions(scope, decisionId || undefined);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  if (!body.decisionId || !body.title || !body.sourceType) {
    return NextResponse.json(
      { error: "decisionId, title and sourceType are required", code: "invalid_input" },
      { status: 400 },
    );
  }
  try {
    const data = await ctx.business.decisionAction.createOption(scope, body as unknown as BusinessDecisionOptionInput);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.manage");

export const PATCH = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as BusinessDecisionOptionStatus;
  if (!id || !BUSINESS_DECISION_OPTION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and valid status are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.decisionAction.updateOptionStatus(scope, id, status);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.manage");
