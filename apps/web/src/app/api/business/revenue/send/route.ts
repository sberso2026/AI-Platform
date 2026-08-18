import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

/** BOS-4 does not send externally. This endpoint exists only to fail closed. */
export const POST = withBusinessApi(async () => {
  return NextResponse.json(
    {
      error: "BOS-4 does not send messages or submit proposals externally.",
      code: "external_send_forbidden",
    },
    { status: 403 },
  );
}, "business_os.revenue_execution.manage");
