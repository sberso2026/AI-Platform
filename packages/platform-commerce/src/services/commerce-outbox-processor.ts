import type { CommercialOutboxEvent, OutboxRepository } from "../repositories/outbox-repository";
import { commerceExtensions } from "./product-service";

export type OutboxEventHandler = (event: CommercialOutboxEvent) => Promise<void>;

const MAX_RETRIES = 5;
const DEFAULT_BATCH_SIZE = 50;

export interface OutboxProcessResult {
  processed: number;
  failed: number;
  deadLettered: number;
  errors: string[];
}

export class CommerceOutboxProcessor {
  private readonly handlers = new Map<string, OutboxEventHandler>();

  constructor(private readonly outbox: OutboxRepository) {
    this.registerDefaultHandlers();
  }

  registerHandler(eventType: string, handler: OutboxEventHandler): void {
    this.handlers.set(eventType, handler);
  }

  async processBatch(limit = DEFAULT_BATCH_SIZE): Promise<OutboxProcessResult> {
    const events = await this.outbox.claimPending(limit);
    let processed = 0;
    let failed = 0;
    let deadLettered = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        const handler = this.handlers.get(event.event_type);
        if (handler) {
          await handler(event);
        }
        await this.outbox.markProcessed(event.id);
        processed++;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const retryCount = (event.retry_count ?? 0) + 1;
        if (retryCount >= MAX_RETRIES) {
          await this.outbox.moveToDeadLetter(event.id, message);
          deadLettered++;
        } else {
          await this.outbox.markFailed(event.id, message, retryCount);
          failed++;
        }
        errors.push(`${event.id}: ${message}`);
      }
    }

    return { processed, failed, deadLettered, errors };
  }

  private registerDefaultHandlers(): void {
    const growth = commerceExtensions.growth;
    if (!growth) return;

    if (growth.onSubscriptionCreated) {
      this.registerHandler("subscription.created", async (event) => {
        await growth.onSubscriptionCreated?.(event.payload.subscription as never);
      });
    }
    if (growth.onSubscriptionRenewed) {
      this.registerHandler("subscription.renewed", async (event) => {
        await growth.onSubscriptionRenewed?.(event.payload.subscription as never);
      });
    }
  }
}
