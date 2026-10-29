/**
 * Phase 12K — Digital Thread integrity assessment.
 * Detect only — never auto-repair.
 */

import type { DigitalThreadSnapshot } from "./digital-thread-snapshot";

export const INTEGRITY_STATUSES = [
  "complete",
  "partial",
  "broken_reference",
  "conflicting",
  "stale",
  "unknown",
] as const;

export type DigitalThreadIntegrityStatus = (typeof INTEGRITY_STATUSES)[number];

export type DigitalThreadIntegrityFinding = {
  code: string;
  message: string;
  subjectRef?: string;
};

export type DigitalThreadIntegrityAssessment = {
  integrityId: string;
  twinId: string;
  threadSnapshotId: string;
  status: DigitalThreadIntegrityStatus;
  findings: readonly DigitalThreadIntegrityFinding[];
  autoRepairAttempted: false;
  assessedAt: string;
};

export function assessDigitalThreadIntegrity(input: {
  integrityId: string;
  twinId: string;
  snapshot: DigitalThreadSnapshot;
  knownReferenceIds?: ReadonlySet<string>;
  staleAfterMs?: number;
  nowMs?: number;
}): DigitalThreadIntegrityAssessment {
  const findings: DigitalThreadIntegrityFinding[] = [];
  const refIds = new Set(input.snapshot.references.map((r) => r.threadReferenceId));
  const known = input.knownReferenceIds;

  for (const rel of input.snapshot.relationships) {
    if (!refIds.has(rel.fromReferenceId) || !refIds.has(rel.toReferenceId)) {
      findings.push({
        code: "broken_reference",
        message: "Relationship cites missing thread reference",
        subjectRef: rel.threadRelationshipId,
      });
    }
  }

  if (known) {
    for (const ref of input.snapshot.references) {
      if (!known.has(ref.targetRef)) {
        findings.push({
          code: "broken_reference",
          message: "Target reference unresolved in known set",
          subjectRef: ref.targetRef,
        });
      }
    }
  }

  for (const p of input.snapshot.provenance) {
    if (p.provenanceStatus === "unknown") {
      findings.push({
        code: "unknown_provenance",
        message: "Missing provenance marked unknown (fail-closed)",
        subjectRef: p.provenanceId,
      });
    }
    if (p.provenanceStatus === "conflicting") {
      findings.push({
        code: "conflicting_provenance",
        message: "Conflicting provenance detected",
        subjectRef: p.provenanceId,
      });
    }
    if (p.relationshipType === "contradicted_by") {
      findings.push({
        code: "conflicting_relationship",
        message: "contradicted_by relationship present",
        subjectRef: p.provenanceId,
      });
    }
  }

  const contradicted = input.snapshot.relationships.some(
    (r) => r.relationshipType === "contradicted_by",
  );
  if (contradicted) {
    findings.push({
      code: "conflicting_relationship",
      message: "Thread contains contradicted_by relationship",
    });
  }

  const staleAfter = input.staleAfterMs ?? 0;
  if (staleAfter > 0) {
    const asOfMs = Date.parse(input.snapshot.asOf);
    const now = input.nowMs ?? Date.now();
    if (!Number.isNaN(asOfMs) && now - asOfMs > staleAfter) {
      findings.push({
        code: "stale_snapshot",
        message: "Snapshot as-of older than stale threshold",
        subjectRef: input.snapshot.threadSnapshotId,
      });
    }
  }

  let status: DigitalThreadIntegrityStatus = "complete";
  if (findings.some((f) => f.code.startsWith("conflicting"))) {
    status = "conflicting";
  } else if (findings.some((f) => f.code === "broken_reference")) {
    status = "broken_reference";
  } else if (findings.some((f) => f.code === "stale_snapshot")) {
    status = "stale";
  } else if (findings.some((f) => f.code === "unknown_provenance")) {
    status = input.snapshot.references.length === 0 ? "unknown" : "partial";
  } else if (input.snapshot.references.length === 0) {
    status = "unknown";
  } else if (findings.length > 0) {
    status = "partial";
  }

  return {
    integrityId: input.integrityId,
    twinId: input.twinId,
    threadSnapshotId: input.snapshot.threadSnapshotId,
    status,
    findings,
    autoRepairAttempted: false,
    assessedAt: new Date().toISOString(),
  };
}

/** Integrity detection never mutates or auto-repairs the snapshot. */
export function assertIntegrityDetectOnly(
  assessment: DigitalThreadIntegrityAssessment,
): { ok: true; autoRepairAttempted: false } {
  if (assessment.autoRepairAttempted !== false) {
    throw new Error("digital_thread_integrity_auto_repair_forbidden");
  }
  return { ok: true, autoRepairAttempted: false };
}
