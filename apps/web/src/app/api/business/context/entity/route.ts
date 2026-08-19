import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessContextNodeType } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const params = new URL(request.url).searchParams;
  const entityType = (params.get("type") ?? params.get("entityType") ?? "") as BusinessContextNodeType;
  const entityId = params.get("id") ?? params.get("entityId") ?? "";
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "type and id are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.businessContextGraph.entityContext(scope, { entityType, entityId });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_context.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const entityType = String(body.entityType ?? "");
  const entityId = String(body.entityId ?? "");
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "type and id are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.businessContextGraph.entityContext(scope, {
      entityType: entityType as BusinessContextNodeType,
      entityId,
      depth: typeof body.depth === "number" ? body.depth : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_context.view");
