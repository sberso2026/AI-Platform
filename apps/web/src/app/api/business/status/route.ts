import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

export const GET = withBusinessApi(async ({ ctx }) => {
  const data = ctx.business.status.snapshot();
  try {
    await ctx.kernel.eventBus.publish({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      eventType: "business_os.foundation.status.requested",
      source: "business-os",
      payload: { osId: data.osId, phase: data.phase },
    });
  } catch {
    // Event persistence must not block foundation reads.
  }
  return NextResponse.json({ data });
});
