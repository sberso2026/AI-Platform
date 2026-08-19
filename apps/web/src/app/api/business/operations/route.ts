import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessWorkItemIngestInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const includeAi = new URL(request.url).searchParams.get("narrative") === "true";
    const data = await ctx.business.workOperations.summary(scope);
    const narrative = includeAi ? await ctx.business.workOperations.explain(scope) : null;
    return NextResponse.json({ data: { ...data, narrative } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.work_operations.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  if (!body.reference || !body.name || !body.workType || !body.currency || !body.sourceType) {
    return NextResponse.json(
      { error: "reference, name, workType, currency and sourceType are required", code: "invalid_input" },
      { status: 400 },
    );
  }
  try {
    const data = await ctx.business.workOperations.ingestWork(
      scope,
      body as unknown as BusinessWorkItemIngestInput,
    );
    return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.work_operations.manage");
