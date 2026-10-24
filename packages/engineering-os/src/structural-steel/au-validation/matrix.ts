import type { AuSteelValidationMatrixRow } from "@rtb/types";

export const AU_STEEL_VALIDATION_MATRIX: readonly AuSteelValidationMatrixRow[] = [
  { capability: "tension", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "mechanics fyAg/fuAn; not AS 4100 φNt" },
  { capability: "compression", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "squash fyA mechanics reference only" },
  { capability: "compression stability", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "Euler Pcr is not code compression design" },
  { capability: "major bending", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "elastic My=fyZ; not code member moment capacity" },
  { capability: "minor bending", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "elastic My=fyZ; not code member moment capacity" },
  { capability: "LTB", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "elastic Mcr is not validated code member capacity" },
  { capability: "shear", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "von Mises yield reference; not AS 4100 Vv" },
  { capability: "shear buckling", implemented: true, benchmarked: true, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "elastic plate buckling; kv never defaulted; not code shear design" },
  { capability: "combined actions", implemented: false, benchmarked: false, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "framework only; no numerical interaction methods" },
  { capability: "serviceability", implemented: true, benchmarked: false, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "orchestration of governed criteria; no default L/n" },
  { capability: "member orchestration", implemented: true, benchmarked: false, engineerValidated: false, conformanceValidated: false, certified: false, limitation: "assembles checks; interaction gap keeps members undetermined" },
];
