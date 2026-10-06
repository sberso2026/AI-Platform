import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY,
  AI_SERVICEABILITY_CRITERION_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_CODE_RULES_REUSED_AS_EU_RULES,
  AUTOMATIC_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DEFAULT_DEFLECTION_LIMIT_GUESSED,
  DEFAULT_EU_NATIONAL_ANNEX,
  EOS_D1D_EU7_PHASE,
  EU6_INTERACTION_LIMITATION_PROPAGATED,
  EU7_AUTOMATIC_APPROVAL,
  EU_MEMBER_PILOT_EXPOSURE,
  EU_ONLY_STEEL_CORE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_SPAN_RATIO_DENOMINATOR_GUESSED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  EU_STEEL_RELEASE_CLASSIFICATION,
  EU_VIBRATION_DESIGN_IMPLEMENTED,
  GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  MECHANICS_COMPLETE_EQUALS_CODE_DESIGN_COMPLETE,
  MECHANICS_ONLY_RESULTS_ALLOW_EUROCODE_DESIGN_PASS,
  MEMBER_CHECK_EQUALS_CONNECTION_CHECK,
  MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL,
  MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY,
  NEW_INTERACTION_METHOD_IMPLEMENTED_IN_EU7,
  PARALLEL_MEMBER_ORCHESTRATION_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_EU7,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  UNIVERSAL_MEMBER_UTILIZATION,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type EurocodeSteelServiceabilityContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelMemberDesignCheckRow,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_MEMBER_ORCHESTRATION_REVIEW,
  AU_MEMBER_ORCHESTRATION_REVIEWED,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_MEMBER_ORCHESTRATION_REUSED_WHERE_VALID,
  D1D_EU7_D0_RISK_DISPOSITION,
  EU_MEMBER_CHECK_TAXONOMY,
  IMPLEMENTED_EU_BENDING_METHODS,
  IMPLEMENTED_EU_COMPRESSION_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_EU_SHEAR_METHODS,
  IMPLEMENTED_EU_TENSION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  aggregateEngineeringCheckState,
  assertAiCannotApproveEuMember,
  assertCandidateFullEuMemberRecheck,
  denyAiMechanicsToCodePromotion,
  denyAiServiceabilityCriterion,
  denyNationalAnnexFromUserLocation,
  detectRequiredInteractions,
  evaluateSteelCapacity,
  explainEuMemberDesign,
  orchestrateEuSteelMemberDesign,
  requestEuDefaultDeflectionLimit,
  requestEuGuessedSpanRatioDenominator,
  unknownEurocodeVersion,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function annex(country: string, overrides: Partial<EurocodeNationalAnnex> = {}): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1993-1-1`,
    countryCode: country,
    standardPartRef: "EN_1993_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: null,
    sourceAuthorityRef: "metadata-reference-only",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
    ...overrides,
  };
}

function euStandard(country = "DE"): StructuralStandardContext {
  return {
    ...createConfiguredKnowledgeContext({
      contextId: `ctx-en1993-eu7-${country}`,
      jurisdictionProfileRef: "eu-eea",
      standardFamily: "EN",
      standardCode: "EN 1993-1-1",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "steel",
    }),
    nationalAnnexRef: {
      annexId: `NA-${country}-EN1993-1-1`,
      country,
      jurisdiction: "eu-eea",
      standardCode: "EN 1993-1-1",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      annexEdition: null,
      effectiveFrom: "1970-01-01",
      effectiveTo: null,
      parameterSetRef: null,
      sourceReference: "National Annex metadata reference only",
      validationState: "FRAMEWORK_ONLY",
    },
  };
}

function eurocodeContext(country = "DE", overrides: Partial<EurocodeSteelDesignContext> = {}): EurocodeSteelDesignContext {
  return {
    contextId: `ctx-eu-member-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu7",
    assetId: `asset-${country}`,
    jurisdictionProfileRef: "eu-eea",
    countryCode: country,
    standardFamily: "EUROCODE",
    standardPart: "EN_1993_1_1",
    standardCode: "EN 1993-1-1",
    version: unknownEurocodeVersion("EN 1993-1-1"),
    nationalAnnex: annex(country),
    ndpSet: [],
    materialSourceKind: "PROJECT_SPECIFICATION",
    sectionCatalogRef: null,
    projectContextRef: "proj-eu7",
    calculationContextRef: "calc-eu7",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu7:member",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-eu7-uls",
    memberId: "m-eu7",
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
    resultId: "demand-eu7-sls",
    memberId: "m-eu7",
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
    materialRef: "mat-eu7",
    grade: "S355",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["eu-eea"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-eu7",
    sectionFamily: "IPE",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["eu-eea"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 222_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 23_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: { name: "Zyy", value: 1_000_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusZz: { name: "Zzz", value: 200_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: { name: "J", value: 500_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    warpingConstant: { name: "Iw", value: 200_000_000_000, unit: "mm6", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    shearArea: { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "engineer-shear-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webDepth: { name: "d", value: 300, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webThickness: { name: "tw", value: 8, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
  };
}

function stability(): SteelStabilityContext {
  return {
    stabilityContextId: "stab-eu7",
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

function designContext(context: StructuralStandardContext, demandId = "demand-eu7-uls"): SteelDesignContext {
  return {
    designContextId: "dc-eu7",
    memberRef: "m-eu7",
    sectionRef: "sec-eu7",
    materialRef: "mat-eu7",
    demandRefs: [demandId],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-eu7",
    restraintContextRef: "stab-eu7",
    stabilityContextRef: "stab-eu7",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_MEMBER_DESIGN",
    methodRef: "EU_MEMBER",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_MEMBER" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  const standardContext = patch.standardContext ?? euStandard();
  return {
    adapterId: "EU_STEEL",
    designContext: designContext(standardContext),
    standardContext,
    material: material(),
    section: section(),
    stability: null,
    demand: demand(standardContext),
    limitState: "TENSION",
    requiredProperties: [],
    eurocodeContext: eurocodeContext(),
    ...patch,
  };
}

function criterion(patch: Partial<EurocodeSteelServiceabilityContext> = {}): EurocodeSteelServiceabilityContext {
  const context = euStandard();
  return {
    memberRef: "m-eu7",
    serviceabilityDemandRef: "demand-eu7-sls",
    criterionRef: "proj-defl-25mm",
    criterionType: "ABSOLUTE_DISPLACEMENT",
    criterionValue: 25,
    criterionUnits: "mm",
    criterionSource: "PROJECT_REQUIREMENT",
    loadCaseOrCombinationRef: "comb-sls",
    projectRequirementRef: "PR-SLS-1",
    standardProfileRef: context.contextId,
    evidenceRef: "ev-sls",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_SLS" }),
    validationState: "HUMAN_CONFIRMED_RULE",
    spanM: 8,
    standardContextRef: context.contextId,
    standardPartRefs: ["EN_1990"],
    nationalAnnexRef: "NA-DE-EN1993-1-1",
    ndpRefs: [],
    technicalBasisRef: "project-deflection-limit",
    criterionRequiresNdp: false,
    criterionRequiresAnnex: false,
    ...patch,
  };
}

function memberInput(patch: Partial<Parameters<typeof orchestrateEuSteelMemberDesign>[0]> = {}) {
  return {
    designRecordId: "rec-eu7",
    createdAt: "2026-10-06T00:00:00.000Z",
    version: 1,
    capacityInput: capacityInput(),
    ...patch,
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

describe("EOS-D1D-EU-7 Eurocode steel member design orchestration", () => {
  it("reviews AU member orchestration and keeps mechanics, code-design, and approval separate", () => {
    expect(EOS_D1D_EU7_PHASE).toBe("EOS-D1D-EU-7");
    expect(AU_MEMBER_ORCHESTRATION_REVIEWED).toBe(true);
    expect(COMMON_MEMBER_ORCHESTRATION_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_EU_RULES).toBe(false);
    expect(PARALLEL_MEMBER_ORCHESTRATION_CREATED).toBe(false);
    expect(AU_MEMBER_ORCHESTRATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(AU_MEMBER_ORCHESTRATION_REVIEW.some((row) => row.classification === "AU_SPECIFIC")).toBe(true);
    expect(EU_MEMBER_CHECK_TAXONOMY).toEqual(expect.arrayContaining(["TENSION", "COMPRESSION_STABILITY", "LTB", "WEB_STABILITY", "COMBINED_ACTION", "DEFLECTION"]));
    const record = orchestrateEuSteelMemberDesign(memberInput());
    expect(record.memberRef).toBe("m-eu7");
    expect(record.standardContextRef).toMatch(/en1993-eu7/);
    expect(record.edition).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(record.mechanicsEvaluationState).toBe("COMPLETE_FOR_AVAILABLE_MECHANICS");
    expect(record.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    expect(record.overallEngineeringCheckState).toBe("CHECK_UNDETERMINED");
    expect(record.engineeringCheckState).toBe("CHECK_UNDETERMINED");
    expect(record.approvalState).toBe("not_approved");
    expect(record.eurocodeCompliantClaim).toBe(false);
    expect(MECHANICS_COMPLETE_EQUALS_CODE_DESIGN_COMPLETE).toBe(false);
    expect(MECHANICS_ONLY_RESULTS_ALLOW_EUROCODE_DESIGN_PASS).toBe(false);
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.authority).toBe("MECHANICS_REFERENCE");
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.state).toBe("CHECK_UNDETERMINED");
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.utilization).not.toBeNull();
    expect(record.completenessMatrix.find((row) => row.checkKind === "TENSION")?.incompleteReason).toBe("CODE_METHOD_UNAVAILABLE");
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
  });

  it("orchestrates single-action mechanics without treating them as Eurocode pass", () => {
    const tension = orchestrateEuSteelMemberDesign(memberInput());
    expect(tension.applicableCheckRegistry).toEqual(["TENSION"]);
    expect(tension.mechanicsEvaluationState).toBe("COMPLETE_FOR_AVAILABLE_MECHANICS");
    expect(tension.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const compression = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(euStandard(), { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        stability: stability(),
      }),
    }));
    expect(compression.applicableCheckRegistry).toEqual(expect.arrayContaining(["COMPRESSION", "STABILITY_COMPRESSION"]));
    expect(compression.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const bending = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(euStandard(), {
          axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
          moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
        }),
        stability: stability(),
      }),
    }));
    expect(bending.applicableCheckRegistry).toEqual(expect.arrayContaining(["BENDING_MAJOR", "STABILITY_LTB"]));
    expect(bending.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const shear = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(euStandard(), {
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

  it("requires EU-6 interaction and does not let component or mechanics checks complete code-design", () => {
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(NEW_INTERACTION_METHOD_IMPLEMENTED_IN_EU7).toBe(false);
    expect(EU6_INTERACTION_LIMITATION_PROPAGATED).toBe(true);
    const multi = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(euStandard(), { moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        stability: stability(),
      }),
    }));
    expect(detectRequiredInteractions(capacityInput({
      demand: demand(euStandard(), { moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
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
  });

  it("propagates a failed governed check and never treats satisfaction as Eurocode or approval", () => {
    const failed = aggregateEngineeringCheckState([
      { ...satisfiedRow("TENSION"), state: "CHECK_UNDETERMINED", completeness: "INCOMPLETE_METHOD_UNAVAILABLE", incompleteReason: "CODE_METHOD_UNAVAILABLE" },
      { ...satisfiedRow("DEFLECTION"), state: "CHECK_NOT_SATISFIED", authority: "GOVERNED" },
    ]);
    expect(failed).toBe("CHECK_NOT_SATISFIED");
    const sls = slsDemand(euStandard());
    const exceeded = orchestrateEuSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionValue: 10, criterionUnits: "mm" }),
        demand: sls,
      },
    }));
    expect(exceeded.serviceabilityResult?.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(exceeded.codeDesignCheckState).toBe("CHECK_NOT_SATISFIED");
    expect(exceeded.approvalState).toBe("not_approved");
    expect(exceeded.humanReviewState).toBe("NOT_REVIEWED");
    expect(EU7_AUTOMATIC_APPROVAL).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED).toBe(false);
  });

  it("reuses D1C deflection, accepts governed criteria, and fails closed without a criterion, NDP, or guessed L/n", () => {
    const sls = slsDemand(euStandard());
    const withLimit = orchestrateEuSteelMemberDesign(memberInput({
      serviceability: { context: criterion(), demand: sls },
    }));
    expect(withLimit.serviceabilityResult?.demandRef).toBe("demand-eu7-sls");
    expect(withLimit.serviceabilityResult?.loadContextRef).toBe("comb-sls");
    expect(withLimit.serviceabilityResult?.checkState).toBe("CHECK_SATISFIED");
    expect(withLimit.demandSetRef).toBe("demand-eu7-uls");
    expect(withLimit.loadCombinationRefs).toEqual(expect.arrayContaining(["comb-uls", "comb-sls"]));

    const missing = orchestrateEuSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionRef: null, criterionType: null, criterionValue: null, criterionUnits: null, criterionSource: null }),
        demand: sls,
      },
    }));
    expect(missing.completenessMatrix.find((row) => row.checkKind === "DEFLECTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(missing.serviceabilityResult?.reason).toBe("SERVICEABILITY_CRITERION_REQUIRED");
    expect(missing.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const span = orchestrateEuSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionType: "SPAN_RATIO", criterionValue: 400, criterionUnits: "1", criterionRef: "proj-L400" }),
        demand: sls,
      },
    }));
    expect(span.serviceabilityResult?.allowableValue).toBeCloseTo(8 / 400, 10);
    expect(DEFAULT_DEFLECTION_LIMIT_GUESSED).toBe(false);
    expect(EU_SPAN_RATIO_DENOMINATOR_GUESSED).toBe(false);
    expect(() => requestEuDefaultDeflectionLimit()).toThrow(/unknown required code parameter/);
    expect(() => requestEuGuessedSpanRatioDenominator()).toThrow(/unknown required code parameter/);

    const missingNdp = orchestrateEuSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionRequiresNdp: true, criterionRequiresAnnex: true, nationalAnnexRef: null, ndpRefs: [] }),
        demand: sls,
      },
    }));
    expect(missingNdp.serviceabilityResult?.reason).toBe("NATIONAL_ANNEX_REQUIRED");
    expect(missingNdp.completenessMatrix.find((row) => row.checkKind === "DEFLECTION")?.incompleteReason).toBe("NATIONAL_ANNEX_REQUIRED");
    expect(DEFAULT_EU_NATIONAL_ANNEX).toBe(false);
    expect(() => denyNationalAnnexFromUserLocation("locale")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
  });

  it("invalidates stale fingerprints and keeps no universal utilization", () => {
    const first = orchestrateEuSteelMemberDesign(memberInput());
    expect(() => orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ section: { ...section(), sectionRef: "sec-changed" } }),
      previousFingerprint: first.fingerprint,
      reuseStaleResults: true,
    }))).toThrow(/stale result/);
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ demand: demand(euStandard(), { resultId: "demand-changed" }), designContext: designContext(euStandard(), "demand-changed") }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("LOAD_CHANGED");
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ material: { ...material(), materialRef: "mat-changed" } }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("MATERIAL_CHANGED");
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(euStandard(), { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        stability: { ...stability(), effectiveLengthM: 10, effectiveLengthMajorM: 10 },
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("EFFECTIVE_LENGTH_CHANGED");
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand(euStandard(), { axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" }, moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        stability: { ...stability(), unbracedLengthM: 12, restraintDescription: "changed restraint" },
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toEqual(expect.arrayContaining(["UNBRACED_LENGTH_CHANGED", "RESTRAINT_CHANGED"]));
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ eurocodeContext: eurocodeContext("FR") }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("NATIONAL_ANNEX_CHANGED");
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        eurocodeContext: eurocodeContext("DE", { nationalAnnex: annex("DE", { nationalParameterSetRef: "ndp-de-1" }) }),
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("NDP_CHANGED");
    expect(orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        eurocodeContext: eurocodeContext("DE", {
          version: { ...unknownEurocodeVersion("EN 1993-1-1"), edition: "2005" },
          nationalAnnex: annex("DE", { edition: "2005" }),
        }),
      }),
      previousFingerprint: first.fingerprint,
    })).invalidationTags).toContain("EDITION_CHANGED");
    const historical = orchestrateEuSteelMemberDesign(memberInput({ version: 1 }));
    const reproduced = orchestrateEuSteelMemberDesign(memberInput({ version: 1 }));
    expect(reproduced.fingerprint).toEqual(historical.fingerprint);
    expect(UNIVERSAL_MEMBER_UTILIZATION).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(first, "overallUtilization")).toBe(false);
    expect(first.optimizationHandoff.optimizationImplemented).toBe(false);
  });

  it("keeps method-not-implemented distinct, isolates AU/US, and preserves AI/optimizer/pack boundaries", () => {
    const other = orchestrateEuSteelMemberDesign(memberInput({ otherServiceabilityModes: ["VIBRATION"] }));
    expect(other.completenessMatrix.find((row) => row.checkKind === "OTHER_SERVICEABILITY")?.incompleteReason).toBe("METHOD_NOT_IMPLEMENTED");
    expect(other.completenessMatrix.find((row) => row.checkKind === "SHEAR_MAJOR")?.incompleteReason).toBe("NOT_APPLICABLE");
    expect(other.connectionDesignInScope).toBe(false);
    expect(other.foundationAdequacyInScope).toBe(false);
    expect(MEMBER_CHECK_EQUALS_CONNECTION_CHECK).toBe(false);
    expect(MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL).toBe(false);
    expect(MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(EU_VIBRATION_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_MEMBER_PILOT_EXPOSURE).toBe(false);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(EU_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(other.releaseClassification).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(other.reportLanguage).not.toMatch(/EN 1993 compliant|Eurocode compliant|design approved|certified/i);
    const explained = explainEuMemberDesign(other);
    expect(explained.advisoryOnly).toBe(true);
    expect(() => denyAiMechanicsToCodePromotion()).toThrow(/cannot promote mechanics/);
    expect(() => denyAiServiceabilityCriterion()).toThrow(/cannot invent a serviceability criterion/);
    expect(() => assertAiCannotApproveEuMember("AI", "approved")).toThrow(/AI cannot promote result to approval/);
    expect(AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY).toBe(false);
    expect(AI_SERVICEABILITY_CRITERION_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(EU_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(() => assertCandidateFullEuMemberRecheck({
      candidateSectionRef: "ipe-200",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined/);

    const de = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ standardContext: euStandard("DE"), designContext: designContext(euStandard("DE")), demand: demand(euStandard("DE")), eurocodeContext: eurocodeContext("DE") }),
    }));
    const fr = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        standardContext: euStandard("FR"),
        designContext: { ...designContext(euStandard("FR")), standardContextRef: euStandard("FR").contextId },
        demand: demand(euStandard("FR")),
        eurocodeContext: eurocodeContext("FR"),
      }),
    }));
    expect(de.nationalAnnexRef).toBe("NA-DE-EN1993-1-1");
    expect(fr.nationalAnnexRef).toBe("NA-FR-EN1993-1-1");
    expect(de.codeDesignCheckState).toBe(fr.codeDesignCheckState);
    expect(() => orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "SECOND_GENERATION" } }),
      }),
    }))).toThrow(/STANDARD_VERSION_CONFLICT/);
    const secondGenTag = orchestrateEuSteelMemberDesign(memberInput({
      previousFingerprint: de.fingerprint,
      capacityInput: capacityInput({
        eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "FIRST_GENERATION" } }),
      }),
    }));
    expect(secondGenTag.invalidationTags).toContain("GENERATION_CHANGED");

    const ukContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-uk-en1993-eu7",
        jurisdictionProfileRef: "united-kingdom",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        materialScope: "steel",
      }),
      nationalAnnexRef: {
        annexId: "NA-GB-EN1993-1-1",
        country: "GB",
        jurisdiction: "united-kingdom",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        annexEdition: null,
        effectiveFrom: "1970-01-01",
        effectiveTo: null,
        parameterSetRef: null,
        sourceReference: "UK Eurocode annex metadata only",
        validationState: "FRAMEWORK_ONLY",
      },
    };
    const uk = orchestrateEuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        standardContext: ukContext,
        designContext: { ...designContext(ukContext), standardContextRef: ukContext.contextId },
        demand: demand(ukContext),
        eurocodeContext: eurocodeContext("GB", { jurisdictionProfileRef: "united-kingdom" }),
      }),
    }));
    expect(uk.nationalAnnexRef).toBe("NA-GB-EN1993-1-1");
    expect(uk.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    expect(IMPLEMENTED_EU_TENSION_METHODS).toEqual(["EU_TENSION_GROSS_YIELD_MECHANICS", "EU_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(IMPLEMENTED_EU_COMPRESSION_METHODS).toEqual([
      "EU_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "EU_COMPRESSION_EULER_MAJOR_MECHANICS",
      "EU_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(IMPLEMENTED_EU_BENDING_METHODS).toEqual([
      "EU_BENDING_ELASTIC_MAJOR_MECHANICS",
      "EU_BENDING_ELASTIC_MINOR_MECHANICS",
      "EU_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(IMPLEMENTED_EU_SHEAR_METHODS).toEqual([
      "EU_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "EU_SHEAR_ELASTIC_MINOR_MECHANICS",
      "EU_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(evaluateSteelCapacity(capacityInput()).implemented).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU7).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_EU7_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU7_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01", "D0-R03"]);
    const euSrc = ["orchestrate.ts", "serviceability.ts", "language.ts"].map((name) => readFileSync(join(here, "eu-member", name), "utf8")).join("\n");
    expect(euSrc).not.toMatch(/AS 4100|phi|AUST300 default|0\.9 fy Ag/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/EU_MEMBER_|L \/ 250/);
  });
});
