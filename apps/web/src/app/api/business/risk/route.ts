import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.businessRisk.list(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required", code: "risk_title_required" }, { status: 400 });
  }
  try {
    const data = await ctx.business.businessRisk.createRisk(scope, {
      title,
      description: typeof body.description === "string" ? body.description : null,
      category: typeof body.category === "string" ? (body.category as never) : undefined,
      domain: typeof body.domain === "string" ? body.domain : null,
      ownerLabel: typeof body.ownerLabel === "string" ? body.ownerLabel : null,
      status: typeof body.status === "string" ? (body.status as never) : undefined,
      sourceType: typeof body.sourceType === "string" ? body.sourceType : "manual",
      sourceRef: typeof body.sourceRef === "string" ? body.sourceRef : undefined,
      reviewAt: typeof body.reviewAt === "string" ? body.reviewAt : null,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");

export const PATCH = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id is required", code: "invalid_input" }, { status: 400 });
  try {
    const data = await ctx.business.businessRisk.updateRisk(scope, id, {
      title: typeof body.title === "string" ? body.title : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      ownerLabel: typeof body.ownerLabel === "string" ? body.ownerLabel : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      reviewAt: typeof body.reviewAt === "string" ? body.reviewAt : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
