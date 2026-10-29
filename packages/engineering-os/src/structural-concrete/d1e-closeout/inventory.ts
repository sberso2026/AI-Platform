import type { D1dPhaseInventoryRecord } from "@rtb/types";
import { D1E_PHASE_INVENTORY_COMPLETE, D1E_SOURCE_CONTROL_TRACEABILITY } from "@rtb/types";

export const D1E_PHASE_INVENTORY: readonly D1dPhaseInventoryRecord[] = [
  {
    phase: "EOS-D1E-0",
    scope: "global concrete domain, object model, adapter contracts, validation dimensions, AI/human authority",
    commit: "ae862d05869deddae586c3c8655979db3b456ae1",
    verdict: "PASS",
    implementedCapability: "concrete foundation contracts and AU/EU/US adapter routing",
    frameworkOnlyCapability: "AS 3600 / EN 1992 / ACI 318 design equations",
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "architecture only; not a complete concrete design product",
    validationDebt: "all jurisdiction code-profile methods and standard identity",
    riskImpact: "D0-R01 reduced by shared contract; standards-implementation risks remain open",
  },
  {
    phase: "EOS-D1E-1",
    scope: "common deterministic RC section mechanics kernel",
    commit: "51e52e3a4408a8fc748447074e5b0f36838c0c59",
    verdict: "PASS",
    implementedCapability: "geometry, kinematics, elastic integration, equilibrium, fingerprints, invalidation",
    frameworkOnlyCapability: "code constitutive laws, stress blocks, strain limits, design factors",
    validationState: "NUMERICALLY_VALIDATED_MECHANICS",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "elastic reference ≠ national code capacity",
    validationDebt: "D1E-VD-SECTION-ANALYSIS, constitutive/code capacity",
    riskImpact: "D0-R01 reduced; conformance remaining",
  },
  {
    phase: "EOS-D1E-AU-1",
    scope: "AU AS 3600-profile uniaxial flexure framework consuming D1E-1",
    commit: "a142279b91d8106827205fb32cc0d0719ffc8e94",
    verdict: "PASS_WITH_LIMITATIONS",
    implementedCapability: "AU adapter + flexure pipeline + D1E-1 elastic reference reuse",
    frameworkOnlyCapability: "AS 3600 flexural resistance equations",
    validationState: "MECHANICS_REFERENCE_BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "no implemented AU code flexure methods; edition unconfirmed",
    validationDebt: "D1E-AU-VD-EDITION, D1E-AU-VD-STRESS-BLOCK, D1E-AU-VD-PHI",
    riskImpact: "AU architecture bounded; code flexure remaining",
  },
  {
    phase: "EOS-D1E-EU-1",
    scope: "EN 1992 family / generation / part / Annex / NDP binding",
    commit: "4eb9d65262bba829f8a301016239115477a68449",
    verdict: "PASS",
    implementedCapability: "Eurocode concrete standard-context governance",
    frameworkOnlyCapability: "EN 1992 resistance equations and populated NDP catalogs",
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "generation/edition/annex/NDP datasets unpopulated",
    validationDebt: "D1E-VD-EU-EDITION, annex/NDP catalogs",
    riskImpact: "EU high-water mark inherited; identity remaining",
  },
  {
    phase: "EOS-D1E-EU-2",
    scope: "Eurocode-profile uniaxial flexure framework consuming D1E-1",
    commit: "8e7ea6d98146de8444b43ea889160aafe7170bbb",
    verdict: "PASS_WITH_LIMITATIONS",
    implementedCapability: "EU flexure pipeline + D1E-1 elastic reference reuse",
    frameworkOnlyCapability: "EN 1992 flexural resistance equations",
    validationState: "MECHANICS_REFERENCE_BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "no implemented EU code flexure methods; annex/NDP unpopulated",
    validationDebt: "D1E-EU-VD-STRESS-BLOCK, D1E-EU-VD-PARTIAL-FACTOR, D1E-EU-VD-STRAIN-LIMITS",
    riskImpact: "EU architecture bounded; numerical conformance remaining",
  },
  {
    phase: "EOS-D1E-US-1",
    scope: "ACI family / building-code adoption / local amendment / direct-contract binding",
    commit: "a3a4ae0cbc1a3a324dc9b5cdefc92f3c47221c22",
    verdict: "PASS",
    implementedCapability: "US ACI concrete standard-context governance",
    frameworkOnlyCapability: "ACI 318 resistance equations and populated adoption datasets",
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "edition/adoption/amendment datasets unpopulated",
    validationDebt: "D1E-VD-US-EDITION, adoption/amendment catalogs",
    riskImpact: "US architecture bounded; identity remaining",
  },
  {
    phase: "EOS-D1E-US-2",
    scope: "ACI-profile uniaxial flexure framework consuming D1E-1",
    commit: "28a89fbc31df25a894bfefa8e7b7381ebead02ab",
    verdict: "PASS_WITH_LIMITATIONS",
    implementedCapability: "US flexure pipeline + D1E-1 elastic reference reuse",
    frameworkOnlyCapability: "ACI 318 flexural resistance equations",
    validationState: "MECHANICS_REFERENCE_BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    releaseState: "INTERNAL_ENGINEERING_REFERENCE",
    knownLimitations: "no implemented US code flexure methods; edition/adoption unpopulated",
    validationDebt: "D1E-US-VD-STRESS-BLOCK, D1E-US-VD-PHI, D1E-US-VD-STRAIN-LIMITS",
    riskImpact: "three-jurisdiction architecture complete; numerical code methods remaining",
  },
];

export const D1E_SOURCE_CONTROL_ANOMALIES: readonly string[] = [];

export function assertD1ePhaseInventoryComplete(): void {
  if (!D1E_PHASE_INVENTORY_COMPLETE) throw new Error("D1E phase inventory must be complete");
  if (D1E_PHASE_INVENTORY.length !== 7) throw new Error("D1E phase inventory must contain seven closeout records");
  const expected = [
    "EOS-D1E-0",
    "EOS-D1E-1",
    "EOS-D1E-AU-1",
    "EOS-D1E-EU-1",
    "EOS-D1E-EU-2",
    "EOS-D1E-US-1",
    "EOS-D1E-US-2",
  ];
  if (D1E_PHASE_INVENTORY.map((row) => row.phase).join() !== expected.join()) {
    throw new Error("D1E phase inventory order drifted");
  }
  if (D1E_PHASE_INVENTORY.some((row) => !/^[0-9a-f]{40}$/.test(row.commit))) {
    throw new Error("D1E phase inventory requires full commit SHAs");
  }
  if (D1E_SOURCE_CONTROL_TRACEABILITY !== "PASS" || D1E_SOURCE_CONTROL_ANOMALIES.length > 0) {
    throw new Error("D1E source-control traceability must pass with no anomalies");
  }
}
