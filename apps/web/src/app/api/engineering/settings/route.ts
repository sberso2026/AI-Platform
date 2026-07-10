import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("settings", async ({ ctx, commerce, decision }) => {
  const [settings, applications] = await Promise.all([
    ctx.engineering.settings.get(commerce, ctx.tenantId),
    ctx.engineering.applications.listApplications(commerce, { aggregate: true }),
  ]);
  return NextResponse.json({
    data: {
      settings,
      applications,
      installationStatus: decision.allowed ? "enabled" : "disabled",
    },
  });
});

export const POST = withEngineeringApi("settings", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.settings.upsert(commerce, ctx.tenantId, body);
  return NextResponse.json({ data }, { status: 201 });
});
