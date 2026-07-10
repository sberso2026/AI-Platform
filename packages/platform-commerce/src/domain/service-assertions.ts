import type { CommerceAccessPolicy, CommerceExecutionContext } from "@rtb/types";
import { verifyCommerceAuthorization } from "./commerce-execution-context";
import { CommerceDomainError } from "./errors";

export interface ServiceAssertionPolicy extends CommerceAccessPolicy {
  allowScheduler?: boolean;
}

export function assertVerifiedCommerceContext(
  commerce: CommerceExecutionContext,
  policy: ServiceAssertionPolicy
): void {
  if (!commerce?.authorization) {
    throw new CommerceDomainError(
      "Commerce execution context required",
      "commerce_context_required",
      403
    );
  }

  if (commerce.actorType === "scheduler" && policy.allowScheduler) {
    assertTenantMatch(commerce, commerce.tenantId);
    return;
  }

  if (!verifyCommerceAuthorization(commerce.authorization)) {
    throw new CommerceDomainError(
      "Invalid or expired commerce authorization",
      "commerce_authorization_invalid",
      403
    );
  }

  assertTenantMatch(commerce, commerce.tenantId);
  assertCommerceAction(commerce, policy.action);
  assertApplicationScope(commerce, policy);
  assertFeatureScope(commerce, policy);

  if (policy.workspaceRequired && !commerce.workspaceId) {
    throw new CommerceDomainError("Workspace required", "workspace_required", 403);
  }

  if (policy.seatRequired && commerce.authorization.seatRequired && !commerce.authorization.seatAssigned) {
    throw new CommerceDomainError("Seat not assigned", "seat_not_assigned", 403);
  }
}

export function assertTenantMatch(
  commerce: CommerceExecutionContext,
  tenantId: string
): void {
  if (commerce.tenantId !== tenantId) {
    throw new CommerceDomainError("Tenant mismatch", "tenant_mismatch", 403);
  }
  if (commerce.authorization.tenantId !== tenantId) {
    throw new CommerceDomainError("Authorization tenant mismatch", "tenant_mismatch", 403);
  }
}

export function assertWorkspaceMatch(
  commerce: CommerceExecutionContext,
  workspaceId?: string
): void {
  if (!workspaceId) return;
  if (commerce.workspaceId && commerce.workspaceId !== workspaceId) {
    throw new CommerceDomainError("Workspace mismatch", "workspace_mismatch", 403);
  }
}

export function assertCommerceAction(
  commerce: CommerceExecutionContext,
  action: string
): void {
  if (commerce.authorization.action !== action) {
    throw new CommerceDomainError(
      `Action mismatch: expected ${action}`,
      "action_mismatch",
      403
    );
  }
}

export function assertApplicationScope(
  commerce: CommerceExecutionContext,
  policy: CommerceAccessPolicy
): void {
  if (!policy.applicationKey) return;
  if (commerce.authorization.applicationKey !== policy.applicationKey) {
    throw new CommerceDomainError(
      "Application scope mismatch",
      "application_not_in_plan",
      403
    );
  }
}

export function assertFeatureScope(
  commerce: CommerceExecutionContext,
  policy: CommerceAccessPolicy
): void {
  if (!policy.featureKey) return;
  if (commerce.authorization.featureKey !== policy.featureKey) {
    throw new CommerceDomainError("Feature scope mismatch", "feature_not_enabled", 403);
  }
}
