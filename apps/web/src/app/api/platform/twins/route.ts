import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const twins = await ctx.kernel.digitalTwin.list(ctx.tenantId);
  return NextResponse.json({ data: twins });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const twin = await ctx.kernel.digitalTwin.register({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    twinType: body.twinType ?? "asset",
    name: body.name,
    externalId: body.externalId,
    metadata: body.metadata,
    createdBy: ctx.userId,
  });

  return NextResponse.json({ data: twin }, { status: 201 });
}
