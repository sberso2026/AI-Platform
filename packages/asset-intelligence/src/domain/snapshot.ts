/**
 * Phase 10B / 10E — Asset Snapshot (composed read view; not a registry).
 */

import type {
  AssetConditionState,
  AssetCriticalityState,
  AssetIdentityReference,
  Provenance,
} from "../architecture/identity-state";
import type { AssetHealthIndexState } from "./health-index";
import type { AssetFailureMechanismState, AssetFailureModeState } from "./failure";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";

export type SnapshotIntelligenceContribution = {
  kind:
    | "condition"
    | "health_index"
    | "criticality"
    | "reliability"
    | "failure_mode"
    | "failure_mechanism"
    | "evidence_confidence";
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  mutatesIdentity: false;
};

export type AssetSnapshot = {
  identity: AssetIdentityReference;
  asOf: string;
  registerVersion?: string;
  /** Intelligence contributions only — never a second asset register. */
  condition?: AssetConditionState;
  healthIndex?: AssetHealthIndexState;
  criticality?: AssetCriticalityState;
  failureModes?: AssetFailureModeState[];
  failureMechanisms?: AssetFailureMechanismState[];
  evidenceConfidenceRef?: string;
  contributions: SnapshotIntelligenceContribution[];
  isAssetRegistry: false;
  mutatesIdentity: false;
};

export function composeAssetSnapshot(input: {
  identity: AssetIdentityReference;
  asOf: string;
  registerVersion?: string;
  condition?: AssetConditionState;
  healthIndex?: AssetHealthIndexState;
  criticality?: AssetCriticalityState;
  failureModes?: AssetFailureModeState[];
  failureMechanisms?: AssetFailureMechanismState[];
  evidenceConfidence?: EvidenceConfidenceAssessment;
}): AssetSnapshot {
  const contributions: SnapshotIntelligenceContribution[] = [];
  if (input.condition) {
    contributions.push({
      kind: "condition",
      stateId: input.condition.stateId,
      recordedAt: input.condition.recordedAt,
      provenance: input.condition.provenance,
      mutatesIdentity: false,
    });
  }
  if (input.healthIndex) {
    contributions.push({
      kind: "health_index",
      stateId: input.healthIndex.stateId,
      recordedAt: input.healthIndex.recordedAt,
      provenance: input.healthIndex.provenance,
      mutatesIdentity: false,
    });
  }
  if (input.criticality) {
    contributions.push({
      kind: "criticality",
      stateId: input.criticality.stateId,
      recordedAt: input.criticality.recordedAt,
      provenance: input.criticality.provenance,
      mutatesIdentity: false,
    });
  }
  for (const mode of input.failureModes ?? []) {
    contributions.push({
      kind: "failure_mode",
      stateId: mode.stateId,
      recordedAt: mode.recordedAt,
      provenance: mode.provenance,
      mutatesIdentity: false,
    });
  }
  for (const mech of input.failureMechanisms ?? []) {
    contributions.push({
      kind: "failure_mechanism",
      stateId: mech.stateId,
      recordedAt: mech.recordedAt,
      provenance: mech.provenance,
      mutatesIdentity: false,
    });
  }
  if (input.evidenceConfidence) {
    contributions.push({
      kind: "evidence_confidence",
      stateId: input.evidenceConfidence.assessmentId,
      recordedAt: input.evidenceConfidence.assessedAt,
      provenance: {
        sourceSystem: "evidence_confidence_engine",
        observedAt: input.evidenceConfidence.assessedAt,
        method: input.evidenceConfidence.method,
      },
      mutatesIdentity: false,
    });
  }
  return {
    identity: input.identity,
    asOf: input.asOf,
    registerVersion: input.registerVersion,
    condition: input.condition,
    healthIndex: input.healthIndex,
    criticality: input.criticality,
    failureModes: input.failureModes,
    failureMechanisms: input.failureMechanisms,
    evidenceConfidenceRef: input.evidenceConfidence?.assessmentId,
    contributions,
    isAssetRegistry: false,
    mutatesIdentity: false,
  };
}
