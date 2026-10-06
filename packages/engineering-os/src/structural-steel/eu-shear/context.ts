import type { En1993PartId, EurocodeSteelShearContext, SteelCapacityEngineInput } from "@rtb/types";
import { EU_INITIAL_STEEL_STANDARD_PART, INTERACTION_REVIEW_REQUIRED, SILENT_EU_STANDARD_EDITION_INFERENCE } from "@rtb/types";
import { resolveEurocodePart } from "../eu-standard/family";
import { unknownEditionBlocksConformance } from "../eu-standard/resolver";
import {
  requireStiffenerState,
  shearAxisFromInput,
  toLengthM,
  webSlendernessContext,
} from "../mechanics/shear";
import { EU_SHEAR_METHOD_REGISTRY, EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL } from "./registry";

export function assertEuShearStandardContext(context: SteelCapacityEngineInput["standardContext"]): void {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (context.standardCode !== "EN 1993-1-1") {
    throw new Error("steel design fail closed: unsupported standard part");
  }
  resolveEurocodePart(EU_INITIAL_STEEL_STANDARD_PART);
  resolveEurocodePart(EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL.webPlateStabilityFrameworkPart);
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
}

export function assertShearGenerationCompatible(generation: string): void {
  if (generation === "SECOND_GENERATION") {
    throw new Error("STANDARD_VERSION_CONFLICT: EU-5 shear methods are not silently reused across incompatible Eurocode generations");
  }
}

export function createEuShearContext(input: SteelCapacityEngineInput): EurocodeSteelShearContext {
  assertEuShearStandardContext(input.standardContext);
  const euro = input.eurocodeContext ?? null;
  if (euro) {
    unknownEditionBlocksConformance(euro);
    assertShearGenerationCompatible(euro.version.generationFamily);
  }
  if (!INTERACTION_REVIEW_REQUIRED) throw new Error("bending-shear interaction review must remain required until EU-6");
  const axis = shearAxisFromInput(input);
  const stiffenerState = requireStiffenerState(input);
  const web = webSlendernessContext(input, stiffenerState);
  const spacing = input.shear?.stiffenerSpacing;
  const panelLength = input.shear?.panelLength;
  const standardPartRefs: En1993PartId[] = [
    EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL.memberShearMechanicsPart,
    EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL.webPlateStabilityFrameworkPart,
  ];
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    shearDemandRefs: [input.demand.resultId],
    shearAxis: axis,
    sectionGeometry: input.section.sectionFamily,
    webGeometry: { clearWebDepth: web.clearWebDepth, webThickness: web.webThickness },
    shearAreaContext: "GOVERNED_EXPLICIT",
    stiffenerContext: stiffenerState,
    panelContext: {
      panelLengthM: panelLength && typeof panelLength.value === "number" ? toLengthM(panelLength, "shear.panelLength") : null,
      stiffenerSpacingM: spacing && typeof spacing.value === "number" ? toLengthM(spacing, "shear.stiffenerSpacing") : null,
      boundaryMetadata: input.shear?.panelBoundaryMetadata ?? null,
    },
    webSlenderness: web,
    standardContextRef: input.standardContext.contextId,
    standardPartRef: EU_INITIAL_STEEL_STANDARD_PART,
    standardPartRefs,
    nationalAnnexRef: input.standardContext.nationalAnnexRef?.annexId ?? euro?.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euro?.nationalAnnex?.nationalParameterSetRef ?? null,
    engineeringRuleRefs: EU_SHEAR_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: [
      "established-mechanics-von-mises-pure-shear-yield-fy-over-sqrt-3-times-governed-shear-area",
      "established-mechanics-elastic-plate-shear-buckling-kv-pi2-E-over-12-1-nu2-d-over-t-squared-times-Av",
    ],
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenanceRef: input.designContext.provenanceRef.timestamp,
  };
}
