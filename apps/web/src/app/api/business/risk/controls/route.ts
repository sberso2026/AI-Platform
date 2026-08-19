import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.businessRisk.repository.listControls(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.businessRisk.createControl(scope, {
      name: typeof body.name === "string" ? body.name : "",
      description: typeof body.description === "string" ? body.description : null,
      controlType: typeof body.controlType === "string" ? (body.controlType as never) : undefined,
      ownerLabel: typeof body.ownerLabel === "string" ? body.ownerLabel : null,
      status: typeof body.status === "string" ? (body.status as never) : undefined,
      effectiveness: typeof body.effectiveness === "string" ? (body.effectiveness as never) : undefined,
      evidenceRefs: Array.isArray(body.evidenceRefs) ? (body.evidenceRefs as never) : [],
      riskId: typeof body.riskId === "string" ? body.riskId : undefined,
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
    const data = await ctx.business.businessRisk.updateControl(scope, id, {
      status: typeof body.status === "string" ? (body.status as never) : undefined,
      effectiveness: typeof body.effectiveness === "string" ? (body.effectiveness as never) : undefined,
      evidenceRefs: Array.isArray(body.evidenceRefs) ? (body.evidenceRefs as never) : undefined,
      testedAt: typeof body.testedAt === "string" ? body.testedAt : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
