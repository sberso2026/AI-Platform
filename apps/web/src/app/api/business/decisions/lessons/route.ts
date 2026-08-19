import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessDecisionLessonInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const decisionId = new URL(request.url).searchParams.get("decisionId") ?? "";
  try {
    const data = await ctx.business.decisionAction.repository.listLessons(scope, decisionId || undefined);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  if (!body.decisionId || !body.lessonText || !body.sourceType) {
    return NextResponse.json(
      { error: "decisionId, lessonText and sourceType are required", code: "invalid_input" },
      { status: 400 },
    );
  }
  try {
    const data = await ctx.business.decisionAction.draftLesson(scope, body as unknown as BusinessDecisionLessonInput);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.decision_action.manage");
