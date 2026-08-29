import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

function integrationsRedirect(request: Request, params: Record<string, string>): NextResponse {
  const url = new URL("/business/integrations", request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  try {
    const data = await ctx.business.connectors.completeOAuthCallback(
      scope,
      { state, code, error },
      { userId: ctx.userId, actorType: "human" },
    );
    return integrationsRedirect(request, {
      oauth: data.connectionState === "CONNECTED" ? "connected" : "error",
      provider: String(data.connectorId),
      fixture: "1",
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "oauth_provider_error";
    const failed = ownerCommandError(caught);
    if (failed.status === 500) return failed;
    return integrationsRedirect(request, { oauth: "error", reason: message, fixture: "1" });
  }
}, "business_os.connectors.manage");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.connectors.completeOAuthCallback(
      scope,
      {
        state: String(body.state ?? ""),
        code: body.code == null || body.code === "" ? null : String(body.code),
        error: body.error == null || body.error === "" ? null : String(body.error),
      },
      { userId: ctx.userId, actorType: "human" },
    );
    return NextResponse.json({ data, fixture: true, live: false });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.manage");
