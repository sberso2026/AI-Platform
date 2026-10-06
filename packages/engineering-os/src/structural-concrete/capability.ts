import type { D1dCapabilityManifestRecord, D1eValidationDebtItem, ConcreteProductGatingLevel } from "@rtb/types";
import {
  CONCRETE_IMPLEMENTATION_MATURITY,
  CONCRETE_PRODUCT_CAPABILITY_GATING,
  CONCRETE_PRODUCT_GATING_LEVELS,
  CONCRETE_VALIDATION_PILOT_EXPOSURE,
  D1D_GLOBAL_RELEASE_CLASSIFICATION,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
} from "@rtb/types";
import { D1D_CAPABILITY_MANIFEST } from "../structural-steel/d1d-closeout/manifest";
import { CANONICAL_D0_D1_RISK_STATE } from "../structural-steel/risk-ledger";

export const CONCRETE_CAPABILITY_MANIFEST: readonly D1dCapabilityManifestRecord[] = [
  {
    capabilityId: "D1E.GLOBAL.FOUNDATION",
    jurisdiction: "GLOBAL",
    method: "concrete design foundation",
    authorityType: "FRAMEWORK_ONLY",
    implementationState: CONCRETE_IMPLEMENTATION_MATURITY,
    validationState: "NOT_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
    limitations: "architecture/contracts only; no national concrete design equations",
    dependencies: ["D1A structural domain", "D1B standard bind", "D1C bounded demand", "D1D frozen architecture"],
  },
  {
    capabilityId: "D1E.AU.ADAPTER",
    jurisdiction: "AU",
    method: "AS 3600 family adapter",
    authorityType: "FRAMEWORK_ONLY",
    implementationState: "NOT_IMPLEMENTED",
    validationState: "NOT_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
    limitations: "edition UNKNOWN_PENDING_CONFIRMATION; no AS 3600 equations",
    dependencies: ["D1E.GLOBAL.FOUNDATION"],
  },
  {
    capabilityId: "D1E.EU.ADAPTER",
    jurisdiction: "EU",
    method: "EN 1992 family adapter",
    authorityType: "FRAMEWORK_ONLY",
    implementationState: "NOT_IMPLEMENTED",
    validationState: "NOT_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
    limitations: "edition/annex/NDP not selected; no EN 1992 equations",
    dependencies: ["D1E.GLOBAL.FOUNDATION"],
  },
  {
    capabilityId: "D1E.US.ADAPTER",
    jurisdiction: "US",
    method: "ACI 318 family adapter",
    authorityType: "FRAMEWORK_ONLY",
    implementationState: "NOT_IMPLEMENTED",
    validationState: "NOT_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
    limitations: "edition UNKNOWN_PENDING_CONFIRMATION; no ACI 318 equations",
    dependencies: ["D1E.GLOBAL.FOUNDATION"],
  },
  {
    capabilityId: "D1E.GLOBAL.RC_SECTION_MECHANICS",
    jurisdiction: "GLOBAL",
    method: "deterministic RC section geometry and kinematics kernel",
    authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
    implementationState: "MECHANICS_REFERENCE",
    validationState: "NUMERICALLY_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: D1D_GLOBAL_RELEASE_CLASSIFICATION,
    limitations: "geometry/kinematics/elastic reference only; not AS 3600 / EN 1992 / ACI 318 capacity",
    dependencies: ["D1E.GLOBAL.FOUNDATION", "D1C bounded demand"],
  },
];

export const STRUCTURAL_CAPABILITY_MANIFEST: readonly D1dCapabilityManifestRecord[] = [
  ...D1D_CAPABILITY_MANIFEST,
  ...CONCRETE_CAPABILITY_MANIFEST,
];

