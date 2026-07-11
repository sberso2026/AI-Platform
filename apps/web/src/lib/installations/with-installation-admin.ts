import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { CommerceDomainError, InstallationLifecycleService } from "@rtb/platform-commerce";

import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  lifecycleErrorResponse,
  resolveRequestId,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";

export async function requireInstallationAdmin(request?: Request) {
  const requestId = request ? resolveRequestId(request) : randomUUID();
  const ctx = await getAuthContext();
  if (!ctx) return { error: unauthenticatedResponse(requestId) };
  const denied = await requireCommerceAdmin(ctx);
  if (denied) {
    return {
      error: forbiddenResponse(requestId, "Commerce permission denied", "commerce_permission_denied"),
    };
  }
  try {
    InstallationLifecycleService.assertInstallPermission(ctx.roleSlug);
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return { error: handleCommerceDomainError(err, requestId) };
    }
    throw err;
  }
  return { ctx, requestId };
}

export function handleInstallationError(err: unknown, requestId: string = randomUUID()): NextResponse {
  if (err instanceof CommerceDomainError) {
    return handleCommerceDomainError(err, requestId);
  }
  console.error("[installation-admin] unhandled error", { requestId, err });
  return lifecycleErrorResponse("internal_error", "An unexpected error occurred", 500, requestId);
}
