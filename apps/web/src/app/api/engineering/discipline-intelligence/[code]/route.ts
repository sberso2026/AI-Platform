import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApiParams<{ code: string }>(
  "discipline-intelligence",
  async ({ ctx, commerce }, _request, params) => {
    const data = ctx.engineering.disciplineIntelligence.get(commerce, ctx.tenantId, params.code);
    return NextResponse.json({ data });
  },
);
