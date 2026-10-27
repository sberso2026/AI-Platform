import { NextResponse } from "next/server";
import { classifyPilotFailure, currentUserFailureResponse, hasAuthSessionCookie, logPilotEvent } from "@/lib/pilot/pilot-controls";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const hasSessionCookie = hasAuthSessionCookie(request.headers.get("cookie"));
  let ctx;
  try {
    const { getAuthContext } = await import("@/lib/kernel");
    ctx = await getAuthContext();
  } catch (error) {
    const failure = currentUserFailureResponse(hasSessionCookie);
    logPilotEvent({
      eventClass: hasSessionCookie ? "application_exception" : "authentication_failure",
      action: "current_user",
      result: `${failure.status === 401 ? "unauthenticated" : "failed"}:${classifyPilotFailure(error)}`,
    });
    return NextResponse.json(failure.body, { status: failure.status });
  }
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load profile to get full_name for the current authenticated user.
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("id, full_name, email, metadata")
    .eq("id", ctx.userId)
    .maybeSingle();

  const metadata = (profile?.metadata ?? {}) as Record<string, unknown>;
  const company =
    typeof metadata.company === "string"
      ? metadata.company
      : typeof metadata.company_name === "string"
        ? metadata.company_name
        : null;

  return NextResponse.json({
    data: {
      id: ctx.userId,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      company,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId ?? null,
      roleSlug: ctx.roleSlug,
    },
  });
}
