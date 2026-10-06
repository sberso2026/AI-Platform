import type { SteelCapacityEngineInput, USSteelBendingContext, USSteelDesignContext, UsSteelResolverInput } from "@rtb/types";
import {
  AISC_UNKNOWN_EDITION_TOKEN,
  DEFAULT_LRFD_OR_ASD,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_US_LTB_RESTRAINT_ASSUMPTION,
  SILENT_US_UNBRACED_LENGTH_ASSUMPTION,
  STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED,
} from "@rtb/types";
import { bendingAxisFromLimitState } from "../mechanics/bending";
import { assertAmendmentCompatibleWithAdoption } from "../us-standard/adoption";
import { resolveAiscSteelFamily } from "../us-standard/family";
import { resolveUsSteelContext, unknownEditionBlocksUsConformance } from "../us-standard/resolver";
import { usBendingElementClassificationState } from "./classification";
import { US_BENDING_METHOD_REGISTRY } from "./registry";

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

export function assertUsBendingStandardContext(input: SteelCapacityEngineInput): USSteelDesignContext {
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

export function assertAiscBendingEditionIsolation(methodEdition: string, contextEdition: string): void {
  if (methodEdition !== AISC_UNKNOWN_EDITION_TOKEN && contextEdition !== AISC_UNKNOWN_EDITION_TOKEN && methodEdition !== contextEdition) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC bending method cannot silently cross editions");
  }
}

export function createUsBendingContext(input: SteelCapacityEngineInput): USSteelBendingContext {
  const us = assertUsBendingStandardContext(input);
  if (us.designMethod !== "LRFD" && us.designMethod !== "ASD") {
    throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  }
  if (SILENT_US_UNBRACED_LENGTH_ASSUMPTION) throw new Error("unbraced length must not be assumed silently");
  if (SILENT_US_LTB_RESTRAINT_ASSUMPTION) throw new Error("LTB restraint must not be assumed silently");
  if (input.usStabilityContext) {
    if (input.usStabilityContext.method === "UNKNOWN") {
      throw new Error("steel design fail closed: unknown stability-analysis method");
    }
    if (input.usStabilityContext.mixedMethods || STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED) {
      throw new Error("steel design fail closed: stability-analysis methods must not mix silently");
    }
  }
  const axis = bendingAxisFromLimitState(input.limitState);
  const stability = input.stability;
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    momentDemandRefs: [input.demand.resultId],
    designMethod: us.designMethod,
    unitSystem: us.unitSystem,
    bendingAxis: axis,
    memberLengthM: stability?.memberLengthM ?? null,
    unbracedLengthM: stability?.unbracedLengthM ?? null,
    unbracedLengthProvenanceRef: stability?.unbracedLengthProvenanceRef ?? stability?.sourceEvidenceRef ?? null,
    restraintContext: stability?.restraintDescription ?? null,
    lateralRestraint: stability?.lateralRestraint ?? null,
    torsionalRestraint: stability?.torsionalRestraint ?? null,
    warpingRestraint: stability?.warpingRestraint ?? null,
    momentGradientContext: stability?.momentDistributionDescription ?? stability?.momentGradientRef ?? null,
    loadApplicationContext: stability?.loadApplicationPosition ?? null,
    stabilityAnalysisContext: input.usStabilityContext?.method ?? null,
    elementClassificationState: usBendingElementClassificationState(),
    flexuralBehaviorState: "ELASTIC",
    standardContextRef: input.standardContext.contextId,
    buildingCodeContextRef: us.directContractProfile ? null : (us.buildingCodeAdoptionRef ?? us.buildingCodeAdoption?.adoptionId ?? null),
    loadStandardContextRef: us.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
    engineeringRuleRefs: US_BENDING_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: [
      "established-mechanics-first-yield-moment-equals-fy-times-elastic-section-modulus",
      "established-mechanics-uniform-moment-elastic-critical-ltb-sqrt-pi2-EIy-L2-times-GJ-plus-pi2-EIw-L2",
    ],
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenance: input.designContext.provenanceRef.timestamp,
    directContractProfile: us.directContractProfile,
  };
}
