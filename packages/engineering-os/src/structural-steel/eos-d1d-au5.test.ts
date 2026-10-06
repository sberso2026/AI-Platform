import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_INTERACTION_ASSISTANCE_ADVISORY_ONLY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_COMBINED_PILOT_EXPOSURE,
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK,
  CONNECTION_INTERACTION_IMPLEMENTED,
  GENERIC_MATHEMATICS_EQUALS_CODE_INTERACTION,
  LLM_INTERACTION_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS,
  OPTIMIZATION_INTERACTION_RECHECK_REQUIRED,
  SHEAR_REDUCTION_RULE_GUESSED,
  TORSIONAL_INTERACTION_IMPLEMENTED,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION_HARDCODED,
  UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED,
  type SteelCapacityEngineInput,
  type SteelCombinedActionInput,
  type SteelCombinedCapacityComponent,
  type SteelCombinedDemandComponent,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  assertAiCannotChangeComponentResults,
  assertAiCannotInventInteraction,
  assertEngineeringRuleAuthority,
  assertLlmCannotOriginateCapacity,
  assertNotCertified,
  assertOptimizationInteractionRecheck,
  AU_COMBINED_UNSUPPORTED_METHODS,
  AU_INTERACTION_INDEPENDENT_BENCHMARKS,
  AU_INTERACTION_METHOD_CATALOG,
  AU_INTERACTION_METHOD_REGISTRY,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  D1D_AU5_D0_RISK_DISPOSITION,
  detectRequiredInteractions,
  evaluateSteelCapacity,
  FRAMEWORK_ONLY_INTERACTION_TYPES,
  IMPLEMENTED_INTERACTION_METHODS,
  orchestrateAuBendingDesignCheck,
  orchestrateAuCombinedActionDesignCheck,
  orchestrateAuCompressionDesignCheck,
  orchestrateAuShearDesignCheck,
  orchestrateAuTensionDesignCheck,
  orchestrateSteelDesignCheck,
  requestAuBiaxialLinearInteraction,
  requestAuCodeProfileInteraction,
  requestAuConnectionInteraction,
  requestAuShearReduction,
  requestAuTorsionalInteraction,
  requestAuUniversalInteractionEquation,
  STEEL_ADAPTER_BOUNDARIES,
  toAuCombinedContext,
} from "./index";

const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-combined-au5" });

