/**
 * EOS-3-WORKFLOW-1 — Engineering Pattern registry (governed templates).
 * Pattern ≠ discipline ≠ project type ≠ maturity. Does not grant engineering authority.
 */

export const ENGINEERING_PATTERN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
  "SUPERSEDED",
] as const;
export type EngineeringPatternStatus = (typeof ENGINEERING_PATTERN_STATUSES)[number];

export type PatternStageDefinition = {
  stageId: string;
  label: string;
  order: number;
  optional: boolean;
  entryAllowed: boolean;
  expectedInputs: string[];
  expectedOutputs: string[];
  expectedReviews: string[];
  expectedDecisions: string[];
  expectedAssumptions: string[];
  expectedDeliverables: string[];
  optionalActivities: string[];
  conditionalActivities: Array<{
    when: string;
    activity: string;
  }>;
};

export type PatternGateDefinition = {
  gateId: string;
  label: string;
  afterStageId: string;
  requiredInputClasses: string[];
  requiredDecisionClasses: string[];
  requiredReviewClasses: string[];
  requiredDeliverableClasses: string[];
  blocksOnMaterialImpact: boolean;
  autoApproval: false;
};

export type EngineeringPatternDefinition = {
  patternId: string;
  name: string;
  engineerFacingWorkType: string;
  description: string;
  version: string;
  status: EngineeringPatternStatus;
  supersededByPatternId: string | null;
  permittedEntryStageIds: string[];
  stages: PatternStageDefinition[];
  gates: PatternGateDefinition[];
  completionCriteria: string[];
  allowedTransitions: Array<{ fromStageId: string; toStageId: string }>;
  jurisdictionProfileHooks: string[];
  organizationProfileHooks: string[];
  disciplineProfileHooks: string[];
  provenance: Record<string, unknown>;
};

function stage(
  partial: Omit<PatternStageDefinition, "expectedInputs" | "expectedOutputs" | "expectedReviews" | "expectedDecisions" | "expectedAssumptions" | "expectedDeliverables" | "optionalActivities" | "conditionalActivities"> &
    Partial<PatternStageDefinition>,
): PatternStageDefinition {
  return {
    expectedInputs: [],
    expectedOutputs: [],
    expectedReviews: [],
    expectedDecisions: [],
    expectedAssumptions: [],
    expectedDeliverables: [],
    optionalActivities: [],
    conditionalActivities: [],
    optional: false,
    entryAllowed: false,
    ...partial,
  };
}

function transitionsSequential(stages: PatternStageDefinition[]) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  const edges: Array<{ fromStageId: string; toStageId: string }> = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    edges.push({ fromStageId: ordered[i]!.stageId, toStageId: ordered[i + 1]!.stageId });
  }
  return edges;
}

const GREENFIELD_STAGES: PatternStageDefinition[] = [
  stage({
    stageId: "concept",
    label: "Concept",
    order: 1,
    entryAllowed: true,
    expectedInputs: ["Opportunity statement", "Site constraints"],
    expectedOutputs: ["Concept options"],
  }),
  stage({
    stageId: "feasibility",
    label: "Feasibility",
    order: 2,
    entryAllowed: true,
    expectedInputs: ["Concept basis"],
    expectedOutputs: ["Feasibility assessment"],
    expectedDecisions: ["Preferred concept"],
  }),
  stage({
    stageId: "feed",
    label: "FEED",
    order: 3,
    entryAllowed: true,
    expectedInputs: ["Selected concept"],
    expectedOutputs: ["FEED package"],
    expectedReviews: ["FEED review"],
  }),
  stage({
    stageId: "detailed_engineering",
    label: "Detailed Engineering",
    order: 4,
    entryAllowed: true,
    expectedInputs: ["FEED / design basis"],
    expectedOutputs: ["Detailed design"],
    expectedDeliverables: ["Calculation", "Drawing", "Specification"],
    expectedAssumptions: ["Design input assumptions"],
    expectedDecisions: ["Key design decisions"],
  }),
  stage({
    stageId: "ready_for_construction",
    label: "Ready for Construction",
    order: 5,
    entryAllowed: false,
    expectedReviews: ["IFC review"],
    expectedDeliverables: ["IFC package"],
  }),
  stage({
    stageId: "construction_support",
    label: "Construction Support",
    order: 6,
    entryAllowed: false,
    optional: true,
  }),
  stage({
    stageId: "commissioning_handover",
    label: "Commissioning / Handover",
    order: 7,
    entryAllowed: false,
    expectedDeliverables: ["As-built", "Handover dossier"],
  }),
];

