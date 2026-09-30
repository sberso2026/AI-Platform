import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("settings", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.lifecycle.settingsCatalog(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("settings", async ({ ctx, commerce }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const profileId = typeof body.profileId === "string" ? body.profileId : "";
  const profileVersion = typeof body.profileVersion === "string" ? body.profileVersion : "";
  if (!profileId || !profileVersion) {
    return NextResponse.json({ error: "profile_id_and_version_required" }, { status: 400 });
  }
  try {
    const data = await ctx.engineering.lifecycle.updateProfileSetting(commerce, ctx.tenantId, {
      profileId,
      profileVersion,
      enabledCriterionIds: Array.isArray(body.enabledCriterionIds) ? body.enabledCriterionIds.map(String) : null,
      omittedStages: Array.isArray(body.omittedStages) ? body.omittedStages.map(String) as never : [],
      actorId: ctx.userId,
    });
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "lifecycle_setting_failed";
    const status = message === "unknown_lifecycle_profile" ? 400 : 403;
    return NextResponse.json({ error: message }, { status });
  }
});
