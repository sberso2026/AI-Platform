import type { InformationPurpose, InformationType } from "../information-intelligence/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { EngineeringWorkType, InformationRequirementTemplate, ProviderConsumerKind } from "./types";

function template(
  id: string,
  workType: EngineeringWorkType,
  lifecycleStage: LifecycleStage,
  requirementType: InformationRequirementTemplate["requirementType"],
  informationType: InformationType,
  purpose: InformationPurpose,
  providerKind: ProviderConsumerKind,
  providerDiscipline: string | null,
  consumerKind: ProviderConsumerKind,
  consumerDiscipline: string | null,
  blocking: boolean,
  title: string,
  whyRequired: string,
): InformationRequirementTemplate {
  return {
    id,
    workType,
    lifecycleStage,
    requirementType,
    informationType,
    purpose,
    providerKind,
    providerDiscipline,
    consumerKind,
    consumerDiscipline,
    blocking,
    requireAuthoritative: blocking,
    title,
    whyRequired,
  };
}

export const INFORMATION_REQUIREMENT_TEMPLATES: InformationRequirementTemplate[] = [
  template("tpl-feed-found-dc", "FOUNDATION_CALCULATION", "FEED", "DESIGN_CRITERIA", "DESIGN_CRITERIA", "FOR_ENGINEERING_REVIEW", "DISCIPLINE", "STRUCTURAL", "DISCIPLINE", "STRUCTURAL", true, "Structural design criteria", "Required to start crusher foundation preliminary design."),
  template("tpl-feed-found-load", "FOUNDATION_CALCULATION", "FEED", "LOAD_DATA", "LOAD_DATA", "FOR_DESIGN_INPUT", "DISCIPLINE", "MECHANICAL", "DISCIPLINE", "STRUCTURAL", true, "Mechanical equipment reactions", "Structural consumes mechanical reactions for foundation calculation."),
  template("tpl-feed-found-geo", "FOUNDATION_CALCULATION", "FEED", "GEOTECHNICAL_DATA", "MATERIAL_PROPERTY", "FOR_DESIGN_INPUT", "VENDOR", null, "DISCIPLINE", "STRUCTURAL", true, "Geotechnical bearing capacity", "Required geotechnical parameter for foundation calculation."),
  template("tpl-feed-found-survey", "FOUNDATION_CALCULATION", "FEED", "SURVEY_DATA", "SURVEY_DATA", "FOR_DESIGN_INPUT", "DISCIPLINE", "CIVIL", "DISCIPLINE", "STRUCTURAL", true, "Survey level", "Site level is required before foundation calculation can start."),
  template("tpl-feed-iface-load", "CROSS_DISCIPLINE_INTERFACE", "FEED", "INTERFACE_INPUT", "LOAD_DATA", "FOR_COORDINATION", "DISCIPLINE", "MECHANICAL", "DISCIPLINE", "STRUCTURAL", true, "Interface equipment loads", "Information that must be supplied across the Mechanical–Structural interface."),
  template("tpl-con-anchor", "CONSTRUCTION_CLARIFICATION", "CONSTRUCTION", "CONSTRUCTION_INFORMATION", "DRAWING", "FOR_CONSTRUCTION_REFERENCE", "CONSTRUCTION", null, "DISCIPLINE", "STRUCTURAL", true, "Anchor bolt location clarification", "Construction RFI/TQ information need around an engineering source."),
  template("tpl-ho-drawing", "SUBSYSTEM_HANDOVER", "COMMISSIONING", "HANDOVER_INFORMATION", "DRAWING", "FOR_OPERATIONS_REFERENCE", "ENGINEERING", "STRUCTURAL", "OWNER", null, true, "Final drawing", "Handover requires the final governed drawing reference."),
  template("tpl-ho-calc", "SUBSYSTEM_HANDOVER", "COMMISSIONING", "HANDOVER_INFORMATION", "CALCULATION", "FOR_OPERATIONS_REFERENCE", "ENGINEERING", "STRUCTURAL", "OWNER", null, true, "Final calculation", "Handover requires the final governed calculation reference."),
  template("tpl-ho-manual", "SUBSYSTEM_HANDOVER", "COMMISSIONING", "HANDOVER_INFORMATION", "DATASHEET", "FOR_OPERATIONS_REFERENCE", "VENDOR", null, "OWNER", null, true, "Vendor manual", "Handover requires vendor manual as a canonical information reference."),
  template("tpl-ho-test", "SUBSYSTEM_HANDOVER", "COMMISSIONING", "COMMISSIONING_INFORMATION", "TEST_DATA", "FOR_COMMISSIONING", "COMMISSIONING", null, "OWNER", null, true, "Commissioning test", "Handover requires commissioning test evidence."),
];

export const LIFECYCLE_INFORMATION_PROFILES: Record<LifecycleStage, string[]> = {
  CONCEPT: ["coarse design basis", "site constraints", "production requirements", "major assumptions"],
  PREFEASIBILITY: ["option inputs", "preliminary loads", "cost/constructability inputs"],
  FEASIBILITY: ["selected concept inputs", "cross-discipline information", "risk-reduction data"],
  FEED: ["design criteria", "equipment data", "loads", "interfaces", "specification inputs"],
  DETAILED_DESIGN: ["final design inputs", "vendor information", "analysis inputs", "configuration data"],
  CONSTRUCTION: ["current construction information", "RFIs/TQs", "field data"],
  COMMISSIONING: ["test requirements", "as-built information", "vendor manuals"],
  OPERATIONS: ["final configuration", "O&M data", "design basis", "commissioning evidence"],
  MODIFICATION: ["as-operating configuration", "modification design inputs"],
};

export function templatesForWork(workType: EngineeringWorkType, lifecycleStage: LifecycleStage) {
  return INFORMATION_REQUIREMENT_TEMPLATES.filter((row) => row.workType === workType && row.lifecycleStage === lifecycleStage);
}

export const A11A_COMPATIBILITY = {
  getRequiredInformationForWork: true,
  resolveWorkReadiness: true,
  calculationGenerationImplemented: false,
} as const;