const BROWNFIELD_STAGES: PatternStageDefinition[] = [
  stage({
    stageId: "modification_definition",
    label: "Change / Modification Definition",
    order: 1,
    entryAllowed: true,
    expectedInputs: ["Modification scope", "Existing asset context"],
    expectedOutputs: ["Modification definition"],
  }),
  stage({
    stageId: "existing_baseline_confirmation",
    label: "Existing Baseline Confirmation",
    order: 2,
    entryAllowed: true,
    expectedInputs: ["As-built / survey / existing drawings"],
    optionalActivities: ["Site survey", "Laser scan"],
  }),
  stage({
    stageId: "impact_interface_assessment",
    label: "Impact & Interface Assessment",
    order: 3,
    entryAllowed: true,
    expectedInputs: ["Interfaces", "Dependencies"],
    expectedOutputs: ["Impact assessment"],
    conditionalActivities: [
      { when: "affects_operating_process_line", activity: "Process review" },
    ],
  }),
  stage({
    stageId: "engineering_design",
    label: "Engineering Design",
    order: 4,
    entryAllowed: true,
    expectedInputs: ["Confirmed baseline", "Assumptions"],
    expectedOutputs: ["Design outputs"],
    expectedAssumptions: ["Vendor / operating loads"],
    expectedDecisions: ["Support strategy"],
    expectedDeliverables: ["Calculation", "Marked-up drawing"],
    optionalActivities: ["Temporary works design"],
  }),
  stage({
    stageId: "verification_review",
    label: "Verification / Review",
    order: 5,
    entryAllowed: false,
    expectedReviews: ["Discipline check", "IDC"],
  }),
  stage({
    stageId: "ready_for_construction_ifc",
    label: "Ready for Construction / IFC",
    order: 6,
    entryAllowed: false,
    expectedDeliverables: ["IFC deliverable"],
  }),
  stage({
    stageId: "construction_support",
    label: "Construction Support",
    order: 7,
    entryAllowed: false,
    optional: true,
  }),
  stage({
    stageId: "as_built_handover",
    label: "As-Built / Handover",
    order: 8,
    entryAllowed: false,
    expectedDeliverables: ["As-built revision"],
  }),
  stage({
    stageId: "closed",
    label: "Closed",
    order: 9,
    entryAllowed: false,
  }),
];

const BROWNFIELD_GATES: PatternGateDefinition[] = [
  {
    gateId: "M0",
    label: "M0 Modification Authorized",
    afterStageId: "modification_definition",
    requiredInputClasses: ["Modification scope"],
    requiredDecisionClasses: [],
    requiredReviewClasses: [],
    requiredDeliverableClasses: [],
    blocksOnMaterialImpact: false,
    autoApproval: false,
  },
  {
    gateId: "M1",
    label: "M1 Existing Basis Confirmed",
    afterStageId: "existing_baseline_confirmation",
    requiredInputClasses: ["Existing baseline"],
    requiredDecisionClasses: [],
    requiredReviewClasses: [],
    requiredDeliverableClasses: [],
    blocksOnMaterialImpact: false,
    autoApproval: false,
  },
  {
    gateId: "M2",
    label: "M2 Interdisciplinary Impact Understood",
    afterStageId: "impact_interface_assessment",
    requiredInputClasses: ["Interface assessment"],
    requiredDecisionClasses: [],
    requiredReviewClasses: [],
    requiredDeliverableClasses: [],
    blocksOnMaterialImpact: true,
    autoApproval: false,
  },
  {
    gateId: "M3",
    label: "M3 Design Verified / Approved",
    afterStageId: "verification_review",
    requiredInputClasses: [],
    requiredDecisionClasses: ["Support strategy"],
    requiredReviewClasses: ["Discipline check"],
    requiredDeliverableClasses: ["Calculation"],
    blocksOnMaterialImpact: true,
    autoApproval: false,
  },
  {
    gateId: "M4",
    label: "M4 Ready for Construction",
    afterStageId: "ready_for_construction_ifc",
    requiredInputClasses: [],
    requiredDecisionClasses: [],
    requiredReviewClasses: ["IDC"],
    requiredDeliverableClasses: ["IFC deliverable"],
    blocksOnMaterialImpact: true,
    autoApproval: false,
  },
  {
    gateId: "M5",
    label: "M5 Construction Complete",
    afterStageId: "construction_support",
    requiredInputClasses: [],
    requiredDecisionClasses: [],
    requiredReviewClasses: [],
    requiredDeliverableClasses: [],
    blocksOnMaterialImpact: false,
    autoApproval: false,
  },
  {
    gateId: "M6",
    label: "M6 As-Built / Handover Complete",
    afterStageId: "as_built_handover",
    requiredInputClasses: [],
    requiredDecisionClasses: [],
    requiredReviewClasses: [],
    requiredDeliverableClasses: ["As-built revision"],
    blocksOnMaterialImpact: false,
    autoApproval: false,
  },
];

