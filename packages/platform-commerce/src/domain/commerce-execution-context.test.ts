import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { VerifiedCommerceAuthorization } from "@rtb/types";
import {
  createCommerceExecutionContext,
  createVerifiedCommerceAuthorization,
  createSchedulerCommerceContext,
  verifyCommerceAuthorization,
} from "./commerce-execution-context";
import { CommerceDomainError } from "./errors";

describe("createVerifiedCommerceAuthorization", () => {
  it("creates a signed authorization from an allowed decision", () => {
    const auth = createVerifiedCommerceAuthorization({
      decision: {
        allowed: true,
        decision: "allow",
        reasonCode: "active_product_licence" as never,
        seatRequired: true,
        seatAssigned: true,
      },
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      },
      tenantId: "tenant-a",
      userId: "user-1",
    });

    expect(auth.decision).toBe("allow");
    expect(auth.signatureOrInternalToken).toBeTruthy();
    expect(verifyCommerceAuthorization(auth)).toBe(true);
  });

  it("rejects denied decisions", () => {
    expect(() =>
      createVerifiedCommerceAuthorization({
        decision: {
          allowed: false,
          decision: "deny",
          reasonCode: "no_active_subscription" as never,
          seatRequired: false,
          seatAssigned: false,
        },
        policy: { productKey: "engineering-os", action: "access" },
        tenantId: "tenant-a",
      })
    ).toThrow(CommerceDomainError);
  });
});

describe("verifyCommerceAuthorization", () => {
  beforeEach(() => {
    vi.stubEnv("COMMERCE_AUTH_SECRET", "test-commerce-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects forged signatures", () => {
    const auth = createVerifiedCommerceAuthorization({
      decision: {
        allowed: true,
        decision: "allow",
        reasonCode: "active_product_licence" as never,
        seatRequired: false,
        seatAssigned: true,
      },
      policy: { productKey: "engineering-os", action: "project.read" },
      tenantId: "tenant-a",
    });

    const forged: VerifiedCommerceAuthorization = {
      ...auth,
      signatureOrInternalToken: "deadbeef".repeat(8),
    };

    expect(verifyCommerceAuthorization(forged)).toBe(false);
  });

  it("rejects expired authorization", () => {
    const auth = createVerifiedCommerceAuthorization({
      decision: {
        allowed: true,
        decision: "allow",
        reasonCode: "active_product_licence" as never,
        seatRequired: false,
        seatAssigned: true,
      },
      policy: { productKey: "engineering-os", action: "project.read" },
      tenantId: "tenant-a",
    });

    const expired: VerifiedCommerceAuthorization = {
      ...auth,
      validUntil: new Date(Date.now() - 60_000).toISOString(),
    };

    expect(verifyCommerceAuthorization(expired)).toBe(false);
  });

  it("rejects tampered tenant id", () => {
    const auth = createVerifiedCommerceAuthorization({
      decision: {
        allowed: true,
        decision: "allow",
        reasonCode: "active_product_licence" as never,
        seatRequired: false,
        seatAssigned: true,
      },
      policy: { productKey: "engineering-os", action: "project.read" },
      tenantId: "tenant-a",
    });

    const tampered: VerifiedCommerceAuthorization = {
      ...auth,
      tenantId: "tenant-b",
    };

    expect(verifyCommerceAuthorization(tampered)).toBe(false);
  });
});

describe("createCommerceExecutionContext", () => {
  it("binds verified authorization to execution context", () => {
    const ctx = createCommerceExecutionContext({
      tenantId: "tenant-a",
      actorUserId: "user-1",
      correlationId: "corr-1",
      decision: {
        allowed: true,
        decision: "allow",
        reasonCode: "active_product_licence" as never,
        seatRequired: true,
        seatAssigned: true,
      },
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      },
    });

    expect(ctx.tenantId).toBe("tenant-a");
    expect(ctx.authorization.action).toBe("project.read");
    expect(verifyCommerceAuthorization(ctx.authorization)).toBe(true);
  });
});

describe("createSchedulerCommerceContext", () => {
  it("creates scheduler context with valid signature", () => {
    const ctx = createSchedulerCommerceContext({
      tenantId: "tenant-a",
      correlationId: "job-1",
      action: "subscription.renew",
    });

    expect(ctx.actorType).toBe("scheduler");
    expect(verifyCommerceAuthorization(ctx.authorization)).toBe(true);
  });
});
