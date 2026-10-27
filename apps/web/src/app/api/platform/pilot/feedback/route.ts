import { NextResponse } from "next/server";
import { buildPilotFeedbackRecord, logPilotEvent } from "@/lib/pilot/pilot-controls";

async function authContext() {
  const { getPilotSession } = await import("@/lib/pilot/pilot-session");
  return getPilotSession();
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let ctx;
  try {
    ctx = await authContext();
  } catch {
    logPilotEvent({ eventClass: "authentication_failure", action: "pilot_feedback", result: "denied" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    category?: string;
    description?: string;
    severity?: string;
  };
  const record = buildPilotFeedbackRecord({
    category: String(body.category ?? ""),
    description: String(body.description ?? ""),
    severity: String(body.severity ?? ""),
  });
  if (!record.ok) return NextResponse.json({ error: record.message }, { status: 422 });
  const inserted = await ctx.supabase.from("audit_events").insert({
    tenant_id: ctx.tenantId,
    workspace_id: ctx.workspaceId ?? null,
    user_id: ctx.userId,
    action: record.action,
    resource_type: record.resourceType,
    metadata: record.metadata,
  });
  if (inserted.error) {
    logPilotEvent({ eventClass: "application_exception", action: "pilot_feedback", result: "rejected" });
    return NextResponse.json({ error: "Feedback could not be stored." }, { status: 403 });
  }
  logPilotEvent({ eventClass: "pilot_admin", action: "pilot_feedback", result: "accepted" });
  return NextResponse.json({
    data: {
      status: "accepted",
      triageStatus: "new",
      engineeringReview: false,
      engineeringApproval: false,
      certification: false,
    },
  });
}

export async function GET() {
  let ctx;
  try {
    ctx = await authContext();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { isPlatformAdmin } = await import("@rtb/platform-core");
  if (!isPlatformAdmin(ctx.roleSlug)) {
    logPilotEvent({ eventClass: "authorization_denial", action: "pilot_feedback_triage", result: "denied" });
    return NextResponse.json({ error: "Pilot feedback triage requires a tenant administrator." }, { status: 403 });
  }
  const listed = await ctx.supabase
    .from("audit_events")
    .select("id, created_at, workspace_id, action, metadata")
    .eq("action", "pilot_feedback_submitted")
    .order("created_at", { ascending: false })
    .limit(50);
  if (listed.error) return NextResponse.json({ error: "Feedback is not visible to this user." }, { status: 403 });
  return NextResponse.json({
    data: listed.data ?? [],
    authority: "pilot_feedback_not_engineering_authority",
  });
}
