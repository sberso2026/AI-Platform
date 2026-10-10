import type { EuC5CheckResult } from "@rtb/types";
import { STALE_EU_C5_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function euC5ResultFingerprint(
  result: Omit<EuC5CheckResult, "fingerprint">,
  demandResultId: string,
  combinationId: string | null,
): string {
  return JSON.stringify({
    family: result.family,
    capabilityFamily: result.capabilityFamily,
    methodId: result.methodId,
    demand: result.demand,
    resistance: result.resistance,
    utilization: result.utilization,
    units: result.units,
    checkState: result.checkState,
    governingRuleIds: result.governingRuleIds,
    parameterVersions: result.parameterVersions,
    geometryFingerprint: result.geometryFingerprint,
    reinforcementFingerprint: result.reinforcementFingerprint,
    standardProfileContext: result.standardProfileContext,
    ndpContext: result.ndpContext,
    validationState: result.validationState,
    conformanceState: result.conformanceState,
    failReason: result.failReason,
    demandResultId,
    combinationId,
    ...(result.torsionDetail ? { torsionDetail: result.torsionDetail } : {}),
  });
}

export function euC5InvalidationTags(previous: string | null | undefined, current: string): readonly string[] {
  if (!previous) return [];
  return previous === current ? [] : ["EU_C5_DEPENDENCY_CHANGED"];
}

export function assertStaleEuC5NotReused(reuseAttempted: boolean, tags: readonly string[]): void {
  if (STALE_EU_C5_RESULT_REUSE_ALLOWED) throw new Error("stale EU C5 result reuse must not be allowed");
  if (reuseAttempted && tags.length > 0) throw new Error("EU C5 fail closed: stale result reuse");
}
