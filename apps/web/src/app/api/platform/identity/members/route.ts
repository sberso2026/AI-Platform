import { NextResponse } from "next/server";
import { hasAuthSessionCookie, logPilotEvent } from "@/lib/pilot/pilot-controls";

export const dynamic = "force-dynamic";

async function delegate(request: Request, method: "GET" | "POST" | "PATCH") {
  if (!hasAuthSessionCookie(request.headers.get("cookie"))) {
    logPilotEvent({ eventClass: "authentication_failure", action: "pilot_members", result: "unauthenticated" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const handler = await import("./handler");
  return handler[method](request);
}

export function GET(request: Request) {
  return delegate(request, "GET");
}

export function POST(request: Request) {
  return delegate(request, "POST");
}

export function PATCH(request: Request) {
  return delegate(request, "PATCH");
}
