import type { PlatformCommerce } from "../platform-commerce";
import type { CommerceOutboxProcessor } from "./commerce-outbox-processor";
import type { InstallationHealthService } from "./installation-health-service";
import type { InstallationLifecycleService } from "./installation-lifecycle-service";
import type { EntitlementCache } from "./entitlement-cache";

export interface SchedulerRunResult {
  job: string;
  processed: number;
  errors: string[];
}

export const COMMERCE_SCHEDULER_JOBS = [
  "expireTrials",
  "expireLicences",
  "applyScheduledSubscriptionChanges",
  "applyScheduledCancellations",
  "processGracePeriodExpiry",
  "detectExpiringSubscriptions",
  "detectExpiringLicences",
  "emitTrialWarnings",
  "processCommerceOutbox",
  "installationHealthCheck",
  "installationRetry",
  "suspendInstallationsOnSubscriptionSuspension",
] as const;

export type CommerceSchedulerJob = (typeof COMMERCE_SCHEDULER_JOBS)[number];

const BATCH_SIZE = 100;
const WARNING_WITHIN_DAYS = 7;
const TRIAL_WARNING_DAYS = [7, 3, 1];

/** Callable lifecycle job handlers — wire to cron or platform scheduler. */
export class CommerceSchedulerService {
  constructor(
    private readonly commerce: PlatformCommerce,
    private readonly outboxProcessor: CommerceOutboxProcessor,
    private readonly cache: EntitlementCache,
    private readonly installationLifecycle?: InstallationLifecycleService,
    private readonly installationHealth?: InstallationHealthService
  ) {}

  async runAll(): Promise<SchedulerRunResult[]> {
    return this.runJobs([...COMMERCE_SCHEDULER_JOBS]);
  }

  async runJobs(jobs: string[]): Promise<SchedulerRunResult[]> {
    const results: SchedulerRunResult[] = [];
    for (const job of jobs) {
      const handler = this.jobHandlers[job as CommerceSchedulerJob];
      if (!handler) {
        results.push({ job, processed: 0, errors: [`Unknown job: ${job}`] });
        continue;
      }
      results.push(await handler.call(this));
    }
    return results;
  }

  private readonly jobHandlers: Record<CommerceSchedulerJob, () => Promise<SchedulerRunResult>> = {
    expireTrials: this.expireTrials,
    expireLicences: this.expireLicences,
    applyScheduledSubscriptionChanges: this.applyScheduledSubscriptionChanges,
    applyScheduledCancellations: this.applyScheduledCancellations,
    processGracePeriodExpiry: this.processGracePeriodExpiry,
    detectExpiringSubscriptions: this.detectExpiringSubscriptions,
    detectExpiringLicences: this.detectExpiringLicences,
    emitTrialWarnings: this.emitTrialWarnings,
    processCommerceOutbox: this.processCommerceOutbox,
    installationHealthCheck: this.installationHealthCheck,
    installationRetry: this.installationRetry,
    suspendInstallationsOnSubscriptionSuspension: this.suspendInstallationsOnSubscriptionSuspension,
  };

