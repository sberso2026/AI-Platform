import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("settings", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.deliverables.settingsCatalog(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("settings", async ({ ctx, commerce }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  try {
    if (body.action === "configureMapping") {
      const data = await ctx.engineering.deliverables.configureStatusMapping(commerce, ctx.tenantId, {
        projectId: typeof body.projectId === "string" ? body.projectId : null,
        sourceSystem: String(body.sourceSystem ?? "project"),
        rawStatusCode: String(body.rawStatusCode ?? ""),
        semantic: String(body.semantic ?? "") as never,
        mappingVersion: String(body.mappingVersion ?? "v1"),
        enabled: body.enabled !== false,
        description: typeof body.description === "string" ? body.description : null,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
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
