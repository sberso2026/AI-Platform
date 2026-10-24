import type { EuC1bInventoryReclassRow, EuC1bParameterProvenance, EuC1bRuleEvidenceRecord } from "@rtb/types";
import {
  EU_C1B_IMPLEMENTABLE_NUMERICAL_RULE_COUNT,
  EU_C1B_IMPLEMENTABLE_REFERENCE_RULE_COUNT,
} from "@rtb/types";
import { EU_C1A_PLANNED_RULE_IDS } from "../eu-c1a";
import { formulaFingerprint } from "./fingerprint";

const INTENDED = {
  standardFamily: "EN 1992" as const,
  standardPart: "EN_1992_1_1" as const,
  intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION" as const,
  intendedEdition: "UNKNOWN_PENDING_CONFIRMATION" as const,
  conformanceState: "INTENDED_PROFILE" as const,
  version: "c1b.0" as const,
  requiresEngineerValidation: true as const,
  engineeringValidationState: "REQUIRED_FOR_PROMOTION" as const,
};

function blocked(
  ruleId: string,
  ruleCategory: string,
  ruleClass: EuC1bRuleEvidenceRecord["ruleClass"],
  blockedReason: string,
): EuC1bRuleEvidenceRecord {
  return {
    ...INTENDED,
    ruleId,
    ruleCategory,
    authorityType: "UNBOUND",
    sourceReference: "NO_GOVERNED_COEFFICIENT_SOURCE_IN_REPOSITORY",
    sourceType: "UNBOUND",
    formulaFingerprint: null,
    parameterIds: [],
    units: null,
    applicability: "UNBOUND_PENDING_GOVERNED_ENGINEERING_REFERENCE",
    corroboratingEvidenceRefs: [],
    numericalValidationState: "NOT_STARTED",
    provenance: "C1B reclassification: licensed standard file is not the blocker; no independently governed coefficient/formula source is bound",
    ruleClass,
    maturityClaimed: null,
    nationalChoiceRequired: "UNRESOLVED",
    referenceEvidenceAvailable: false,
    implementable: false,
    stillBlocked: true,
    blockedReason,
    independentValidationPlan: "Bind a governed engineering reference plus one independent corroborating source plus deterministic tests before C1 implements this rule",
  };
}

const CONCRETE_CHAR: EuC1bRuleEvidenceRecord = {
  ...INTENDED,
  ruleId: "EU_C1_CONCRETE_CHAR_PROPERTIES",
  ruleCategory: "CONCRETE_CHARACTERISTIC_PROPERTIES",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  sourceReference: "packages/engineering-os/src/structural-concrete/materials.ts#requireConcreteMaterialProperties",
  sourceType: "VALIDATED_CORPORATE_DESIGN_PROCEDURE",
  formulaFingerprint: formulaFingerprint({
    ruleId: "EU_C1_CONCRETE_CHAR_PROPERTIES",
    operations: ["REQUIRE_EXPLICIT_GOVERNED_PROPERTY", "FORBID_GRADE_SYNTHESIS"],
    parameterIds: ["compressiveStrength", "elasticModulus"],
  }),
  parameterIds: ["compressiveStrength", "elasticModulus"],
  units: "property-specific; required at calculation input",
  applicability: "EN 1992 / EN_1992_1_1 intended profile; ULS/SLS material input; no National Annex required",
  corroboratingEvidenceRefs: [
    "packages/types/src/structural-concrete.ts governed-property contract",
    "packages/engineering-os/src/structural-concrete/eos-d1e1.test.ts",
  ],
  numericalValidationState: "PLAN_ONLY",
  provenance: "D1E-1 fail-closed material contract; characteristic values are calculation inputs, not pack constants",
  ruleClass: "MATERIAL_SPECIFIC",
  maturityClaimed: "REFERENCE_IMPLEMENTED",
  nationalChoiceRequired: false,
  referenceEvidenceAvailable: true,
  implementable: true,
  stillBlocked: false,
  blockedReason: null,
  independentValidationPlan: "C1 reuses requireConcreteMaterialProperties; add invalid-input and missing-provenance unit tests; no coefficient invention",
};

