import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

function resolveBrowserOrigin(request: Request, body: Record<string, unknown>): string {
  const fromBody = typeof body.origin === "string" ? body.origin.trim() : "";
  const fromHeader = request.headers.get("origin")?.trim() ?? "";
  try {
    return new URL(fromBody || fromHeader || request.url).origin;
  } catch {
    return new URL(request.url).origin;
  }
}

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.connectors.beginOAuth(
      scope,
      { connectorId: String(body.connectorId ?? ""), origin: resolveBrowserOrigin(request, body) },
      { userId: ctx.userId, actorType: "human" },
    );
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.manage");
