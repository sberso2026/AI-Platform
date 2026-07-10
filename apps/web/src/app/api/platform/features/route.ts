import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [features, flags] = await Promise.all([
    ctx.kernel.intelligence.features.listFeatures(),
    ctx.kernel.intelligence.features.listFlags(ctx.tenantId),
  ]);
  return NextResponse.json({ data: { features, flags } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.action === "set") {
    const data = await ctx.kernel.intelligence.features.setFlag(
      ctx.tenantId,
      body.featureKey,
      body.enabled ?? false,
      body.rolloutPct
    );
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.kernel.intelligence.features.evaluate({
    tenantId: ctx.tenantId,
    featureKey: body.featureKey,
    userId: ctx.userId,
    environment: body.environment,
  });
  return NextResponse.json({ data: { enabled: data } }, { status: 201 });
}
