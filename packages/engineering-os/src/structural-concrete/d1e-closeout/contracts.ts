import {
  CANONICAL_D1E_NEXT_PHASE,
  CANONICAL_D1E_NEXT_PHASE_SCOPE,
  D1E_ARCHITECTURE_CONTRACT_FROZEN,
  D1E_FUTURE_EXTENSION_RULE_DEFINED,
  EU_CONCRETE_CONFORMANCE_PHASE_PLAN_DEFINED,
  EU_CONCRETE_CONFORMANCE_TRACK_DEFINED,
  EU_CONCRETE_V1_SCOPE_DEFINED,
} from "@rtb/types";

export const D1E_FROZEN_ARCHITECTURE_CONTRACTS = [
  "concrete domain",
  "material model",
  "reinforcement model",
  "section geometry",
  "section kernel",
  "material-response interface",
  "strain kinematics",
  "section integration",
  "equilibrium solver interface",
  "standard adapter boundary",
  "validation dimensions",
  "result authority",
  "provenance",
  "invalidation",
  "AI authority",
  "optimization recheck",
  "human approval separation",
] as const;

export const D1E_FUTURE_EXTENSION_RULE = {
  defined: D1E_FUTURE_EXTENSION_RULE_DEFINED,
  mustExtendExistingArchitecture: true,
  parallelRcKernelForbidden: true,
  parallelSectionSolverForbidden: true,
  parallelStandardFrameworkForbidden: true,
  parallelValidationSystemForbidden: true,
  parallelCapabilityManifestForbidden: true,
} as const;

export const EU_CONCRETE_V1_SCOPE = {
  defined: EU_CONCRETE_V1_SCOPE_DEFINED,
  members: ["beams", "columns"] as const,
  sections: ["rectangular", "circular", "flanged"] as const,
  ultimate: [
    "flexure",
    "axial-flexure",
    "biaxial interaction",
    "shear",
    "punching",
    "second-order member effects",
  ] as const,
  serviceability: ["crack control", "deflection", "creep/shrinkage"] as const,
  detailing: [
    "cover",
    "durability",
    "minimum/maximum reinforcement",
    "bar spacing",
    "development/anchorage",
    "lap splices",
    "detailing",
  ] as const,
  governance: ["National Annex / NDP support"] as const,
  excluded: [
    "prestressed concrete",
    "advanced bridge-specific design",
    "fire",
    "seismic ductile detailing",
    "nonlinear shell/solid FEA",
    "special precast connections",
  ] as const,
} as const;

export const EU_CONCRETE_CONFORMANCE_PHASE_PLAN = [
  { id: "EOS-D1E-EU-C1", scope: "governed EN 1992 material/design rules" },
  { id: "EOS-D1E-EU-C2", scope: "validated uniaxial flexure" },
  { id: "EOS-D1E-EU-C3", scope: "validated axial-flexure / P-M" },
  { id: "EOS-D1E-EU-C4", scope: "validated biaxial P-M-M" },
  { id: "EOS-D1E-EU-C5", scope: "validated shear / punching / torsion" },
  { id: "EOS-D1E-EU-C6", scope: "validated RC second-order/stability" },
  { id: "EOS-D1E-EU-C7", scope: "validated serviceability / cracking / long-term" },
  { id: "EOS-D1E-EU-C8", scope: "validated detailing / cover / durability / anchorage" },
  { id: "EOS-D1E-EU-C9", scope: "complete member orchestration" },
  { id: "EOS-D1E-EU-C10", scope: "independent conformance / release gate" },
] as const;

export const EU_CONCRETE_CONFORMANCE_TRACK = {
  defined: EU_CONCRETE_CONFORMANCE_TRACK_DEFINED,
  name: "EUROCODE CONCRETE V1 CONFORMANCE TRACK",
  nature: ["RULE IMPLEMENTATION", "NUMERICAL VALIDATION", "ENGINEERING VALIDATION", "CONFORMANCE HARDENING"] as const,
  notArchitectureFirst: true,
  v1Scope: EU_CONCRETE_V1_SCOPE,
  phases: EU_CONCRETE_CONFORMANCE_PHASE_PLAN,
  phasePlanDefined: EU_CONCRETE_CONFORMANCE_PHASE_PLAN_DEFINED,
} as const;

export const D1E_CANONICAL_ROADMAP_HANDOFF_CLOSEOUT = {
  nextPhase: CANONICAL_D1E_NEXT_PHASE,
  nextPhaseScope: CANONICAL_D1E_NEXT_PHASE_SCOPE,
  source: "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_COMPLETION_PLAN.md",
  frozen: D1E_ARCHITECTURE_CONTRACT_FROZEN,
} as const;
