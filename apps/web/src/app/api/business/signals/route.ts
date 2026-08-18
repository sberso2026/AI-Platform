import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import { BUSINESS_SIGNAL_STATUSES, type BusinessSignalStatus } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.ownerCommand.repository.listSignals(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.view");

export const PATCH = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as BusinessSignalStatus;
  if (!id || !BUSINESS_SIGNAL_STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and valid status are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.ownerCommand.updateSignal(scope, id, status);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.manage");
