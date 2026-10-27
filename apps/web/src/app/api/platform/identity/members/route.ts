import { NextResponse } from "next/server";
import {
  AuditService,
  IdentityProvisioningError,
  MembershipAdminService,
  buildAuthActivationRedirect,
  classifyIdentityFailure,
  isPlatformAdmin,
  shouldBlockSeatAssignment,
} from "@rtb/platform-core";
import { SeatLimitExceededError } from "@rtb/platform-commerce";
import { createServiceClient } from "@/lib/supabase/service";
import { classifyPilotFailure, currentUserFailureResponse, hasAuthSessionCookie, logPilotEvent } from "@/lib/pilot/pilot-controls";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  lifecycleErrorResponse,
  resolveRequestId,
} from "@/lib/lifecycle-api";

function activationRedirect(request: Request): string | undefined {
  return buildAuthActivationRedirect({
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    requestOrigin: request.headers.get("origin"),
    vercelUrl: process.env.VERCEL_URL,
  });
}

export const dynamic = "force-dynamic";

async function loadAdminContext(request: Request) {
  const hasSessionCookie = hasAuthSessionCookie(request.headers.get("cookie"));
  if (!hasSessionCookie) {
    logPilotEvent({ eventClass: "authentication_failure", action: "pilot_members", result: "unauthenticated" });
    return { ctx: null, failure: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  try {
    const { getAuthContext } = await import("@/lib/kernel");
    const ctx = await getAuthContext();
    if (!ctx) {
      logPilotEvent({ eventClass: "authentication_failure", action: "pilot_members", result: "unauthenticated" });
      return { ctx: null, failure: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { ctx, failure: null };
  } catch (error) {
    const failure = currentUserFailureResponse(true);
    logPilotEvent({
      eventClass: "application_exception",
      action: "pilot_members",
      result: classifyPilotFailure(error),
    });
    return { ctx: null, failure: NextResponse.json(failure.body, { status: failure.status }) };
  }
}

function identityErrorResponse(err: unknown, requestId: string) {
  const classified = classifyIdentityFailure(err);
  if (classified.code === "identity_failed") {
    return handleCommerceDomainError(err, requestId);
  }
  return lifecycleErrorResponse(classified.code, classified.message, classified.status, requestId, classified.details);
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const loaded = await loadAdminContext(request);
  if (!loaded.ctx) return loaded.failure;
  const ctx = loaded.ctx;
  if (!isPlatformAdmin(ctx.roleSlug)) {
    logPilotEvent({ eventClass: "authorization_denial", action: "pilot_members", result: "denied" });
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "unauthorized");
  }
  try {
    const admin = new MembershipAdminService(createServiceClient());
    const data = await admin.listMembers(ctx.tenantId);
    logPilotEvent({ eventClass: "pilot_admin", action: "membership_list", result: `count:${data.length}` });
    return NextResponse.json({ data, requestId });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const loaded = await loadAdminContext(request);
  if (!loaded.ctx) return loaded.failure;
  const ctx = loaded.ctx;
  if (!isPlatformAdmin(ctx.roleSlug)) {
    logPilotEvent({ eventClass: "authorization_denial", action: "pilot_members", result: "denied" });
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "unauthorized");
  }
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Workspace required", requestId, details: {} } }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const redirectTo = activationRedirect(request);
  try {
    const admin = new MembershipAdminService(createServiceClient());
    const invited = await admin.invite({
      tenantId: ctx.tenantId,
      workspaceId: typeof body.workspaceId === "string" ? body.workspaceId : ctx.workspaceId,
      email: String(body.email ?? ""),
      roleSlug: String(body.roleSlug ?? "member"),
      invitedBy: ctx.userId,
      breakGlass: body.breakGlass === true,
      redirectTo,
    });
    let seatBlocked = false;
    if (body.assignSeat === true && typeof body.seatPoolId === "string") {
      const pools = await ctx.commerce.seatAssignment.listPools(ctx.tenantId);
      const pool = pools.find((item) => item.id === body.seatPoolId);
      const assignments = pool
        ? await ctx.commerce.seatAssignment.listAssignments(ctx.tenantId, pool.id)
        : [];
      if (!pool || shouldBlockSeatAssignment(assignments.length, pool.total_seats)) {
        seatBlocked = true;
      } else {
        try {
          await ctx.commerce.seatAssignment.assign({
            tenantId: ctx.tenantId,
            seatPoolId: body.seatPoolId,
            userId: invited.userId,
            workspaceId: invited.workspaceId,
            assignedBy: ctx.userId,
          });
        } catch (err) {
          if (err instanceof SeatLimitExceededError) {
            throw new IdentityProvisioningError(
              "seat_capacity_exceeded",
              err.message,
              409,
              { userId: invited.userId, created: invited.created, applicationAccess: "not_assigned" },
            );
          }
          throw err;
        }
      }
      if (seatBlocked) {
        throw new IdentityProvisioningError(
          "seat_capacity_exceeded",
          "Engineering OS seat capacity is exceeded. Identity can remain pending; application access was not assigned.",
          409,
          { userId: invited.userId, created: invited.created, applicationAccess: "not_assigned" },
        );
      }
    }
    return NextResponse.json(
      {
        data: {
          ...invited,
          authRedirectTo: redirectTo,
          inviteState: invited.delivery === "activation_sent" ? "sent" : invited.delivery,
        },
        requestId,
      },
      { status: invited.created ? 201 : 200 },
    );
  } catch (err) {
    return identityErrorResponse(err, requestId);
  }
}

export async function PATCH(request: Request) {
  const requestId = resolveRequestId(request);
  const loaded = await loadAdminContext(request);
  if (!loaded.ctx) return loaded.failure;
  const ctx = loaded.ctx;
  if (!isPlatformAdmin(ctx.roleSlug)) {
    logPilotEvent({ eventClass: "authorization_denial", action: "pilot_members", result: "denied" });
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "unauthorized");
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.userId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 422 });
  }
  try {
    const service = createServiceClient();
    const admin = new MembershipAdminService(service);
    if (body.resendActivation === true) {
      const data = await admin.resendActivation({
        tenantId: ctx.tenantId,
        userId: body.userId,
        redirectTo: activationRedirect(request),
        actorUserId: ctx.userId,
      });
      await new AuditService(service).log({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        action: "identity.activation_resend",
        resourceType: "auth_user",
        resourceId: body.userId,
        metadata: { email: data.email, delivery: data.delivery },
      });
      return NextResponse.json({ data, requestId });
    }
    if (body.membershipStatus === "active" || body.membershipStatus === "suspended") {
      const data = await admin.setMembershipStatus({
        tenantId: ctx.tenantId,
        actorUserId: ctx.userId,
        userId: body.userId,
        status: body.membershipStatus,
      });
      logPilotEvent({
        eventClass: "pilot_admin",
        action: "membership_status",
        result: `${data.status}:${data.userId}`,
      });
      return NextResponse.json({ data, requestId });
    }
    if (typeof body.roleSlug === "string") {
      const data = await admin.assignRole({
        tenantId: ctx.tenantId,
        userId: body.userId,
        roleSlug: body.roleSlug,
        workspaceId: typeof body.workspaceId === "string" ? body.workspaceId : ctx.workspaceId,
      });
      return NextResponse.json({ data, requestId });
    }
    if (typeof body.workspaceId === "string") {
      const data = await admin.assignWorkspace({
        tenantId: ctx.tenantId,
        userId: body.userId,
        workspaceId: body.workspaceId,
      });
      return NextResponse.json({ data, requestId });
    }
    return NextResponse.json({ error: "roleSlug, workspaceId, membershipStatus, or resendActivation required" }, { status: 422 });
  } catch (err) {
    return identityErrorResponse(err, requestId);
  }
}
