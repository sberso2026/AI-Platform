export type ProjectIntelligenceHealthStatus = "healthy" | "warning" | "degraded" | "failed" | "suspended";
export interface ProjectIntelligenceHealthCheck {
  key: string;
  status: ProjectIntelligenceHealthStatus;
  message?: string;
}
export interface ProjectIntelligenceHealthReport {
  status: ProjectIntelligenceHealthStatus;
  checkedAt: string;
  checks: readonly ProjectIntelligenceHealthCheck[];
}

const RANK: Record<ProjectIntelligenceHealthStatus, number> = { healthy: 0, warning: 1, degraded: 2, failed: 3, suspended: 4 };

export async function collectHealthChecks(
  probes: Record<string, () => Promise<ProjectIntelligenceHealthStatus | { status: ProjectIntelligenceHealthStatus; message?: string }>>,
): Promise<ProjectIntelligenceHealthReport> {
  const checks = await Promise.all(Object.entries(probes).map(async ([key, probe]) => {
    try {
      const result = await probe();
      return typeof result === "string" ? { key, status: result } : { key, ...result };
    } catch (error) {
      return { key, status: "failed" as const, message: error instanceof Error ? error.message : "Health probe failed" };
    }
  }));
  const status = checks.reduce<ProjectIntelligenceHealthStatus>((worst, item) => RANK[item.status] > RANK[worst] ? item.status : worst, "healthy");
  return { status, checkedAt: new Date().toISOString(), checks };
}
