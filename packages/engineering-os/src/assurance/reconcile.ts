import { ageDays } from "./maturity";
import { OPEN_ASSURANCE_STATUSES, type AssuranceDetection, type EngineeringAssuranceCondition } from "./types";

export type AssuranceReconcileResult = {
  conditions: EngineeringAssuranceCondition[];
  created: number;
  updated: number;
  resolved: number;
  reopened: number;
  unchanged: number;
};

function withEvaluationMeta(
  condition: EngineeringAssuranceCondition,
  detection: AssuranceDetection,
  now: string,
): EngineeringAssuranceCondition {
  return {
    ...condition,
    ...detection,
    id: condition.id,
    status: condition.status,
    detectedAt: condition.detectedAt,
    lastEvaluatedAt: now,
    resolvedAt: condition.resolvedAt,
    resolutionSource: condition.resolutionSource,
    ownerId: condition.ownerId,
    disposition: condition.disposition,
    dispositionBy: condition.dispositionBy,
    dispositionAt: condition.dispositionAt,
    dispositionRationale: condition.dispositionRationale,
    reviewPackageId: condition.reviewPackageId,
    issueId: condition.issueId,
    automaticDefect: false,
    automaticCompliance: false,
    automaticConfirmedImpact: false,
    priorityFactors: {
      ...detection.priorityFactors,
      ageDays: ageDays(condition.detectedAt, now),
    },
  };
}

function fromDetection(detection: AssuranceDetection, now: string, id: string): EngineeringAssuranceCondition {
  return {
    ...detection,
    id,
    status: "OPEN",
    detectedAt: now,
    lastEvaluatedAt: now,
    resolvedAt: null,
    resolutionSource: null,
    ownerId: null,
    disposition: null,
    dispositionBy: null,
    dispositionAt: null,
    dispositionRationale: null,
    reviewPackageId: null,
    issueId: null,
    automaticDefect: false,
    automaticCompliance: false,
    automaticConfirmedImpact: false,
    priorityFactors: { ...detection.priorityFactors, ageDays: 0 },
  };
}

export function reconcileAssuranceConditions(input: {
  existing: EngineeringAssuranceCondition[];
  detections: AssuranceDetection[];
  now: string;
  newId?: () => string;
}): AssuranceReconcileResult {
  const newId = input.newId ?? (() => crypto.randomUUID());
  const existingByFingerprint = new Map(input.existing.map((row) => [row.fingerprint, row]));
  const detected = new Set(input.detections.map((row) => row.fingerprint));
  const next: EngineeringAssuranceCondition[] = [];
  let created = 0;
  let updated = 0;
  let resolved = 0;
  let reopened = 0;
  let unchanged = 0;

  for (const detection of input.detections) {
    const current = existingByFingerprint.get(detection.fingerprint);
    if (!current) {
      next.push(fromDetection(detection, input.now, newId()));
      created += 1;
      continue;
    }
    if (current.status === "RESOLVED" || current.status === "SUPERSEDED") {
      next.push({
        ...withEvaluationMeta(current, detection, input.now),
        status: "OPEN",
        resolvedAt: null,
        resolutionSource: null,
      });
      reopened += 1;
      continue;
    }
    if (current.status === "ACCEPTED_WITH_JUSTIFICATION" || current.status === "NOT_APPLICABLE") {
      next.push(withEvaluationMeta(current, detection, input.now));
      unchanged += 1;
      continue;
    }
    next.push(withEvaluationMeta(current, detection, input.now));
    updated += 1;
  }

  for (const current of input.existing) {
    if (detected.has(current.fingerprint)) continue;
    if (OPEN_ASSURANCE_STATUSES.includes(current.status)) {
      next.push({
        ...current,
        status: "RESOLVED",
        lastEvaluatedAt: input.now,
        resolvedAt: input.now,
        resolutionSource: "CANONICAL_STATE_CHANGED",
      });
      resolved += 1;
      continue;
    }
    next.push({ ...current, lastEvaluatedAt: input.now });
    unchanged += 1;
  }

  return { conditions: next, created, updated, resolved, reopened, unchanged };
}
