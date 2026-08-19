import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

/** No generic arbitrary agent execution endpoint. */
export const POST = withBusinessApi(async () => {
  return NextResponse.json(
    { error: "Arbitrary agent execution is forbidden", code: "unrestricted_agent_execution_forbidden" },
    { status: 400 },
  );
}, "business_os.ai_workforce.manage");
