import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { GeneratorWorkType } from "../work-generator/types";

export type WorkbenchActionAvailability = "AVAILABLE" | "REQUIRES_WORK_PLAN" | "UNAVAILABLE";

export type WorkbenchAction = {
  code: string;
  label: string;
  workType: GeneratorWorkType | null;
  href: string | null;
  availability: WorkbenchActionAvailability;
  reason: string;
  reuses: string;
};

const DEEP = {
  information: "/engineering/information",
  requirements: "/engineering/information-requirements",
  assumptions: "/engineering/decisions",
  systems: "/engineering/systems",
  interfaces: "/engineering/interfaces",
  decisions: "/engineering/decisions",
  optimization: "/engineering/optimization",
  analysis: "/engineering/analysis",
  review: "/engineering/apps/project-intelligence/documents/review",
  deliverables: "/engineering/deliverables",
  lifecycle: "/engineering/lifecycle",
  thread: "/engineering/thread",
  configuration: "/engineering/configuration",
} as const;

function start(code: string, label: string, workType: GeneratorWorkType, reuses = "A11A"): WorkbenchAction {
  return {
    code,
    label,
    workType,
    href: null,
    availability: "AVAILABLE",
    reason: "Starts an Engineering Work Plan using the existing Work Generator.",
    reuses,
  };
}

function link(code: string, label: string, href: string, reuses: string, reason: string): WorkbenchAction {
  return {
    code,
    label,
    workType: null,
    href,
    availability: "AVAILABLE",
    reason,
    reuses,
  };
}

function unavailable(code: string, label: string, reason: string): WorkbenchAction {
  return {
    code,
    label,
    workType: null,
    href: null,
    availability: "UNAVAILABLE",
    reason,
    reuses: "A11C",
  };
}

function reviewAction(): WorkbenchAction {
  return {
    code: "RUN_PRE_ISSUE_REVIEW",
    label: "Run Pre-Issue Review",
    workType: null,
    href: null,
    availability: "REQUIRES_WORK_PLAN",
    reason: "Available on an active Work Plan. Reuses Automated Engineering Review.",
    reuses: "A11D",
  };
}

