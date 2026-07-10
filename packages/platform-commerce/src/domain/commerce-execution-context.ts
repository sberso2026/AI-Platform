import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CommerceAccessPolicy,
  CommerceCachePolicy,
  CommerceExecutionContext,
  CommerceActorType,
  VerifiedCommerceAuthorization,
} from "@rtb/types";
import type { EntitlementDecision } from "./entitlement-reason-codes";
import { CommerceDomainError } from "./errors";

const AUTH_TTL_MS = 5 * 60 * 1000;

function authSecret(): string {
  return process.env.COMMERCE_AUTH_SECRET ?? "rtb-dev-commerce-auth-secret";
}

function signPayload(payload: Record<string, string>): string {
  const canonical = Object.keys(payload)
    .sort()
    .map((k) => `${k}=${payload[k]}`)
    .join("|");
  return createHmac("sha256", authSecret()).update(canonical).digest("hex");
}

export function createVerifiedCommerceAuthorization(input: {
  decision: EntitlementDecision;
  policy: CommerceAccessPolicy;
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  cachePolicy?: CommerceCachePolicy;
}): VerifiedCommerceAuthorization {
  if (!input.decision.allowed) {
    throw new CommerceDomainError(
      "Cannot create authorization from denied decision",
      "authorization_denied",
      403
    );
  }

  const decisionId = crypto.randomUUID();
  const evaluatedAt = new Date().toISOString();
  const validUntil = new Date(Date.now() + AUTH_TTL_MS).toISOString();

  const auth: VerifiedCommerceAuthorization = {
    decisionId,
    decision: "allow",
    productKey: input.policy.productKey,
    applicationKey: input.policy.applicationKey,
    featureKey: input.policy.featureKey,
    action: input.policy.action,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    seatRequired: input.policy.seatRequired ?? false,
    seatAssigned: input.decision.seatAssigned,
    evaluatedAt,
    validUntil,
    cachePolicy: input.cachePolicy ?? input.policy.cachePolicy ?? "allow-short-cache",
  };

  const signature = signPayload({
    decisionId,
    tenantId: auth.tenantId,
    action: auth.action,
    productKey: auth.productKey,
  });

  return { ...auth, signatureOrInternalToken: signature };
}

export function verifyCommerceAuthorization(
  auth: VerifiedCommerceAuthorization
): boolean {
  if (!auth.signatureOrInternalToken) return false;
  if (auth.decision !== "allow") return false;
  if (new Date(auth.validUntil).getTime() < Date.now()) return false;

  const expected = signPayload({
    decisionId: auth.decisionId,
    tenantId: auth.tenantId,
    action: auth.action,
    productKey: auth.productKey,
  });

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(auth.signatureOrInternalToken, "utf8")
    );
  } catch {
    return false;
  }
}

export function createCommerceExecutionContext(input: {
  tenantId: string;
  workspaceId?: string;
  actorUserId?: string;
  actorType?: CommerceActorType;
  correlationId: string;
  decision: EntitlementDecision;
  policy: CommerceAccessPolicy;
}): CommerceExecutionContext {
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId,
    actorType: input.actorType ?? "user",
    correlationId: input.correlationId,
    authorization: createVerifiedCommerceAuthorization({
      decision: input.decision,
      policy: input.policy,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.actorUserId,
      cachePolicy: input.policy.cachePolicy,
    }),
  };
}

export function createSchedulerCommerceContext(input: {
  tenantId: string;
  correlationId: string;
  action: string;
  productKey?: string;
}): CommerceExecutionContext {
  const decisionId = crypto.randomUUID();
  const evaluatedAt = new Date().toISOString();
  const validUntil = new Date(Date.now() + AUTH_TTL_MS).toISOString();
  const productKey = input.productKey ?? "engineering-os";
  const auth: VerifiedCommerceAuthorization = {
    decisionId,
    decision: "allow",
    productKey,
    action: input.action,
    tenantId: input.tenantId,
    seatRequired: false,
    evaluatedAt,
    validUntil,
    cachePolicy: "fresh",
  };
  const signature = signPayload({
    decisionId,
    tenantId: input.tenantId,
    action: input.action,
    productKey,
  });
  return {
    tenantId: input.tenantId,
    actorType: "scheduler",
    correlationId: input.correlationId,
    authorization: { ...auth, signatureOrInternalToken: signature },
  };
}

/** Test-only helper — never use in production routes */
export function createTestCommerceExecutionContext(
  overrides: Partial<CommerceExecutionContext> & {
    policy?: CommerceAccessPolicy;
  } = {}
): CommerceExecutionContext {
  const policy = overrides.policy ?? {
    productKey: "engineering-os",
    applicationKey: "project_intelligence",
    action: "project.read",
    seatRequired: true,
  };
  const tenantId = overrides.tenantId ?? "test-tenant";
  return createCommerceExecutionContext({
    tenantId,
    workspaceId: overrides.workspaceId,
    actorUserId: overrides.actorUserId ?? "test-user",
    actorType: overrides.actorType ?? "user",
    correlationId: overrides.correlationId ?? "test-correlation",
    decision: {
      allowed: true,
      decision: "allow",
      reasonCode: "active_product_licence" as never,
      seatRequired: policy.seatRequired ?? false,
      seatAssigned: true,
    },
    policy,
  });
}
