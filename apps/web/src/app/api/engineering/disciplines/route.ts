import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("disciplines", async ({ ctx, commerce }, request) => {
  const debug = new URL(request.url).searchParams.get("debug") === "1";
  const data = await ctx.engineering.disciplines.list(commerce, ctx.tenantId, {
    includeSource: debug,
  });
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("disciplines", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.disciplines.create(commerce, {
    tenantId: ctx.tenantId,
    disciplineKey: body.disciplineKey,
    name: body.name,
    description: body.description,
  });
  return NextResponse.json({ data }, { status: 201 });
});
