import type { D1dCapabilityManifestRecord } from "@rtb/types";
import { D1D_GLOBAL_RELEASE_CLASSIFICATION } from "@rtb/types";
import { D1D_CANONICAL_CAPABILITY_MATRIX } from "./matrix";
import { COMMON_STEEL_MECHANICS_INVENTORY } from "./mechanics";

const RELEASE = D1D_GLOBAL_RELEASE_CLASSIFICATION;

function fromMatrix(): D1dCapabilityManifestRecord[] {
  const records: D1dCapabilityManifestRecord[] = [];
  for (const row of D1D_CANONICAL_CAPABILITY_MATRIX) {
    for (const jurisdiction of ["GLOBAL", "AU", "EU", "US"] as const) {
      const cell = row[jurisdiction];
      records.push({
        capabilityId: `D1D.${jurisdiction}.${row.capability.replace(/\s+/g, "_").toUpperCase()}`,
        jurisdiction,
        method: row.capability,
        authorityType: cell.numericallyValidated
          ? "ENGINEERING_MECHANICS_REFERENCE"
          : cell.frameworkOnly
            ? "FRAMEWORK_ONLY"
            : cell.implemented
              ? "GOVERNED_ORCHESTRATION"
              : "NOT_IMPLEMENTED",
        implementationState: cell.implemented ? "IMPLEMENTED" : cell.frameworkOnly ? "FRAMEWORK_ONLY" : "NOT_IMPLEMENTED",
        validationState: cell.numericallyValidated ? "NUMERICALLY_VALIDATED" : cell.engineerValidated ? "ENGINEER_VALIDATED" : "NOT_VALIDATED",
        conformanceState: cell.conformanceValidated ? "CONFORMANCE_VALIDATED" : "INTENDED_PROFILE",
        releaseState: cell.releaseState || RELEASE,
        limitations: cell.limitation,
        dependencies: ["D1A structural domain", "D1B standard bind", "D1C bounded demand"],
      });
    }
  }
  return records;
}

function fromMechanics(): D1dCapabilityManifestRecord[] {
  return COMMON_STEEL_MECHANICS_INVENTORY.map((row) => ({
    capabilityId: `D1D.GLOBAL.${row.commonMethodId}`,
    jurisdiction: "GLOBAL" as const,
    method: row.commonMethodId,
    authorityType: "ENGINEERING_MECHANICS_REFERENCE",
    implementationState: "IMPLEMENTED",
    validationState: row.benchmarkState === "PASS" ? "NUMERICALLY_VALIDATED" : "ORCHESTRATION_ONLY",
    conformanceState: "INTENDED_PROFILE",
    releaseState: RELEASE,
    limitations: row.unsupportedInterpretations,
    dependencies: [...row.supportedInputs],
  }));
}

export const D1D_CAPABILITY_MANIFEST: readonly D1dCapabilityManifestRecord[] = [
  ...fromMatrix(),
  ...fromMechanics(),
];
