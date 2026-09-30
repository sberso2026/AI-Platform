import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "@/lib/kernel";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { createCommerceExecutionContext } from "@rtb/platform-commerce/server";
import type { CommerceExecutionContext } from "@rtb/types";
import {
  resolveReviewIdentityPolicy,
  type ReviewIdentityClaims,
} from "@rtb/engineering-review";
import { enforceCommercePolicy, type CommerceHandlerContext } from "./with-commerce-entitlement";
import {
  decideEngineeringIdentityAssurance,
  engineeringApiRequiresIdentityAssurance,
} from "./engineering-identity-assurance";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  lifecycleErrorResponse,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";
import { isReadOnlyEngineeringRole } from "@/lib/commerce/canonical-access";

export type { CommerceHandlerContext };

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function engineeringIdentityClaims(ctx: AuthContext): Promise<ReviewIdentityClaims> {
  const { data } = await ctx.supabase.auth.getSession();
  const payload = data.session?.access_token ? decodeJwtPayload(data.session.access_token) : {};
  const { data: userData } = await ctx.supabase.auth.getUser();
  return {
    aal: typeof payload.aal === "string" ? payload.aal : null,
    amr: Array.isArray(payload.amr) ? (payload.amr as Array<string | { method?: string }>) : null,
    appMetadata: (userData.user?.app_metadata as Record<string, unknown> | undefined) ?? null,
  };
}

async function denyIfEngineeringIdentityInsufficient(
  ctx: AuthContext,
  segment: string,
  method: string,
): Promise<NextResponse | null> {
  if (!engineeringApiRequiresIdentityAssurance(segment, method)) return null;
  const { data: tenant } = await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle();
  const policy = resolveReviewIdentityPolicy((tenant?.settings as Record<string, unknown> | null) ?? {});
  const claims = await engineeringIdentityClaims(ctx);
  const decision = decideEngineeringIdentityAssurance({ segment, method, policy, claims });
  if (decision.allowed) return null;
  return lifecycleErrorResponse(
    "identity_assurance_insufficient",
    "Authentication succeeded but Deliverables/Lifecycle identity policy was not met",
    403,
    crypto.randomUUID(),
    { reason: decision.reason, segment },
  );
}

const PI_NOT_INSTALLED_REASONS = new Set([
  "application_not_in_plan",
  "application_not_installed",
  "installation_not_active",
  "installation_not_found",
]);
const PI_LICENCE_SUSPENDED_REASONS = new Set([
  "licence_expired",
  "licence_revoked",
  "licence_missing",
  "licence_not_found",
]);
const PI_WORKSPACE_REASONS = new Set([
  "workspace_required",
  "workspace_not_assigned",
  "workspace_not_entitled",
]);

function projectIntelligenceEntitlementCode(reasonCode: string): string {
  if (PI_NOT_INSTALLED_REASONS.has(reasonCode)) return "project_intelligence_not_installed";
  if (PI_LICENCE_SUSPENDED_REASONS.has(reasonCode)) return "licence_suspended";
  if (reasonCode === "seat_not_assigned") return "seat_not_assigned";
  if (PI_WORKSPACE_REASONS.has(reasonCode)) return "workspace_not_assigned";
  return "project_intelligence_access_denied";
}

async function projectIntelligenceGuardError(response: NextResponse, requestId: string): Promise<NextResponse> {
  const text = await response.clone().text().catch(() => "");
  let body: Record<string, unknown> = {};
  if (text.trim()) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  const reasonCode = typeof body?.code === "string" ? body.code : "entitlement_denied";
  return lifecycleErrorResponse(
    projectIntelligenceEntitlementCode(reasonCode),
    typeof body?.error === "string" ? body.error : "Project Intelligence access denied",
    response.status,
    requestId,
    { reasonCode },
  );
}

export async function guardEngineeringApi(
  segment: string,
  method: string
): Promise<CommerceHandlerContext | NextResponse> {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());

  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (mutating && isReadOnlyEngineeringRole(ctx.roleSlug)) {
    return forbiddenResponse(
      crypto.randomUUID(),
      "Read-only role cannot mutate engineering records",
      "read_only",
    );
  }

  const identityDenied = await denyIfEngineeringIdentityInsufficient(ctx, segment, method);
  if (identityDenied) return identityDenied;

  const policy = getEngineeringApiPolicy(segment, method);
  const result = await enforceCommercePolicy(ctx, policy);
  const correlationId = crypto.randomUUID();
  if (result instanceof NextResponse) {
    return segment.startsWith("project-intelligence")
      ? projectIntelligenceGuardError(result, correlationId)
      : result;
  }
  const commerce = createCommerceExecutionContext({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    actorUserId: ctx.userId,
    correlationId,
    decision: result,
    policy,
  });

  return {
    ctx,
    decision: result,
    correlationId,
    commerce,
  };
}

/** Authorize a distinct engineering API segment with its own commerce action. */
export async function authorizeEngineeringSegment(
  ctx: AuthContext,
  segment: string,
  method: string,
  correlationId: string,
): Promise<CommerceExecutionContext | null> {
  const policy = getEngineeringApiPolicy(segment, method);
  const result = await enforceCommercePolicy(ctx, policy);
  if (result instanceof NextResponse) return null;
  return createCommerceExecutionContext({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    actorUserId: ctx.userId,
    correlationId,
    decision: result,
    policy,
  });
}

export function withEngineeringApi(
  segment: string,
  handler: (context: CommerceHandlerContext, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      const guarded = await guardEngineeringApi(segment, request.method);
      if (guarded instanceof NextResponse) return guarded;
      return await handler(guarded, request);
    } catch (err) {
      // Guard and handler must both return JSON — never an empty non-JSON 500.
      return handleCommerceDomainError(err, crypto.randomUUID());
    }
  };
}

export function withEngineeringApiParams<T extends Record<string, string>>(
  segment: string,
  handler: (
    context: CommerceHandlerContext,
    request: Request,
    params: T
  ) => Promise<NextResponse>
) {
  return async (
    request: Request,
    routeContext: { params: Promise<T> }
  ): Promise<NextResponse> => {
    try {
      const guarded = await guardEngineeringApi(segment, request.method);
      if (guarded instanceof NextResponse) return guarded;
      const params = await routeContext.params;
      return await handler(guarded, request, params);
    } catch (err) {
      return handleCommerceDomainError(err, crypto.randomUUID());
    }
  };
}
