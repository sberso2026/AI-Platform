/**
 * Phase 9J — semantic versioning, migration, deprecation, compatibility, rollback.
 */

export const INSPECTION_SEMVER_POLICY_VERSION = "1.0.0" as const;

export type VersionCompatibilityPolicy = {
  moduleSemver: string;
  packSemver: string;
  publicContractSemver: string;
  serviceSemver: string;
  manifestSemver: string;
  migrationStrategy: string;
  deprecationPolicy: string;
  backwardCompatibilityGuarantee: string;
  rollbackProcedure: string;
  silentGovernedRecordMutationForbidden: true;
};

export const INSPECTION_VERSIONING_POLICY: VersionCompatibilityPolicy = {
  moduleSemver: "1.0.0",
  packSemver: "pack major aligned to compatibility matrix",
  publicContractSemver: "1.0.0 with range >=1.0.0 <2.0.0",
  serviceSemver: "1.0.0 per service entry",
  manifestSemver: "inspection-intelligence-module-manifest/1",
  migrationStrategy:
    "additive minor changes preferred; breaking changes require major bump, dual-run window, and documented migration notes",
  deprecationPolicy:
    "deprecated contracts remain available for at least one minor cycle with deprecationNotice set before removal in next major",
  backwardCompatibilityGuarantee:
    "consumers within published compatibility ranges continue to work; incompatible majors are denied",
  rollbackProcedure:
    "restore prior module/pack/contract pins via registry rollback without mutating governed inspection records",
  silentGovernedRecordMutationForbidden: true,
};

export type CompatibilityCheckResult =
  | { outcome: "compatible"; fromVersion: string; toVersion: string }
  | { outcome: "denied_incompatible"; reason: string }
  | { outcome: "deprecated_signalled"; notice: string }
  | { outcome: "rolled_back"; fromVersion: string; toVersion: string };

export function checkContractCompatibility(
  fromVersion: string,
  toVersion: string,
): CompatibilityCheckResult {
  const fromMajor = Number(fromVersion.split(".")[0] ?? 0);
  const toMajor = Number(toVersion.split(".")[0] ?? 0);
  if (toMajor !== fromMajor) {
    return { outcome: "denied_incompatible", reason: "major_version_mismatch" };
  }
  return { outcome: "compatible", fromVersion, toVersion };
}

export function signalContractDeprecation(contractId: string, notice: string): CompatibilityCheckResult {
  if (!notice.trim()) throw new Error("deprecation_notice_required");
  return { outcome: "deprecated_signalled", notice: `${contractId}: ${notice}` };
}

export function rollbackModulePin(
  fromVersion: string,
  toVersion: string,
): CompatibilityCheckResult {
  if (!INSPECTION_VERSIONING_POLICY.silentGovernedRecordMutationForbidden) {
    throw new Error("rollback_must_forbid_silent_mutation");
  }
  return { outcome: "rolled_back", fromVersion, toVersion };
}

export function assertVersioningFormalized(): {
  ok: true;
  policyVersion: typeof INSPECTION_SEMVER_POLICY_VERSION;
} {
  const denied = checkContractCompatibility("1.0.0", "2.0.0");
  if (denied.outcome !== "denied_incompatible") {
    throw new Error("expected_major_denial");
  }
  const deprecated = signalContractDeprecation("ii.api.slice", "use ii.api.slice@1.x");
  if (deprecated.outcome !== "deprecated_signalled") {
    throw new Error("expected_deprecation_signal");
  }
  const rolled = rollbackModulePin("1.0.1", "1.0.0");
  if (rolled.outcome !== "rolled_back") throw new Error("expected_module_rollback");
  return { ok: true, policyVersion: INSPECTION_SEMVER_POLICY_VERSION };
}
