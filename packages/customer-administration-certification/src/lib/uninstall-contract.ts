import { expect } from "vitest";

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

export function parseUninstallSuccess(body: unknown): UninstallSuccessResponse {
  expect(body).toBeTruthy();
  expect(typeof body).toBe("object");
  const payload = body as Record<string, unknown>;
  expect(payload.data).toBeTruthy();
  const data = payload.data as Record<string, unknown>;
  expect(typeof data.id).toBe("string");
  expect(data.status).toBe("uninstalled");
  expect(typeof data.tenant_id).toBe("string");
  expect(typeof data.product_id).toBe("string");
  return payload as UninstallSuccessResponse;
}

export function parseUninstallError(body: unknown): UninstallErrorResponse {
  expect(body).toBeTruthy();
  expect(typeof body).toBe("object");
  const payload = body as Record<string, unknown>;
  expect(typeof payload.error).toBe("string");
  expect(typeof payload.code).toBe("string");
  return payload as UninstallErrorResponse;
}
