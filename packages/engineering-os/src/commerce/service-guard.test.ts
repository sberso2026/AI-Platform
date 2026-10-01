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

  it("rejects authorization.action project.list when the canonical permission is project.read", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        action: "project.list",
        seatRequired: true,
      },
    });

    expect(() => assertEngineeringService(commerce, "project.list", "tenant-a")).toThrow(
      CommerceDomainError,
    );

    try {
      assertEngineeringService(commerce, "project.list", "tenant-a");
    } catch (error) {
      expect(error).toBeInstanceOf(CommerceDomainError);
      expect((error as CommerceDomainError).code).toBe("action_mismatch");
      expect((error as CommerceDomainError).message).toBe("Action mismatch: expected project.read");
    }
  });

  it("allows a verified matching commerce context", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: {
        productKey: "engineering-os",
        action: "project.read",
        seatRequired: true,
      },
    });

    expect(() => assertEngineeringService(commerce, "project.list", "tenant-a")).not.toThrow();
  });

  it("does not let analysis.write satisfy work.get", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: { productKey: "engineering-os", action: "analysis.write", seatRequired: true },
    });
    expect(() => assertEngineeringService(commerce, "work.get", "tenant-a")).toThrow(CommerceDomainError);
    try {
      assertEngineeringService(commerce, "work.get", "tenant-a");
    } catch (error) {
      expect((error as CommerceDomainError).code).toBe("action_mismatch");
      expect((error as CommerceDomainError).message).toBe("Action mismatch: expected analysis.read");
    }
  });

  it("does not let analysis.read satisfy work.write", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      policy: { productKey: "engineering-os", action: "analysis.read", seatRequired: true },
    });
    expect(() => assertEngineeringService(commerce, "work.write", "tenant-a")).toThrow(CommerceDomainError);
    try {
      assertEngineeringService(commerce, "work.write", "tenant-a");
    } catch (error) {
      expect((error as CommerceDomainError).code).toBe("action_mismatch");
      expect((error as CommerceDomainError).message).toBe("Action mismatch: expected analysis.write");
    }
  });
});
