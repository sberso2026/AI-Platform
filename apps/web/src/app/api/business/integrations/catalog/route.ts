import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    return NextResponse.json({ data: ctx.business.connectors.catalog() });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.view");
