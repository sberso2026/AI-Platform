import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await ctx.kernel.apiGateway.listKeys(ctx.tenantId);
  return NextResponse.json({ data: keys });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = await ctx.kernel.apiGateway.createApiKey({
    tenantId: ctx.tenantId,
    name: body.name,
    permissions: body.permissions ?? [{ resource: "workspace", action: "read" }],
    createdBy: ctx.userId,
  });

  return NextResponse.json({
    data: { apiKey: result.apiKey, secret: result.secret },
  }, { status: 201 });
}
