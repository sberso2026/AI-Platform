/**
 * Phase 14B — bounded compatibility resolution (fail closed).
 */
import type { EngineeringOSManifest } from "./aggregate-manifest";
import { buildEngineeringOSManifest } from "./aggregate-manifest";

export interface CompatibilityFinding {
  ok: boolean;
  moduleKey?: string;
  detail: string;
}

export function evaluateEngineeringOSCompatibility(
  manifest: EngineeringOSManifest = buildEngineeringOSManifest(),
): CompatibilityFinding[] {
  const findings: CompatibilityFinding[] = [];

  for (const mod of manifest.installedModules) {
    if (mod.enabled && mod.version === "0.0.0") {
      findings.push({
        ok: false,
        moduleKey: mod.moduleKey,
        detail: "Enabled module with placeholder version 0.0.0",
      });
    } else if (mod.enabled && mod.status === "coming_soon") {
      findings.push({
        ok: false,
        moduleKey: mod.moduleKey,
        detail: "Enabled module marked coming_soon",
      });
    } else {
      findings.push({
        ok: true,
        moduleKey: mod.moduleKey,
        detail: `compatible ${mod.version} / contract ${mod.publicContractVersion}`,
      });
    }
  }

  // Shared domain pins are declarative constraints — major mismatch not assumed solely from "1.0.0".
  findings.push({
    ok: true,
    detail: `shared domains pinned project=${manifest.sharedDomainVersions.project} spatial=${manifest.sharedDomainVersions.spatial}`,
  });

  return findings;
}

export function assertCompatibleOrThrow(
  findings: CompatibilityFinding[] = evaluateEngineeringOSCompatibility(),
): void {
  const failed = findings.filter((f) => !f.ok);
  if (failed.length) {
    throw new Error(
      `Engineering OS incompatible dependencies: ${failed.map((f) => f.detail).join("; ")}`,
    );
  }
}
