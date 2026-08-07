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
    timelineStore: "ok",
    snapshotStore: "ok",
    outbox: "ok",
    checkedAt,
  };
}
