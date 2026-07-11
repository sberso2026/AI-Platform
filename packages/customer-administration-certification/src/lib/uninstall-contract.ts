/** Canonical machine-readable codes for POST /api/platform/installations/:id/uninstall */
export const UNINSTALL_ERROR_CODES = {
  INVALID_INSTALLATION_TRANSITION: "invalid_installation_transition",
  ACTIVE_DEPENDENCIES_EXIST: "active_dependencies_exist",
  INSTALLATION_NOT_FOUND: "installation_not_found",
  COMMERCE_PERMISSION_DENIED: "commerce_permission_denied",
} as const;

export type UninstallErrorCode =
  (typeof UNINSTALL_ERROR_CODES)[keyof typeof UNINSTALL_ERROR_CODES];

export interface UninstallSuccessResponse {
  data: {
    id: string;
    status: string;
    tenant_id: string;
    product_id: string;
    subscription_id: string | null;
    installed_version: string | null;
  };
}

export interface UninstallErrorResponse {
  error: string;
  code: string;
}

export function assertNoServerError(status: number): void {
  if (status >= 500) {
    throw new Error(`Unexpected server error status ${status}`);
  }
}

/** Use for uninstall certification — assertNoServerError alone is not sufficient. */
export function assertExactUninstallStatus(status: number, expected: number): void {
  assertNoServerError(status);
  if (status !== expected) {
    throw new Error(`Expected uninstall HTTP status ${expected}, got ${status}`);
  }
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function parseUninstallSuccess(body: unknown): UninstallSuccessResponse {
  assertCondition(body && typeof body === "object", "invalid uninstall success body");
  const payload = body as Record<string, unknown>;
  assertCondition(payload.data && typeof payload.data === "object", "missing data in success body");
  const data = payload.data as Record<string, unknown>;
  assertCondition(typeof data.id === "string", "missing id in success body");
  assertCondition(data.status === "uninstalled", `expected uninstalled status, got ${String(data.status)}`);
  assertCondition(typeof data.tenant_id === "string", "missing tenant_id in success body");
  assertCondition(typeof data.product_id === "string", "missing product_id in success body");
  return payload as UninstallSuccessResponse;
}

export function parseUninstallError(body: unknown): UninstallErrorResponse {
  assertCondition(body && typeof body === "object", "invalid uninstall error body");
  const payload = body as Record<string, unknown>;
  const nested = payload.error;
  if (nested && typeof nested === "object") {
    const err = nested as Record<string, unknown>;
    assertCondition(typeof err.code === "string", "missing error code");
    assertCondition(typeof err.message === "string", "missing error message");
    return { error: err.message as string, code: err.code as string };
  }
  assertCondition(typeof payload.error === "string", "missing error message");
  assertCondition(typeof payload.code === "string", "missing error code");
  return payload as UninstallErrorResponse;
}
