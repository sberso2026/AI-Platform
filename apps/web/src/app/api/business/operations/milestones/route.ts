import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessWorkMilestoneIngestInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const workId = new URL(request.url).searchParams.get("workId") ?? undefined;
  try {
    const data = await ctx.business.workOperations.repository.listMilestones(scope, workId);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.work_operations.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.workOperations.ingestMilestone(
      scope,
      body as unknown as BusinessWorkMilestoneIngestInput,
    );
    return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.work_operations.manage");
