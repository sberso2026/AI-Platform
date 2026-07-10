import type { CommerceExecutionContext } from "@rtb/types";
import {
  assertTenantMatch,
  assertVerifiedCommerceContext,
  verifyCommerceAuthorization,
  type ServiceAssertionPolicy,
} from "@rtb/platform-commerce/server";
import {
  ENGINEERING_SERVICE_POLICIES,
  CommerceDomainError,
} from "@rtb/platform-commerce";

export function assertEngineeringTenantScope(
  commerce: CommerceExecutionContext,
  tenantId?: string
): void {
  if (!commerce?.authorization) {
    throw new CommerceDomainError(
      "Commerce execution context required",
      "commerce_context_required",
      403
    );
  }

  if (!verifyCommerceAuthorization(commerce.authorization)) {
    throw new CommerceDomainError(
      "Invalid or expired commerce authorization",
      "commerce_authorization_invalid",
      403
    );
  }

  if (tenantId !== undefined) {
    assertTenantMatch(commerce, tenantId);
  }
}

export function assertEngineeringService(
  commerce: CommerceExecutionContext,
  policyKey: string,
  tenantId?: string,
  options?: { aggregate?: boolean }
): void {
  if (options?.aggregate) {
    assertEngineeringTenantScope(commerce, tenantId);
    return;
  }

  const policy = ENGINEERING_SERVICE_POLICIES[policyKey];
  if (!policy) {
    throw new CommerceDomainError(
      `Unknown engineering service policy: ${policyKey}`,
      "policy_not_found",
      500
    );
  }

  assertVerifiedCommerceContext(commerce, policy as ServiceAssertionPolicy);

  if (tenantId !== undefined) {
    assertTenantMatch(commerce, tenantId);
  }
}
