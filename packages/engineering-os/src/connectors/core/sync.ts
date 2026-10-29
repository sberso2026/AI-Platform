import { isOlderThanKnown } from "./identity";

export type PoisonObjectFailure = {
  objectId: string;
  objectType?: string;
  reason: string;
  retries: number;
};

export type BatchSyncOutcome = {
  processed: number;
  changed: number;
  poison: PoisonObjectFailure[];
  checkpointAllowed: boolean;
  status: "READY" | "DEGRADED";
};

const MAX_POISON_RETRIES = 3;

export function shouldIgnoreOutOfOrder(incomingOccurredAt: string, knownOccurredAt: string | null | undefined): boolean {
  if (!knownOccurredAt) return false;
  return isOlderThanKnown(incomingOccurredAt, knownOccurredAt);
}

export function recordPoisonObject(failures: PoisonObjectFailure[], objectId: string, reason: string, objectType?: string): PoisonObjectFailure[] {
  const existing = failures.find((row) => row.objectId === objectId);
  if (existing) {
    existing.retries += 1;
    existing.reason = reason;
    return failures;
  }
  failures.push({ objectId, objectType, reason, retries: 1 });
  return failures;
}

export function poisonIsBounded(failure: PoisonObjectFailure): boolean {
  return failure.retries >= MAX_POISON_RETRIES;
}

export function finalizeBatch(input: { processed: number; changed: number; poison: PoisonObjectFailure[] }): BatchSyncOutcome {
  const blocking = input.poison.filter((row) => row.retries < MAX_POISON_RETRIES);
  return {
    processed: input.processed,
    changed: input.changed,
    poison: input.poison,
    checkpointAllowed: blocking.length === 0,
    status: input.poison.length ? "DEGRADED" : "READY",
  };
}

export function cursorAfterSuccessfulBoundary(previousCursor: string | null, processedOk: number): string {
  return `cursor:${processedOk}:${previousCursor ?? "0"}`;
}
