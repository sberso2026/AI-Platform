import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { evaluateBusinessAccess } from "@/lib/business/access";
import { unauthenticatedResponse } from "@/lib/lifecycle-api";
import type { AuthContext } from "@/lib/kernel";
import type { BusinessPermission } from "@rtb/business-os";

export interface BusinessHandlerContext {
  ctx: AuthContext;
}

function denial(code: string, status = 403): NextResponse {
  return NextResponse.json({ error: "Access denied", code }, { status });
}

export async function guardBusinessApi(
  requiredPermission: BusinessPermission = "business_os.view",
): Promise<BusinessHandlerContext | NextResponse> {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());

  const decision = await evaluateBusinessAccess(ctx, requiredPermission);
  if (!decision.allowed) {
    if (decision.reason === "feature_disabled") return denial("feature_not_enabled");
    if (decision.reason === "permission_denied") return denial("permission_denied");
    if (decision.reason === "entitlement_unavailable") {
      return NextResponse.json(
        { error: "Entitlement service unavailable", code: "entitlement_unavailable" },
        { status: 503 },
      );
    }
    return denial(decision.entitlementReasonCode ?? "entitlement_denied");
  }

  return { ctx };
}

export function withBusinessApi(
  handler: (context: BusinessHandlerContext, request: Request) => Promise<NextResponse>,
  requiredPermission: BusinessPermission = "business_os.view",
) {
  return async (request: Request): Promise<NextResponse> => {
    const guarded = await guardBusinessApi(requiredPermission);
    if (guarded instanceof NextResponse) return guarded;
    return handler(guarded, request);
  };
}
