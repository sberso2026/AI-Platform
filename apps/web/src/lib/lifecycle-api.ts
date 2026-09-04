import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { CommerceDomainError } from "@rtb/platform-commerce";
import {
  ProjectIntelligenceError,
  MeetingIntelligenceError,
  DocumentIntelligenceError,
} from "@rtb/project-intelligence";

export function resolveRequestId(request: Request): string {
  return (
    request.headers.get("x-correlation-id") ??
    request.headers.get("x-request-id") ??
    randomUUID()
  );
}

export interface LifecycleErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    details: Record<string, unknown>;
  };
}

export interface LifecycleSuccessBody<T> {
  ok: true;
  data: T;
}

const BLOCKED_DETAIL_KEYS = new Set([
  "stack",
  "sql",
  "query",
  "serviceRole",
  "service_role",
  "cause",
]);

function publicErrorDetails(details?: Record<string, unknown>): Record<string, unknown> {
  if (!details) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (BLOCKED_DETAIL_KEYS.has(key)) continue;
    out[key] = value;
  }
  return out;
}

function sanitizeLogText(value: string): string {
  return value
    .replace(/service[_-]?role[^\s]*/gi, "[redacted]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[redacted]")
    .slice(0, 400);
}

export interface LifecycleErrorLogContext {
  route?: string;
  layer?: string;
  tenantId?: string;
  workspaceId?: string;
  durationMs?: number;
  publicCode?: string;
  publicMessage?: string;
}

export function lifecycleOkResponse<T>(data: T, status = 200): NextResponse<LifecycleSuccessBody<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function lifecycleErrorResponse(
  code: string,
  message: string,
  status: number,
  requestId: string,
  details?: Record<string, unknown>,
): NextResponse<LifecycleErrorBody> {
  const response = NextResponse.json(
    {
      ok: false as const,
      error: { code, message, requestId, details: publicErrorDetails(details) },
    },
    { status },
  );
  response.headers.set("x-request-id", requestId);
  return response;
}

export function unauthenticatedResponse(requestId: string): NextResponse<LifecycleErrorBody> {
  return lifecycleErrorResponse("unauthenticated", "Unauthorized", 401, requestId);
}

export function forbiddenResponse(
  requestId: string,
  message = "Commerce permission denied",
  code = "forbidden"
): NextResponse<LifecycleErrorBody> {
  return lifecycleErrorResponse(code, message, 403, requestId);
}

export function handleCommerceDomainError(
  err: unknown,
  requestId: string,
  logContext?: LifecycleErrorLogContext,
): NextResponse<LifecycleErrorBody> {
  if (err instanceof CommerceDomainError) {
    logLifecycleFailure(err, requestId, err.code, logContext);
    return lifecycleErrorResponse(err.code, err.message, err.statusCode, requestId);
  }
  if (err instanceof MeetingIntelligenceError) {
    logLifecycleFailure(err, requestId, err.code, logContext);
    return lifecycleErrorResponse(err.code, err.message, err.statusCode, requestId, err.details);
  }
  if (err instanceof ProjectIntelligenceError) {
    logLifecycleFailure(err, requestId, err.code, logContext);
    return lifecycleErrorResponse(err.code, err.message, err.statusCode, requestId, err.details);
  }
  if (err instanceof DocumentIntelligenceError) {
    logLifecycleFailure(err, requestId, err.code, logContext);
    return lifecycleErrorResponse(err.code, err.message, err.statusCode, requestId, err.details);
  }

  const code = logContext?.publicCode ?? "internal_error";
  const message = logContext?.publicMessage ?? "An unexpected error occurred";
  logLifecycleFailure(err, requestId, code, logContext);
  return lifecycleErrorResponse(code, message, 500, requestId);
}

function logLifecycleFailure(
  err: unknown,
  requestId: string,
  errorCode: string,
  logContext?: LifecycleErrorLogContext,
): void {
  const errorName = err instanceof Error ? err.name : "unknown";
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.error("[lifecycle-api]", {
    requestId,
    route: logContext?.route,
    layer: logContext?.layer ?? "handler",
    tenantId: logContext?.tenantId,
    workspaceId: logContext?.workspaceId,
    errorCode,
    durationMs: logContext?.durationMs,
    errorName,
    errorMessage: sanitizeLogText(errorMessage),
  });
}

export function parseLifecycleErrorBody(body: unknown): { code: string; message: string; requestId?: string; details?: Record<string, unknown> } {
  if (!body || typeof body !== "object") throw new Error("invalid error body");
  const payload = body as Record<string, unknown>;
  const nested = payload.error;
  if (nested && typeof nested === "object") {
    const err = nested as Record<string, unknown>;
    return {
      code: String(err.code ?? ""),
      message: String(err.message ?? err.error ?? ""),
      requestId: typeof err.requestId === "string" ? err.requestId : undefined,
      details: err.details && typeof err.details === "object" ? err.details as Record<string, unknown> : undefined,
    };
  }
  return {
    code: String(payload.code ?? ""),
    message: String(payload.error ?? ""),
  };
}