const ASSET_INTEGRITY_STAGES: PatternStageDefinition[] = [
  stage({ stageId: "defect_identified", label: "Defect Identified", order: 1, entryAllowed: true }),
  stage({
    stageId: "condition_information",
    label: "Condition Information Collected",
    order: 2,
    entryAllowed: true,
    expectedInputs: ["Inspection / condition data"],
  }),
  stage({ stageId: "assessment", label: "Assessment", order: 3, entryAllowed: true }),
  stage({
    stageId: "fitness_capacity",
    label: "Fitness / Capacity Determination",
    order: 4,
    entryAllowed: false,
    expectedDecisions: ["Fitness determination"],
  }),
  stage({
    stageId: "repair_recommendation",
    label: "Repair Recommendation",
    order: 5,
    entryAllowed: false,
    optional: true,
  }),
  stage({
    stageId: "review_approval",
    label: "Review / Approval",
    order: 6,
    entryAllowed: false,
    expectedReviews: ["Integrity review"],
  }),
  stage({
    stageId: "remediation_or_monitoring",
    label: "Remediation or Monitoring",
    order: 7,
    entryAllowed: false,
  }),
  stage({ stageId: "closeout", label: "Closeout", order: 8, entryAllowed: false }),
];

const REPAIR_STAGES: PatternStageDefinition[] = [
  stage({ stageId: "defect_definition", label: "Defect Definition", order: 1, entryAllowed: true }),
  stage({
    stageId: "cause_basis_assessment",
    label: "Cause / Basis Assessment",
    order: 2,
    entryAllowed: true,
  }),
  stage({
    stageId: "repair_design",
    label: "Repair Design",
    order: 3,
    entryAllowed: true,
    expectedDeliverables: ["Repair design"],
  }),
  stage({
    stageId: "verification",
    label: "Verification",
    order: 4,
    entryAllowed: false,
    expectedReviews: ["Repair verification"],
  }),
  stage({ stageId: "field_execution", label: "Field Execution", order: 5, entryAllowed: false }),
  stage({ stageId: "inspection", label: "Inspection", order: 6, entryAllowed: false }),
  stage({ stageId: "closeout", label: "Closeout", order: 7, entryAllowed: false }),
];

const VENDOR_CHANGE_STAGES: PatternStageDefinition[] = [
  stage({
    stageId: "vendor_information_change",
    label: "Vendor Information Change",
    order: 1,
    entryAllowed: true,
    expectedInputs: ["Vendor data revision"],
  }),
  stage({
    stageId: "engineering_impact_review",
    label: "Engineering Impact Review",
    order: 2,
    entryAllowed: true,
  }),
  stage({
    stageId: "discipline_assessments",
    label: "Discipline Assessments",
    order: 3,
    entryAllowed: false,
  }),
  stage({
    stageId: "decision",
    label: "Decision",
    order: 4,
    entryAllowed: false,
    expectedDecisions: ["Accept / redesign / no change"],
  }),
  stage({
    stageId: "design_update",
    label: "Design Update where required",
    order: 5,
    entryAllowed: false,
    optional: true,
  }),
  stage({
    stageId: "deliverable_update",
    label: "Deliverable Update",
    order: 6,
    entryAllowed: false,
    optional: true,
  }),
  stage({
    stageId: "approval_closeout",
    label: "Approval / Closeout",
    order: 7,
    entryAllowed: false,
    expectedReviews: ["Change closeout review"],
  }),
];

const SITE_SUPPORT_STAGES: PatternStageDefinition[] = [
  stage({
    stageId: "site_originated_issue",
    label: "Site-Originated Issue (RFI / TQ / Field)",
    order: 1,
    entryAllowed: true,
    expectedInputs: ["RFI", "TQ", "Field issue", "Deviation"],
  }),
  stage({
    stageId: "technical_response",
    label: "Technical Response",
    order: 2,
    entryAllowed: true,
  }),
  stage({
    stageId: "affected_design_review",
    label: "Affected Design Review",
    order: 3,
    entryAllowed: false,
    optional: true,
  }),
  stage({
    stageId: "approval_where_required",
    label: "Approval where required",
    order: 4,
    entryAllowed: false,
    optional: true,
  }),
  stage({ stageId: "field_closeout", label: "Field Closeout", order: 5, entryAllowed: false }),
];