export const CONCRETE_PRODUCT_GATING_POLICY: Record<ConcreteProductGatingLevel, {
  discoveryAllowed: boolean;
  productDesignClaimAllowed: boolean;
  certifiedClaimAllowed: boolean;
  uiPilotExpose: boolean;
}> = {
  FRAMEWORK: { discoveryAllowed: true, productDesignClaimAllowed: false, certifiedClaimAllowed: false, uiPilotExpose: false },
  MECHANICS_REFERENCE: { discoveryAllowed: true, productDesignClaimAllowed: false, certifiedClaimAllowed: false, uiPilotExpose: false },
  CODE_PROFILE_IMPLEMENTED: { discoveryAllowed: false, productDesignClaimAllowed: false, certifiedClaimAllowed: false, uiPilotExpose: false },
  VALIDATED: { discoveryAllowed: false, productDesignClaimAllowed: false, certifiedClaimAllowed: false, uiPilotExpose: false },
  CONFORMANCE_VALIDATED: { discoveryAllowed: false, productDesignClaimAllowed: false, certifiedClaimAllowed: false, uiPilotExpose: false },
  CERTIFIED: { discoveryAllowed: false, productDesignClaimAllowed: false, certifiedClaimAllowed: false, uiPilotExpose: false },
};

export function concreteProductCapabilityVisible(level: ConcreteProductGatingLevel): boolean {
  return CONCRETE_PRODUCT_GATING_POLICY[level].discoveryAllowed;
}

export function assertConcreteProductCapabilityGating(): void {
  if (!CONCRETE_PRODUCT_CAPABILITY_GATING) throw new Error("concrete product capability gating must remain in force");
  if (CONCRETE_PRODUCT_GATING_LEVELS.length !== 6) throw new Error("concrete gating levels must remain six-valued");
  if (CONCRETE_VALIDATION_PILOT_EXPOSURE) throw new Error("concrete validation must not be Profile A exposed");
  for (const level of CONCRETE_PRODUCT_GATING_LEVELS) {
    if (CONCRETE_PRODUCT_GATING_POLICY[level].productDesignClaimAllowed || CONCRETE_PRODUCT_GATING_POLICY[level].certifiedClaimAllowed) {
      throw new Error("D1E-0 must not expose unsupported concrete design or certification claims");
    }
  }
}

