import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

/** No arbitrary URL connector / unrestricted proxy endpoint. */
export const POST = withBusinessApi(async () => {
  return NextResponse.json(
    { error: "Unrestricted external proxy is forbidden", code: "unrestricted_external_proxy_forbidden" },
    { status: 400 },
  );
}, "business_os.connectors.manage");
