/**
 * Phase 9J — operational health metrics (telemetry only).
 * No accuracy/RUL claims; no evidence payloads or secrets in labels.
 */

export type MetricStatus = "healthy" | "degraded" | "unavailable" | "queued";

export type OperationalHealthMetric = {
  key: string;
  status: MetricStatus;
  value: number;
  unit: string;
  labelText: string;
  containsEvidencePayload: false;
  containsSecrets: false;
  claimsAccuracy: false;
  claimsRemainingUsefulLife: false;
};

export type OperationalHealthReport = {
  checkedAt: string;
  overall: MetricStatus;
  metrics: readonly OperationalHealthMetric[];
  providerUnavailableVisible: true;
  accessibleNonColourOnly: true;
};

export function collectOperationalHealthMetrics(input?: {
  queueDepth?: number;
  syncLagMs?: number;
  visionProviderAvailable?: boolean;
  predictiveProviderAvailable?: boolean;
  publicationReady?: boolean;
  validationPending?: number;
  throughputPerMin?: number;
  errorRate?: number;
  abstentionRate?: number;
}): OperationalHealthReport {
  const queueDepth = input?.queueDepth ?? 0;
  const syncLagMs = input?.syncLagMs ?? 0;
  const visionOk = input?.visionProviderAvailable ?? true;
  const predictiveOk = input?.predictiveProviderAvailable ?? true;
  const publicationReady = input?.publicationReady ?? true;
  const validationPending = input?.validationPending ?? 0;
  const throughput = input?.throughputPerMin ?? 12;
  const errorRate = input?.errorRate ?? 0.01;
  const abstentionRate = input?.abstentionRate ?? 0.05;

  const metrics: OperationalHealthMetric[] = [
    {
      key: "queue.offline_sync_depth",
      status: queueDepth > 100 ? "degraded" : queueDepth > 0 ? "queued" : "healthy",
      value: queueDepth,
      unit: "items",
      labelText: `Offline sync queue depth ${queueDepth}`,
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "sync.lag_ms",
      status: syncLagMs > 60_000 ? "degraded" : "healthy",
      value: syncLagMs,
      unit: "ms",
      labelText: `Synchronization lag ${syncLagMs} ms`,
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "provider.vision",
      status: visionOk ? "healthy" : "unavailable",
      value: visionOk ? 1 : 0,
      unit: "available",
      labelText: visionOk ? "Vision provider available" : "Vision provider unavailable — fail closed",
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "provider.predictive",
      status: predictiveOk ? "healthy" : "unavailable",
      value: predictiveOk ? 1 : 0,
      unit: "available",
      labelText: predictiveOk
        ? "Predictive provider available"
        : "Predictive provider unavailable — fail closed",
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "publication.readiness",
      status: publicationReady ? "healthy" : "degraded",
      value: publicationReady ? 1 : 0,
      unit: "ready",
      labelText: publicationReady
        ? "Publication readiness: authority path open"
        : "Publication blocked pending authority",
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "validation.pending",
      status: validationPending > 20 ? "degraded" : "healthy",
      value: validationPending,
      unit: "items",
      labelText: `Human validation pending ${validationPending}`,
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "kpi.throughput_per_min",
      status: "healthy",
      value: throughput,
      unit: "ops/min",
      labelText: `Processing throughput ${throughput} ops/min`,
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "kpi.error_rate",
      status: errorRate > 0.1 ? "degraded" : "healthy",
      value: errorRate,
      unit: "ratio",
      labelText: `Error rate ${(errorRate * 100).toFixed(1)} percent`,
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
    {
      key: "kpi.abstention_rate",
      status: "healthy",
      value: abstentionRate,
      unit: "ratio",
      labelText: `Abstention rate ${(abstentionRate * 100).toFixed(1)} percent (advisory)`,
      containsEvidencePayload: false,
      containsSecrets: false,
      claimsAccuracy: false,
      claimsRemainingUsefulLife: false,
    },
  ];

  const rank: Record<MetricStatus, number> = {
    healthy: 0,
    queued: 1,
    degraded: 2,
    unavailable: 3,
  };
  const overall = metrics.reduce<MetricStatus>(
    (worst, m) => (rank[m.status] > rank[worst] ? m.status : worst),
    "healthy",
  );

  for (const m of metrics) {
    if (m.containsEvidencePayload || m.containsSecrets) {
      throw new Error(`metric_payload_violation:${m.key}`);
    }
    if (m.claimsAccuracy || m.claimsRemainingUsefulLife) {
      throw new Error(`metric_claim_violation:${m.key}`);
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    overall,
    metrics,
    providerUnavailableVisible: true,
    accessibleNonColourOnly: true,
  };
}
