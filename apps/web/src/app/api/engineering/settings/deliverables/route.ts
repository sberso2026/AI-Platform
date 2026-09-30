import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("settings", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.deliverables.settingsCatalog(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("settings", async ({ ctx, commerce }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  try {
    const data = await ctx.engineering.deliverables.updateSettings(commerce, ctx.tenantId, {
      enabledDefinitionIds: Array.isArray(body.enabledDefinitionIds) ? body.enabledDefinitionIds.map(String) : null,
      maturityProfileId: String(body.maturityProfileId ?? ""),
      maturityProfileVersion: String(body.maturityProfileVersion ?? ""),
      actorId: ctx.userId,
    });
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "deliverable_setting_failed";
    const status = message === "unknown_maturity_profile" ? 400 : 403;
    return NextResponse.json({ error: message }, { status });
  }
});
