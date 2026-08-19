import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.workOperations.seedDemo(scope);
    return NextResponse.json({ data, isDemo: true }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.work_operations.manage");
