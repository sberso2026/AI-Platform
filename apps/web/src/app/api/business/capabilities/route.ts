import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

export const GET = withBusinessApi(async ({ ctx }) => {
  const data = ctx.business.capabilities.list();
  return NextResponse.json({ data });
});
