import type {
  IsolationExecutionMode,
  IsolationReleaseGateContract,
  IsolationTargetPlane,
} from "../../isolation-contracts";
import type { IsolationAssuranceSnapshot } from "../../isolation-contracts";

export const DEFAULT_ISOLATION_RELEASE_GATE: IsolationReleaseGateContract = {
  contractId: "sa-isolation-release-gate-v1",
  requiredPlanes: [
    "DATABASE",
    "API",
    "FILES",
    "SEARCH",
    "KNOWLEDGE_GRAPH",
    "AI_CONTEXT",
    "BACKGROUND_JOB",
    "EVENT",
    "EXECUTION_HOST",
    "SOLVER_WORKSPACE",
  ],
  maxEvidenceAgeHours: 168,
  requiredControlStatus: "active",
  blockingFindingKinds: [
    "cross_tenant_access",
    "cross_workspace_access",
    "metadata_disclosure",
    "search_leakage",
    "kg_leakage",
    "ai_context_leakage",
  ],
  allowCertifiedEvidenceReuse: true,
  subjectToFreshness: true,
};

export const ISOLATION_EXECUTION_MODES: IsolationExecutionMode[] = [
  "on_demand",
  "ci",
  "scheduled",
  "release_gate",
];

export function evaluateReleaseGate(
  snapshot: IsolationAssuranceSnapshot,
  contract: IsolationReleaseGateContract = DEFAULT_ISOLATION_RELEASE_GATE,
  now = Date.now(),
): {
  passed: boolean;
  blockingPlanes: IsolationTargetPlane[];
  stalePlanes: IsolationTargetPlane[];
} {
  const blockingPlanes: IsolationTargetPlane[] = [];
  const stalePlanes: IsolationTargetPlane[] = [];
  for (const plane of contract.requiredPlanes) {
    const status = snapshot.planes.find((p) => p.plane === plane);
    if (!status || status.result === "fail" || status.result === "unknown") {
      blockingPlanes.push(plane);
      continue;
    }
    if (status.result === "error") {
      blockingPlanes.push(plane);
      continue;
    }
    if (status.lastVerifiedAt) {
      const ageMs = now - Date.parse(status.lastVerifiedAt);
      if (ageMs > contract.maxEvidenceAgeHours * 3600_000) {
        stalePlanes.push(plane);
      }
    }
  }
  return {
    passed: blockingPlanes.length === 0 && stalePlanes.length === 0,
    blockingPlanes,
    stalePlanes,
  };
}
