import type { AssignSeatInput, CommercialSeatAssignment, RemoveSeatInput, TransferSeatInput } from "@rtb/types";
import {
  SeatAlreadyAssignedError,
  SeatLimitExceededError,
} from "../domain/errors";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import type { SeatAssignmentRepository } from "../repositories/seat-assignment-repository";
import type { SeatRepository } from "../repositories/seat-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { LicenseRepository } from "../repositories/license-repository";
import type { CommerceEventService } from "./commerce-event-service";
import type { EntitlementCache } from "./entitlement-cache";
import type { EntitlementVersionRepository } from "../repositories/entitlement-version-repository";

export class SeatAssignmentService {
  constructor(
    private readonly seats: SeatRepository,
    private readonly assignments: SeatAssignmentRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly licenses: LicenseRepository,
    private readonly events: CommerceEventService,
    private readonly cache: EntitlementCache,
    private readonly entitlementVersions?: EntitlementVersionRepository
  ) {}

  private invalidateEntitlements(tenantId: string): void {
    this.cache.invalidateTenant(tenantId);
    void this.entitlementVersions?.bumpTenant(tenantId);
  }

  listPools = (tenantId: string) => this.seats.listByTenant(tenantId);
  listAssignments = (tenantId: string, seatPoolId: string) =>
    this.assignments.listByPool(tenantId, seatPoolId);

  async assign(input: AssignSeatInput): Promise<CommercialSeatAssignment> {
    const pool = (await this.seats.listByTenant(input.tenantId)).find((p) => p.id === input.seatPoolId);
    if (!pool) throw new Error("Seat pool not found");

    const existing = await this.assignments.getActiveAssignment(
      input.tenantId,
      input.seatPoolId,
      input.userId
    );
    if (existing) throw new SeatAlreadyAssignedError(input.userId);

    const activeAssignments = await this.assignments.listByPool(input.tenantId, input.seatPoolId);
    if (activeAssignments.length >= pool.total_seats) {
      throw new SeatLimitExceededError();
    }

    if (pool.subscription_id) {
      const sub = await this.subscriptions.getById(input.tenantId, pool.subscription_id);
      if (!sub || !SubscriptionStateMachine.isAccessGranting(sub.status)) {
        throw new Error("Subscription not active for seat assignment");
      }
    }

    const productLicences = await this.licenses.listByProduct(input.tenantId, pool.product_id);
    const activeLicence = productLicences.find((l) => l.status === "active");
    if (!activeLicence) throw new Error("No active licence for seat assignment");

    const assignment = await this.assignments.assign({
      tenantId: input.tenantId,
      seatPoolId: input.seatPoolId,
      userId: input.userId,
      workspaceId: input.workspaceId,
      subscriptionId: input.subscriptionId ?? pool.subscription_id ?? undefined,
      createdBy: input.assignedBy,
    });

    await this.seats.upsertPool({
      tenantId: input.tenantId,
      productId: pool.product_id,
      subscriptionId: pool.subscription_id ?? undefined,
      totalSeats: pool.total_seats,
      assignedSeats: activeAssignments.length + 1,
      createdBy: input.assignedBy,
    });

    await this.events.emit({
      eventType: "seat.assigned",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      actorUserId: input.assignedBy,
      aggregateType: "seat_assignment",
      aggregateId: assignment.id,
      payload: { userId: input.userId, seatPoolId: input.seatPoolId },
    });

    this.invalidateEntitlements(input.tenantId);
    return assignment;
  }

  async remove(input: RemoveSeatInput): Promise<CommercialSeatAssignment> {
    const existing = await this.assignments.getActiveAssignment(
      input.tenantId,
      input.seatPoolId,
      input.userId
    );
    if (!existing) throw new Error("Seat assignment not found");

    const removed = await this.assignments.remove(input.tenantId, existing.id, input.removedBy);
    const pool = (await this.seats.listByTenant(input.tenantId)).find((p) => p.id === input.seatPoolId);
    if (pool) {
      const remaining = await this.assignments.listByPool(input.tenantId, input.seatPoolId);
      await this.seats.upsertPool({
        tenantId: input.tenantId,
        productId: pool.product_id,
        subscriptionId: pool.subscription_id ?? undefined,
        totalSeats: pool.total_seats,
        assignedSeats: remaining.length,
        createdBy: input.removedBy,
      });
    }

    await this.events.emit({
      eventType: "seat.removed",
      tenantId: input.tenantId,
      actorUserId: input.removedBy,
      aggregateType: "seat_assignment",
      aggregateId: removed.id,
      payload: { userId: input.userId },
    });

    this.invalidateEntitlements(input.tenantId);
    return removed;
  }

  async transfer(input: TransferSeatInput): Promise<CommercialSeatAssignment> {
    await this.remove({
      tenantId: input.tenantId,
      seatPoolId: input.seatPoolId,
      userId: input.fromUserId,
      removedBy: input.transferredBy,
    });
    const assigned = await this.assign({
      tenantId: input.tenantId,
      seatPoolId: input.seatPoolId,
      userId: input.toUserId,
      assignedBy: input.transferredBy,
    });
    await this.events.emit({
      eventType: "seat.transferred",
      tenantId: input.tenantId,
      actorUserId: input.transferredBy,
      aggregateType: "seat_assignment",
      aggregateId: assigned.id,
      payload: { fromUserId: input.fromUserId, toUserId: input.toUserId },
    });
    return assigned;
  }
}
