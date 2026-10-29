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

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!isPlatformAdmin(ctx.roleSlug)) {
    return forbiddenResponse(requestId, "Workspace administration requires an owner or administrator", "read_only");
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const admin = new MembershipAdminService(createServiceClient());
    const data = await admin.createWorkspace({
      tenantId: ctx.tenantId,
      name: String(body.name ?? "Project workspace"),
      slug: typeof body.slug === "string" ? body.slug : undefined,
    });
    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}
