import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { CommerceExecutionContext } from "@rtb/types";
import { createTestCommerceExecutionContext, createSchedulerCommerceContext } from "./commerce-execution-context";
import { CommerceDomainError } from "./errors";
import {
  assertApplicationScope,
  assertCommerceAction,
  assertFeatureScope,
  assertTenantMatch,
  assertVerifiedCommerceContext,
  assertWorkspaceMatch,
} from "./service-assertions";

describe("assertVerifiedCommerceContext", () => {
  beforeEach(() => {
    vi.stubEnv("COMMERCE_AUTH_SECRET", "test-commerce-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when authorization is missing", () => {
    const ctx = {
      tenantId: "tenant-a",
      correlationId: "c1",
      actorType: "user",
    } as CommerceExecutionContext;

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        action: "project.read",
      })
    ).toThrow(CommerceDomainError);

    try {
      assertVerifiedCommerceContext(ctx, { productKey: "engineering-os", action: "project.read" });
    } catch (e) {
      expect((e as CommerceDomainError).code).toBe("commerce_context_required");
    }
  });

  it("allows scheduler bypass when policy permits", () => {
    const ctx = createSchedulerCommerceContext({
      tenantId: "tenant-a",
      correlationId: "job-1",
      action: "subscription.renew",
    });

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        action: "subscription.renew",
        allowScheduler: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid authorization signature", () => {
    const ctx = createTestCommerceExecutionContext({ tenantId: "tenant-a" });
    ctx.authorization.signatureOrInternalToken = "forged";

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      })
    ).toThrow(CommerceDomainError);
  });

  it("rejects action mismatch", () => {
    const ctx = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "asset.read",
        seatRequired: true,
      },
    });

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      })
    ).toThrow(CommerceDomainError);
  });

  it("rejects application scope mismatch", () => {
    const ctx = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "documents",
        action: "document.read",
        seatRequired: true,
      },
    });

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "document.read",
        seatRequired: true,
      })
    ).toThrow(CommerceDomainError);
  });

  it("rejects unassigned seat when required", () => {
    const ctx = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      },
    });
    ctx.authorization.seatAssigned = false;

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      })
    ).toThrow(CommerceDomainError);
  });

  it("requires workspace when policy demands it", () => {
    const ctx = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: undefined,
      policy: {
        productKey: "engineering-os",
        action: "project.read",
        seatRequired: true,
        workspaceRequired: true,
      },
    });

    expect(() =>
      assertVerifiedCommerceContext(ctx, {
        productKey: "engineering-os",
        action: "project.read",
        workspaceRequired: true,
      })
    ).toThrow(CommerceDomainError);
  });
});

describe("assertTenantMatch", () => {
  it("throws on tenant mismatch", () => {
    const ctx = createTestCommerceExecutionContext({ tenantId: "tenant-a" });
    expect(() => assertTenantMatch(ctx, "tenant-b")).toThrow(CommerceDomainError);
  });
});

describe("assertWorkspaceMatch", () => {
  it("throws on workspace mismatch", () => {
    const ctx = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "ws-a",
    });
    expect(() => assertWorkspaceMatch(ctx, "ws-b")).toThrow(CommerceDomainError);
  });
});

describe("assertCommerceAction", () => {
  it("throws when action differs", () => {
    const ctx = createTestCommerceExecutionContext({
      policy: { productKey: "engineering-os", action: "project.read" },
    });
    expect(() => assertCommerceAction(ctx, "project.create")).toThrow(CommerceDomainError);
  });
});

describe("assertApplicationScope", () => {
  it("throws when application key differs", () => {
    const ctx = createTestCommerceExecutionContext({
      policy: {
        productKey: "engineering-os",
        applicationKey: "documents",
        action: "document.read",
      },
    });
    expect(() =>
      assertApplicationScope(ctx, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "document.read",
      })
    ).toThrow(CommerceDomainError);
  });
});

describe("assertFeatureScope", () => {
  it("throws when feature key differs", () => {
    const ctx = createTestCommerceExecutionContext({
      policy: {
        productKey: "engineering-os",
        featureKey: "ai_assistant",
        action: "ai.execute",
      },
    });
    expect(() =>
      assertFeatureScope(ctx, {
        productKey: "engineering-os",
        featureKey: "ai_ocr",
        action: "ai.execute",
      })
    ).toThrow(CommerceDomainError);
  });
});
