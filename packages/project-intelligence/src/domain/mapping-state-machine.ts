import { MappingStatus, type MappingEvidence } from "../types/mapping.js";

const TRANSITIONS: Readonly<Record<MappingStatus, readonly MappingStatus[]>> = {
  [MappingStatus.Discovered]: [MappingStatus.Candidate, MappingStatus.Retired],
  [MappingStatus.Candidate]: [MappingStatus.Matched, MappingStatus.Conflict, MappingStatus.PendingReview, MappingStatus.Retired],
  [MappingStatus.Matched]: [MappingStatus.PendingReview, MappingStatus.Approved, MappingStatus.Conflict, MappingStatus.Retired],
  [MappingStatus.Conflict]: [MappingStatus.PendingReview, MappingStatus.Retired],
  [MappingStatus.PendingReview]: [MappingStatus.Approved, MappingStatus.Conflict, MappingStatus.Retired],
  [MappingStatus.Approved]: [MappingStatus.Migrated, MappingStatus.Failed, MappingStatus.Retired],
  [MappingStatus.Migrated]: [MappingStatus.Verified, MappingStatus.Failed, MappingStatus.RolledBack],
  [MappingStatus.Verified]: [MappingStatus.RolledBack, MappingStatus.Retired],
  [MappingStatus.Failed]: [MappingStatus.PendingReview, MappingStatus.RolledBack, MappingStatus.Retired],
  [MappingStatus.RolledBack]: [MappingStatus.PendingReview, MappingStatus.Retired],
  [MappingStatus.Retired]: [],
};

export function allowedTransitions(status: MappingStatus): readonly MappingStatus[] {
  return TRANSITIONS[status];
}

export function canTransition(from: MappingStatus, to: MappingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function canAutoApprove(confidence: number): boolean {
  return Number.isFinite(confidence) && confidence >= 0.98 && confidence <= 1;
}

export function detectConflict(evidence: readonly MappingEvidence[]): boolean {
  const valuesByField = new Map<string, Set<string>>();
  for (const item of evidence) {
    const values = valuesByField.get(item.field) ?? new Set<string>();
    values.add(item.value.trim().toLocaleLowerCase());
    valuesByField.set(item.field, values);
  }
  return [...valuesByField.values()].some((values) => values.size > 1);
}