const REO_CHAR: EuC1bRuleEvidenceRecord = {
  ...INTENDED,
  ruleId: "EU_C1_REINFORCEMENT_CHAR_PROPERTIES",
  ruleCategory: "REINFORCEMENT_CHARACTERISTIC_PROPERTIES",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  sourceReference: "packages/engineering-os/src/structural-concrete/materials.ts#requireReinforcementMaterialProperties",
  sourceType: "VALIDATED_CORPORATE_DESIGN_PROCEDURE",
  formulaFingerprint: formulaFingerprint({
    ruleId: "EU_C1_REINFORCEMENT_CHAR_PROPERTIES",
    operations: ["REQUIRE_EXPLICIT_GOVERNED_PROPERTY", "FORBID_DESIGNATION_AREA_INFERENCE"],
    parameterIds: ["yieldStrength", "elasticModulus", "area"],
  }),
  parameterIds: ["yieldStrength", "elasticModulus", "area"],
  units: "property-specific; required at calculation input",
  applicability: "EN 1992 / EN_1992_1_1 intended profile; reinforcement input; no National Annex required",
  corroboratingEvidenceRefs: [
    "packages/engineering-os/src/structural-concrete/materials.ts#assertBarAreaNotInferredFromDesignation",
    "packages/engineering-os/src/structural-concrete/eos-d1e1.test.ts",
  ],
  numericalValidationState: "PLAN_ONLY",
  provenance: "D1E-1 fail-closed reinforcement contract; fy/Es/area are calculation inputs, not pack constants",
  ruleClass: "MATERIAL_SPECIFIC",
  maturityClaimed: "REFERENCE_IMPLEMENTED",
  nationalChoiceRequired: false,
  referenceEvidenceAvailable: true,
  implementable: true,
  stillBlocked: false,
  blockedReason: null,
  independentValidationPlan: "C1 reuses requireReinforcementMaterialProperties and explicit bar area; add missing-input tests",
};

const TENSION: EuC1bRuleEvidenceRecord = {
  ...INTENDED,
  ruleId: "EU_C1_CONCRETE_TENSION_TREATMENT",
  ruleCategory: "CONCRETE_COMPRESSION_RESPONSE",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  sourceReference: "D1E-1/EU adapter explicit-null tension treatment; no invented ULS tensile capacity",
  sourceType: "ESTABLISHED_ENGINEERING_MECHANICS",
  formulaFingerprint: formulaFingerprint({
    ruleId: "EU_C1_CONCRETE_TENSION_TREATMENT",
    operations: ["ULS_FLEXURE_DO_NOT_INVENT_CONCRETE_TENSION", "REQUIRE_GOVERNED_MODEL_IF_INCLUDED"],
    parameterIds: ["concreteTensionIncludedInUlsFlexure"],
  }),
  parameterIds: ["concreteTensionIncludedInUlsFlexure"],
  units: "dimensionless boolean",
  applicability: "ULS flexural section analysis under intended EN 1992-1-1 profile; not a National Annex choice",
  corroboratingEvidenceRefs: [
    "packages/engineering-os/src/structural-concrete/eu-c1a/evidence.ts EU_C1_CONCRETE_TENSION_TREATMENT explicit-null",
    "packages/engineering-os/src/structural-concrete/eos-d1e-eu1.test.ts unpopulated constitutive slots",
  ],
  numericalValidationState: "PLAN_ONLY",
  provenance: "Fail-closed: concrete ULS flexural tension is omitted unless a later governed constitutive model is bound; boolean false is not an EN 1992 coefficient",
  ruleClass: "ESTABLISHED_MECHANICS",
  maturityClaimed: "REFERENCE_IMPLEMENTED",
  nationalChoiceRequired: false,
  referenceEvidenceAvailable: true,
  implementable: true,
  stillBlocked: false,
  blockedReason: null,
  independentValidationPlan: "C1 keeps tension omitted; tests must fail closed if a tensile capacity is invented without a governed model",
};

const BLOCKED_COEFFICIENT = "no independently governed coefficient/formula source is bound in-repository; licensed standard PDF is not the blocker";

