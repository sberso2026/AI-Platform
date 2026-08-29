import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BosConnectorId, BosConnectorMode } from "@rtb/types";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.connectors.configure(
      scope,
      {
        connectorId: body.connectorId as BosConnectorId,
        secretId: typeof body.secretId === "string" ? body.secretId : null,
        mode: body.mode as BosConnectorMode | undefined,
        expectedProviderOrgId:
          typeof body.expectedProviderOrgId === "string" ? body.expectedProviderOrgId : null,
      },
      { userId: ctx.userId, actorType: "human" },
    );
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.manage");
