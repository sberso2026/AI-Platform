import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await ctx.kernel.intelligence.capabilities.listCapabilities(ctx.tenantId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.capabilities.registerFromPlugin({
    tenantId: ctx.tenantId,
    capabilityKey: body.capabilityKey,
    name: body.name,
    description: body.description,
    operatingSystem: body.operatingSystem,
    pluginId: body.pluginId,
  });
  return NextResponse.json({ data }, { status: 201 });
}
