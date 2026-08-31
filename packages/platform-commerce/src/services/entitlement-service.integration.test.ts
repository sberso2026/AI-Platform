import { describe, expect, it, vi, beforeEach } from "vitest";
import { EntitlementService } from "./entitlement-service";
import { EntitlementCache } from "./entitlement-cache";
import { EntitlementReasonCode } from "../domain/entitlement-reason-codes";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { LicenseRepository } from "../repositories/license-repository";
import type { SeatRepository } from "../repositories/seat-repository";
import type { SeatAssignmentRepository } from "../repositories/seat-assignment-repository";
import type { PlanEntitlementRepository } from "../repositories/entitlement-repository";
import type { EntitlementOverrideRepository } from "../repositories/entitlement-repository";
import type { ProductApplicationRepository } from "../repositories/entitlement-repository";

function createMocks() {
  const cache = new EntitlementCache(60_000);
  const subscriptions = {
    findActiveByProduct: vi.fn(),
    listByTenant: vi.fn(),
  } as unknown as SubscriptionRepository;
  const licenses = {
    listByProduct: vi.fn(),
  } as unknown as LicenseRepository;
  const seats = {
    getByProduct: vi.fn(),
  } as unknown as SeatRepository;
  const seatAssignments = {
    getActiveAssignment: vi.fn(),
  } as unknown as SeatAssignmentRepository;
  const planEntitlements = {
    listByPlan: vi.fn(),
  } as unknown as PlanEntitlementRepository;
  const overrides = {
    listActive: vi.fn().mockResolvedValue([]),
  } as unknown as EntitlementOverrideRepository;
  const products = {
    getProductBySlug: vi.fn(),
  } as unknown as ProductApplicationRepository;

  const service = new EntitlementService(
    subscriptions,
    licenses,
    seats,
    seatAssignments,
    planEntitlements,
    overrides,
    products,
    cache
  );

  return {
    service,
    cache,
    subscriptions,
    licenses,
    seats,
    seatAssignments,
    products,
    overrides,
  };
}

describe("EntitlementService integration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies when subscription is suspended", async () => {
    const { service, products, subscriptions } = createMocks();
    products.getProductBySlug = vi.fn().mockResolvedValue({
      id: "prod-1",
      slug: "engineering-os",
      lifecycle_status: "active",
    });
    subscriptions.findActiveByProduct = vi.fn().mockResolvedValue({
      id: "sub-1",
      status: "suspended",
      product_id: "prod-1",
      tenant_id: "t1",
    });

    const decision = await service.check({
      tenantId: "t1",
      userId: "u1",
      productKey: "engineering-os",
      action: "access",
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe(EntitlementReasonCode.DENY_SUBSCRIPTION_SUSPENDED);
  });

  it("denies when seat not assigned", async () => {
    const { service, products, subscriptions, licenses, seats, seatAssignments } = createMocks();
    products.getProductBySlug = vi.fn().mockResolvedValue({
      id: "prod-1",
      lifecycle_status: "active",
    });
    subscriptions.findActiveByProduct = vi.fn().mockResolvedValue({
      id: "sub-1",
      status: "active",
      product_id: "prod-1",
    });
    licenses.listByProduct = vi.fn().mockResolvedValue([
      {
        id: "lic-1",
        license_type: "product",
        status: "active",
        product_id: "prod-1",
        max_seats: 10,
      },
    ]);
    seats.getByProduct = vi.fn().mockResolvedValue({ id: "pool-1", total_seats: 10 });
    seatAssignments.getActiveAssignment = vi.fn().mockResolvedValue(null);

    const decision = await service.check({
      tenantId: "t1",
      userId: "u1",
      productKey: "engineering-os",
      action: "access",
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe(EntitlementReasonCode.DENY_SEAT_NOT_ASSIGNED);
  });

  it("bypasses cache when fresh policy requested", async () => {
    const { service, products, subscriptions, licenses, seats, seatAssignments, cache } =
      createMocks();
    products.getProductBySlug = vi.fn().mockResolvedValue({
      id: "prod-1",
      lifecycle_status: "active",
    });
    subscriptions.findActiveByProduct = vi.fn().mockResolvedValue({
      id: "sub-1",
      status: "active",
      product_id: "prod-1",
    });
    licenses.listByProduct = vi.fn().mockResolvedValue([
      { id: "lic-1", license_type: "product", status: "active", product_id: "prod-1", max_seats: 0 },
    ]);
    seats.getByProduct = vi.fn().mockResolvedValue(null);
    seatAssignments.getActiveAssignment = vi.fn().mockResolvedValue(null);

    const input = {
      tenantId: "t1",
      userId: "u1",
      productKey: "engineering-os",
      action: "access",
      cachePolicy: "fresh" as const,
    };

    await service.check(input);
    await service.check(input);
    expect(subscriptions.findActiveByProduct).toHaveBeenCalledTimes(2);

    cache.invalidateTenant("t1");
  });

  it("lists active overrides once and does not reserialize deny/allow lookups", async () => {
    const { service, products, subscriptions, licenses, seats, seatAssignments, overrides } =
      createMocks();
    products.getProductBySlug = vi.fn().mockResolvedValue({
      id: "prod-1",
      lifecycle_status: "active",
    });
    subscriptions.findActiveByProduct = vi.fn().mockResolvedValue({
      id: "sub-1",
      status: "active",
      product_id: "prod-1",
    });
    licenses.listByProduct = vi.fn().mockResolvedValue([
      { id: "lic-1", license_type: "product", status: "active", product_id: "prod-1", max_seats: 0 },
    ]);
    seats.getByProduct = vi.fn().mockResolvedValue(null);
    seatAssignments.getActiveAssignment = vi.fn().mockResolvedValue(null);

    await service.check({
      tenantId: "t1",
      userId: "u1",
      productKey: "engineering-os",
      action: "access",
      cachePolicy: "fresh",
    });

    expect(overrides.listActive).toHaveBeenCalledTimes(1);
    expect(service.lastProfile?.overrideListCalls).toBe(1);
    expect(service.lastProfile?.waves).toBeGreaterThanOrEqual(2);
  });
});