export const EU_C1B_RULE_EVIDENCE_RECORDS: readonly EuC1bRuleEvidenceRecord[] = [
  CONCRETE_CHAR,
  blocked("EU_C1_CONCRETE_DESIGN_PROPERTIES", "CONCRETE_DESIGN_PROPERTIES", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  REO_CHAR,
  blocked("EU_C1_REINFORCEMENT_DESIGN_PROPERTIES", "REINFORCEMENT_DESIGN_PROPERTIES", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  blocked("EU_C1_PARTIAL_FACTOR_GAMMA_C", "PARTIAL_FACTORS", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  blocked("EU_C1_PARTIAL_FACTOR_GAMMA_S", "PARTIAL_FACTORS", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  blocked("EU_C1_CONCRETE_COMPRESSION_RESPONSE", "CONCRETE_COMPRESSION_RESPONSE", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  TENSION,
  blocked("EU_C1_CONCRETE_STRAIN_LIMITS", "CONCRETE_STRAIN_LIMITS", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  blocked("EU_C1_REINFORCEMENT_RESPONSE", "REINFORCEMENT_RESPONSE", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  blocked("EU_C1_REINFORCEMENT_STRAIN_STATES", "REINFORCEMENT_STRAIN_STATES", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
  blocked("EU_C1_STRESS_BLOCK_OR_SECTION_MODEL", "STRESS_BLOCK_OR_SECTION_MODEL", "STANDARD_SPECIFIC", BLOCKED_COEFFICIENT),
];

export const EU_C1B_INVENTORY_RECLASS: readonly EuC1bInventoryReclassRow[] = EU_C1B_RULE_EVIDENCE_RECORDS.map((row) => ({
  ruleId: row.ruleId,
  REFERENCE_EVIDENCE_AVAILABLE: row.referenceEvidenceAvailable,
  IMPLEMENTABLE: row.implementable,
  REQUIRES_NATIONAL_CHOICE: row.nationalChoiceRequired,
  REQUIRES_ENGINEER_VALIDATION: true,
  STILL_BLOCKED: row.stillBlocked,
  blockedReason: row.blockedReason,
}));

export const EU_C1B_PARAMETER_PROVENANCE: readonly EuC1bParameterProvenance[] = [
  {
    parameterId: "compressiveStrength",
    value: null,
    valueMode: "EXPLICIT_CALCULATION_INPUT" as const,
    units: "explicit at input",
    authority: "ESTABLISHED_ENGINEERING_MECHANICS" as const,
    source: "calculation material catalogue / test certificate",
    applicability: "concrete characteristic input",
    version: "c1b.0",
    validationStatus: "CALCULATION_INPUT" as const,
  },
  {
    parameterId: "elasticModulus",
    value: null,
    valueMode: "EXPLICIT_CALCULATION_INPUT" as const,
    units: "explicit at input",
    authority: "ESTABLISHED_ENGINEERING_MECHANICS" as const,
    source: "calculation material catalogue / test certificate",
    applicability: "concrete or reinforcement characteristic input",
    version: "c1b.0",
    validationStatus: "CALCULATION_INPUT" as const,
  },
  {
    parameterId: "yieldStrength",
    value: null,
    valueMode: "EXPLICIT_CALCULATION_INPUT" as const,
    units: "explicit at input",
    authority: "ESTABLISHED_ENGINEERING_MECHANICS" as const,
    source: "calculation reinforcement catalogue / product standard",
    applicability: "reinforcement characteristic input",
    version: "c1b.0",
    validationStatus: "CALCULATION_INPUT" as const,
  },
  {
    parameterId: "area",
    value: null,
    valueMode: "EXPLICIT_CALCULATION_INPUT" as const,
    units: "explicit at input",
    authority: "ESTABLISHED_ENGINEERING_MECHANICS" as const,
    source: "explicit bar geometry; designation must not infer area",
    applicability: "reinforcement geometry input",
    version: "c1b.0",
    validationStatus: "CALCULATION_INPUT" as const,
  },
  {
    parameterId: "concreteTensionIncludedInUlsFlexure",
    value: false,
    valueMode: "PACK_CONSTANT" as const,
    units: "dimensionless boolean",
    authority: "ESTABLISHED_ENGINEERING_MECHANICS" as const,
    source: "D1E-1/EU fail-closed explicit-null tension treatment",
    applicability: "ULS flexure unless a later governed tension model is bound",
    version: "c1b.0",
    validationStatus: "BOUND" as const,
  },
  {
    parameterId: "gamma_c",
    value: null,
    valueMode: "UNBOUND_PENDING_GOVERNED_SOURCE" as const,
    units: null,
    authority: "UNBOUND" as const,
    source: "unbound; not guessed; NDP vs base-standard class unresolved pending evidence",
    applicability: "unbound",
    version: "c1b.0",
    validationStatus: "UNBOUND" as const,
  },
  {
    parameterId: "gamma_s",
    value: null,
    valueMode: "UNBOUND_PENDING_GOVERNED_SOURCE" as const,
    units: null,
    authority: "UNBOUND" as const,
    source: "unbound; not guessed; NDP vs base-standard class unresolved pending evidence",
    applicability: "unbound",
    version: "c1b.0",
    validationStatus: "UNBOUND" as const,
  },
];

export function assertEuC1bInventoryComplete(): void {
  const ids = EU_C1B_RULE_EVIDENCE_RECORDS.map((row) => row.ruleId);
  if (ids.length !== EU_C1A_PLANNED_RULE_IDS.length) throw new Error("C1B inventory must reclassify every C1A planned rule");
  for (const id of EU_C1A_PLANNED_RULE_IDS) {
    if (!ids.includes(id)) throw new Error(`C1B missing C1A rule ${id}`);
  }
  const implementable = EU_C1B_INVENTORY_RECLASS.filter((row) => row.IMPLEMENTABLE).length;
  if (implementable !== EU_C1B_IMPLEMENTABLE_REFERENCE_RULE_COUNT) {
    throw new Error("C1B implementable reference count drifted");
  }
  if (implementable !== EU_C1B_IMPLEMENTABLE_NUMERICAL_RULE_COUNT) {
    throw new Error("C1B implementable numerical count drifted");
  }
}
