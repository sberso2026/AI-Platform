import { commerceExtensions } from "./product-service";
import type { OutboxRepository } from "../repositories/outbox-repository";

export interface CommerceDomainEvent {
  eventType: string;
  tenantId?: string;
  workspaceId?: string;
  actorUserId?: string;
  aggregateType: string;
  aggregateId: string;
  correlationId?: string;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
}

export class CommerceEventService {
  constructor(private readonly outbox: OutboxRepository) {}

  async emit(event: CommerceDomainEvent): Promise<void> {
    await this.outbox.enqueue({
      tenantId: event.tenantId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      payload: {
        ...event.payload,
        workspaceId: event.workspaceId,
        actorUserId: event.actorUserId,
        payloadVersion: "1.0",
        occurredAt: new Date().toISOString(),
      },
      correlationId: event.correlationId,
      idempotencyKey: event.idempotencyKey,
    });

    const hook = commerceExtensions.growth;
    if (event.eventType === "subscription.created" && hook?.onSubscriptionCreated) {
      await hook.onSubscriptionCreated(event.payload.subscription as never);
    }
    if (event.eventType === "subscription.renewed" && hook?.onSubscriptionRenewed) {
      await hook.onSubscriptionRenewed(event.payload.subscription as never);
    }
  }
}
