import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("settings", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.assurance.settingsCatalog(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("settings", async ({ ctx, commerce }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const ruleId = typeof body.ruleId === "string" ? body.ruleId : "";
  const ruleVersion = typeof body.ruleVersion === "string" ? body.ruleVersion : "";
  if (!ruleId || !ruleVersion) {
    return NextResponse.json({ error: "rule_id_and_version_required" }, { status: 400 });
  }
  const enabled = body.enabled === null ? null : Boolean(body.enabled);
  try {
    const data = await ctx.engineering.assurance.updateRuleSetting(commerce, ctx.tenantId, {
      ruleId,
      ruleVersion,
      enabled,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "rule_setting_failed";
    const status = message === "unknown_assurance_rule" ? 400 : 403;
    return NextResponse.json({ error: message }, { status });
  }
});
