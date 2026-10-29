import {
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  D1D_CANONICAL_NEXT_PHASE,
  D1D_CANONICAL_NEXT_PHASE_SCOPE,
  D1D_FUTURE_EXTENSION_RULE_DEFINED,
  D1D_FUTURE_STANDARDS_VALIDATION_TRACK_DEFINED,
} from "@rtb/types";

export const D1D_FROZEN_ARCHITECTURE_CONTRACTS = [
  "structural steel object model",
  "standard-context interface",
  "engineering-rule authority",
  "common mechanics boundary",
  "jurisdiction adapter boundary",
  "validation/conformance dimensions",
  "member result authority semantics",
  "member orchestration contract",
  "serviceability governance",
  "optimization recheck contract",
  "AI authority boundary",
  "human approval separation",
] as const;

export const D1D_FUTURE_EXTENSION_RULE = {
  mustExtendExistingContracts: true,
  parallelSteelCoreForbidden: true,
  parallelStandardsFrameworkForbidden: true,
  parallelMemberOrchestratorForbidden: true,
  parallelValidationModelForbidden: true,
  defined: D1D_FUTURE_EXTENSION_RULE_DEFINED,
} as const;

export const D1D_FUTURE_STANDARDS_VALIDATION_TRACK = {
  defined: D1D_FUTURE_STANDARDS_VALIDATION_TRACK_DEFINED,
  independentOfD1E: true,
  tracks: [
    { id: "AU_STEEL_CONFORMANCE_HARDENING", jurisdiction: "AU", purpose: "AS 4100 identity, code-profile resistance, classification, interaction, human validation" },
    { id: "EU_STEEL_CONFORMANCE_HARDENING", jurisdiction: "EU", purpose: "EN 1993 identity, National Annex/NDP datasets, code resistance, classification, interaction" },
    { id: "US_STEEL_CONFORMANCE_HARDENING", jurisdiction: "US", purpose: "AISC identity, LRFD/ASD, building-code adoption, code strength, classification, interaction" },
  ],
} as const;

export const D1D_EXTERNAL_SOLVER_BOUNDARY = {
  preserved: true,
  vendorNeutralPort: "D1G",
  uncertifiedUnlessIndependentlyCertified: [
    "SPACE GASS",
    "SAP2000",
    "STAAD",
    "Robot",
    "ETABS",
    "RFEM",
    "Strand7",
  ],
} as const;

export const D1D_CANONICAL_ROADMAP_HANDOFF = {
  nextPhase: D1D_CANONICAL_NEXT_PHASE,
  nextPhaseScope: D1D_CANONICAL_NEXT_PHASE_SCOPE,
  source: "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_COMPLETION_PLAN.md",
  frozen: D1D_ARCHITECTURE_CONTRACT_FROZEN,
} as const;
