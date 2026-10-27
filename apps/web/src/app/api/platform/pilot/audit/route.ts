import { NextResponse } from "next/server";
import { hasAuthSessionCookie, logPilotEvent } from "@/lib/pilot/pilot-controls";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasAuthSessionCookie(request.headers.get("cookie"))) {
    logPilotEvent({ eventClass: "authentication_failure", action: "pilot_audit", result: "unauthenticated" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let ctx;
  try {
    const { getAuthContext } = await import("@/lib/kernel");
    ctx = await getAuthContext();
  } catch {
    logPilotEvent({ eventClass: "authentication_failure", action: "pilot_audit", result: "unauthenticated" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { isPlatformAdmin } = await import("@rtb/platform-core");
  if (!isPlatformAdmin(ctx.roleSlug)) {
    logPilotEvent({ eventClass: "authorization_denial", action: "pilot_audit", result: "denied" });
    return NextResponse.json({ error: "Pilot audit visibility requires a tenant administrator." }, { status: 403 });
  }
  const listed = await ctx.supabase
    .from("audit_events")
    .select("id, created_at, workspace_id, user_id, action, resource_type, resource_id")
    .order("created_at", { ascending: false })
    .limit(50);
  if (listed.error) {
    logPilotEvent({ eventClass: "authorization_denial", action: "pilot_audit", result: "denied" });
    return NextResponse.json({ error: "Audit events are not visible to this user." }, { status: 403 });
  }
  logPilotEvent({
    eventClass: "pilot_admin",
    action: "pilot_audit",
    result: `count:${listed.data?.length ?? 0}`,
  });
  return NextResponse.json({
    data: listed.data ?? [],
    authority: "pilot_admin_not_engineering_authority",
  });
}
