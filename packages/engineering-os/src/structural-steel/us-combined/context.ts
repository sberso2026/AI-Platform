import type { SteelCapacityEngineInput, USSteelCombinedActionContext, USSteelDesignContext, UsSteelResolverInput, SteelInteractionType } from "@rtb/types";
import {
  AISC_UNKNOWN_EDITION_TOKEN,
  DEFAULT_LRFD_OR_ASD,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
} from "@rtb/types";
import { axialValue, momentMajor, momentMinor, shearMajor, shearMinor } from "../mechanics/interaction";
import { assertAmendmentCompatibleWithAdoption } from "../us-standard/adoption";
import { resolveAiscSteelFamily } from "../us-standard/family";
import { resolveUsSteelContext, unknownEditionBlocksUsConformance } from "../us-standard/resolver";
import { usInteractionElementClassificationState } from "./classification";
import { US_INTERACTION_METHOD_REGISTRY } from "./registry";

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

export function assertUsInteractionStandardContext(input: SteelCapacityEngineInput): USSteelDesignContext {
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
  if (DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE && resolved.context.directContractProfile) {
    throw new Error("direct-contract AISC profile must not equal building-code compliance");
  }
  return resolved.context;
}

export function assertAiscInteractionEditionIsolation(methodEdition: string, contextEdition: string): void {
  if (methodEdition !== AISC_UNKNOWN_EDITION_TOKEN && contextEdition !== AISC_UNKNOWN_EDITION_TOKEN && methodEdition !== contextEdition) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC interaction method cannot silently cross editions");
  }
}

export function assertUsStabilityMethodNotMixed(input: SteelCapacityEngineInput): void {
  const stability = input.usStabilityContext;
  if (stability?.mixedMethods) {
    throw new Error("steel design fail closed: stability-analysis methods cannot mix");
  }
}

export function createUsCombinedActionContext(
  input: SteelCapacityEngineInput,
  types: SteelInteractionType[],
): USSteelCombinedActionContext {
  const us = assertUsInteractionStandardContext(input);
  if (us.designMethod !== "LRFD" && us.designMethod !== "ASD") {
    throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  }
  assertUsStabilityMethodNotMixed(input);
  const capacities = input.combined?.componentCapacities ?? [];
  const n = axialValue(input);
  const mx = momentMajor(input);
  const my = momentMinor(input);
  const vMajor = shearMajor(input);
  const vMinor = shearMinor(input);
  const mechanicsRefs = capacities
    .filter((row) => row.resultClass !== "DESIGN_CAPACITY" && row.authorityState !== "CODE_PROFILE_CAPACITY")
    .map((row) => row.capacityResultId);
  const strengthRefs = capacities
    .filter((row) => row.resultClass === "DESIGN_CAPACITY" || row.authorityState === "CODE_PROFILE_CAPACITY")
    .map((row) => row.capacityResultId);
  const classification = usInteractionElementClassificationState();
  const ltbRef = input.stability?.unbracedLengthProvenanceRef ?? input.stability?.stabilityContextId ?? null;
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    axialDemandRef: n !== 0 ? input.demand.resultId : null,
    majorMomentDemandRef: mx > 0 ? input.demand.resultId : null,
    minorMomentDemandRef: my > 0 ? (input.combined?.componentDemands?.find((row) => row.kind === "MOMENT_MINOR")?.resultId ?? input.demand.resultId) : null,
    majorShearDemandRef: vMajor > 0 ? input.demand.resultId : null,
    minorShearDemandRef: vMinor > 0 ? input.demand.resultId : null,
    componentMechanicsRefs: mechanicsRefs,
    componentStrengthRefs: strengthRefs,
    designMethod: us.designMethod,
    unitSystem: us.unitSystem,
    stabilityAnalysisContextRef: input.usStabilityContext?.method ?? null,
    compressionStabilityContextRef: n < 0 ? (input.stability?.stabilityContextId ?? input.designContext.stabilityContextRef) : null,
    bendingStabilityContextRef: mx > 0 || my > 0 ? (input.stability?.stabilityContextId ?? input.designContext.stabilityContextRef) : null,
    secondOrderAnalysis: input.usStabilityContext?.secondOrder ?? null,
    elementClassificationRefs: [classification],
    localBucklingContextRefs: ["VALIDATION_REQUIRED"],
    ltbContextRefs: ltbRef ? [ltbRef] : [],
    interactionRuleRef: types[0] ? `US_INTERACTION_${types[0]}` : null,
    standardContextRef: input.standardContext.contextId,
    buildingCodeContextRef: us.directContractProfile ? null : (us.buildingCodeAdoptionRef ?? us.buildingCodeAdoption?.adoptionId ?? null),
    loadStandardContextRef: us.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
    engineeringRuleRefs: US_INTERACTION_METHOD_REGISTRY.map((row) => row.ruleId),
    technicalBasisRefs: [US_INTERACTION_METHOD_REGISTRY[0]?.technicalBasisRef ?? "aisc-interaction-framework"],
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    provenance: input.designContext.provenanceRef.timestamp,
    directContractProfile: us.directContractProfile,
  };
}
