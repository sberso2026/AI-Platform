import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "rtb-ai-os",
    version: "0.1.0",
    phase: "platform-core",
    timestamp: new Date().toISOString(),
  });
}
