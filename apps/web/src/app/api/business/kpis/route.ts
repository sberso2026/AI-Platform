import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessKpiCategory } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.ownerCommand.repository.listKpis(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.view");

export const PATCH = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const key = typeof body.key === "string" ? body.key : "";
  const name = typeof body.name === "string" ? body.name : "";
  if (!key || !name) {
    return NextResponse.json({ error: "key and name are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.ownerCommand.upsertKpi(scope, {
      key,
      name,
      description: typeof body.description === "string" ? body.description : undefined,
      category: body.category as BusinessKpiCategory | undefined,
      unit: typeof body.unit === "string" ? body.unit : undefined,
      value: body.value === null || typeof body.value === "number" ? body.value : undefined,
      target: body.target === null || typeof body.target === "number" ? body.target : undefined,
      warningThreshold:
        body.warningThreshold === null || typeof body.warningThreshold === "number"
          ? body.warningThreshold
          : undefined,
      criticalThreshold:
        body.criticalThreshold === null || typeof body.criticalThreshold === "number"
          ? body.criticalThreshold
          : undefined,
      direction:
        body.direction === "lower_is_better" || body.direction === "higher_is_better"
          ? body.direction
          : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.manage");
