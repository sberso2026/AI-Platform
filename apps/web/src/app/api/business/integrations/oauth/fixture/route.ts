import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BosOauthFixtureOutcome } from "@rtb/business-os";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.connectors.applyFixtureOutcome(
      scope,
      {
        connectorId: String(body.connectorId ?? ""),
        outcome: body.outcome as BosOauthFixtureOutcome,
      },
      { userId: ctx.userId, actorType: "human" },
    );
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.manage");