function pattern(
  def: Omit<EngineeringPatternDefinition, "allowedTransitions" | "provenance" | "supersededByPatternId" | "jurisdictionProfileHooks" | "organizationProfileHooks" | "disciplineProfileHooks"> &
    Partial<EngineeringPatternDefinition>,
): EngineeringPatternDefinition {
  const stages = def.stages;
  return {
    supersededByPatternId: null,
    jurisdictionProfileHooks: ["jurisdiction.profile"],
    organizationProfileHooks: ["organization.pattern_variant"],
    disciplineProfileHooks: ["discipline.context"],
    provenance: {
      source: "eos3.engineering-pattern-registry.workflow-1",
      grantsEngineeringAuthority: false,
      isDisciplinePattern: false,
      isProjectType: false,
      universalLifecycleAssumption: false,
    },
    allowedTransitions: transitionsSequential(stages),
    ...def,
    stages,
  };
}

/** System-managed ACTIVE pattern catalog (extensible without schema redesign). */
export const EOS3_ENGINEERING_PATTERN_CATALOG: EngineeringPatternDefinition[] = [
  pattern({
    patternId: "GREENFIELD_ENGINEERING",
    name: "Greenfield Engineering",
    engineerFacingWorkType: "Greenfield Engineering",
    description: "New facility / new asset engineering progression with flexible entry.",
    version: "1.0.0",
    status: "ACTIVE",
    permittedEntryStageIds: ["concept", "feasibility", "feed", "detailed_engineering"],
    stages: GREENFIELD_STAGES,
    gates: [
      {
        gateId: "G-DE",
        label: "Detailed Engineering review ready",
        afterStageId: "detailed_engineering",
        requiredInputClasses: ["Design basis"],
        requiredDecisionClasses: [],
        requiredReviewClasses: [],
        requiredDeliverableClasses: ["Calculation"],
        blocksOnMaterialImpact: true,
        autoApproval: false,
      },
    ],
    completionCriteria: ["Required deliverables issued or waived", "Handover complete or waived"],
  }),
  pattern({
    patternId: "BROWNFIELD_MODIFICATION",
    name: "Brownfield Modification",
    engineerFacingWorkType: "Brownfield Modification",
    description:
      "Modification of existing operating / brownfield assets without forcing greenfield concept→FEED sequence.",
    version: "1.0.0",
    status: "ACTIVE",
    permittedEntryStageIds: [
      "modification_definition",
      "existing_baseline_confirmation",
      "impact_interface_assessment",
      "engineering_design",
    ],
    stages: BROWNFIELD_STAGES,
    gates: BROWNFIELD_GATES,
    completionCriteria: [
      "Required reviews complete or waived",
      "As-built / handover complete or waived",
    ],
  }),
  pattern({
    patternId: "ASSET_INTEGRITY_ASSESSMENT",
    name: "Asset Integrity Assessment",
    engineerFacingWorkType: "Asset Integrity Assessment",
    description: "Defect/condition assessment through fitness determination and closeout.",
    version: "1.0.0",
    status: "ACTIVE",
    permittedEntryStageIds: ["defect_identified", "condition_information", "assessment"],
    stages: ASSET_INTEGRITY_STAGES,
    gates: [
      {
        gateId: "AI-1",
        label: "Fitness determination ready for review",
        afterStageId: "fitness_capacity",
        requiredInputClasses: ["Condition information"],
        requiredDecisionClasses: ["Fitness determination"],
        requiredReviewClasses: [],
        requiredDeliverableClasses: [],
        blocksOnMaterialImpact: true,
        autoApproval: false,
      },
    ],
    completionCriteria: ["Assessment closed or monitoring plan accepted"],
  }),
  pattern({
    patternId: "REPAIR_REMEDIATION",
    name: "Repair / Remediation",
    engineerFacingWorkType: "Repair / Remediation",
    description: "Approved repair of deteriorated members or systems through closeout.",
    version: "1.0.0",
    status: "ACTIVE",
    permittedEntryStageIds: ["defect_definition", "cause_basis_assessment", "repair_design"],
    stages: REPAIR_STAGES,
    gates: [
      {
        gateId: "R-1",
        label: "Repair design verified",
        afterStageId: "verification",
        requiredInputClasses: [],
        requiredDecisionClasses: [],
        requiredReviewClasses: ["Repair verification"],
        requiredDeliverableClasses: ["Repair design"],
        blocksOnMaterialImpact: true,
        autoApproval: false,
      },
    ],
    completionCriteria: ["Inspection complete", "Closeout recorded"],
  }),
  pattern({
    patternId: "VENDOR_CHANGE_ASSESSMENT",
    name: "Vendor Change Assessment",
    engineerFacingWorkType: "Vendor Change Assessment",
    description: "Vendor information change through impact, decision, and closeout.",
    version: "1.0.0",
    status: "ACTIVE",
    permittedEntryStageIds: ["vendor_information_change", "engineering_impact_review"],
    stages: VENDOR_CHANGE_STAGES,
    gates: [
      {
        gateId: "V-1",
        label: "Vendor change decision ready",
        afterStageId: "decision",
        requiredInputClasses: ["Vendor data revision"],
        requiredDecisionClasses: ["Accept / redesign / no change"],
        requiredReviewClasses: [],
        requiredDeliverableClasses: [],
        blocksOnMaterialImpact: true,
        autoApproval: false,
      },
    ],
    completionCriteria: ["Decision recorded", "Closeout review complete or waived"],
  }),
  pattern({
    patternId: "SITE_TECHNICAL_SUPPORT",
    name: "Site Technical Support",
    engineerFacingWorkType: "Site Technical Support",
    description: "Site-originated RFI/TQ/field issues through technical response and closeout.",
    version: "1.0.0",
    status: "ACTIVE",
    permittedEntryStageIds: ["site_originated_issue", "technical_response"],
    stages: SITE_SUPPORT_STAGES,
    gates: [
      {
        gateId: "S-1",
        label: "Technical response issued",
        afterStageId: "technical_response",
        requiredInputClasses: ["Site issue"],
        requiredDecisionClasses: [],
        requiredReviewClasses: [],
        requiredDeliverableClasses: [],
        blocksOnMaterialImpact: false,
        autoApproval: false,
      },
    ],
    completionCriteria: ["Field closeout recorded"],
  }),
];

