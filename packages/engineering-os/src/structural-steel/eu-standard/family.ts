import type { En1993PartId, EurocodeFamilyId, EurocodePartImplementationState } from "@rtb/types";
import { EN1993_STEEL_FAMILY_REGISTERED, EU_INITIAL_STEEL_STANDARD_PART, EUROCODE_FAMILY_IDS } from "@rtb/types";

export const EUROCODE_FAMILY_CATALOG: readonly {
  familyId: EurocodeFamilyId;
  standardCode: string;
  purpose: string;
  d1dEuScope: "IN_SCOPE" | "DEPENDENCY_REFERENCE" | "OUT_OF_SCOPE";
  implementationState: EurocodePartImplementationState;
}[] = [
  { familyId: "EN_1990", standardCode: "EN 1990", purpose: "Basis of structural design", d1dEuScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1991", standardCode: "EN 1991", purpose: "Actions on structures", d1dEuScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1992", standardCode: "EN 1992", purpose: "Concrete", d1dEuScope: "OUT_OF_SCOPE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1993", standardCode: "EN 1993", purpose: "Steel", d1dEuScope: "IN_SCOPE", implementationState: "REGISTERED_ARCHITECTURE" },
  { familyId: "EN_1994", standardCode: "EN 1994", purpose: "Composite", d1dEuScope: "OUT_OF_SCOPE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1995", standardCode: "EN 1995", purpose: "Timber", d1dEuScope: "OUT_OF_SCOPE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1996", standardCode: "EN 1996", purpose: "Masonry", d1dEuScope: "OUT_OF_SCOPE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1997", standardCode: "EN 1997", purpose: "Geotechnical", d1dEuScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1998", standardCode: "EN 1998", purpose: "Seismic", d1dEuScope: "DEPENDENCY_REFERENCE", implementationState: "NOT_IMPLEMENTED" },
  { familyId: "EN_1999", standardCode: "EN 1999", purpose: "Aluminium", d1dEuScope: "OUT_OF_SCOPE", implementationState: "NOT_IMPLEMENTED" },
];

export const EN1993_PART_CATALOG: readonly {
  partId: En1993PartId;
  standardCode: string;
  purpose: string;
  implementationState: EurocodePartImplementationState;
  initialSteelDesignPart: boolean;
}[] = [
  { partId: "EN_1993_1_1", standardCode: "EN 1993-1-1", purpose: "General rules and rules for buildings — architecture only", implementationState: "REGISTERED_ARCHITECTURE", initialSteelDesignPart: true },
  { partId: "EN_1993_1_5", standardCode: "EN 1993-1-5", purpose: "Plated structural elements — not implemented", implementationState: "NOT_IMPLEMENTED", initialSteelDesignPart: false },
  { partId: "EN_1993_1_8", standardCode: "EN 1993-1-8", purpose: "Joints — not implemented", implementationState: "NOT_IMPLEMENTED", initialSteelDesignPart: false },
  { partId: "EN_1993_1_9", standardCode: "EN 1993-1-9", purpose: "Fatigue — not implemented", implementationState: "NOT_IMPLEMENTED", initialSteelDesignPart: false },
  { partId: "EN_1993_1_10", standardCode: "EN 1993-1-10", purpose: "Material toughness / through-thickness — not implemented", implementationState: "NOT_IMPLEMENTED", initialSteelDesignPart: false },
  { partId: "EN_1993_1_12", standardCode: "EN 1993-1-12", purpose: "Additional rules — not implemented", implementationState: "NOT_IMPLEMENTED", initialSteelDesignPart: false },
];

export const EUROCODE_DEPENDENCY_MODEL = {
  EN_1990: "design basis / combinations context — D1C demand engine reused; no EU-1 load-combination engine",
  EN_1991: "action provenance — not implemented in EU-1",
  EN_1998: "seismic applicability hook — not implemented",
  EN_1997: "foundation/interface boundary — member validation does not imply foundation validation",
} as const;

export function resolveEurocodeFamily(familyId: string) {
  const row = EUROCODE_FAMILY_CATALOG.find((item) => item.familyId === familyId);
  if (!row) throw new Error(`Eurocode family not registered: ${familyId}`);
  return row;
}

export function resolveEn1993Family() {
  if (!EN1993_STEEL_FAMILY_REGISTERED) throw new Error("EN 1993 steel family must be registered");
  return resolveEurocodeFamily("EN_1993");
}

export function resolveEurocodePart(partId: string) {
  const row = EN1993_PART_CATALOG.find((item) => item.partId === partId);
  if (!row) throw new Error(`STANDARD_PART_UNSUPPORTED: ${partId}`);
  return row;
}

export function resolveInitialSteelStandardPart() {
  const row = EN1993_PART_CATALOG.find((item) => item.partId === EU_INITIAL_STEEL_STANDARD_PART);
  if (!row?.initialSteelDesignPart) throw new Error("initial EN 1993-1-1 part is not registered");
  return row;
}

export function assertEurocodeFamilyComplete(): void {
  if (EUROCODE_FAMILY_CATALOG.map((row) => row.familyId).join() !== EUROCODE_FAMILY_IDS.join()) {
    throw new Error("Eurocode family catalog is incomplete");
  }
  if (EUROCODE_FAMILY_CATALOG.filter((row) => row.d1dEuScope === "IN_SCOPE").length !== 1) {
    throw new Error("only EN 1993 is in D1D-EU implementation scope");
  }
}
