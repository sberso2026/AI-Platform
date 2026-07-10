import { describe, expect, it } from "vitest";
import type { CommerceExecutionContext } from "@rtb/types";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { assertEngineeringService } from "./service-guard";

describe("assertEngineeringService", () => {
  it("throws when commerce context is missing authorization", () => {
    const missingAuth = {
      tenantId: "tenant-a",
      correlationId: "corr-1",
      actorType: "user",
    } as CommerceExecutionContext;

    expect(() => assertEngineeringService(missingAuth, "project.list", "tenant-a")).toThrow(
      CommerceDomainError
    );

    try {
      assertEngineeringService(missingAuth, "project.list", "tenant-a");
    } catch (error) {
      expect(error).toBeInstanceOf(CommerceDomainError);
      expect((error as CommerceDomainError).code).toBe("commerce_context_required");
    }
  });

  it("throws on tenant mismatch between commerce context and service tenantId", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      },
    });

    expect(() => assertEngineeringService(commerce, "project.list", "tenant-b")).toThrow(
      CommerceDomainError
    );

    try {
      assertEngineeringService(commerce, "project.list", "tenant-b");
    } catch (error) {
      expect(error).toBeInstanceOf(CommerceDomainError);
      expect((error as CommerceDomainError).code).toBe("tenant_mismatch");
    }
  });

  it("throws on action mismatch for the requested service policy", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "asset.read",
        seatRequired: true,
      },
    });

    expect(() => assertEngineeringService(commerce, "project.list", "tenant-a")).toThrow(
      CommerceDomainError
    );

    try {
      assertEngineeringService(commerce, "project.list", "tenant-a");
    } catch (error) {
      expect(error).toBeInstanceOf(CommerceDomainError);
      expect((error as CommerceDomainError).code).toBe("action_mismatch");
    }
  });

  it("allows a verified matching commerce context", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      },
    });

    expect(() => assertEngineeringService(commerce, "project.list", "tenant-a")).not.toThrow();
  });
});
