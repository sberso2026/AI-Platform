import type { SteelCapacityEngineInput, USSteelDesignContext, USSteelShearContext, UsSteelResolverInput } from "@rtb/types";
import {
  AISC_UNKNOWN_EDITION_TOKEN,
  DEFAULT_LRFD_OR_ASD,
  INTERACTION_REVIEW_REQUIRED,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_US_SHEAR_AREA_ASSUMPTION,
  SILENT_US_STIFFENER_ASSUMPTION,
} from "@rtb/types";
import { requireStiffenerState, shearAxisFromInput, toLengthM, webSlendernessContext } from "../mechanics/shear";
import { assertAmendmentCompatibleWithAdoption } from "../us-standard/adoption";
import { resolveAiscSteelFamily } from "../us-standard/family";
import { resolveUsSteelContext, unknownEditionBlocksUsConformance } from "../us-standard/resolver";
import { usShearElementClassificationState } from "./classification";
import { US_SHEAR_METHOD_REGISTRY } from "./registry";

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

export function assertUsShearStandardContext(input: SteelCapacityEngineInput): USSteelDesignContext {
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

export function assertAiscShearEditionIsolation(methodEdition: string, contextEdition: string): void {
  if (methodEdition !== AISC_UNKNOWN_EDITION_TOKEN && contextEdition !== AISC_UNKNOWN_EDITION_TOKEN && methodEdition !== contextEdition) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC shear method cannot silently cross editions");
  }
}

export function createUsShearContext(input: SteelCapacityEngineInput): USSteelShearContext {
  const us = assertUsShearStandardContext(input);
  if (us.designMethod !== "LRFD" && us.designMethod !== "ASD") {
    throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  }
  if (SILENT_US_SHEAR_AREA_ASSUMPTION) throw new Error("shear area must not be assumed silently");
  if (SILENT_US_STIFFENER_ASSUMPTION) throw new Error("stiffener state must not be assumed silently");
  if (!INTERACTION_REVIEW_REQUIRED) throw new Error("bending-shear interaction review must remain required until US-6");
  const axis = shearAxisFromInput(input);
  const stiffenerState = requireStiffenerState(input);
  const web = webSlendernessContext(input, stiffenerState);
  const spacing = input.shear?.stiffenerSpacing;
  const panelLength = input.shear?.panelLength;
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    shearDemandRefs: [input.demand.resultId],
    designMethod: us.designMethod,
    unitSystem: us.unitSystem,
    shearAxis: axis,
    sectionGeometry: input.section.sectionFamily,
    webGeometry: { clearWebDepth: web.clearWebDepth, webThickness: web.webThickness },
    shearAreaContext: "GOVERNED_EXPLICIT",
    panelGeometryContext: {
      panelLengthM: panelLength && typeof panelLength.value === "number" ? toLengthM(panelLength, "shear.panelLength") : null,
      stiffenerSpacingM: spacing && typeof spacing.value === "number" ? toLengthM(spacing, "shear.stiffenerSpacing") : null,
      boundaryMetadata: input.shear?.panelBoundaryMetadata ?? null,
    },
    stiffenerContext: stiffenerState,
    webSlendernessContext: web,
    elementClassificationState: usShearElementClassificationState(),
    standardContextRef: input.standardContext.contextId,
    buildingCodeContextRef: us.directContractProfile ? null : (us.buildingCodeAdoptionRef ?? us.buildingCodeAdoption?.adoptionId ?? null),
    loadStandardContextRef: us.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
    engineeringRuleRefs: US_SHEAR_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: [
      "established-mechanics-von-mises-pure-shear-yield-fy-over-sqrt-3-times-governed-shear-area",
      "established-mechanics-elastic-plate-shear-buckling-kv-pi2-E-over-12-1-nu2-d-over-t-squared-times-Av",
    ],
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenance: input.designContext.provenanceRef.timestamp,
    directContractProfile: us.directContractProfile,
  };
}
