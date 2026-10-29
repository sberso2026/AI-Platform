import type { UsConcreteEcosystemId } from "@rtb/types";
import { US_CONCRETE_ECOSYSTEM_IDS, US_CONCRETE_STANDARD_FAMILY_BOUND } from "@rtb/types";

export const ACI318_CONCRETE_FAMILY_BINDING = {
  familyId: "ACI_318" as const,
  standardCode: "ACI 318",
  purpose: "Building Code Requirements for Structural Concrete — architecture/binding only",
  d1eUsScope: "IN_SCOPE" as const,
  implementationState: "REGISTERED_ARCHITECTURE" as const,
  numericalMethodsImplemented: false,
};

export const US_CONCRETE_ECOSYSTEM_CATALOG: readonly {
  familyId: UsConcreteEcosystemId;
  standardCode: string;
  purpose: string;
  d1eUsScope: "IN_SCOPE" | "DEPENDENCY_REFERENCE";
  implementationState: "REGISTERED_ARCHITECTURE" | "NOT_IMPLEMENTED" | "FRAMEWORK_ONLY";
  numericalImplemented: false;
}[] = [
  { familyId: "ACI_318", standardCode: "ACI 318", purpose: "ACI concrete design standard — architecture only", d1eUsScope: "IN_SCOPE", implementationState: "REGISTERED_ARCHITECTURE", numericalImplemented: false },
  { familyId: "ASCE_7", standardCode: "ASCE 7", purpose: "Load-standard dependency; D1C remains demand engine", d1eUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED", numericalImplemented: false },
  { familyId: "IBC", standardCode: "IBC", purpose: "Building-code adoption family example — not an ACI specification", d1eUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED", numericalImplemented: false },
  { familyId: "ASTM_CONCRETE", standardCode: "ASTM", purpose: "Concrete material/product standards boundary — unpopulated", d1eUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED", numericalImplemented: false },
  { familyId: "ASTM_REINFORCEMENT", standardCode: "ASTM", purpose: "Reinforcement product/material standards boundary — unpopulated", d1eUsScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED", numericalImplemented: false },
];

export function bindAci318ConcreteFamily() {
  if (!US_CONCRETE_STANDARD_FAMILY_BOUND) throw new Error("ACI 318 concrete family must be bound");
  return { ...ACI318_CONCRETE_FAMILY_BINDING };
}

export function resolveUsConcreteEcosystem(familyId: string) {
  const row = US_CONCRETE_ECOSYSTEM_CATALOG.find((item) => item.familyId === familyId);
  if (!row) throw new Error(`UNSUPPORTED_STANDARD_PROFILE: ${familyId}`);
  return row;
}

export function assertUsConcreteEcosystemComplete(): void {
  if (US_CONCRETE_ECOSYSTEM_CATALOG.map((row) => row.familyId).join() !== US_CONCRETE_ECOSYSTEM_IDS.join()) {
    throw new Error("US concrete ecosystem catalog is incomplete");
  }
  if (US_CONCRETE_ECOSYSTEM_CATALOG.filter((row) => row.d1eUsScope === "IN_SCOPE").length !== 1) {
    throw new Error("only ACI 318 is in D1E-US-1 implementation scope");
  }
}
