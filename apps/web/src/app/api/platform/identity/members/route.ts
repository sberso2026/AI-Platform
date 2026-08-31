import { NextResponse } from "next/server";
import { isPlatformAdmin, MembershipAdminService } from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { createServiceClient } from "@/lib/supabase/service";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  lifecycleErrorResponse,
  resolveRequestId,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "read_only");
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
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "read_only");
  }
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: "Workspace required" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const admin = new MembershipAdminService(createServiceClient());
    const invited = await admin.invite({
      tenantId: ctx.tenantId,
      workspaceId: typeof body.workspaceId === "string" ? body.workspaceId : ctx.workspaceId,
      email: String(body.email ?? ""),
      roleSlug: String(body.roleSlug ?? "member"),
      invitedBy: ctx.userId,
      breakGlass: body.breakGlass === true,
    });
    if (body.assignSeat === true && typeof body.seatPoolId === "string") {
      await ctx.commerce.seatAssignment.assign({
        tenantId: ctx.tenantId,
        seatPoolId: body.seatPoolId,
        userId: invited.userId,
        workspaceId: invited.workspaceId,
        assignedBy: ctx.userId,
      });
    }
    const data =
      invited.delivery === "temporary_password" && body.breakGlass === true
        ? invited
        : { ...invited, temporaryPassword: undefined };
    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/rate limit/i.test(message) || /over_email_send_rate_limit/i.test(message)) {
      return lifecycleErrorResponse(
        "invite_email_rate_limited",
        "Invite email could not be sent because the Auth mailer rate limit was exceeded. Retry later. Temporary passwords are internal break-glass only.",
        429,
        requestId,
      );
    }
    return handleCommerceDomainError(err, requestId);
  }
}

export async function PATCH(request: Request) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
    return forbiddenResponse(requestId, "User administration requires an owner or administrator", "read_only");
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.userId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 422 });
  }
  try {
    const admin = new MembershipAdminService(createServiceClient());
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
    return NextResponse.json({ error: "roleSlug or workspaceId required" }, { status: 422 });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}
