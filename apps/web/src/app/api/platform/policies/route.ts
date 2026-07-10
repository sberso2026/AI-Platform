import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await ctx.kernel.intelligence.policies.listPolicies(ctx.tenantId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.policies.evaluate({
    tenantId: ctx.tenantId,
    intent: body.intent,
    confidence: body.confidence,
    riskLevel: body.riskLevel,
    operatingSystem: body.operatingSystem,
    modelProvider: body.modelProvider,
    simulation: body.simulation ?? false,
  });
  return NextResponse.json({ data }, { status: 201 });
}
