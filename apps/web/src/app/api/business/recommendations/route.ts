import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import { BUSINESS_RECOMMENDATION_STATUSES, type BusinessRecommendationStatus } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.ownerCommand.repository.listRecommendations(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.view");

export const PATCH = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as BusinessRecommendationStatus;
  if (!id || !BUSINESS_RECOMMENDATION_STATUSES.includes(status) || status === "proposed") {
    return NextResponse.json(
      { error: "id and accepted|rejected|superseded status are required", code: "invalid_input" },
      { status: 400 },
    );
  }
  try {
    const data = await ctx.business.ownerCommand.updateRecommendation(scope, id, status);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.manage");
