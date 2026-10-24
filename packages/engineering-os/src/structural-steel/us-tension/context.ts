import type { SteelCapacityEngineInput, USSteelDesignContext, USSteelTensionContext, UsSteelResolverInput } from "@rtb/types";
import { AISC_UNKNOWN_EDITION_TOKEN, DEFAULT_LRFD_OR_ASD, SILENT_AISC_EDITION_INFERENCE, SILENT_LRFD_ASD_CONVERSION } from "@rtb/types";
import { resolveAiscSteelFamily } from "../us-standard/family";
import { resolveUsSteelContext, unknownEditionBlocksUsConformance } from "../us-standard/resolver";
import { US_TENSION_METHOD_REGISTRY } from "./registry";

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

export function assertUsTensionStandardContext(input: SteelCapacityEngineInput): USSteelDesignContext {
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
  return resolved.context;
}

export function assertAiscTensionEditionIsolation(methodEdition: string, contextEdition: string): void {
  if (methodEdition !== AISC_UNKNOWN_EDITION_TOKEN && contextEdition !== AISC_UNKNOWN_EDITION_TOKEN && methodEdition !== contextEdition) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC tension method cannot silently cross editions");
  }
}

export function createUsTensionContext(input: SteelCapacityEngineInput): USSteelTensionContext {
  const us = assertUsTensionStandardContext(input);
  if (us.designMethod !== "LRFD" && us.designMethod !== "ASD") {
    throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  }
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    axialDemandRef: input.demand.resultId,
    designMethod: us.designMethod,
    unitSystem: us.unitSystem,
    grossAreaRef: input.section.area?.provenanceRef ?? "ungoverned",
    netAreaRef: input.section.netArea?.provenanceRef ?? "ungoverned",
    effectiveNetAreaRef: null,
    standardContextRef: input.standardContext.contextId,
    buildingCodeContextRef: us.directContractProfile ? null : (us.buildingCodeAdoptionRef ?? us.buildingCodeAdoption?.adoptionId ?? null),
    loadStandardContextRef: us.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
    engineeringRuleRefs: US_TENSION_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: ["established-mechanics-nominal-tension-force-equals-stress-times-area"],
    materialPropertyRefs: [input.material.yieldStrength?.provenanceRef, input.material.ultimateStrength?.provenanceRef].filter((row): row is string => Boolean(row)),
    sectionPropertyRefs: [input.section.area?.provenanceRef, input.section.netArea?.provenanceRef].filter((row): row is string => Boolean(row)),
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenance: input.designContext.provenanceRef.timestamp,
    directContractProfile: us.directContractProfile,
  };
}
