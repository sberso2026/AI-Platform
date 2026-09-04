import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { createCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { enforceCommercePolicy, type CommerceHandlerContext } from "./with-commerce-entitlement";
import {
  handleCommerceDomainError,
  lifecycleErrorResponse,
  resolveRequestId,
  unauthenticatedResponse,
  type LifecycleErrorLogContext,
} from "@/lib/lifecycle-api";

export type { CommerceHandlerContext };

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

const COMMAND_CENTER_SEGMENTS = new Set([
  "dashboard",
  "timeline",
  "activity",
  "decisions",
  "risks",
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

function piDatasetFromSegment(segment: string): string | undefined {
  if (COMMAND_CENTER_SEGMENTS.has(segment)) return segment;
  if (!segment.startsWith("project-intelligence")) return undefined;
  const rest = segment.slice("project-intelligence-".length);
  if (rest === "command-centre") return "overview";
  if (rest === "cost-progress") return "cost";
  if (rest === "risk-change") return "risk-change";
  if (rest === "queries-decisions") return "decisions";
  return rest || "project-intelligence";
}

function commandCenterLogContext(
  segment: string,
  started: number,
  extra?: Partial<LifecycleErrorLogContext>,
): LifecycleErrorLogContext {
  const commandCenter = COMMAND_CENTER_SEGMENTS.has(segment);
  const projectIntelligence = segment.startsWith("project-intelligence");
  return {
    route: `/api/engineering/${segment}`,
    durationMs: Date.now() - started,
    dataset: piDatasetFromSegment(segment),
    publicCode: commandCenter
      ? "COMMAND_CENTER_DATA_ERROR"
      : projectIntelligence
        ? "PI_DATA_ERROR"
        : undefined,
    publicMessage: commandCenter
      ? "Unable to load engineering KPI data."
      : projectIntelligence
        ? "Project Intelligence data could not be loaded."
        : undefined,
    ...extra,
  };
}

export async function guardEngineeringApi(
  segment: string,
  method: string,
  requestId = crypto.randomUUID(),
): Promise<CommerceHandlerContext | NextResponse> {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);

  const policy = getEngineeringApiPolicy(segment, method);
  const result = await enforceCommercePolicy(ctx, policy);
  if (result instanceof NextResponse) {
    return segment.startsWith("project-intelligence")
      ? projectIntelligenceGuardError(result, requestId)
      : result;
  }
  const commerce = createCommerceExecutionContext({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    actorUserId: ctx.userId,
    correlationId: requestId,
    decision: result,
    policy,
  });

  return {
    ctx,
    decision: result,
    correlationId: requestId,
    commerce,
  };
}

export function withEngineeringApi(
  segment: string,
  handler: (context: CommerceHandlerContext, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const started = Date.now();
    const requestId = resolveRequestId(request);
    try {
      const guarded = await guardEngineeringApi(segment, request.method, requestId);
      if (guarded instanceof NextResponse) return guarded;
      try {
        const response = await handler(guarded, request);
        response.headers.set("x-request-id", guarded.correlationId);
        return response;
      } catch (err) {
        return handleCommerceDomainError(
          err,
          guarded.correlationId,
          commandCenterLogContext(segment, started, {
            layer: "service",
            tenantId: guarded.ctx.tenantId,
            workspaceId: guarded.ctx.workspaceId,
          }),
        );
      }
    } catch (err) {
      return handleCommerceDomainError(
        err,
        requestId,
        commandCenterLogContext(segment, started, { layer: "auth_or_context" }),
      );
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
    const started = Date.now();
    const requestId = resolveRequestId(request);
    try {
      const guarded = await guardEngineeringApi(segment, request.method, requestId);
      if (guarded instanceof NextResponse) return guarded;
      let resolvedParams: T | undefined;
      try {
        resolvedParams = await routeContext.params;
        const response = await handler(guarded, request, resolvedParams);
        response.headers.set("x-request-id", guarded.correlationId);
        return response;
      } catch (err) {
        return handleCommerceDomainError(
          err,
          guarded.correlationId,
          commandCenterLogContext(segment, started, {
            layer: "service",
            tenantId: guarded.ctx.tenantId,
            workspaceId: guarded.ctx.workspaceId,
            projectId: resolvedParams && "projectId" in resolvedParams ? resolvedParams.projectId : undefined,
          }),
        );
      }
    } catch (err) {
      return handleCommerceDomainError(
        err,
        requestId,
        commandCenterLogContext(segment, started, { layer: "auth_or_context" }),
      );
    }
  };
}
