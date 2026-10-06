import type { SteelCapacityEngineInput, USSteelCompressionContext, USSteelDesignContext, UsSteelResolverInput, UsStabilityAnalysisContext } from "@rtb/types";
import {
  AISC_UNKNOWN_EDITION_TOKEN,
  DEFAULT_K_FACTOR,
  DEFAULT_LRFD_OR_ASD,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED,
  STABILITY_METHOD_DETERMINES_EFFECTIVE_LENGTH_REQUIREMENT,
} from "@rtb/types";
import { assertAmendmentCompatibleWithAdoption } from "../us-standard/adoption";
import { resolveAiscSteelFamily } from "../us-standard/family";
import { resolveUsSteelContext, unknownEditionBlocksUsConformance } from "../us-standard/resolver";
import { axisLength, resolveBucklingAxes } from "../mechanics/effective-length";
import { assertEffectiveLengthGovernance } from "../mechanics/effective-length";
import { usElementClassificationState } from "./classification";
import { US_COMPRESSION_METHOD_REGISTRY } from "./registry";

function resolverInput(context: USSteelDesignContext, extras: Partial<UsSteelResolverInput> = {}): UsSteelResolverInput {
  return {
    projectContext: null,
    explicitCalculationContext: context,
    issuedContext: null,
    adoptionRequired: !context.directContractProfile,
    loadStandardRequired: false,
    ruleRequiresSeismic: false,
    enforceLoadMethodCompatibility: true,
    unresolvedSourceConflict: false,
    collapseDesignMethodFromUnits: false,
    convertLrfdToAsdSilently: false,
    convertAsdToLrfdSilently: false,
    source: "explicit",
    aiSelectedEdition: false,
    aiSelectedDesignMethod: false,
    aiInventedAmendment: false,
    aiClaimedConformance: false,
    humanConfirmationRequired: false,
    ...extras,
  };
}

export function assertUsCompressionStandardContext(input: SteelCapacityEngineInput): USSteelDesignContext {
  if (SILENT_AISC_EDITION_INFERENCE) throw new Error("silent AISC edition inference is forbidden");
  if (DEFAULT_LRFD_OR_ASD) throw new Error("LRFD/ASD must not be defaulted");
  if (SILENT_LRFD_ASD_CONVERSION) throw new Error("silent LRFD/ASD conversion is forbidden");
  if (!input.usSteelContext) throw new Error("steel design fail closed: missing AISC context");
  if (input.standardContext.standardCode !== "AISC 360") {
    throw new Error("steel design fail closed: unsupported standard profile");
  }
  resolveAiscSteelFamily();
  if (!input.standardContext.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
  const resolved = resolveUsSteelContext(resolverInput(input.usSteelContext, {
    source: input.usSteelContext.jurisdictionProfileRef === "locale" ? "locale" : "explicit",
  }));
  if (!resolved.ok) {
    throw new Error(`steel design fail closed: ${resolved.failReason}: ${resolved.detail}`);
  }
  unknownEditionBlocksUsConformance(resolved.context);
  if (resolved.context.edition !== AISC_UNKNOWN_EDITION_TOKEN && input.standardContext.edition !== resolved.context.edition) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC edition mismatch");
  }
  if (!resolved.context.designMethod) {
    throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  }
  assertAmendmentCompatibleWithAdoption(resolved.context.buildingCodeAdoption, resolved.context.localAmendment);
  if (resolved.context.localAmendmentSetRef === "UNKNOWN_REQUIRED") {
    throw new Error("CHECK_UNDETERMINED: required local amendment is unresolved");
  }
  if (resolved.context.localAmendment?.validationState === "CONFLICT") {
    throw new Error("steel design fail closed: local amendment conflict");
  }
  return resolved.context;
}

export function assertAiscCompressionEditionIsolation(methodEdition: string, contextEdition: string): void {
  if (methodEdition !== AISC_UNKNOWN_EDITION_TOKEN && contextEdition !== AISC_UNKNOWN_EDITION_TOKEN && methodEdition !== contextEdition) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC compression method cannot silently cross editions");
  }
}

export function resolveUsStabilityAnalysisContext(input: SteelCapacityEngineInput): UsStabilityAnalysisContext {
  if (!input.usStabilityContext) {
    throw new Error("steel design fail closed: unknown stability-analysis method");
  }
  if (input.usStabilityContext.method === "UNKNOWN") {
    throw new Error("steel design fail closed: unknown stability-analysis method");
  }
  if (input.usStabilityContext.mixedMethods || STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED) {
    throw new Error("steel design fail closed: stability-analysis methods must not mix silently");
  }
  return input.usStabilityContext;
}

