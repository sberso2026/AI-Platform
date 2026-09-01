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
import { getAuthContext } from "@/lib/kernel";
import { createServiceClient } from "@/lib/supabase/service";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  lifecycleErrorResponse,
  resolveRequestId,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";

function activationRedirect(request: Request): string | undefined {
  return buildAuthActivationRedirect({
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    requestOrigin: request.headers.get("origin"),
    vercelUrl: process.env.VERCEL_URL,
  });
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
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "unauthorized");
  }
  try {
    const admin = new MembershipAdminService(createServiceClient());
    const data = await admin.listMembers(ctx.tenantId);
    return NextResponse.json({ data, requestId });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
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
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
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
    return NextResponse.json({ error: "roleSlug, workspaceId, or resendActivation required" }, { status: 422 });
  } catch (err) {
    return identityErrorResponse(err, requestId);
  }
}
