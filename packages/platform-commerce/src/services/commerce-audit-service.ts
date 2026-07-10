import type { CommercialSubscriptionEvent } from "@rtb/types";
import type { CommercialOutboxEvent, OutboxRepository } from "../repositories/outbox-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";

export interface CommerceAuditEntry {
  id: string;
  source: "subscription" | "licence";
  eventType: string;
  aggregateId: string;
  actorUserId?: string | null;
  detail?: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export class CommerceAuditService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly outbox: OutboxRepository
  ) {}

  async listTenantAudit(
    tenantId: string,
    options?: { source?: "subscription" | "licence" | "all"; limit?: number }
  ): Promise<CommerceAuditEntry[]> {
    const limit = options?.limit ?? 100;
    const source = options?.source ?? "all";
    const entries: CommerceAuditEntry[] = [];

    if (source === "all" || source === "subscription") {
      const subEvents = await this.subscriptions.listEventsByTenant(tenantId, limit);
      entries.push(...subEvents.map(mapSubscriptionEvent));
    }

    if (source === "all" || source === "licence") {
      const licenceEvents = await this.outbox.listByTenant(tenantId, {
        aggregateType: "licence",
        limit,
      });
      entries.push(...licenceEvents.map(mapOutboxEvent));
    }

    return entries
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, limit);
  }
}

function mapSubscriptionEvent(event: CommercialSubscriptionEvent): CommerceAuditEntry {
  const extended = event as CommercialSubscriptionEvent & {
    previous_status?: string | null;
    new_status?: string | null;
    actor_user_id?: string | null;
    effective_at?: string;
    reason?: string | null;
    event_payload?: Record<string, unknown>;
  };
  const fromStatus = extended.from_status ?? extended.previous_status;
  const toStatus = extended.to_status ?? extended.new_status;
  return {
    id: event.id,
    source: "subscription",
    eventType: event.event_type,
    aggregateId: event.subscription_id,
    actorUserId: extended.actor_user_id,
    detail: fromStatus && toStatus ? `${fromStatus} → ${toStatus}` : extended.reason ?? undefined,
    occurredAt: extended.effective_at ?? event.created_at,
    payload: (event.payload ?? extended.event_payload ?? {}) as Record<string, unknown>,
  };
}

function mapOutboxEvent(event: CommercialOutboxEvent): CommerceAuditEntry {
  const payload = event.payload ?? {};
  return {
    id: event.id,
    source: "licence",
    eventType: event.event_type,
    aggregateId: event.aggregate_id,
    actorUserId: (payload.actorUserId as string | undefined) ?? null,
    detail: (payload.reason as string | undefined) ?? undefined,
    occurredAt: (payload.occurredAt as string | undefined) ?? event.created_at,
    payload,
  };
}
