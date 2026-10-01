import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { ConditionalStartPolicy, EngineeringWorkTemplate, ExpectedOutputType, GeneratorWorkType } from "./types";

function workTemplate(
  code: string,
  name: string,
  workType: GeneratorWorkType,
  lifecycleStage: LifecycleStage,
  disciplines: string[],
  informationWorkType: EngineeringWorkTemplate["informationWorkType"],
  requirementCategories: string[],
  expectedOutputs: ExpectedOutputType[],
  toolCapabilities: string[],
  reviewExpectation: string,
  conditionalStartPolicy: ConditionalStartPolicy,
  requireAcknowledgment: boolean,
  actionCodes: string[],
): EngineeringWorkTemplate {
  return {
    id: `ewt-${code.toLowerCase()}-v1`,
    code,
    name,
    version: "v1",
    workType,
    lifecycleStage,
    disciplines,
    informationWorkType,
    requirementCategories,
    expectedOutputs,
    toolCapabilities,
    reviewExpectation,
    conditionalStartPolicy,
    requireAcknowledgment,
    actionCodes,
  };
}

export const ENGINEERING_WORK_TEMPLATES: EngineeringWorkTemplate[] = [
  workTemplate("EWT-CONCEPT-STUDY", "Concept study", "CONCEPT_STUDY", "CONCEPT", ["PROCESS", "MECHANICAL", "CIVIL"], null, ["CLIENT", "FUNCTIONAL"], ["CONCEPT_STUDY", "OPTION_STUDY"], [], "Concept peer review", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_CONCEPT_STUDY", "PREPARE_PRELIMINARY_SIZING", "PREPARE_OPTION_STUDY"]),
  workTemplate("EWT-PRELIM-SIZING", "Preliminary sizing", "PRELIMINARY_SIZING", "CONCEPT", ["MECHANICAL", "STRUCTURAL"], null, ["PERFORMANCE"], ["CALCULATION_WORKBOOK"], [], "Concept check", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_CALCULATION"]),
  workTemplate("EWT-OPTION-STUDY", "Option study", "OPTION_STUDY", "PREFEASIBILITY", ["PROCESS", "MECHANICAL", "CIVIL"], null, ["CLIENT", "PERFORMANCE"], ["OPTION_STUDY", "ANALYSIS_REQUEST"], ["engineering_analysis"], "Option-study review, no automatic winner", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_OPTION_STUDY", "PREPARE_ANALYSIS"]),
  workTemplate("EWT-FEAS-MULTI", "Multidiscipline feasibility refinement", "ENGINEERING_ANALYSIS", "FEASIBILITY", ["PROCESS", "MECHANICAL", "STRUCTURAL", "CIVIL"], "CROSS_DISCIPLINE_INTERFACE", ["FUNCTIONAL", "PERFORMANCE", "SAFETY"], ["ANALYSIS_REQUEST", "DESIGN_REPORT"], ["engineering_analysis"], "Feasibility multidisciplined review", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_ANALYSIS", "PREPARE_DESIGN_REPORT"]),
  workTemplate("EWT-FEED-STRUCT", "Prepare FEED structural engineering", "DESIGN_CALCULATION", "FEED", ["STRUCTURAL"], "FOUNDATION_CALCULATION", ["DESIGN", "SAFETY"], ["CALCULATION_WORKBOOK", "ANALYSIS_REQUEST", "DRAWING_INPUT", "REVIEW_PACKAGE"], ["engineering_analysis"], "FEED structural review", "REQUIRE_ACCEPTED_INPUTS", false, ["PREPARE_CALCULATION", "PREPARE_ANALYSIS", "CREATE_REVIEW"]),
  workTemplate("EWT-DD-FOUNDATION", "Foundation design calculation", "DESIGN_CALCULATION", "DETAILED_DESIGN", ["STRUCTURAL"], "FOUNDATION_CALCULATION", ["DESIGN", "SAFETY"], ["CALCULATION_WORKBOOK", "ANALYSIS_REQUEST", "DRAWING_INPUT", "DESIGN_REPORT"], ["engineering_analysis"], "Detailed design calculation review", "REQUIRE_ACCEPTED_INPUTS", false, ["PREPARE_CALCULATION", "PREPARE_ANALYSIS", "PREPARE_DESIGN_REPORT"]),
  workTemplate("EWT-CON-RFI", "RFI/TQ engineering response", "RFI_TQ_RESPONSE", "CONSTRUCTION", ["STRUCTURAL"], "CONSTRUCTION_CLARIFICATION", ["DESIGN"], ["RFI_RESPONSE", "TQ_RESPONSE", "CHANGE_ASSESSMENT", "REVIEW_PACKAGE"], [], "Construction engineering response review", "REQUIRE_ACCEPTED_INPUTS", false, ["ASSESS_CHANGE", "PREPARE_RFI_TQ_RESPONSE", "OPEN_CURRENT_DRAWING", "CREATE_REVIEW"]),
  workTemplate("EWT-COMM-ENG", "Commissioning engineering query", "COMMISSIONING_ENGINEERING", "COMMISSIONING", ["COMMISSIONING", "MECHANICAL"], null, ["OPERABILITY"], ["ANALYSIS_REQUEST"], [], "Commissioning engineering check", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_ANALYSIS"]),
  workTemplate("EWT-HANDOVER", "Prepare handover engineering", "HANDOVER_PREPARATION", "COMMISSIONING", ["STRUCTURAL", "MECHANICAL", "COMMISSIONING"], "SUBSYSTEM_HANDOVER", ["OPERABILITY"], ["HANDOVER_PACKAGE"], [], "Human handover acceptance required", "REQUIRE_ACCEPTED_INPUTS", false, ["PREPARE_HANDOVER"]),
  workTemplate("EWT-DESIGN-REPORT", "Design report", "DESIGN_REPORT", "FEED", ["STRUCTURAL"], null, ["DESIGN"], ["DESIGN_REPORT"], [], "Document review", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_DESIGN_REPORT"]),
  workTemplate("EWT-SPEC", "Specification", "SPECIFICATION", "FEED", ["MECHANICAL"], null, ["DESIGN"], ["SPECIFICATION"], [], "Specification review", "ALLOW_WITH_ASSUMPTIONS", true, ["PREPARE_SPECIFICATION"]),
  workTemplate("EWT-DESIGN-REVIEW", "Design review", "DESIGN_REVIEW", "FEED", ["STRUCTURAL"], null, ["DESIGN"], ["REVIEW_PACKAGE"], [], "Formal engineering review", "ALLOW_WITH_ASSUMPTIONS", false, ["CREATE_REVIEW"]),
  workTemplate("EWT-CHANGE", "Change assessment", "CHANGE_ASSESSMENT", "CONSTRUCTION", ["STRUCTURAL"], null, ["DESIGN"], ["CHANGE_ASSESSMENT"], [], "Change review", "ALLOW_WITH_ASSUMPTIONS", true, ["ASSESS_CHANGE"]),
];

export function templateFor(workType: GeneratorWorkType, lifecycleStage: LifecycleStage) {
  return (
    ENGINEERING_WORK_TEMPLATES.find((row) => row.workType === workType && row.lifecycleStage === lifecycleStage) ??
    ENGINEERING_WORK_TEMPLATES.find((row) => row.workType === workType) ??
    null
  );
}

export const A11B_HANDOFF = {
  preparesContext: true,
  generatesXlsx: false,
  generatesDocx: false,
  generatesPptx: false,
  generatesPdf: false,
  generatesCad: false,
} as const;
