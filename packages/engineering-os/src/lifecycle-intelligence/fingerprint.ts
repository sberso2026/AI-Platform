import { createHash } from "node:crypto";
import type { LifecycleEvidence } from "./types";

export function fingerprintLifecycleEvidence(evidence: LifecycleEvidence): string {
  const payload = JSON.stringify({
    baselines: evidence.baselines.map((row) => `${row.id}:${row.baselineType}:${row.status}`).sort(),
    requirements: evidence.requirements.map((row) => `${row.id}:${row.allocated}:${row.status}`).sort(),
    assumptions: evidence.assumptions.map((row) => `${row.id}:${row.validationStatus}:${row.expired}:${row.reviewed}`).sort(),
    interfaces: evidence.interfaces.map((row) => `${row.id}:${row.informationKey}:${row.status}`).sort(),
    analyses: evidence.analyses.map((row) => `${row.id}:${row.valid}:${row.reviewed}:${row.stale}`).sort(),
    reviews: evidence.reviews.map((row) => `${row.id}:${row.status}`).sort(),
    decisions: evidence.decisions.map((row) => `${row.id}:${row.status}`).sort(),
    changes: evidence.changes.map((row) => `${row.id}:${row.status}`).sort(),
    assurance: `${evidence.assurance.completeness}:${evidence.assurance.conditions
      .map((row) => `${row.id}:${row.status}:${row.materiality}`)
      .sort()
      .join(",")}`,
    deliverables: evidence.deliverables?.required
      .map((row) => `${row.definitionCode}:${row.bound}:${row.readiness}:${row.stale}`)
      .sort(),
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function composeLifecycleThread(input: {
  projectId: string;
  profileId: string;
  profileVersion: string;
  gateId: string;
  evaluationId: string;
  evidenceSnapshotFingerprint?: string | null;
  decisionId?: string | null;
  transitionId?: string | null;
  toStage?: string | null;
}): string {
  return [
    `project:${input.projectId}`,
    `lifecycle_profile:${input.profileId}:${input.profileVersion}`,
    `lifecycle_gate:${input.gateId}`,
    `lifecycle_evaluation:${input.evaluationId}`,
    input.evidenceSnapshotFingerprint ? `lifecycle_evidence_snapshot:${input.evidenceSnapshotFingerprint.slice(0, 12)}` : null,
    input.decisionId ? `lifecycle_decision:${input.decisionId}` : null,
    input.transitionId ? `lifecycle_transition:${input.transitionId}` : null,
    input.toStage ? `lifecycle_stage:${input.toStage}` : null,
  ]
    .filter(Boolean)
    .join(" → ");
}