export const D1E_VALIDATION_DEBT_REGISTER: readonly D1eValidationDebtItem[] = [
  { debtId: "D1E-VD-AU-EDITION", category: "STANDARD_EDITION", jurisdiction: "AU", capability: "AS 3600 identity", description: "AS 3600 edition unknown", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "confirmed edition/amendment", ownerWorkstream: "AU_CONCRETE_CONFORMANCE", recommendedFuturePhase: "D1E-AU" },
  { debtId: "D1E-VD-EU-EDITION", category: "STANDARD_EDITION", jurisdiction: "EU", capability: "EN 1992 identity", description: "EN 1992 generation/edition/annex/NDP unknown", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "family/part/edition/annex/NDP datasets", ownerWorkstream: "EU_CONCRETE_CONFORMANCE", recommendedFuturePhase: "D1E-EU" },
  { debtId: "D1E-VD-US-EDITION", category: "STANDARD_EDITION", jurisdiction: "US", capability: "ACI 318 identity", description: "ACI 318 edition and building-code adoption unknown", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "edition, adoption, local amendments", ownerWorkstream: "US_CONCRETE_CONFORMANCE", recommendedFuturePhase: "D1E-US" },
  { debtId: "D1E-VD-MATERIAL-AUTHORITY", category: "MATERIAL_PROPERTY_AUTHORITY", jurisdiction: "GLOBAL", capability: "concrete material", description: "material-property catalogues not certified; D1E-1 requires explicitly governed E only", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed catalogue/test certificates", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-REINFORCEMENT-AUTHORITY", category: "REINFORCEMENT_PROPERTY_AUTHORITY", jurisdiction: "GLOBAL", capability: "reinforcement material", description: "reinforcement-property catalogues not certified; D1E-1 requires explicitly governed Es/area", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed bar/product standards", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-SECTION-ANALYSIS", category: "SECTION_ANALYSIS", jurisdiction: "GLOBAL", capability: "section equilibrium", description: "geometry/kinematics/elastic integration exist; governed constitutive/code section analysis still absent", priority: "SAFETY_CRITICAL", blockingState: "PARTIAL", requiredEvidence: "governed constitutive rules plus code-capacity benchmarks", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "D1E-AU" },
  { debtId: "D1E-VD-STRESS-BLOCK", category: "STRESS_BLOCK_RULES", jurisdiction: "GLOBAL", capability: "flexure", description: "no global or jurisdiction stress-block parameters", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "adapter-owned governed stress-block rules", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-FLEXURE", category: "FLEXURAL_DESIGN", jurisdiction: "GLOBAL", capability: "flexure", description: "numerical code flexure absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction flexural methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-AXIAL-FLEXURE", category: "AXIAL_FLEXURE", jurisdiction: "GLOBAL", capability: "N-M", description: "axial-flexure interaction not implemented", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed N-M methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-BIAXIAL", category: "BIAXIAL_INTERACTION", jurisdiction: "GLOBAL", capability: "P-M-M", description: "biaxial interaction surfaces not generated", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed P-M-M generation", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-SHEAR", category: "SHEAR", jurisdiction: "GLOBAL", capability: "shear", description: "numerical code shear absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction shear methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-TORSION", category: "TORSION", jurisdiction: "GLOBAL", capability: "torsion", description: "numerical torsion absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction torsion methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-PUNCHING", category: "PUNCHING_SHEAR", jurisdiction: "GLOBAL", capability: "punching", description: "punching-shear equations absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed punching methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-SECOND-ORDER", category: "SECOND_ORDER_EFFECTS", jurisdiction: "GLOBAL", capability: "column stability", description: "RC second-order methods absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "RC slenderness methods not copied from steel", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-CRACKING", category: "CRACKING", jurisdiction: "GLOBAL", capability: "crack control", description: "code crack-width equations absent", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction crack-control methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-DEFLECTION", category: "DEFLECTION", jurisdiction: "GLOBAL", capability: "SLS deflection", description: "cracked/long-term RC deflection absent", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "RC deflection methods beyond D1C elastic", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-CREEP", category: "CREEP", jurisdiction: "GLOBAL", capability: "creep", description: "no default creep model", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed time-dependent models", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-SHRINKAGE", category: "SHRINKAGE", jurisdiction: "GLOBAL", capability: "shrinkage", description: "no default shrinkage model", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "governed shrinkage models", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-COVER", category: "COVER", jurisdiction: "GLOBAL", capability: "cover", description: "no default minimum cover", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction cover rules", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-DURABILITY", category: "DURABILITY", jurisdiction: "GLOBAL", capability: "durability", description: "exposure classes not in common core", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "adapter-owned exposure datasets", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-DEVELOPMENT", category: "DEVELOPMENT", jurisdiction: "GLOBAL", capability: "development", description: "development-length equations absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction development methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-ANCHORAGE", category: "ANCHORAGE", jurisdiction: "GLOBAL", capability: "anchorage", description: "anchorage/hooks/headed-bar rules absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction anchorage methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-LAP", category: "LAP_SPLICES", jurisdiction: "GLOBAL", capability: "lap splice", description: "no default lap length", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction lap methods", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-DETAILING", category: "DETAILING", jurisdiction: "GLOBAL", capability: "detailing", description: "no global numeric detailing limits", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "jurisdiction detailing checks", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
  { debtId: "D1E-VD-SLABS", category: "SLABS", jurisdiction: "GLOBAL", capability: "slab", description: "slab object type is not numerical slab design", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "later slab methods; not general FEA", ownerWorkstream: "later D1E", recommendedFuturePhase: "later D1E" },
  { debtId: "D1E-VD-WALLS", category: "WALLS", jurisdiction: "GLOBAL", capability: "wall", description: "wall object type is not numerical wall design", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "later wall methods", ownerWorkstream: "later D1E", recommendedFuturePhase: "later D1E" },
  { debtId: "D1E-VD-FOOTINGS", category: "FOOTINGS", jurisdiction: "GLOBAL", capability: "footing", description: "footing geometry does not imply geotechnical validation", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "D1F/geotechnical methods", ownerWorkstream: "D1F", recommendedFuturePhase: "D1F" },
  { debtId: "D1E-VD-PRESTRESSED", category: "PRESTRESSED_CONCRETE", jurisdiction: "GLOBAL", capability: "prestress", description: "prestressed design not implemented", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "later prestress track", ownerWorkstream: "later D1E", recommendedFuturePhase: "later D1E" },
  { debtId: "D1E-VD-CONNECTIONS", category: "CONNECTIONS", jurisdiction: "GLOBAL", capability: "connections", description: "concrete connections not implemented", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "D1F connection methods", ownerWorkstream: "D1F", recommendedFuturePhase: "D1F" },
  { debtId: "D1E-VD-SEISMIC", category: "SEISMIC", jurisdiction: "GLOBAL", capability: "seismic", description: "seismic concrete detailing absent", priority: "SAFETY_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "later bounded seismic subphase", ownerWorkstream: "later seismic", recommendedFuturePhase: "later bounded seismic subphase" },
  { debtId: "D1E-VD-FIRE", category: "FIRE", jurisdiction: "GLOBAL", capability: "fire", description: "fire design absent", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "later fire-resistance track", ownerWorkstream: "later D1E", recommendedFuturePhase: "later D1E" },
  { debtId: "D1E-VD-THIRD-PARTY", category: "EXTERNAL_TOOL_COMPARISON", jurisdiction: "GLOBAL", capability: "benchmarks", description: "independent commercial-tool comparisons not available", priority: "COMMERCIAL_RELEASE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "D1G / third-party comparisons", ownerWorkstream: "D1G", recommendedFuturePhase: "D1G" },
  { debtId: "D1E-VD-HUMAN", category: "HUMAN_VALIDATION", jurisdiction: "GLOBAL", capability: "human review", description: "human engineering validation of concrete methods not started", priority: "CONFORMANCE_CRITICAL", blockingState: "UNRESOLVED", requiredEvidence: "independent human confirmation", ownerWorkstream: "AU/EU/US concrete", recommendedFuturePhase: "jurisdiction concrete track" },
];

export const D1E_INTERNAL_ROADMAP = [
  { id: "D1E-0", scope: "global concrete design foundation", status: "CLOSED" },
  { id: "D1E-1", scope: "common RC section mechanics / deterministic geometry foundation", status: "THIS_PHASE" },
  { id: "D1E-AU", scope: RECOMMENDED_D1E_NEXT_PHASE_SCOPE, status: "NEXT" },
  { id: "D1E-EU", scope: "EN 1992 family/part/annex/NDP bind then bounded methods", status: "PLANNED" },
  { id: "D1E-US", scope: "ACI 318 family/edition/adoption bind then bounded methods", status: "PLANNED" },
] as const;

export const D1E0_D0_RISK_DISPOSITION = {
  CLOSED: "NONE" as const,
  REDUCED: ["D0-R01"] as const,
  INTRODUCED: "NONE" as const,
  REMAINING: CANONICAL_D0_D1_RISK_STATE.REMAINING,
} as const;

export const D1E1_D0_RISK_DISPOSITION = {
  CLOSED: "NONE" as const,
  REDUCED: ["D0-R01"] as const,
  INTRODUCED: "NONE" as const,
  REMAINING: CANONICAL_D0_D1_RISK_STATE.REMAINING,
} as const;

export function assertD1e0RiskLedger(): void {
  if (D1E0_D0_RISK_DISPOSITION.CLOSED !== "NONE") {
    throw new Error("D1E-0 must not close D0 risks merely because interfaces exist");
  }
  if (D1E0_D0_RISK_DISPOSITION.INTRODUCED !== "NONE") {
    throw new Error("D1E-0 must not introduce unmanaged D0 risks");
  }
}

export const D1E_CANONICAL_ROADMAP_HANDOFF = {
  nextPhase: RECOMMENDED_D1E_NEXT_PHASE,
  nextPhaseScope: RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  source: "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_COMPLETION_PLAN.md",
  canonicalD1eScope: "Concrete Design Capability",
} as const;
