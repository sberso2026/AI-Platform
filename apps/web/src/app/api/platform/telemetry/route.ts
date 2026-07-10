import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sensors = await ctx.kernel.telemetry.listSensors(ctx.tenantId);
  return NextResponse.json({ data: sensors });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const sensor = await ctx.kernel.telemetry.registerSensor({
    tenantId: ctx.tenantId,
    name: body.name,
    sensorType: body.sensorType ?? "temperature",
    digitalTwinId: body.digitalTwinId,
    metadata: body.metadata,
  });

  return NextResponse.json({ data: sensor }, { status: 201 });
}
