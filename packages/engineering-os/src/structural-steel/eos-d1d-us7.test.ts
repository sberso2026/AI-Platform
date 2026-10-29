import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_AISC_STRENGTH_PROMOTION_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_DESIGN_METHOD_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_SERVICEABILITY_CRITERION_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE,
  AISC_UNKNOWN_EDITION_TOKEN,
  AU_CODE_RULES_REUSED_AS_US_RULES,
  AUTOMATIC_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DEFAULT_K_FACTOR,
  DEFAULT_LRFD_OR_ASD,
  DEFAULT_US_DEFLECTION_LIMIT_GUESSED,
  DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE,
  EOS_D1D_US7_PHASE,
  EU_CODE_RULES_REUSED_AS_US_RULES,
  EU_ONLY_STEEL_CORE,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED,
  MECHANICS_COMPLETE_EQUALS_AISC_DESIGN_COMPLETE,
  MECHANICS_ONLY_RESULTS_ALLOW_AISC_DESIGN_PASS,
  MIXED_LRFD_ASD_MEMBER_DESIGN_ALLOWED,
  NEW_INTERACTION_METHOD_IMPLEMENTED_IN_US7,
  PARALLEL_US_MEMBER_ORCHESTRATION_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_US7,
  SILENT_AISC_EDITION_INFERENCE,
  US6_INTERACTION_LIMITATION_PROPAGATED,
  US7_AUTOMATIC_APPROVAL,
  US7_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_MEMBER_CHECK_EQUALS_CONNECTION_CHECK,
  US_MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL,
  US_MEMBER_CHECK_EQUALS_GLOBAL_FRAME_STABILITY,
  US_CONNECTION_DESIGN_VALIDATED,
  US_MEMBER_PILOT_EXPOSURE,
  US_MEMBER_SEISMIC_DESIGN_VALIDATED,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  US_SPAN_RATIO_DENOMINATOR_GUESSED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_STEEL_RELEASE_CLASSIFICATION,
  US_UNIVERSAL_MEMBER_UTILIZATION,
  US_VIBRATION_DESIGN_IMPLEMENTED,
  type BuildingCodeAdoptionContext,
  type SteelCapacityEngineInput,
  type SteelCombinedCapacityComponent,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelMemberDesignCheckRow,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
  type StructuralStandardContext,
  type USSteelDesignContext,
  type USSteelServiceabilityContext,
  type UsStabilityAnalysisContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_EU_MEMBER_ORCHESTRATION_REVIEW,
  AU_MEMBER_ORCHESTRATION_REVIEWED,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_MEMBER_ORCHESTRATION_REUSED_WHERE_VALID,
  D1D_US7_D0_RISK_DISPOSITION,
  EU_MEMBER_CHECK_TAXONOMY,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_BENDING_METHODS,
  IMPLEMENTED_US_COMPRESSION_METHODS,
  IMPLEMENTED_US_INTERACTION_METHODS,
  IMPLEMENTED_US_SHEAR_METHODS,
  IMPLEMENTED_US_TENSION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_AU_MEMBER_ORCHESTRATION_REVIEWED,
  US_EU_MEMBER_ORCHESTRATION_REVIEWED,
  US_MEMBER_CHECK_TAXONOMY,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  aggregateEngineeringCheckState,
  assertAiCannotApproveUsMember,
  assertAiscMemberEditionIsolation,
  assertCandidateFullUsMemberRecheck,
  denyAiUsBuildingCodeCompliance,
  denyAiUsDesignMethodSelection,
  denyAiUsMechanicsToAiscPromotion,
  denyAiUsServiceabilityCriterion,
  denyAiUsStabilityMethod,
  detectRequiredInteractions,
  evaluateSteelCapacity,
  explainUsMemberDesign,
  orchestrateAuSteelMemberDesign,
  orchestrateEuSteelMemberDesign,
  orchestrateUsSteelMemberDesign,
  requestUsDefaultDeflectionLimit,
  requestUsGuessedSpanRatioDenominator,
  usElementClassificationState,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function adoption(overrides: Partial<BuildingCodeAdoptionContext> = {}): BuildingCodeAdoptionContext {
  return {
    adoptionId: "adopt-ca-ibc",
    jurisdiction: "california",
    adoptingAuthority: "state-of-california",
    buildingCodeFamily: "IBC",
    buildingCodeEdition: "UNKNOWN_PENDING_CONFIRMATION",
    effectiveDate: null,
    localAmendmentSetRef: null,
    referencedStandards: ["AISC 360", "ASCE 7"],
    projectOverrideRefs: [],
    validationState: "FRAMEWORK_ONLY",
    sourceAuthorityRef: "metadata-reference-only",
    ...overrides,
  };
}

