import type { En1992PartId, EurocodePartImplementationState } from "@rtb/types";
import {
  EN1992_PART_IDS,
  EU_CONCRETE_STANDARD_FAMILY_BOUND,
  EU_INITIAL_CONCRETE_STANDARD_PART,
} from "@rtb/types";
import { EUROCODE_FAMILY_CATALOG, resolveEurocodeFamily } from "../../structural-steel/eu-standard";

export const EN1992_CONCRETE_FAMILY_BINDING = {
  familyId: "EN_1992" as const,
  standardCode: "EN 1992",
  purpose: "Design of concrete structures — architecture/binding only",
  d1eEuScope: "IN_SCOPE" as const,
  implementationState: "REGISTERED_ARCHITECTURE" as const,
  numericalMethodsImplemented: false,
};

export const EN1992_PART_CATALOG: readonly {
  partId: En1992PartId;
  standardCode: string;
  purpose: string;
  implementationState: EurocodePartImplementationState;
  initialGeneralDesignPart: boolean;
  numericalImplemented: false;
}[] = [
  { partId: "EN_1992_1_1", standardCode: "EN 1992-1-1", purpose: "General rules and rules for buildings — architecture only", implementationState: "REGISTERED_ARCHITECTURE", initialGeneralDesignPart: true, numericalImplemented: false },
  { partId: "EN_1992_1_2", standardCode: "EN 1992-1-2", purpose: "Structural fire design — not implemented", implementationState: "NOT_IMPLEMENTED", initialGeneralDesignPart: false, numericalImplemented: false },
  { partId: "EN_1992_2", standardCode: "EN 1992-2", purpose: "Concrete bridges — not implemented", implementationState: "NOT_IMPLEMENTED", initialGeneralDesignPart: false, numericalImplemented: false },
  { partId: "EN_1992_3", standardCode: "EN 1992-3", purpose: "Liquid retaining and containment — not implemented", implementationState: "NOT_IMPLEMENTED", initialGeneralDesignPart: false, numericalImplemented: false },
  { partId: "EN_1992_4", standardCode: "EN 1992-4", purpose: "Design of fastenings — not implemented", implementationState: "NOT_IMPLEMENTED", initialGeneralDesignPart: false, numericalImplemented: false },
];

export function bindEn1992ConcreteFamily() {
  if (!EU_CONCRETE_STANDARD_FAMILY_BOUND) throw new Error("EN 1992 concrete family must be bound");
  const steelCatalogRow = EUROCODE_FAMILY_CATALOG.find((row) => row.familyId === "EN_1992");
  if (!steelCatalogRow) throw new Error("EN 1992 must remain registered in the global Eurocode family catalog");
  return { ...resolveEurocodeFamily("EN_1992"), ...EN1992_CONCRETE_FAMILY_BINDING };
}

export function resolveEn1992Part(partId: string) {
  const row = EN1992_PART_CATALOG.find((item) => item.partId === partId);
  if (!row) throw new Error(`STANDARD_PART_UNSUPPORTED: ${partId}`);
  return row;
}

export function resolveInitialConcreteStandardPart() {
  const row = EN1992_PART_CATALOG.find((item) => item.partId === EU_INITIAL_CONCRETE_STANDARD_PART);
  if (!row?.initialGeneralDesignPart) throw new Error("initial EN 1992-1-1 general design part is not registered");
  return row;
}

export function assertEn1992PartCatalogComplete(): void {
  if (EN1992_PART_CATALOG.map((row) => row.partId).join() !== EN1992_PART_IDS.join()) {
    throw new Error("EN 1992 part catalog is incomplete");
  }
}

export function assertMethodPartDependency(methodPartRefs: readonly string[], parameterPartRef: string): void {
  if (!methodPartRefs.includes(parameterPartRef)) {
    throw new Error(`STANDARD_PART_UNSUPPORTED: parameter from ${parameterPartRef} is not a declared method part dependency`);
  }
}
