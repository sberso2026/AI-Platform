import { describe, expect, it, vi, beforeEach } from "vitest";
import type { CommercialLicense, CommercialSubscription } from "@rtb/types";

import { CommerceOutboxProcessor } from "./commerce-outbox-processor";
import {
  COMMERCE_SCHEDULER_JOBS,
  CommerceSchedulerService,
} from "./commerce-scheduler-service";
import { EntitlementCache } from "./entitlement-cache";
import type { PlatformCommerce } from "../platform-commerce";
import type { CommercialOutboxEvent, OutboxRepository } from "../repositories/outbox-repository";

function makeSubscription(overrides: Partial<CommercialSubscription> = {}): CommercialSubscription {
  return {
    id: "sub-1",
    tenant_id: "tenant-1",
    product_id: "prod-1",
    status: "trialing",
    quantity: 1,
    metadata: {},
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    trial_end: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function makeLicence(overrides: Partial<CommercialLicense> = {}): CommercialLicense {
  return {
    id: "lic-1",
    tenant_id: "tenant-1",
    license_type: "product",
    status: "active",
    metadata: {},
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createOutboxRepo(events: CommercialOutboxEvent[] = []): OutboxRepository {
  return {
    claimPending: vi.fn(async () => events),
    markProcessed: vi.fn(async () => undefined),
    markFailed: vi.fn(async () => undefined),
    moveToDeadLetter: vi.fn(async () => undefined),
  } as unknown as OutboxRepository;
}

function createCommerceMock(): PlatformCommerce {
  return {
    trials: { expireTrials: vi.fn(async () => 2) },
    licenses: {
      listDueForExpiry: vi.fn(async () => []),
      listExpiringWithin: vi.fn(async () => []),
      transitionToExpired: vi.fn(async () => null),
    },
    subscriptions: {
      listScheduledCancellationsDue: vi.fn(async () => []),
      listGracePeriodExpired: vi.fn(async () => []),
      listExpiringSubscriptions: vi.fn(async () => []),
    },
    subscriptionChanges: {
      listScheduledDue: vi.fn(async () => []),
      applyScheduledChange: vi.fn(async () => undefined),
    },
    lifecycle: {
      cancel: vi.fn(async () => makeSubscription({ status: "cancelled" })),
      suspend: vi.fn(async () => makeSubscription({ status: "suspended" })),
    },
    events: { emit: vi.fn(async () => undefined) },
    scheduler: null,
    outboxProcessor: null,
  } as unknown as PlatformCommerce;
}

describe("CommerceSchedulerService", () => {
  let commerce: PlatformCommerce;
  let cache: EntitlementCache;
  let outboxProcessor: CommerceOutboxProcessor;
  let scheduler: CommerceSchedulerService;

  beforeEach(() => {
    commerce = createCommerceMock();
    cache = new EntitlementCache();
    outboxProcessor = new CommerceOutboxProcessor(createOutboxRepo());
    scheduler = new CommerceSchedulerService(commerce, outboxProcessor, cache);
  });

  it("exposes the expected scheduler jobs", () => {
    expect(COMMERCE_SCHEDULER_JOBS).toContain("expireTrials");
    expect(COMMERCE_SCHEDULER_JOBS).toContain("processCommerceOutbox");
    expect(COMMERCE_SCHEDULER_JOBS.length).toBe(12);
  });

  it("runAll executes every registered job", async () => {
    vi.spyOn(outboxProcessor, "processBatch").mockResolvedValue({
      processed: 1,
      failed: 0,
      deadLettered: 0,
      errors: [],
    });

    const results = await scheduler.runAll();
    expect(results).toHaveLength(COMMERCE_SCHEDULER_JOBS.length);
    expect(commerce.trials.expireTrials).toHaveBeenCalled();
    expect(outboxProcessor.processBatch).toHaveBeenCalled();
  });

  it("runJobs rejects unknown job names in results", async () => {
    const results = await scheduler.runJobs(["expireTrials", "notARealJob"]);
    expect(results[0]?.job).toBe("expireTrials");
    expect(results[1]?.errors[0]).toContain("Unknown job");
  });

  it("expireLicences transitions due licences and emits events", async () => {
    const licence = makeLicence();
    vi.mocked(commerce.licenses.listDueForExpiry)
      .mockResolvedValueOnce([licence])
      .mockResolvedValueOnce([]);
    vi.mocked(commerce.licenses.transitionToExpired).mockResolvedValue(
      makeLicence({ status: "expired" })
    );

    const invalidateSpy = vi.spyOn(cache, "invalidateTenant");
    const result = await scheduler.expireLicences();

    expect(result.processed).toBe(1);
    expect(commerce.events.emit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "licence.expired", aggregateId: licence.id })
    );
    expect(invalidateSpy).toHaveBeenCalledWith("tenant-1");
  });

  it("applyScheduledCancellations cancels due subscriptions", async () => {
    const sub = makeSubscription({ status: "scheduled_cancellation" });
    vi.mocked(commerce.subscriptions.listScheduledCancellationsDue)
      .mockResolvedValueOnce([sub])
      .mockResolvedValueOnce([]);

    const result = await scheduler.applyScheduledCancellations();

    expect(result.processed).toBe(1);
    expect(commerce.lifecycle.cancel).toHaveBeenCalledWith(
      sub.tenant_id,
      sub.id,
      undefined,
      "scheduled_cancellation_effective"
    );
  });

  it("processGracePeriodExpiry suspends expired grace-period subscriptions", async () => {
    const sub = makeSubscription({ status: "grace_period", grace_period_end: "2026-01-01T00:00:00.000Z" });
    vi.mocked(commerce.subscriptions.listGracePeriodExpired)
      .mockResolvedValueOnce([sub])
      .mockResolvedValueOnce([]);

    const result = await scheduler.processGracePeriodExpiry();

    expect(result.processed).toBe(1);
    expect(commerce.lifecycle.suspend).toHaveBeenCalledWith(
      sub.tenant_id,
      sub.id,
      undefined,
      "grace_period_expired"
    );
  });

  it("emitTrialWarnings emits idempotent trial.warning events on warning days", async () => {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);

    const sub = makeSubscription({
      status: "trialing",
      trial_end: trialEnd.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
    });
    vi.mocked(commerce.subscriptions.listExpiringSubscriptions).mockResolvedValue([sub]);

    const result = await scheduler.emitTrialWarnings();

    expect(result.processed).toBe(1);
    expect(commerce.events.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "trial.warning",
        idempotencyKey: expect.stringContaining("trial-warning:sub-1:3"),
      })
    );
  });
});

