import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

/** No generic external-write connector endpoint. */
export const POST = withBusinessApi(async () => {
  return NextResponse.json(
    { error: "Connector writes are disabled", code: "connector_write_forbidden" },
    { status: 400 },
  );
}, "business_os.connectors.manage");
