import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessDecisionEvidenceInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const decisionId = new URL(request.url).searchParams.get("decisionId") ?? "";
  try {
    const data = await ctx.business.decisionAction.repository.listEvidence(scope, decisionId || undefined);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  if (!body.decisionId || !body.sourceType || !body.sourceRef || !body.summary || !body.sourceDomain) {
    return NextResponse.json(
      { error: "decisionId, sourceType, sourceDomain, sourceRef and summary are required", code: "invalid_input" },
      { status: 400 },
    );
  }
  try {
    const data = await ctx.business.decisionAction.addEvidence(scope, body as unknown as BusinessDecisionEvidenceInput);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.manage");
