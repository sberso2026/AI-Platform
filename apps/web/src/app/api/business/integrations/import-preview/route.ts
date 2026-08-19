import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.connectors.previewImport(
      scope,
      {
        filename: String(body.filename ?? ""),
        content: String(body.content ?? ""),
        entityType: String(body.entityType ?? ""),
        mapping: (body.mapping as Record<string, string> | undefined) ?? undefined,
      },
      { userId: ctx.userId, actorType: "human" },
    );
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.manage");