function usSteel(overrides: Partial<USSteelDesignContext> = {}): USSteelDesignContext {
  return {
    contextId: "ctx-us-member",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us7",
    assetId: "asset-1",
    jurisdictionProfileRef: "united-states",
    buildingCodeAdoptionRef: "adopt-ca-ibc",
    buildingCodeAdoption: adoption(),
    steelStandardFamily: "AISC",
    steelStandardId: "AISC_360",
    steelStandardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    amendmentErrataState: AISC_UNKNOWN_EDITION_TOKEN,
    designMethod: "LRFD",
    unitSystem: "US_CUSTOMARY",
    referencedStandardRefs: ["ASCE 7"],
    localAmendmentSetRef: null,
    localAmendment: null,
    loadStandard: {
      standardId: "ASCE_7",
      standardCode: "ASCE 7",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      combinationBasis: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    seismicApplicable: false,
    seismicStandard: null,
    connectionStandardRefs: ["RCSC", "AISC 358"],
    materialSourceKind: "PROJECT_SPECIFICATION",
    sectionCatalogRef: null,
    projectStandardContextRef: "proj-us7",
    calculationContextRef: "calc-us7",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us7:member",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStandard(id = "ctx-aisc-us7"): StructuralStandardContext {
  return createConfiguredKnowledgeContext({
    contextId: id,
    jurisdictionProfileRef: "united-states",
    standardFamily: "AISC",
    standardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    materialScope: "steel",
  });
}

function usStability(overrides: Partial<UsStabilityAnalysisContext> = {}): UsStabilityAnalysisContext {
  return {
    method: "EFFECTIVE_LENGTH_BASED",
    secondOrder: "FIRST_ORDER",
    mixedMethods: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us7-uls",
    memberId: "m-us7",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
    axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "ULS demand is not a serviceability demand" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-uls" }],
    combinationId: "comb-uls",
    ...patch,
  };
}

function slsDemand(context: StructuralStandardContext): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us7-sls",
    memberId: "m-us7",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { value: 0.02, unit: "m", locationM: 4, signed: 0.02 },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c-sls", sourceKind: "calculation", reference: "d1c-sls" }],
    combinationId: "comb-sls",
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us7",
    grade: "A992",
    yieldStrength: { name: "Fy", value: 345, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "Fu", value: 450, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["united-states"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-us7",
    sectionFamily: "W",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["united-states"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 222_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 23_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: { name: "Sx", value: 1_000_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusZz: { name: "Sy", value: 200_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: { name: "J", value: 500_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    warpingConstant: { name: "Cw", value: 200_000_000_000, unit: "mm6", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    shearArea: { name: "Aw", value: 5_000, unit: "mm2", provenanceRef: "engineer-shear-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webDepth: { name: "h", value: 300, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webThickness: { name: "tw", value: 8, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
  };
}

function stability(): SteelStabilityContext {
  return {
    stabilityContextId: "stab-us7",
    memberLengthM: 8,
    effectiveLengthM: 8,
    unbracedLengthM: 8,
    restraintDescription: "pinned ends, explicit Le supplied",
    bucklingAxis: "BOTH",
    momentGradientRef: "uniform-moment",
    torsionalRestraint: "fork-supports",
    lateralRestraint: "discrete-end-flange",
    sourceEvidenceRef: "engineer-effective-length",
    derived: false,
    effectiveLengthMajorM: 8,
    effectiveLengthMinorM: 8,
    effectiveLengthProvenanceRef: "engineer-effective-length",
    unbracedLengthProvenanceRef: "engineer-unbraced-length",
    warpingRestraint: "fork-supports",
    momentDistributionDescription: "uniform-moment",
    loadApplicationPosition: "shear-centre",
  };
}

function designContext(context: StructuralStandardContext, demandId = "demand-us7-uls"): SteelDesignContext {
  return {
    designContextId: "dc-us7",
    memberRef: "m-us7",
    sectionRef: "sec-us7",
    materialRef: "mat-us7",
    demandRefs: [demandId],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-us7",
    restraintContextRef: "stab-us7",
    stabilityContextRef: "stab-us7",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_MEMBER_DESIGN",
    methodRef: "US_MEMBER",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_MEMBER" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  const standardContext = patch.standardContext ?? usStandard();
  return {
    adapterId: "US_STEEL",
    designContext: designContext(standardContext),
    standardContext,
    material: material(),
    section: section(),
    stability: null,
    demand: demand(standardContext),
    limitState: "TENSION",
    requiredProperties: [],
    usSteelContext: usSteel(),
    usStabilityContext: usStability(),
    ...patch,
  };
}

function criterion(patch: Partial<USSteelServiceabilityContext> = {}): USSteelServiceabilityContext {
  const context = usStandard();
  return {
    memberRef: "m-us7",
    serviceabilityDemandRef: "demand-us7-sls",
    criterionRef: "proj-defl-25mm",
    criterionType: "ABSOLUTE_DISPLACEMENT",
    criterionValue: 25,
    criterionUnits: "mm",
    criterionSource: "PROJECT_REQUIREMENT",
    loadCaseOrCombinationRef: "comb-sls",
    projectRequirementRef: "PR-SLS-1",
    standardProfileRef: context.contextId,
    evidenceRef: "ev-sls",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_SLS" }),
    validationState: "HUMAN_CONFIRMED_RULE",
    spanM: 8,
    loadBasisRef: "SERVICE",
    buildingCodeContextRef: "adopt-ca-ibc",
    directContractProfileRef: null,
    localAmendmentSetRef: null,
    standardContextRef: context.contextId,
    clientRequirementRef: null,
    technicalBasisRef: "project-deflection-limit",
    criterionRequiresBuildingCode: false,
    criterionRequiresLocalAmendment: false,
    ...patch,
  };
}

function memberInput(patch: Partial<Parameters<typeof orchestrateUsSteelMemberDesign>[0]> = {}) {
  return {
    designRecordId: "rec-us7",
    createdAt: "2026-10-06T00:00:00.000Z",
    version: 1,
    capacityInput: capacityInput(),
    ...patch,
  };
}

function extraCapacity(kind: SteelCombinedCapacityComponent["kind"], designMethod: "LRFD" | "ASD"): SteelCombinedCapacityComponent {
  return {
    capacityResultId: `cap-us7-${kind}-${designMethod}`,
    methodId: `US_${kind}_REFERENCE`,
    memberId: "m-us7",
    combinationId: "comb-uls",
    kind,
    value: 1,
    unit: "N",
    standardProfileRef: "ctx-aisc-us7",
    maturity: "IMPLEMENTED",
    designMethod,
  };
}

function satisfiedRow(kind: SteelMemberDesignCheckRow["checkKind"]): SteelMemberDesignCheckRow {
  return {
    checkKind: kind,
    applicable: true,
    state: "CHECK_SATISFIED",
    completeness: "COMPLETE",
    incompleteReason: null,
    checkRef: `chk:${kind}`,
    utilization: 0.4,
    utilizationComparable: true,
    reportLanguage: "ok",
    methodMaturity: "IMPLEMENTED",
    authority: "CODE_PROFILE",
  };
}

describe("EOS-D1D-US-7 US steel member design orchestration", () => {
  it("reviews AU/EU member orchestration and keeps mechanics, AISC, building-code, and approval separate", () => {
    expect(EOS_D1D_US7_PHASE).toBe("EOS-D1D-US-7");
    expect(US_AU_MEMBER_ORCHESTRATION_REVIEWED).toBe(true);
    expect(US_EU_MEMBER_ORCHESTRATION_REVIEWED).toBe(true);
    expect(AU_MEMBER_ORCHESTRATION_REVIEWED).toBe(true);
    expect(COMMON_MEMBER_ORCHESTRATION_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(EU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(PARALLEL_US_MEMBER_ORCHESTRATION_CREATED).toBe(false);
    expect(AU_EU_MEMBER_ORCHESTRATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(AU_EU_MEMBER_ORCHESTRATION_REVIEW.some((row) => row.classification === "AU_SPECIFIC")).toBe(true);
    expect(AU_EU_MEMBER_ORCHESTRATION_REVIEW.some((row) => row.classification === "EU_SPECIFIC")).toBe(true);
    expect(US_MEMBER_CHECK_TAXONOMY).toEqual(expect.arrayContaining(["TENSION", "COMPRESSION_STABILITY", "LTB", "WEB_STABILITY", "COMBINED_ACTION", "DEFLECTION"]));
    expect(EU_MEMBER_CHECK_TAXONOMY).toEqual(expect.arrayContaining(["TENSION", "COMBINED_ACTION", "DEFLECTION"]));
    const record = orchestrateUsSteelMemberDesign(memberInput());
    expect(record.memberRef).toBe("m-us7");
    expect(record.standardContextRef).toMatch(/aisc-us7/);
    expect(record.edition).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    expect(record.aiscAmendmentState).toBe(AISC_UNKNOWN_EDITION_TOKEN);
    expect(record.designMethod).toBe("LRFD");
    expect(record.mechanicsEvaluationState).toBe("COMPLETE_FOR_AVAILABLE_MECHANICS");
    expect(record.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    expect(record.overallEngineeringCheckState).toBe("CHECK_UNDETERMINED");
    expect(record.engineeringCheckState).toBe("CHECK_UNDETERMINED");
    expect(record.buildingCodeComplianceState).toBe("COMPLIANCE_NOT_VALIDATED");
    expect(record.approvalState).toBe("not_approved");
    expect(record.aiscCompliantClaim).toBe(false);
    expect(record.buildingCodeCompliantClaim).toBe(false);
    expect(record.humanReviewState).toBe("NOT_REVIEWED");
    expect(MECHANICS_COMPLETE_EQUALS_AISC_DESIGN_COMPLETE).toBe(false);
    expect(MECHANICS_ONLY_RESULTS_ALLOW_AISC_DESIGN_PASS).toBe(false);
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.authority).toBe("MECHANICS_REFERENCE");
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.state).toBe("CHECK_UNDETERMINED");
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.utilization).not.toBeNull();
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.incompleteReason).toBe("CODE_METHOD_UNAVAILABLE");
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(record.codeProfileStrengthRefs).toEqual([]);
    expect(usElementClassificationState()).toBe("VALIDATION_REQUIRED");
    expect(record.classificationRefs).toEqual(["VALIDATION_REQUIRED"]);
    expect(record.localBucklingRefs).toEqual([]);
  });

  it("orchestrates single-action mechanics without treating them as AISC pass", () => {
    const tension = orchestrateUsSteelMemberDesign(memberInput());
    expect(tension.applicableCheckRegistry).toEqual(["TENSION"]);
    expect(tension.mechanicsEvaluationState).toBe("COMPLETE_FOR_AVAILABLE_MECHANICS");
    expect(tension.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const compression = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(usStandard(), { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        stability: stability(),
      }),
    }));
    expect(compression.applicableCheckRegistry).toEqual(expect.arrayContaining(["COMPRESSION", "STABILITY_COMPRESSION"]));
    expect(compression.stabilityAnalysisContextRef).toBe("EFFECTIVE_LENGTH_BASED");
    expect(compression.fingerprint.effectiveLengthMajorM).toBe(8);
    expect(DEFAULT_K_FACTOR).toBe(false);
    expect(compression.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const bending = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(usStandard(), {
          axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
          moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
        }),
        stability: stability(),
      }),
    }));
    expect(bending.applicableCheckRegistry).toEqual(expect.arrayContaining(["BENDING_MAJOR", "STABILITY_LTB"]));
    expect(bending.fingerprint.unbracedLengthM).toBe(8);
    expect(bending.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const shear = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(usStandard(), {
          axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
          shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
        }),
        shear: { shearAxis: "MAJOR_SHEAR", stiffenerState: "UNSTIFFENED", shearBucklingCoefficient: null, stiffenerSpacing: null },
      }),
    }));
    expect(shear.applicableCheckRegistry).toEqual(expect.arrayContaining(["SHEAR_MAJOR", "WEB_STABILITY"]));
    expect(shear.completenessMatrix.find((row) => row.checkKind === "WEB_STABILITY")?.incompleteReason).toBe("CODE_METHOD_UNAVAILABLE");
    expect(shear.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
  });

  it("requires US-6 interaction and rejects mixed LRFD/ASD, load mismatch, and mixed stability methods", () => {
    expect(IMPLEMENTED_US_INTERACTION_METHODS).toEqual([]);
    expect(NEW_INTERACTION_METHOD_IMPLEMENTED_IN_US7).toBe(false);
    expect(US6_INTERACTION_LIMITATION_PROPAGATED).toBe(true);
    expect(MIXED_LRFD_ASD_MEMBER_DESIGN_ALLOWED).toBe(false);
    const multi = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(usStandard(), { moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        stability: stability(),
      }),
    }));
    expect(detectRequiredInteractions(capacityInput({
      demand: demand(usStandard(), { moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
    }))).toContain("TENSION_BENDING");
    expect(multi.applicableCheckRegistry).toEqual(expect.arrayContaining(["TENSION", "BENDING_MAJOR", "COMBINED_ACTION"]));
    expect(multi.completenessMatrix.find((row) => row.checkKind === "COMBINED_ACTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(multi.completenessMatrix.find((row) => row.checkKind === "COMBINED_ACTION")?.completeness).toBe("INCOMPLETE_INTERACTION");
    expect(multi.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    const synthetic = aggregateEngineeringCheckState([
      satisfiedRow("TENSION"),
      satisfiedRow("BENDING_MAJOR"),
      {
        ...satisfiedRow("COMBINED_ACTION"),
        state: "CHECK_UNDETERMINED",
        completeness: "INCOMPLETE_INTERACTION",
        incompleteReason: "INTERACTION_METHOD_UNAVAILABLE",
        utilization: null,
        utilizationComparable: false,
      },
    ]);
    expect(synthetic).toBe("CHECK_UNDETERMINED");
    expect(() => orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        usSteelContext: usSteel({ designMethod: null }),
      }),
    }))).toThrow(/DESIGN_METHOD_REQUIRED/);
    expect(() => orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        combined: {
          combinationRef: "comb-uls",
          componentDemands: [],
          componentCapacities: [extraCapacity("TENSION", "LRFD"), extraCapacity("BENDING_MAJOR", "ASD")],
        },
      }),
    }))).toThrow(/mixed LRFD\/ASD/);
    expect(() => orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        usSteelContext: usSteel({
          designMethod: "ASD",
          loadStandard: {
            standardId: "ASCE_7",
            standardCode: "ASCE 7",
            edition: AISC_UNKNOWN_EDITION_TOKEN,
            combinationBasis: "STRENGTH",
            implemented: false,
          },
        }),
      }),
    }))).toThrow(/LOAD_BASIS_INCOMPATIBLE/);
    expect(() => orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ usStabilityContext: usStability({ mixedMethods: true }) }),
    }))).toThrow(/cannot mix/);
  });

  it("propagates a failed governed check and never treats satisfaction as AISC, building-code, or approval", () => {
    const failed = aggregateEngineeringCheckState([
      { ...satisfiedRow("TENSION"), state: "CHECK_UNDETERMINED", completeness: "INCOMPLETE_METHOD_UNAVAILABLE", incompleteReason: "CODE_METHOD_UNAVAILABLE" },
      { ...satisfiedRow("DEFLECTION"), state: "CHECK_NOT_SATISFIED", authority: "GOVERNED" },
    ]);
    expect(failed).toBe("CHECK_NOT_SATISFIED");
    const sls = slsDemand(usStandard());
    const exceeded = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionValue: 10, criterionUnits: "mm" }),
        demand: sls,
      },
    }));
    expect(exceeded.serviceabilityResult?.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(exceeded.codeDesignCheckState).toBe("CHECK_NOT_SATISFIED");
    expect(exceeded.approvalState).toBe("not_approved");
    expect(exceeded.humanReviewState).toBe("NOT_REVIEWED");
    expect(AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(exceeded.buildingCodeComplianceState).not.toBe("COMPLIANCE_VALIDATED");
    expect(US7_AUTOMATIC_APPROVAL).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED).toBe(false);
  });

  it("reuses D1C deflection, accepts governed criteria, and fails closed without a criterion or amendment", () => {
    const sls = slsDemand(usStandard());
    const withLimit = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: { context: criterion(), demand: sls },
    }));
    expect(withLimit.serviceabilityResult?.demandRef).toBe("demand-us7-sls");
    expect(withLimit.serviceabilityResult?.loadContextRef).toBe("comb-sls");
    expect(withLimit.serviceabilityResult?.checkState).toBe("CHECK_SATISFIED");
    expect(withLimit.demandSetRef).toBe("demand-us7-uls");
    expect(withLimit.loadCombinationRefs).toEqual(expect.arrayContaining(["comb-uls", "comb-sls"]));

    const client = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: { context: criterion({ criterionSource: "CLIENT_REQUIREMENT", clientRequirementRef: "CL-SLS-1" }), demand: sls },
    }));
    expect(client.serviceabilityResult?.criterionSource).toBe("CLIENT_REQUIREMENT");

    const missing = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionRef: null, criterionType: null, criterionValue: null, criterionUnits: null, criterionSource: null }),
        demand: sls,
      },
    }));
    expect(missing.completenessMatrix.find((row) => row.checkKind === "DEFLECTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(missing.serviceabilityResult?.reason).toBe("SERVICEABILITY_CRITERION_REQUIRED");
    expect(missing.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const span = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionType: "SPAN_RATIO", criterionValue: 400, criterionUnits: "1", criterionRef: "proj-L400" }),
        demand: sls,
      },
    }));
    expect(span.serviceabilityResult?.allowableValue).toBeCloseTo(8 / 400, 10);
    expect(DEFAULT_US_DEFLECTION_LIMIT_GUESSED).toBe(false);
    expect(US_SPAN_RATIO_DENOMINATOR_GUESSED).toBe(false);
    expect(() => requestUsDefaultDeflectionLimit()).toThrow(/unknown required code parameter/);
    expect(() => requestUsGuessedSpanRatioDenominator()).toThrow(/unknown required code parameter/);

    const missingAmendment = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionRequiresLocalAmendment: true, localAmendmentSetRef: null }),
        demand: sls,
      },
    }));
    expect(missingAmendment.serviceabilityResult?.reason).toBe("LOCAL_AMENDMENT_REQUIRED");
    expect(missingAmendment.completenessMatrix.find((row) => row.checkKind === "DEFLECTION")?.incompleteReason).toBe("LOCAL_AMENDMENT_REQUIRED");

    const missingCode = orchestrateUsSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionRequiresBuildingCode: true, buildingCodeContextRef: null }),
        demand: sls,
      },
    }));
    expect(missingCode.serviceabilityResult?.reason).toBe("BUILDING_CODE_CONTEXT_REQUIRED");
  });

  it("invalidates stale fingerprints and keeps no universal utilization", () => {
    const first = orchestrateUsSteelMemberDesign(memberInput());
    expect(() => orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ section: { ...section(), sectionRef: "sec-changed" } }),
      previousFingerprint: first.fingerprint,
      reuseStaleResults: true,
    }))).toThrow(/stale result/);
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ demand: demand(usStandard(), { resultId: "demand-changed" }), designContext: designContext(usStandard(), "demand-changed") }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("LOAD_CHANGED");
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ material: { ...material(), materialRef: "mat-changed" } }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("MATERIAL_CHANGED");
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(usStandard(), { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        stability: { ...stability(), effectiveLengthM: 10, effectiveLengthMajorM: 10 },
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("EFFECTIVE_LENGTH_CHANGED");
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(usStandard(), { axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" }, moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        stability: { ...stability(), unbracedLengthM: 12, restraintDescription: "changed restraint" },
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toEqual(expect.arrayContaining(["UNBRACED_LENGTH_CHANGED", "RESTRAINT_CHANGED"]));
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ usSteelContext: usSteel({ designMethod: "ASD" }) }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("DESIGN_METHOD_CHANGED");
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ usStabilityContext: usStability({ method: "DIRECT_ANALYSIS_BASED" }) }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("STABILITY_METHOD_CHANGED");
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        usSteelContext: usSteel({
          buildingCodeAdoption: adoption({ buildingCodeEdition: "2021" }),
          localAmendmentSetRef: "ca-amend-1",
        }),
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toEqual(expect.arrayContaining(["BUILDING_CODE_EDITION_CHANGED", "LOCAL_AMENDMENT_CHANGED"]));
    expect(orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        usSteelContext: usSteel({ edition: "2016" }),
        standardContext: { ...usStandard(), edition: "2016" },
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toEqual(expect.arrayContaining(["EDITION_CHANGED", "AISC_EDITION_CHANGED"]));
    expect(orchestrateUsSteelMemberDesign(memberInput({
      serviceability: { context: criterion({ criterionRef: "changed-limit" }), demand: slsDemand(usStandard()) },
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("SERVICEABILITY_CRITERION_CHANGED");
    const historical = orchestrateUsSteelMemberDesign(memberInput({ version: 1 }));
    const reproduced = orchestrateUsSteelMemberDesign(memberInput({ version: 1 }));
    expect(reproduced.fingerprint).toEqual(historical.fingerprint);
    expect(US_UNIVERSAL_MEMBER_UTILIZATION).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(first, "overallUtilization")).toBe(false);
    expect(first.optimizationHandoff.optimizationImplemented).toBe(false);
  });

  it("keeps method-not-implemented distinct, isolates AU/EU, and preserves AI/optimizer/pack boundaries", () => {
    const other = orchestrateUsSteelMemberDesign(memberInput({ otherServiceabilityModes: ["VIBRATION"] }));
    expect(other.completenessMatrix.find((row) => row.checkKind === "OTHER_SERVICEABILITY")?.incompleteReason).toBe("METHOD_NOT_IMPLEMENTED");
    expect(other.completenessMatrix.find((row) => row.checkKind === "SHEAR_MAJOR")?.incompleteReason).toBe("NOT_APPLICABLE");
    expect(other.connectionDesignInScope).toBe(false);
    expect(other.foundationAdequacyInScope).toBe(false);
    expect(US_MEMBER_CHECK_EQUALS_CONNECTION_CHECK).toBe(false);
    expect(US_MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL).toBe(false);
    expect(US_MEMBER_CHECK_EQUALS_GLOBAL_FRAME_STABILITY).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(US_VIBRATION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_MEMBER_PILOT_EXPOSURE).toBe(false);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(US_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(other.releaseClassification).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(other.reportLanguage).not.toMatch(/AISC compliant|AISC 360 compliant|US code compliant|building-code compliant|design approved|certified/i);
    const explained = explainUsMemberDesign(other);
    expect(explained.advisoryOnly).toBe(true);
    expect(() => denyAiUsMechanicsToAiscPromotion()).toThrow(/cannot promote mechanics/);
    expect(() => denyAiUsServiceabilityCriterion()).toThrow(/cannot invent a serviceability criterion/);
    expect(() => denyAiUsDesignMethodSelection()).toThrow(/cannot choose LRFD or ASD/);
    expect(() => denyAiUsBuildingCodeCompliance()).toThrow(/cannot claim building-code compliance/);
    expect(() => denyAiUsStabilityMethod()).toThrow(/stability-analysis method/);
    expect(() => assertAiCannotApproveUsMember("AI", "approved")).toThrow(/AI cannot promote result to approval/);
    expect(AI_AISC_STRENGTH_PROMOTION_AUTHORITY).toBe(false);
    expect(AI_DESIGN_METHOD_AUTHORITY).toBe(false);
    expect(AI_SERVICEABILITY_CRITERION_AUTHORITY).toBe(false);
    expect(AI_BUILDING_CODE_COMPLIANCE_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(() => assertCandidateFullUsMemberRecheck({
      candidateSectionRef: "w12x50",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined/);

    const ca = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        usSteelContext: usSteel({
          buildingCodeAdoptionRef: "adopt-ca-ibc",
          buildingCodeAdoption: adoption({ jurisdiction: "california", localAmendmentSetRef: "ca-amend-1" }),
          localAmendmentSetRef: "ca-amend-1",
        }),
      }),
    }));
    const tx = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        usSteelContext: usSteel({
          buildingCodeAdoptionRef: "adopt-tx-ibc",
          buildingCodeAdoption: adoption({
            adoptionId: "adopt-tx-ibc",
            jurisdiction: "texas",
            adoptingAuthority: "state-of-texas",
            localAmendmentSetRef: "tx-amend-1",
          }),
          localAmendmentSetRef: "tx-amend-1",
        }),
      }),
    }));
    expect(ca.localAmendmentSetRef).toBe("ca-amend-1");
    expect(tx.localAmendmentSetRef).toBe("tx-amend-1");
    expect(ca.codeDesignCheckState).toBe(tx.codeDesignCheckState);
    expect(ca.buildingCodeComplianceState).not.toBe("COMPLIANCE_VALIDATED");

    const intlStandard = createConfiguredKnowledgeContext({
      contextId: "ctx-aisc-us7-intl",
      jurisdictionProfileRef: "other",
      standardFamily: "AISC",
      standardCode: "AISC 360",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      materialScope: "steel",
    });
    const international = orchestrateUsSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        standardContext: intlStandard,
        designContext: { ...designContext(intlStandard), standardContextRef: intlStandard.contextId },
        demand: demand(intlStandard),
        usSteelContext: usSteel({
          contextId: "ctx-us-member-intl",
          jurisdictionProfileRef: "other",
          directContractProfile: true,
          buildingCodeAdoption: null,
          buildingCodeAdoptionRef: null,
        }),
      }),
    }));
    expect(international.buildingCodeComplianceState).toBe("NOT_APPLICABLE");
    expect(international.directContractProfileRef).toBe("ctx-us-member-intl");
    expect(DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(international.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const combinations: Array<{ designMethod: "LRFD" | "ASD"; unitSystem: "US_CUSTOMARY" | "SI" }> = [
      { designMethod: "LRFD", unitSystem: "US_CUSTOMARY" },
      { designMethod: "LRFD", unitSystem: "SI" },
      { designMethod: "ASD", unitSystem: "US_CUSTOMARY" },
      { designMethod: "ASD", unitSystem: "SI" },
    ];
    for (const combo of combinations) {
      const record = orchestrateUsSteelMemberDesign(memberInput({
        capacityInput: capacityInput({ usSteelContext: usSteel(combo) }),
      }));
      expect(record.designMethod).toBe(combo.designMethod);
      expect(record.unitSystem).toBe(combo.unitSystem);
      expect(record.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    }

    expect(() => assertAiscMemberEditionIsolation("2016", "2022")).toThrow(/cannot silently cross editions/);
    assertAiscMemberEditionIsolation(AISC_UNKNOWN_EDITION_TOKEN, "2016");

    expect(typeof orchestrateAuSteelMemberDesign).toBe("function");
    expect(typeof orchestrateEuSteelMemberDesign).toBe("function");
    expect(typeof orchestrateUsSteelMemberDesign).toBe("function");

    expect(IMPLEMENTED_US_TENSION_METHODS).toEqual(["US_TENSION_GROSS_YIELD_MECHANICS", "US_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(IMPLEMENTED_US_COMPRESSION_METHODS).toEqual([
      "US_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "US_COMPRESSION_EULER_MAJOR_MECHANICS",
      "US_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(IMPLEMENTED_US_BENDING_METHODS).toEqual([
      "US_BENDING_ELASTIC_MAJOR_MECHANICS",
      "US_BENDING_ELASTIC_MINOR_MECHANICS",
      "US_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(IMPLEMENTED_US_SHEAR_METHODS).toEqual([
      "US_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "US_SHEAR_ELASTIC_MINOR_MECHANICS",
      "US_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(IMPLEMENTED_US_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[6]).toMatch(/US-7 member/);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[7]).toMatch(/US-8/);
    expect(evaluateSteelCapacity(capacityInput()).implemented).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US7).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US7_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(US_MEMBER_SEISMIC_DESIGN_VALIDATED).toBe(false);
    expect(US_CONNECTION_DESIGN_VALIDATED).toBe(false);
    expect(D1D_US7_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US7_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01", "D0-R03"]);
    expect(D1D_US7_D0_RISK_DISPOSITION.REMAINING).toEqual(["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"]);
    const usSrc = ["orchestrate.ts", "serviceability.ts", "language.ts", "classification.ts"].map((name) => readFileSync(join(here, "us-member", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AS 4100|phiVv|γM1|kyy|alpha_b|National Annex|NDP|AUST300 default/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/US_MEMBER_|L \/ 240|L \/ 360/);
  });
});
