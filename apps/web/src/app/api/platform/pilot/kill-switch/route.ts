import { NextResponse } from "next/server";
import { currentUserFailureResponse, hasAuthSessionCookie, logPilotEvent } from "@/lib/pilot/pilot-controls";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasAuthSessionCookie(request.headers.get("cookie"))) {
    logPilotEvent({ eventClass: "kill_switch", action: "activate", result: "unauthenticated" });
    return NextResponse.json(currentUserFailureResponse(false).body, { status: 401 });
  }
  try {
    const { getAuthContext } = await import("@/lib/kernel");
    const ctx = await getAuthContext();
    if (!ctx) {
      logPilotEvent({ eventClass: "authorization_denial", action: "kill_switch", result: "unauthenticated" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    logPilotEvent({ eventClass: "authentication_failure", action: "kill_switch", result: "denied" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  logPilotEvent({ eventClass: "authorization_denial", action: "kill_switch", result: "tenant_admin_denied" });
  return NextResponse.json(
    {
      error:
        "The production pilot kill switch is an operator environment control. A tenant administrator cannot activate or restore it.",
    },
    { status: 403 },
  );
}