export function createUsCompressionContext(input: SteelCapacityEngineInput): USSteelCompressionContext {
  const us = assertUsCompressionStandardContext(input);
  if (us.designMethod !== "LRFD" && us.designMethod !== "ASD") {
    throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  }
  const analysis = resolveUsStabilityAnalysisContext(input);
  if (DEFAULT_K_FACTOR) throw new Error("K factor must not be defaulted");
  const stability = input.stability;
  if (!stability) throw new Error("steel design fail closed: missing stability context");
  const usesK = Boolean(stability.effectiveLengthFactorMajor || stability.effectiveLengthFactorMinor);
  if (analysis.method === "DIRECT_ANALYSIS_BASED" && usesK) {
    throw new Error("steel design fail closed: stability-analysis methods must not mix silently");
  }
  const requireEffectiveLength = analysis.method !== "DIRECT_ANALYSIS_BASED";
  if (!STABILITY_METHOD_DETERMINES_EFFECTIVE_LENGTH_REQUIREMENT) {
    throw new Error("stability method must determine effective-length requirement");
  }
  let major: number | null = null;
  let minor: number | null = null;
  let axes = resolveBucklingAxes(stability);
  if (axes.includes("TORSIONAL") || axes.includes("FLEXURAL_TORSIONAL")) {
    throw new Error("steel design fail closed: unsupported buckling mode");
  }
  if (requireEffectiveLength) {
    const governed = assertEffectiveLengthGovernance(stability);
    axes = resolveBucklingAxes(governed);
    if (governed.memberLengthM == null || !(governed.memberLengthM > 0)) {
      throw new Error("steel design fail closed: missing member length");
    }
    major = axes.includes("MAJOR_AXIS") ? axisLength(governed, "MAJOR_AXIS", governed.effectiveLengthFactorMajor) : null;
    minor = axes.includes("MINOR_AXIS") ? axisLength(governed, "MINOR_AXIS", governed.effectiveLengthFactorMinor) : null;
  } else {
    if (stability.memberLengthM == null || !(stability.memberLengthM > 0)) {
      throw new Error("steel design fail closed: missing member length");
    }
    if (stability.effectiveLengthProvenanceRef && /^ai$|^llm|ai-inferred|optimizer-inferred/i.test(stability.effectiveLengthProvenanceRef)) {
      throw new Error("AI cannot supply effective length");
    }
    const explicitMajor = stability.effectiveLengthMajorM ?? (stability.bucklingAxis === "MAJOR" ? stability.effectiveLengthM : null);
    const explicitMinor = stability.effectiveLengthMinorM ?? (stability.bucklingAxis === "MINOR" ? stability.effectiveLengthM : null);
    major = explicitMajor != null && explicitMajor > 0 ? explicitMajor : null;
    minor = explicitMinor != null && explicitMinor > 0 ? explicitMinor : null;
  }
  if (stability.memberLengthM == null || !(stability.memberLengthM > 0)) {
    throw new Error("steel design fail closed: missing member length");
  }
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    compressionDemandRef: input.demand.resultId,
    designMethod: us.designMethod,
    unitSystem: us.unitSystem,
    memberLengthM: stability.memberLengthM,
    effectiveLengthMajorM: major,
    effectiveLengthMinorM: minor,
    stabilityAnalysisMethod: analysis.method,
    secondOrderAnalysis: analysis.secondOrder,
    bucklingAxes: axes,
    restraintContext: stability.restraintDescription ?? "unknown",
    standardContextRef: input.standardContext.contextId,
    buildingCodeContextRef: us.directContractProfile ? null : (us.buildingCodeAdoptionRef ?? us.buildingCodeAdoption?.adoptionId ?? null),
    loadStandardContextRef: us.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
    engineeringRuleRefs: US_COMPRESSION_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: [
      "established-mechanics-nominal-squash-load-equals-yield-stress-times-gross-area",
      "established-mechanics-euler-elastic-buckling-pcr-pi2-ei-over-le2",
    ],
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenance: input.designContext.provenanceRef.timestamp,
    effectiveLengthProvenanceRef: stability.effectiveLengthProvenanceRef ?? stability.sourceEvidenceRef ?? "missing",
    elementClassificationState: usElementClassificationState(),
    directContractProfile: us.directContractProfile,
  };
}