function demand(patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au5",
    memberId: "m-au5",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
    axial: { valueN: 400_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff" },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-combined" }],
    combinationId: "comb-au5",
    ...patch,
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-au5",
    grade: "300PLUS",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: "thickness-dependent fy metadata governed by mill cert",
    jurisdictionApplicability: ["australia"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-au5",
    sectionFamily: "UB",
    catalogSource: "AUST300",
    catalogVersion: "LIBRARY_SECTION_Aust300.sls",
    jurisdictionApplicability: ["australia"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
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
    stabilityContextId: "stab-au5",
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

function designContext(): SteelDesignContext {
  return {
    designContextId: "dc-au5",
    memberRef: "m-au5",
    sectionRef: "sec-au5",
    materialRef: "mat-au5",
    demandRefs: ["demand-au5"],
    standardContextRef: auProfile.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-au5",
    restraintContextRef: "stab-au5",
    stabilityContextRef: "stab-au5",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_AU_STEEL_COMBINED_ACTION",
    methodRef: "AU_COMBINED",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_COMBINED" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function extraDemand(kind: SteelCombinedDemandComponent["kind"], value: number, unit: string, signed = value): SteelCombinedDemandComponent {
  return {
    resultId: `demand-au5-${kind.toLowerCase()}`,
    memberId: "m-au5",
    combinationId: "comb-au5",
    kind,
    value,
    unit,
    signed,
  };
}

function extraCapacity(kind: SteelCombinedCapacityComponent["kind"], value: number, unit: string): SteelCombinedCapacityComponent {
  return {
    capacityResultId: `cap-au5-${kind.toLowerCase()}`,
    methodId: `AU_${kind}_REFERENCE`,
    memberId: "m-au5",
    combinationId: "comb-au5",
    kind,
    value,
    unit,
    standardProfileRef: auProfile.contextId,
    maturity: "BENCHMARKED",
  };
}

function combined(patch: Partial<SteelCombinedActionInput> = {}): SteelCombinedActionInput {
  return {
    combinationRef: "comb-au5",
    componentDemands: [],
    componentCapacities: [],
    ...patch,
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  return {
    adapterId: "AU_STEEL",
    designContext: designContext(),
    standardContext: auProfile,
    material: material(),
    section: section(),
    stability: stability(),
    demand: demand(),
    limitState: "COMBINED_ACTION",
    requiredProperties: [],
    combined: combined(),
    ...patch,
  };
}

describe("EOS-D1D-AU-5 Australian steel combined actions", () => {
  it("detects required interactions without determining adequacy", () => {
    const tensionBending = detectRequiredInteractions(capacityInput());
    expect(tensionBending).toEqual(["TENSION_BENDING"]);
    const compressionBiaxial = detectRequiredInteractions(capacityInput({
      demand: demand({ axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
      combined: combined({ componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")] }),
    }));
    expect(compressionBiaxial).toEqual([
      "COMPRESSION_BENDING",
      "COMPRESSION_BIAXIAL_BENDING",
      "AXIAL_BIAXIAL_BENDING",
      "BIAXIAL_BENDING",
    ]);
    const bendingShear = detectRequiredInteractions(capacityInput({
      demand: demand({
        axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }));
    expect(bendingShear).toEqual(["BENDING_SHEAR"]);
    const axialShear = detectRequiredInteractions(capacityInput({
      demand: demand({
        moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }));
    expect(axialShear).toEqual(["AXIAL_SHEAR"]);
  });

  it("returns CHECK_UNDETERMINED for tension+bending, compression+bending, biaxial, bending+shear, and axial+shear", () => {
    const tension = evaluateSteelCapacity(capacityInput());
    expect(consumeDemandHandoff(demand())).toBe("demand-au5");
    expect(tension.interactionRequired).toBe(true);
    expect(tension.combinedResults?.map((row) => row.interactionType)).toEqual(["TENSION_BENDING"]);
    expect(tension.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(tension.combinedResults?.[0]?.reason).toBe("INTERACTION_RULE_VALIDATION_REQUIRED");
    expect(tension.combinedResults?.[0]?.interactionValue).toBeNull();
    expect(tension.implementationBindingState).toBe("FRAMEWORK_ONLY");
    expect(tension.maturity).toBe("IMPLEMENTED");
    expect(tension.capacity).toBeNull();

    const compression = evaluateSteelCapacity(capacityInput({
      demand: demand({ axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
    }));
    expect(compression.combinedResults?.map((row) => row.interactionType)).toEqual(["COMPRESSION_BENDING"]);
    expect(compression.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    const ctx = toAuCombinedContext(capacityInput({
      demand: demand({ axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
    }), ["COMPRESSION_BENDING"]);
    expect(ctx.stabilityContextRef).toBe("stab-au5");
    expect(ctx.sectionClassificationRef).toBe("VALIDATION_REQUIRED");

    const biaxial = evaluateSteelCapacity(capacityInput({
      demand: demand({ axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" } }),
      combined: combined({ componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")] }),
    }));
    expect(biaxial.combinedResults?.map((row) => row.interactionType)).toEqual(["BIAXIAL_BENDING"]);
    expect(biaxial.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");

    const bendingShear = evaluateSteelCapacity(capacityInput({
      demand: demand({
        axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }));
    expect(bendingShear.combinedResults?.map((row) => row.interactionType)).toEqual(["BENDING_SHEAR"]);

    const axialShear = evaluateSteelCapacity(capacityInput({
      demand: demand({
        moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }));
    expect(axialShear.combinedResults?.map((row) => row.interactionType)).toEqual(["AXIAL_SHEAR"]);
    expect(axialShear.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
  });

  it("keeps component utilizations informational and never treats them as the interaction check", () => {
    const out = evaluateSteelCapacity(capacityInput({
      combined: combined({
        componentCapacities: [
          extraCapacity("TENSION", 1_542_000, "N"),
          extraCapacity("BENDING_MAJOR", 300_000, "N.m"),
        ],
      }),
    }));
    expect(out.componentUtilizations?.equalsInteractionCheck).toBe(false);
    expect(COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK).toBe(false);
    const axial = out.componentUtilizations?.rows.find((row) => row.kind === "AXIAL");
    const major = out.componentUtilizations?.rows.find((row) => row.kind === "BENDING_MAJOR");
    expect(axial?.informationalOnly).toBe(true);
    expect(axial?.ratio).toBeCloseTo(400_000 / 1_542_000, 8);
    expect(major?.ratio).toBeCloseTo(100_000 / 300_000, 8);
    expect(out.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(out.combinedResults?.[0]?.checkState).not.toBe("CHECK_SATISFIED");
  });

  it("fails closed for missing rule, missing capacity, missing stability, incompatible combinations, certified claims, and guessed coefficients", () => {
    const missingCap = evaluateSteelCapacity(capacityInput({ combined: combined({ componentCapacities: [] }) }));
    expect(missingCap.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(missingCap.componentUtilizations?.rows.every((row) => row.capacity == null)).toBe(true);

    const missingStability = evaluateSteelCapacity(capacityInput({
      demand: demand({ axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
      stability: null,
      designContext: { ...designContext(), stabilityContextRef: null },
    }));
    expect(missingStability.combinedResults?.[0]?.interactionType).toBe("COMPRESSION_BENDING");
    expect(missingStability.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");

    expect(() => evaluateSteelCapacity(capacityInput({
      combined: combined({
        combinationRef: "comb-other",
        componentDemands: [{ ...extraDemand("MOMENT_MINOR", 20_000, "N.m"), combinationId: "comb-other" }],
      }),
    }))).toThrow(/incompatible load combination/);

    const sameCombo = evaluateSteelCapacity(capacityInput({
      combined: combined({
        componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")],
      }),
    }));
    expect(sameCombo.combinedResults?.map((row) => row.interactionType)).toEqual([
      "TENSION_BENDING",
      "TENSION_BIAXIAL_BENDING",
      "AXIAL_BIAXIAL_BENDING",
      "BIAXIAL_BENDING",
    ]);
    expect(sameCombo.combinedResults?.every((row) => row.checkState === "CHECK_UNDETERMINED")).toBe(true);
    expect(sameCombo.governingMethodId).toBe("AU_INTERACTION_TENSION_BENDING-V1");

    expect(() => evaluateSteelCapacity(capacityInput({
      designContext: { ...designContext(), validationState: "CERTIFIED" },
    }))).toThrow(/unvalidated method requested as certified/);
    expect(() => assertNotCertified(AU_INTERACTION_METHOD_REGISTRY[0]!, "CERTIFIED")).toThrow(/certified/);

    expect(UNIVERSAL_INTERACTION_EQUATION).toBe(false);
    expect(UNIVERSAL_INTERACTION_EQUATION_HARDCODED).toBe(false);
    expect(UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED).toBe(false);
    expect(BIAXIAL_LINEAR_INTERACTION_ASSUMED).toBe(false);
    expect(SHEAR_REDUCTION_RULE_GUESSED).toBe(false);
    expect(GENERIC_MATHEMATICS_EQUALS_CODE_INTERACTION).toBe(false);
    expect(() => requestAuUniversalInteractionEquation()).toThrow(/unknown required code parameter/);
    expect(() => requestAuCodeProfileInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestAuBiaxialLinearInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestAuShearReduction()).toThrow(/unknown required code parameter/);
    expect(() => requestAuTorsionalInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestAuConnectionInteraction()).toThrow(/unknown required code parameter/);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(FRAMEWORK_ONLY_INTERACTION_TYPES).toHaveLength(8);
    expect(AU_INTERACTION_INDEPENDENT_BENCHMARKS).toBe("NOT_APPLICABLE");
    expect(AU_INTERACTION_METHOD_CATALOG.every((row) => row.validationState === "FRAMEWORK_ONLY")).toBe(true);
    expect(AU_INTERACTION_METHOD_REGISTRY.every((rule) => rule.applicability.length > 0)).toBe(true);
    expect(AU_COMBINED_UNSUPPORTED_METHODS.UNIVERSAL_INTERACTION_EQUATION).toBe(false);
    expect(() => assertEngineeringRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(auProfile.edition).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
    expect(auProfile.amendment).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
  });

  it("does not treat CHECK_SATISFIED or undetermined interaction as approval or optimizer pass", () => {
    expect(() => orchestrateSteelDesignCheck({
      designCheckId: "chk-simple-combined",
      limitState: "COMBINED_ACTION",
      designContext: designContext(),
      capacityInput: capacityInput(),
      simpleUtilizationValid: true,
      demandValue: { value: 1, unit: "N" },
    })).toThrow(/standard adapter/);
    const outcome = orchestrateAuCombinedActionDesignCheck({
      designCheckId: "chk-combined",
      designContext: designContext(),
      capacityInput: capacityInput(),
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(outcome.humanReviewRequired).toBe(true);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(OPTIMIZATION_INTERACTION_RECHECK_REQUIRED).toBe(true);
    expect(OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS).toBe(false);
    expect(() => assertOptimizationInteractionRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: true,
      interactionCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined interaction as pass/);
    expect(() => assertOptimizationInteractionRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    expect(() => assertAiCannotInventInteraction("N/Nc + M/Mc <= 1", "AI")).toThrow(/AI cannot invent interaction equation/);
    expect(() => assertAiCannotChangeComponentResults(true)).toThrow(/AI cannot change component results/);
    expect(() => assertLlmCannotOriginateCapacity(true)).toThrow(/originate capacity/);
    expect(LLM_INTERACTION_AUTHORITY).toBe(false);
    expect(LLM_STEEL_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_INTERACTION_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AU_COMBINED_PILOT_EXPOSURE).toBe(false);
    expect(TORSIONAL_INTERACTION_IMPLEMENTED).toBe(false);
    expect(CONNECTION_INTERACTION_IMPLEMENTED).toBe(false);
  });

  it("does not regress AU-1 through AU-4 and keeps EU/US, AI, and global-core boundaries", () => {
    const tension = orchestrateAuTensionDesignCheck({
      designCheckId: "chk-t-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au1-reg"] },
      capacityInput: capacityInput({
        limitState: "TENSION",
        demand: demand({ resultId: "demand-au1-reg", axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" } }),
        designContext: { ...designContext(), demandRefs: ["demand-au1-reg"] },
        combined: null,
        stability: null,
      }),
    });
    expect(tension.verdict).toBe("CHECK_SATISFIED");
    expect(tension.engineeringApproved).toBe(false);

    const compression = orchestrateAuCompressionDesignCheck({
      designCheckId: "chk-c-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au2-reg"] },
      capacityInput: capacityInput({
        limitState: "COMPRESSION",
        demand: demand({ resultId: "demand-au2-reg", axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        designContext: { ...designContext(), demandRefs: ["demand-au2-reg"] },
        combined: null,
      }),
    });
    expect(compression.verdict).toBe("CHECK_UNDETERMINED");
    expect(compression.utilization?.ratio).toBeCloseTo(400_000 / 616_850, 5);

    const bending = orchestrateAuBendingDesignCheck({
      designCheckId: "chk-b-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au3-reg"] },
      capacityInput: capacityInput({
        limitState: "BENDING_MAJOR",
        demand: demand({ resultId: "demand-au3-reg" }),
        designContext: { ...designContext(), demandRefs: ["demand-au3-reg"] },
        combined: null,
      }),
    });
    expect(bending.verdict).toBe("CHECK_UNDETERMINED");
    expect(bending.engineeringApproved).toBe(false);

    const shear = orchestrateAuShearDesignCheck({
      designCheckId: "chk-s-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au4-reg"] },
      capacityInput: capacityInput({
        limitState: "SHEAR_MAJOR",
        demand: demand({
          resultId: "demand-au4-reg",
          axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
          shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
        }),
        designContext: { ...designContext(), demandRefs: ["demand-au4-reg"] },
        combined: null,
        shear: { shearAxis: "MAJOR_SHEAR", stiffenerState: "UNSTIFFENED", shearBucklingCoefficient: null, stiffenerSpacing: null },
        material: { ...material(), poissonRatio: null },
        section: { ...section(), webDepth: undefined, webThickness: undefined },
      }),
    });
    expect(shear.verdict).toBe("CHECK_UNDETERMINED");

    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "OTHER", combined: null }))).toThrow(/unsupported calculation scope/);
    const adapterSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/N\/Nc|M\/Mc|interactionValue\s*=/);
    const globalCore = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/AU_INTERACTION_|N\/Nc \+ M\/Mc/);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-au5",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "2005",
        materialScope: "steel",
      }),
      nationalAnnexRef: exampleEurocodeAnnex("EN 1993-1-1", "2005"),
    };
    const euOut = evaluateSteelCapacity(capacityInput({
      adapterId: "EU_STEEL",
      standardContext: eu,
      designContext: { ...designContext(), standardContextRef: eu.contextId },
      requiredProperties: [],
      combined: null,
    }));
    expect(euOut.implemented).toBe(false);
    expect(euOut.maturity).toBe("FRAMEWORK_ONLY");
    const us = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-aisc-au5",
        jurisdictionProfileRef: "united-states",
        standardFamily: "AISC",
        standardCode: "AISC 360",
        edition: "2022",
        materialScope: "steel",
      }),
    };
    const usOut = evaluateSteelCapacity(capacityInput({
      adapterId: "US_STEEL",
      standardContext: us,
      designContext: { ...designContext(), standardContextRef: us.contextId },
      requiredProperties: [],
      combined: null,
    }));
    expect(usOut.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.scope).toMatch(/COMBINED_ACTION/);
    expect(D1D_AU5_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_AU5_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01", "D0-R03"]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });
});
