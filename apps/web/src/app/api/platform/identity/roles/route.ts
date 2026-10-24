import { NextResponse } from "next/server";
import { isPlatformAdmin, MembershipAdminService } from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { createServiceClient } from "@/lib/supabase/service";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  resolveRequestId,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
    return forbiddenResponse(requestId, "Role catalogue requires an owner or administrator", "read_only");
  }
  try {
    const admin = new MembershipAdminService(createServiceClient());
    const data = await admin.listAssignableRoles(ctx.tenantId);
    return NextResponse.json({
      data: {
        roles: data,
        assignmentHref: "/users",
        note: "Role assignment uses existing tenant_memberships. Do not create a second identity stack.",
      },
      requestId,
    });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}
