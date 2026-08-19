import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.aiWorkforce.listApprovals(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.ai_workforce.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.aiWorkforce.decideApproval(
      scope,
      {
        approvalId: String(body.approvalId ?? ""),
        decision: body.decision === "rejected" ? "rejected" : "approved",
        reason: body.reason ? String(body.reason) : undefined,
      },
      { userId: ctx.userId, actorType: "human" },
    );
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.ai_workforce.approve");
