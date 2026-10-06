import type { UsSteelEcosystemId } from "@rtb/types";
import { AISC_STEEL_FAMILY_REGISTERED, US_STEEL_ECOSYSTEM_IDS } from "@rtb/types";

export const US_STEEL_ECOSYSTEM_CATALOG: readonly {
  familyId: UsSteelEcosystemId;
  standardCode: string;
  purpose: string;
  d1dUsScope: "IN_SCOPE" | "DEPENDENCY_REFERENCE" | "OUT_OF_SCOPE";
  implementationState: "REGISTERED_ARCHITECTURE" | "NOT_IMPLEMENTED" | "FRAMEWORK_ONLY";
}[] = [
  { familyId: "AISC_360", standardCode: "AISC 360", purpose: "Specification for Structural Steel Buildings — architecture only", d1dUsScope: "IN_SCOPE", implementationState: "REGISTERED_ARCHITECTURE" },
  { familyId: "AISC_341", standardCode: "AISC 341", purpose: "Seismic Provisions for Structural Steel Buildings — optional dependency", d1dUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "ASCE_7", standardCode: "ASCE 7", purpose: "Minimum Design Loads — load-basis dependency; D1C remains demand engine", d1dUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "IBC", standardCode: "IBC", purpose: "Building-code adoption family example — not a steel specification", d1dUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "ASTM_MATERIAL", standardCode: "ASTM", purpose: "Material/product standards boundary — not populated in US-1", d1dUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "RCSC", standardCode: "RCSC", purpose: "Bolted joint specification dependency — connection design not implemented", d1dUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "AISC_358", standardCode: "AISC 358", purpose: "Prequalified connections dependency — connection design not implemented", d1dUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
];

export function resolveUsSteelEcosystem(familyId: string) {
  const row = US_STEEL_ECOSYSTEM_CATALOG.find((item) => item.familyId === familyId);
  if (!row) throw new Error(`UNSUPPORTED_STANDARD_PROFILE: ${familyId}`);
  return row;
}

export function resolveAiscSteelFamily() {
  if (!AISC_STEEL_FAMILY_REGISTERED) throw new Error("AISC steel family must be registered");
  return resolveUsSteelEcosystem("AISC_360");
}

export function assertUsSteelEcosystemComplete(): void {
  if (US_STEEL_ECOSYSTEM_CATALOG.map((row) => row.familyId).join() !== US_STEEL_ECOSYSTEM_IDS.join()) {
    throw new Error("US steel ecosystem catalog is incomplete");
  }
  if (US_STEEL_ECOSYSTEM_CATALOG.filter((row) => row.d1dUsScope === "IN_SCOPE").length !== 1) {
    throw new Error("only AISC 360 is in D1D-US implementation scope");
  }
}
