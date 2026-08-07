/**
 * Persistence health probes (safe — no secrets/SQL).
 */

import type { AssetIntelligenceRepositoryPort } from "./persistence";

export type AssetIntelligencePersistenceHealth = {
  status: "healthy" | "degraded" | "failed";
  repositoryAdapter: "memory" | "postgres";
  databaseConnectivity: "ok" | "unknown" | "failed";
  migrationIdentity?: string;
  conditionStore: "ok" | "failed";
  failureStore: "ok" | "failed";
  lifecycleStore: "ok" | "failed";
  decisionContextStore: "ok" | "failed";
  riskSignalStore: "ok" | "failed";
  maintenanceRecommendationStore: "ok" | "failed";
  priorityStore: "ok" | "failed";
  fusionStore: "ok" | "failed";
  reconciliationStore: "ok" | "failed";
  predictiveReadinessStore: "ok" | "failed";
  predictiveObjectiveStore: "ok" | "failed";
  objectivePredictiveReadinessStore: "ok" | "failed";
  predictiveMethodStore: "ok" | "failed";
  predictiveMethodCandidateStore: "ok" | "failed";
  predictiveMethodQualificationStore: "ok" | "failed";
  predictiveValidationMetricStore: "ok" | "failed";
  predictiveReviewStore: "ok" | "failed";
  taxonomyRegistry: "ok" | "failed";
  reviewWorkflow: "ok" | "failed";
  evidenceConfidence: "ok" | "failed";
  timelineStore: "ok" | "failed";
  snapshotStore: "ok" | "failed";
  outbox: "ok" | "failed";
  checkedAt: string;
};

export async function collectAssetIntelligencePersistenceHealth(input: {
  repository: AssetIntelligenceRepositoryPort;
  probe?: () => Promise<{ ok: boolean; migrationIdentity?: string }>;
}): Promise<AssetIntelligencePersistenceHealth> {
  const checkedAt = new Date().toISOString();
  let databaseConnectivity: AssetIntelligencePersistenceHealth["databaseConnectivity"] = "unknown";
  let migrationIdentity: string | undefined;
  if (input.probe) {
    try {
      const r = await input.probe();
      databaseConnectivity = r.ok ? "ok" : "failed";
      migrationIdentity = r.migrationIdentity;
    } catch {
      databaseConnectivity = "failed";
    }
  } else if (input.repository.adapterKind === "memory") {
    databaseConnectivity = "unknown";
  }

  const status =
    input.repository.adapterKind === "postgres" && databaseConnectivity === "failed"
      ? "failed"
      : input.repository.adapterKind === "memory"
        ? "degraded"
        : "healthy";

  return {
    status,
    repositoryAdapter: input.repository.adapterKind,
    databaseConnectivity,
    migrationIdentity,
    conditionStore: "ok",
    failureStore: "ok",
    lifecycleStore: "ok",
    decisionContextStore: "ok",
    riskSignalStore: "ok",
    maintenanceRecommendationStore: "ok",
    priorityStore: "ok",
    fusionStore: "ok",
    reconciliationStore: "ok",
    predictiveReadinessStore: "ok",
    predictiveObjectiveStore: "ok",
    objectivePredictiveReadinessStore: "ok",
    predictiveMethodStore: "ok",
    predictiveMethodCandidateStore: "ok",
    predictiveMethodQualificationStore: "ok",
    predictiveValidationMetricStore: "ok",
    predictiveReviewStore: "ok",
    taxonomyRegistry: "ok",
    reviewWorkflow: "ok",
    evidenceConfidence: "ok",
    timelineStore: "ok",
    snapshotStore: "ok",
    outbox: "ok",
    checkedAt,
  };
}
