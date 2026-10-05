import { resolveVerifiedSection, type VerifiedSteelSection } from "../optimization-intelligence/spacegass-aust300-sections";
import { AUST300_GLOBAL_DEFAULT } from "@rtb/types";

export function aust300AsAuCatalogIdentity(designation: string): {
  catalogId: "AUST300";
  jurisdictionApplicability: ["australia"];
  globalDefault: false;
  libraryName: string;
  massKgPerM: number;
  inferredEngineeringProperties: false;
} {
  if (AUST300_GLOBAL_DEFAULT) throw new Error("AUST300 must not be the global section default");
  const row: VerifiedSteelSection | undefined = resolveVerifiedSection(designation);
  if (!row) throw new Error(`AUST300 catalog identity not found for ${designation}`);
  return {
    catalogId: "AUST300",
    jurisdictionApplicability: ["australia"],
    globalDefault: false,
    libraryName: row.libraryName,
    massKgPerM: row.massKgPerM,
    inferredEngineeringProperties: false,
  };
}

export function assertAust300NotGlobal(jurisdictionApplicability: string[]): void {
  if (AUST300_GLOBAL_DEFAULT) throw new Error("AUST300 must not be the global section default");
  if (jurisdictionApplicability.length === 1 && jurisdictionApplicability[0] === "global-baseline") {
    throw new Error("AUST300 must not be treated as a global catalog");
  }
}