export function workbenchActionsForLifecycle(stage: LifecycleStage | "UNKNOWN"): WorkbenchAction[] {
  if (stage === "CONCEPT") {
    return [
      start("START_CONCEPT_STUDY", "Start Concept Study", "CONCEPT_STUDY"),
      start("PREPARE_PRELIMINARY_SIZING", "Prepare Preliminary Sizing", "PRELIMINARY_SIZING"),
      start("COMPARE_CONCEPTS", "Compare Concepts", "OPTION_STUDY", "A11A+A11E+A5"),
      start("PREPARE_OPTION_STUDY", "Prepare Option Study", "OPTION_STUDY", "A11A+A11E"),
      start("GENERATE_CONCEPT_REPORT", "Generate Concept Report", "CONCEPT_STUDY", "A11A+A11B"),
      link("REVIEW_INFORMATION_GAPS", "Review Information Gaps", DEEP.requirements, "A10C", "Open information requirements for this project."),
      link("CREATE_INITIAL_ASSUMPTIONS", "Create Initial Assumptions", DEEP.assumptions, "A2", "Record a governed assumption. Not a silent default."),
    ];
  }
  if (stage === "PREFEASIBILITY") {
    return [
      start("OPTION_STUDY", "Option Study", "OPTION_STUDY", "A11A+A11E+A5"),
      start("PRELIMINARY_ENGINEERING", "Preliminary Engineering", "PRELIMINARY_SIZING"),
      start("COMPARE_ALTERNATIVES", "Compare Alternatives", "OPTION_STUDY", "A11A+A11E"),
      link("REVIEW_CONSTRAINTS", "Review Constraints", DEEP.requirements, "A10C", "Review governing constraints and requirements."),
      start("PREPARE_TECHNICAL_MEMORANDUM", "Prepare Technical Memorandum", "DESIGN_REPORT", "A11A+A11B"),
      start("ASSESS_REQUIREMENT_CHANGE", "Assess Requirement Change", "CHANGE_ASSESSMENT", "A11E"),
      link("PREPARE_COST_QUANTITY_INPUTS", "Prepare Cost / Quantity Inputs", DEEP.deliverables, "A9", "Quantity/cost remain deliverable-governed. Not invented here."),
    ];
  }
  if (stage === "FEASIBILITY") {
    return [
      start("PREPARE_ENGINEERING_WORK", "Prepare Engineering Work", "ENGINEERING_ANALYSIS"),
      link("RESOLVE_INTERFACES", "Resolve Interfaces", DEEP.interfaces, "A3", "Open interface register for this project."),
      start("PREPARE_DISCIPLINE_STUDY", "Prepare Discipline Study", "ENGINEERING_ANALYSIS"),
      start("PREPARE_ANALYSIS", "Prepare Analysis", "ENGINEERING_ANALYSIS", "A11A+A11C"),
      start("PREPARE_DESIGN_REPORT", "Prepare Design Report", "DESIGN_REPORT", "A11A+A11B"),
      link("REVIEW_INFORMATION_REQUIREMENTS", "Review Information Requirements", DEEP.requirements, "A10C", "Open required information for this work type."),
      start("ASSESS_OPTION_CHANGE", "Assess Option / Change", "CHANGE_ASSESSMENT", "A11E"),
    ];
  }
  if (stage === "FEED") {
    return [
      start("START_CALCULATION", "Start Calculation", "DESIGN_CALCULATION", "A11A+A11B"),
      start("PREPARE_ANALYSIS", "Prepare Analysis", "ENGINEERING_ANALYSIS", "A11A+A11C"),
      start("GENERATE_DESIGN_REPORT", "Generate Design Report", "DESIGN_REPORT", "A11A+A11B"),
      start("GENERATE_SPECIFICATION", "Generate Specification", "SPECIFICATION", "A11A+A11B"),
      start("PREPARE_FEED_PACKAGE", "Prepare FEED Package", "DESIGN_REPORT", "A11A"),
      link("REVIEW_INTERFACES", "Review Interfaces", DEEP.interfaces, "A3", "Open current interface context."),
      start("ASSESS_VENDOR_CHANGE", "Assess Vendor Change", "CHANGE_ASSESSMENT", "A11E"),
      reviewAction(),
    ];
  }
  if (stage === "DETAILED_DESIGN") {
    return [
      start("START_CALCULATION", "Start Calculation", "DESIGN_CALCULATION", "A11A+A11B"),
      start("PREPARE_ANALYSIS", "Prepare Analysis", "ENGINEERING_ANALYSIS", "A11A+A11C"),
      unavailable("OPEN_CURRENT_DRAWING", "Open Current Drawing", "CAD plugin is not certified. Current drawing opens from governed sources when a Work Plan is available."),
      start("GENERATE_DESIGN_REPORT", "Generate / Update Design Report", "DESIGN_REPORT", "A11A+A11B"),
      start("GENERATE_SPECIFICATION", "Generate Specification", "SPECIFICATION", "A11A+A11B"),
      reviewAction(),
      start("ASSESS_DESIGN_CHANGE", "Assess Design Change", "CHANGE_ASSESSMENT", "A11E"),
      start("CREATE_REVIEW_PACKAGE", "Create Review Package", "DESIGN_REVIEW", "A11D"),
    ];
  }
  if (stage === "CONSTRUCTION") {
    return [
      start("RESPOND_RFI_TQ", "Respond to RFI/TQ", "RFI_TQ_RESPONSE", "A11E"),
      start("ASSESS_FIELD_CHANGE", "Assess Field Change", "CHANGE_ASSESSMENT", "A11E"),
      start("ASSESS_CLASH", "Assess Clash", "CHANGE_ASSESSMENT", "A11E"),
      link("OPEN_CONSTRUCTION_INFORMATION", "Open Current Construction Information", DEEP.information, "A10A+A11C", "Open governing construction information."),
      start("PREPARE_TECHNICAL_RESPONSE", "Prepare Technical Response", "RFI_TQ_RESPONSE", "A11A+A11B"),
      start("REVIEW_POTENTIAL_IMPACT", "Review Potential Impact", "CHANGE_ASSESSMENT", "A11E"),
      reviewAction(),
      start("CREATE_CHANGE_DECISION", "Create Change / Decision", "CHANGE_ASSESSMENT", "A11E+A2"),
    ];
  }
  if (stage === "COMMISSIONING") {
    return [
      link("REVIEW_SYSTEM_INFORMATION", "Review System Information", DEEP.systems, "A3", "Open system context for commissioning."),
      start("ASSESS_COMMISSIONING_QUERY", "Assess Commissioning Query", "COMMISSIONING_ENGINEERING", "A11A"),
      link("REVIEW_CONFIGURATION", "Review Configuration", DEEP.configuration, "A4", "Open configuration register."),
      start("PREPARE_ENGINEERING_RESPONSE", "Prepare Engineering Response", "COMMISSIONING_ENGINEERING", "A11A+A11B"),
      link("REVIEW_TEST_EVIDENCE", "Review Test Evidence", DEEP.information, "A10A", "Open current test/commissioning information."),
      start("ASSESS_HANDOVER_IMPACT", "Assess Handover Impact", "HANDOVER_PREPARATION", "A11E"),
    ];
  }
  if (stage === "OPERATIONS" || stage === "MODIFICATION") {
    return [
      start("PREPARE_HANDOVER", "Prepare Handover", "HANDOVER_PREPARATION", "A11A+A10C"),
      link("REVIEW_MISSING_INFORMATION", "Review Missing Information", DEEP.requirements, "A10C", "Open missing handover information."),
      link("REVIEW_STALE_INFORMATION", "Review Stale Information", DEEP.information, "A10A", "Open stale governing information."),
      link("UPDATE_FINAL_CONFIGURATION", "Update Final Configuration Context", DEEP.configuration, "A4", "Configuration remains a human-governed register."),
      start("REVIEW_HANDOVER_PACKAGE", "Review Handover Package", "HANDOVER_PREPARATION", "A10C"),
      start("GENERATE_HANDOVER_REPORT", "Generate Handover Report", "HANDOVER_PREPARATION", "A11B"),
      ...(stage === "MODIFICATION"
        ? [
            start("ASSESS_DESIGN_CHANGE", "Assess Design Change", "CHANGE_ASSESSMENT", "A11E"),
            start("START_CALCULATION", "Start Calculation", "DESIGN_CALCULATION", "A11A+A11B"),
            reviewAction(),
          ]
        : []),
    ];
  }
  return [
    start("START_CALCULATION", "Start Calculation", "DESIGN_CALCULATION", "A11A+A11B"),
    start("PREPARE_ANALYSIS", "Prepare Analysis", "ENGINEERING_ANALYSIS"),
    start("GENERATE_DESIGN_REPORT", "Prepare Design Report", "DESIGN_REPORT"),
    start("ASSESS_CHANGE", "Assess Change", "CHANGE_ASSESSMENT", "A11E"),
    start("RESPOND_RFI_TQ", "Respond to RFI/TQ", "RFI_TQ_RESPONSE", "A11E"),
    reviewAction(),
  ];
}

