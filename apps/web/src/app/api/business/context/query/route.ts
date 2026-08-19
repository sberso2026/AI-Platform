import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";

/** No arbitrary Cypher/SQL-like graph query is exposed. */
export const POST = withBusinessApi(async () => {
  return NextResponse.json(
    { error: "Unrestricted graph query is forbidden", code: "unrestricted_graph_query_forbidden" },
    { status: 400 },
  );
}, "business_os.business_context.manage");
