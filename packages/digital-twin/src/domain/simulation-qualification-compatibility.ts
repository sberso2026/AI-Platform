/**
 * Phase 12H — Method×Provider×Application compatibility matrix + conflict detection.
 *
 * Queryable only — no false inference when entries are missing.
 */

import type { SimulationMethodQualification } from "./simulation-method-qualification";
import type { SimulationProviderQualification } from "./simulation-provider-qualification";
import type { SimulationApplicationQualification } from "./simulation-application-qualification";

export type CompatibilityMatrixEntry = {
  entryId: string;
  methodId: string;
  providerId: string;
  applicationKey: string;
  compatible: boolean;
  notes?: string;
  /** Explicit declaration required — never inferred from partial matches. */
  inferred: false;
};

export function createCompatibilityMatrixEntry(input: {
  entryId: string;
  methodId: string;
  providerId: string;
  applicationKey: string;
  compatible: boolean;
  notes?: string;
}): CompatibilityMatrixEntry {
  return {
    entryId: input.entryId,
    methodId: input.methodId,
    providerId: input.providerId,
    applicationKey: input.applicationKey,
    compatible: input.compatible,
    notes: input.notes,
    inferred: false,
  };
}

export function queryCompatibilityMatrix(
  entries: CompatibilityMatrixEntry[],
  query: { methodId: string; providerId: string; applicationKey: string },
): CompatibilityMatrixEntry[] {
  return entries.filter(
    (e) =>
      e.methodId === query.methodId &&
      e.providerId === query.providerId &&
      e.applicationKey === query.applicationKey &&
      e.inferred === false,
  );
}

/**
 * Fail-closed conflict detection across qualification layers.
 */
export function detectQualificationConflicts(input: {
  methodQualifications: SimulationMethodQualification[];
  providerQualifications: SimulationProviderQualification[];
  applicationQualifications: SimulationApplicationQualification[];
}): string[] {
  const conflicts: string[] = [];

  for (const pq of input.providerQualifications) {
    if (pq.autoInheritsAllMethods) {
      conflicts.push(`provider_auto_inherit_forbidden:${pq.providerQualificationId}`);
    }
    if (pq.externalSolverAdapterActivated) {
      conflicts.push(`external_solver_activated:${pq.providerQualificationId}`);
    }
    if (pq.claimsNativeSolver) {
      conflicts.push(`native_solver_claim:${pq.providerQualificationId}`);
    }
  }

  for (const mq of input.methodQualifications) {
    if (mq.claimsNativeSolver || mq.claimsUniversalAccuracy) {
      conflicts.push(`method_forbidden_claim:${mq.methodQualificationId}`);
    }
  }

  for (const aq of input.applicationQualifications) {
    if (aq.claimsUniversalAccuracy || aq.engineeringApproved) {
      conflicts.push(`application_forbidden_claim:${aq.applicationQualificationId}`);
    }
  }

  // Active method quals with overlapping validity for same method+version
  const byMethod = new Map<string, SimulationMethodQualification[]>();
  for (const mq of input.methodQualifications.filter((q) => q.status === "active")) {
    const key = `${mq.methodId}:${mq.version}`;
    const list = byMethod.get(key) ?? [];
    list.push(mq);
    byMethod.set(key, list);
  }
  for (const [key, list] of byMethod) {
    if (list.length > 1) {
      conflicts.push(`duplicate_active_method_qualification:${key}`);
    }
  }

  // Provider quals claiming same provider+method concurrently active
  const byProviderMethod = new Map<string, SimulationProviderQualification[]>();
  for (const pq of input.providerQualifications.filter((q) => q.status === "active")) {
    const key = `${pq.providerId}:${pq.methodId}`;
    const list = byProviderMethod.get(key) ?? [];
    list.push(pq);
    byProviderMethod.set(key, list);
  }
  for (const [key, list] of byProviderMethod) {
    if (list.length > 1) {
      conflicts.push(`duplicate_active_provider_qualification:${key}`);
    }
  }

  return conflicts;
}