export const WORKBENCH_DEEP_MODULES = [
  { id: "information", label: "Information", href: DEEP.information },
  { id: "requirements", label: "Requirements", href: DEEP.requirements },
  { id: "assumptions", label: "Assumptions", href: DEEP.assumptions },
  { id: "systems", label: "Systems", href: DEEP.systems },
  { id: "interfaces", label: "Interfaces", href: DEEP.interfaces },
  { id: "decisions", label: "Decisions", href: DEEP.decisions },
  { id: "optimization", label: "Optimization", href: DEEP.optimization },
  { id: "analysis", label: "Analysis", href: DEEP.analysis },
  { id: "review", label: "Review", href: DEEP.review },
  { id: "deliverables", label: "Deliverables", href: DEEP.deliverables },
  { id: "lifecycle", label: "Lifecycle", href: DEEP.lifecycle },
  { id: "thread", label: "Digital Thread", href: DEEP.thread },
  { id: "configuration", label: "Configuration", href: DEEP.configuration },
] as const;

export const WORKBENCH_AI_BOUNDARY = {
  mayProposeActions: true,
  mayApproveDesign: false,
  mayConfirmEngineeringImpact: false,
  mayChoosePreferredOption: false,
  mayIssueRfiResponse: false,
  mayMarkIfc: false,
  mayOverrideReadiness: false,
  mayChooseAuthoritativeInformation: false,
} as const;
