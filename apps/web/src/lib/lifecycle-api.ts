import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { CommerceDomainError } from "@rtb/platform-commerce";

export function resolveRequestId(request: Request): string {
  return (
    request.headers.get("x-correlation-id") ??
    request.headers.get("x-request-id") ??
    randomUUID()
  );
}

export interface LifecycleErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

export function lifecycleErrorResponse(
  code: string,
  message: string,
  status: number,
  requestId: string
): NextResponse<LifecycleErrorBody> {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
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
  requestId: string
): NextResponse<LifecycleErrorBody> {
  if (err instanceof CommerceDomainError) {
    return lifecycleErrorResponse(err.code, err.message, err.statusCode, requestId);
  }
  console.error("[lifecycle-api] unhandled error", { requestId, err });
  return lifecycleErrorResponse(
    "internal_error",
    "An unexpected error occurred",
    500,
    requestId
  );
}

export function parseLifecycleErrorBody(body: unknown): { code: string; message: string; requestId?: string } {
  if (!body || typeof body !== "object") throw new Error("invalid error body");
  const payload = body as Record<string, unknown>;
  const nested = payload.error;
  if (nested && typeof nested === "object") {
    const err = nested as Record<string, unknown>;
    return {
      code: String(err.code ?? ""),
      message: String(err.message ?? err.error ?? ""),
      requestId: typeof err.requestId === "string" ? err.requestId : undefined,
    };
  }
  return {
    code: String(payload.code ?? ""),
    message: String(payload.error ?? ""),
  };
}
