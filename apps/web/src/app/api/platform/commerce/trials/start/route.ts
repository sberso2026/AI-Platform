import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { CommerceDomainError } from "@rtb/platform-commerce";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  try {
    const result = await ctx.commerce.trials.startTrial({
      tenantId: ctx.tenantId,
      productId: body.productId,
      planId: body.planId,
      workspaceId: body.workspaceId ?? ctx.workspaceId,
      actorUserId: ctx.userId,
      trialDays: body.trialDays,
      seatLimit: body.seatLimit,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
