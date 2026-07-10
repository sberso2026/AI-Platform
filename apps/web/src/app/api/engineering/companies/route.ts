import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("companies", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.companies.list(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("companies", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.companies.create(commerce, {
    tenantId: ctx.tenantId,
    name: body.name,
    companyType: body.companyType,
    registrationNumber: body.registrationNumber,
    country: body.country,
  });
  return NextResponse.json({ data }, { status: 201 });
});