  async expireTrials(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    try {
      processed = await this.commerce.trials.expireTrials();
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    return { job: "expireTrials", processed, errors };
  }

  async expireLicences(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    const now = new Date().toISOString();

    try {
      while (true) {
        const due = await this.commerce.licenses.listDueForExpiry(now, BATCH_SIZE);
        if (due.length === 0) break;

        for (const licence of due) {
          try {
            const expired = await this.commerce.licenses.transitionToExpired(
              licence.tenant_id,
              licence.id
            );
            if (!expired) continue;

            await this.commerce.events.emit({
              eventType: "licence.expired",
              tenantId: licence.tenant_id,
              workspaceId: licence.workspace_id ?? undefined,
              aggregateType: "licence",
              aggregateId: licence.id,
              payload: {
                licenceId: licence.id,
                subscriptionId: licence.subscription_id,
                validUntil:
                  (licence as { valid_until?: string | null }).valid_until ?? licence.expires_at,
              },
            });
            this.cache.invalidateTenant(licence.tenant_id);
            processed++;
          } catch (e) {
            errors.push(
              `licence ${licence.id}: ${e instanceof Error ? e.message : String(e)}`
            );
          }
        }

        if (due.length < BATCH_SIZE) break;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "expireLicences", processed, errors };
  }

  async applyScheduledSubscriptionChanges(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    try {
      const due = await this.commerce.subscriptionChanges.listScheduledDue(new Date().toISOString());
      for (const change of due) {
        try {
          await this.commerce.subscriptionChanges.applyScheduledChange(change.tenant_id, change.id);
          processed++;
        } catch (e) {
          errors.push(
            `change ${change.id}: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    return { job: "applyScheduledSubscriptionChanges", processed, errors };
  }

  async applyScheduledCancellations(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    const now = new Date().toISOString();

    try {
      while (true) {
        const due = await this.commerce.subscriptions.listScheduledCancellationsDue(
          now,
          BATCH_SIZE
        );
        if (due.length === 0) break;

        for (const sub of due) {
          try {
            await this.commerce.lifecycle.cancel(
              sub.tenant_id,
              sub.id,
              undefined,
              "scheduled_cancellation_effective"
            );
            processed++;
          } catch (e) {
            errors.push(`subscription ${sub.id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }

        if (due.length < BATCH_SIZE) break;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "applyScheduledCancellations", processed, errors };
  }

  async processGracePeriodExpiry(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    const now = new Date().toISOString();

    try {
      while (true) {
        const due = await this.commerce.subscriptions.listGracePeriodExpired(
          now,
          BATCH_SIZE
        );
        if (due.length === 0) break;

        for (const sub of due) {
          try {
            await this.commerce.lifecycle.suspend(
              sub.tenant_id,
              sub.id,
              undefined,
              "grace_period_expired"
            );
            processed++;
          } catch (e) {
            errors.push(`subscription ${sub.id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }

        if (due.length < BATCH_SIZE) break;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "processGracePeriodExpiry", processed, errors };
  }

  async detectExpiringSubscriptions(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const expiring = await this.commerce.subscriptions.listExpiringSubscriptions(
        WARNING_WITHIN_DAYS,
        BATCH_SIZE
      );

      for (const sub of expiring) {
        if (sub.status === "trialing" || sub.status === "trial") continue;

        const endDate = sub.current_period_end ?? sub.renewal_date;
        if (!endDate) continue;

        const daysRemaining = daysUntil(endDate);
        try {
          await this.commerce.events.emit({
            eventType: "subscription.expiring_soon",
            tenantId: sub.tenant_id,
            workspaceId: sub.workspace_id ?? undefined,
            aggregateType: "subscription",
            aggregateId: sub.id,
            idempotencyKey: `subscription-expiring:${sub.id}:${daysRemaining}`,
            payload: {
              subscriptionId: sub.id,
              daysRemaining,
              expiresAt: endDate,
            },
          });
          processed++;
        } catch (e) {
          errors.push(`subscription ${sub.id}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "detectExpiringSubscriptions", processed, errors };
  }

  async detectExpiringLicences(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const expiring = await this.commerce.licenses.listExpiringWithin(
        WARNING_WITHIN_DAYS,
        BATCH_SIZE
      );

      for (const licence of expiring) {
        const validUntil =
          (licence as { valid_until?: string | null }).valid_until ?? licence.expires_at;
        if (!validUntil) continue;

        const daysRemaining = daysUntil(validUntil);
        try {
          await this.commerce.events.emit({
            eventType: "licence.expiring_soon",
            tenantId: licence.tenant_id,
            workspaceId: licence.workspace_id ?? undefined,
            aggregateType: "licence",
            aggregateId: licence.id,
            idempotencyKey: `licence-expiring:${licence.id}:${daysRemaining}`,
            payload: {
              licenceId: licence.id,
              daysRemaining,
              validUntil,
            },
          });
          processed++;
        } catch (e) {
          errors.push(`licence ${licence.id}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "detectExpiringLicences", processed, errors };
  }

  async emitTrialWarnings(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const expiring = await this.commerce.subscriptions.listExpiringSubscriptions(
        Math.max(...TRIAL_WARNING_DAYS),
        BATCH_SIZE
      );

      for (const sub of expiring) {
        if (sub.status !== "trialing" && sub.status !== "trial") continue;

        const trialEnd = sub.trial_end ?? sub.trial_ends_at;
        if (!trialEnd) continue;

        const daysRemaining = daysUntil(trialEnd);
        if (!TRIAL_WARNING_DAYS.includes(daysRemaining)) continue;

        try {
          await this.commerce.events.emit({
            eventType: "trial.warning",
            tenantId: sub.tenant_id,
            workspaceId: sub.workspace_id ?? undefined,
            aggregateType: "subscription",
            aggregateId: sub.id,
            idempotencyKey: `trial-warning:${sub.id}:${daysRemaining}`,
            payload: {
              subscriptionId: sub.id,
              daysRemaining,
              trialEnd,
            },
          });
          processed++;
        } catch (e) {
          errors.push(`subscription ${sub.id}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "emitTrialWarnings", processed, errors };
  }

  async processCommerceOutbox(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const result = await this.outboxProcessor.processBatch(BATCH_SIZE);
      processed = result.processed;
      errors.push(...result.errors);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return { job: "processCommerceOutbox", processed, errors };
  }

  async installationHealthCheck(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    if (!this.installationHealth || !this.installationLifecycle) {
      return { job: "installationHealthCheck", processed: 0, errors: [] };
    }
    try {
      processed = await this.installationLifecycle.runScheduledHealthChecks(
        (id, installationId) => this.installationHealth!.check(id, installationId)
      );
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    return { job: "installationHealthCheck", processed, errors };
  }

  async installationRetry(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    if (!this.installationLifecycle) {
      return { job: "installationRetry", processed: 0, errors: [] };
    }
    try {
      processed = await this.installationLifecycle.retryFailedInstallations();
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    return { job: "installationRetry", processed, errors };
  }

  async suspendInstallationsOnSubscriptionSuspension(): Promise<SchedulerRunResult> {
    const errors: string[] = [];
    let processed = 0;
    if (!this.installationLifecycle) {
      return { job: "suspendInstallationsOnSubscriptionSuspension", processed: 0, errors: [] };
    }
    try {
      processed = await this.installationLifecycle.suspendForInactiveSubscriptions();
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    return { job: "suspendInstallationsOnSubscriptionSuspension", processed, errors };
  }
}

function daysUntil(isoDate: string): number {
  const end = new Date(isoDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