export function listActivePatterns(): EngineeringPatternDefinition[] {
  return EOS3_ENGINEERING_PATTERN_CATALOG.filter((p) => p.status === "ACTIVE");
}

export function getPatternDefinition(
  patternId: string,
  version?: string,
): EngineeringPatternDefinition | null {
  return (
    EOS3_ENGINEERING_PATTERN_CATALOG.find(
      (p) => p.patternId === patternId && (!version || p.version === version),
    ) ?? null
  );
}

export function getPatternByWorkTypeLabel(label: string): EngineeringPatternDefinition | null {
  const norm = label.trim().toLowerCase();
  return (
    EOS3_ENGINEERING_PATTERN_CATALOG.find(
      (p) =>
        p.engineerFacingWorkType.toLowerCase() === norm ||
        p.patternId.toLowerCase() === norm.replace(/\s+/g, "_"),
    ) ?? null
  );
}

/** Map WP maturity labels to nearest pattern stage ids for brownfield/greenfield. */
export function mapMaturityToPatternStage(
  patternId: string,
  maturity: string,
): string | null {
  const m = maturity.toLowerCase();
  if (patternId === "BROWNFIELD_MODIFICATION") {
    if (m.includes("detailed")) return "engineering_design";
    if (m.includes("verification") || m.includes("review")) return "verification_review";
    if (m.includes("construction") && m.includes("ready")) return "ready_for_construction_ifc";
    if (m.includes("construction")) return "construction_support";
    if (m.includes("complete") || m.includes("closed")) return "closed";
    if (m.includes("initiation") || m.includes("concept")) return "modification_definition";
    return "engineering_design";
  }
  if (patternId === "GREENFIELD_ENGINEERING") {
    if (m.includes("concept")) return "concept";
    if (m.includes("feasib")) return "feasibility";
    if (m.includes("feed")) return "feed";
    if (m.includes("detailed")) return "detailed_engineering";
    if (m.includes("ready")) return "ready_for_construction";
    if (m.includes("commission")) return "commissioning_handover";
    return "detailed_engineering";
  }
  const p = getPatternDefinition(patternId);
  return p?.permittedEntryStageIds[0] ?? p?.stages[0]?.stageId ?? null;
}

export const EOS_PATTERN_FUTURE_OBJECT_PREGENERATION = false as const;
export const EOS_PATTERN_GATE_AUTO_APPROVAL = false as const;
export const EOS_PATTERN_MANUAL_SELECTION_REQUIRED_BY_DEFAULT = false as const;
export const EOS_ONE_PROJECT_ONE_PATTERN_ASSUMPTION = false as const;
export const EOS_UNIVERSAL_LIFECYCLE_ASSUMPTION_REMOVED = true as const;