describe("CommerceOutboxProcessor", () => {
  it("marks events processed when handlers succeed", async () => {
    const event: CommercialOutboxEvent = {
      id: "evt-1",
      tenant_id: "tenant-1",
      aggregate_type: "subscription",
      aggregate_id: "sub-1",
      event_type: "subscription.created",
      payload: {},
      correlation_id: null,
      idempotency_key: null,
      status: "processing",
      retry_count: 0,
      last_error: null,
      available_at: "2026-01-01T00:00:00.000Z",
      processed_at: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    const outbox = createOutboxRepo([event]);
    const processor = new CommerceOutboxProcessor(outbox);

    const result = await processor.processBatch(10);

    expect(result.processed).toBe(1);
    expect(outbox.markProcessed).toHaveBeenCalledWith("evt-1");
  });

  it("dead-letters events after max retries", async () => {
    const event: CommercialOutboxEvent = {
      id: "evt-2",
      tenant_id: "tenant-1",
      aggregate_type: "subscription",
      aggregate_id: "sub-2",
      event_type: "custom.fail",
      payload: {},
      correlation_id: null,
      idempotency_key: null,
      status: "processing",
      retry_count: 4,
      last_error: null,
      available_at: "2026-01-01T00:00:00.000Z",
      processed_at: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    const outbox = createOutboxRepo([event]);
    const processor = new CommerceOutboxProcessor(outbox);
    processor.registerHandler("custom.fail", async () => {
      throw new Error("handler failed");
    });

    const result = await processor.processBatch(10);

    expect(result.deadLettered).toBe(1);
    expect(outbox.moveToDeadLetter).toHaveBeenCalledWith("evt-2", "handler failed");
  });
});
