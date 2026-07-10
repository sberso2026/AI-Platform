import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("applications", async ({ ctx, commerce }) => {
  const [applications, installations] = await Promise.all([
    ctx.engineering.applications.listApplications(commerce),
    ctx.engineering.applications.listInstallations(commerce, ctx.tenantId),
  ]);
  return NextResponse.json({ data: { applications, installations } });
});

export const POST = withEngineeringApi("applications", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.applications.setEnabled(
    commerce,
    ctx.tenantId,
    body.appKey,
    body.enabled ?? false
  );
  return NextResponse.json({ data }, { status: 201 });
});
