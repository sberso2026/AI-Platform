/**
 * EOS-A12C lifecycle journey orchestration.
 * Code/configuration-level UX only. Not a source of engineering truth.
 * Canonical stages remain A9 LIFECYCLE_STAGES. Handover is an A10C experience.
 */

import { LIFECYCLE_STAGES, type LifecycleStage } from "../lifecycle-intelligence/types";
import type { GeneratorWorkType } from "../work-generator/types";

export const A12C_LIFECYCLE_RECON = {
  lifecycleIntelligence: "REUSE",
  lifecycleProfiles: "REUSE",
  lifecycleTransitions: "REUSE",
  gateCriteria: "REUSE",
  lifecycleActions: "EXTEND",
  engineeringWorkbench: "EXTEND",
  myEngineeringDay: "REUSE",
  engineeringWorkPlan: "EXTEND",
  informationRequirements: "REUSE",
  deliverables: "REUSE",
  digitalThread: "COMPOSE",
  configuration: "REUSE",
  handover: "REUSE",
  existingLifecycleUi: "EXTEND",
  projectLifecycleState: "REUSE",
  mixedLifecycleState: "REUSE",
  newLifecycleDomain: "NO",
  newJourneyDomain: "NO",
  newWorkbench: "NO",
  newWorkGenerator: "NO",
} as const;

export const A12C_AI_BOUNDARY = {
  maySummarizeLifecycleContext: true,
  mayExplainInheritedAssumptions: true,
  maySummarizeChanges: true,
  mayDraftNarrative: true,
  maySuggestQuestions: true,
  mayIdentifyInformationGapsFromCanonicalFacts: true,
  mayAdvanceLifecycle: false,
  mayApproveGate: false,
  maySelectOption: false,
  mayApproveDesign: false,
  mayConfirmImpact: false,
  mayAcceptCommissioning: false,
  mayAcceptHandover: false,
} as const;

export const A12C_PRIVACY = {
  employeeProductivityScoring: "PROHIBITED",
  managedRepositoryDefaultCapture: "DENY",
  allowlistedRepositoriesOnly: true,
  newContentBase64: false,
  binaryDuplication: "NO",
  companyTemplateBinaryUpload: "DEFERRED",
} as const;

export const HANDOVER_IS_CANONICAL_STAGE = false;

export type LifecycleJourneyStep = {
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  workType: GeneratorWorkType;
  handoverExperience: boolean;
  label: string;
};

export const DEFAULT_WORK_TYPE_FOR_STAGE: Record<LifecycleStage, GeneratorWorkType> = {
  CONCEPT: "CONCEPT_STUDY",
  PREFEASIBILITY: "OPTION_STUDY",
  FEASIBILITY: "ENGINEERING_ANALYSIS",
  FEED: "DESIGN_CALCULATION",
  DETAILED_DESIGN: "DESIGN_CALCULATION",
  CONSTRUCTION: "RFI_TQ_RESPONSE",
  COMMISSIONING: "COMMISSIONING_ENGINEERING",
  OPERATIONS: "HANDOVER_PREPARATION",
  MODIFICATION: "CHANGE_ASSESSMENT",
};

export const FORWARD_LIFECYCLE_WORK: Record<LifecycleStage, LifecycleJourneyStep> = {
  CONCEPT: {
    fromStage: "CONCEPT",
    toStage: "PREFEASIBILITY",
    workType: "OPTION_STUDY",
    handoverExperience: false,
    label: "Continue into Prefeasibility work",
  },
  PREFEASIBILITY: {
    fromStage: "PREFEASIBILITY",
    toStage: "FEASIBILITY",
    workType: "ENGINEERING_ANALYSIS",
    handoverExperience: false,
    label: "Continue into Feasibility work",
  },
  FEASIBILITY: {
    fromStage: "FEASIBILITY",
    toStage: "FEED",
    workType: "DESIGN_CALCULATION",
    handoverExperience: false,
    label: "Continue into FEED work",
  },
  FEED: {
    fromStage: "FEED",
    toStage: "DETAILED_DESIGN",
    workType: "DESIGN_CALCULATION",
    handoverExperience: false,
    label: "Continue into Detailed Design work",
  },
  DETAILED_DESIGN: {
    fromStage: "DETAILED_DESIGN",
    toStage: "CONSTRUCTION",
    workType: "RFI_TQ_RESPONSE",
    handoverExperience: false,
    label: "Continue into Construction engineering work",
  },
  CONSTRUCTION: {
    fromStage: "CONSTRUCTION",
    toStage: "COMMISSIONING",
    workType: "COMMISSIONING_ENGINEERING",
    handoverExperience: false,
    label: "Continue into Commissioning engineering work",
  },
  COMMISSIONING: {
    fromStage: "COMMISSIONING",
    toStage: "COMMISSIONING",
    workType: "HANDOVER_PREPARATION",
    handoverExperience: true,
    label: "Prepare Handover Package",
  },
  OPERATIONS: {
    fromStage: "OPERATIONS",
    toStage: "MODIFICATION",
    workType: "CHANGE_ASSESSMENT",
    handoverExperience: false,
    label: "Continue into Modification work",
  },
  MODIFICATION: {
    fromStage: "MODIFICATION",
    toStage: "DETAILED_DESIGN",
    workType: "DESIGN_CALCULATION",
    handoverExperience: false,
    label: "Continue modification into Detailed Design work",
  },
};

export function resolveNextLifecycleWork(
  fromStage: LifecycleStage,
  toStage?: LifecycleStage | null,
  workType?: GeneratorWorkType | null,
): LifecycleJourneyStep {
  if (toStage) {
    const handoverExperience = workType === "HANDOVER_PREPARATION" || (fromStage === "COMMISSIONING" && toStage === "COMMISSIONING");
    return {
      fromStage,
      toStage,
      workType: workType ?? DEFAULT_WORK_TYPE_FOR_STAGE[toStage],
      handoverExperience,
      label: handoverExperience ? "Prepare Handover Package" : `Continue into ${toStage.replaceAll("_", " ")} work`,
    };
  }
  return FORWARD_LIFECYCLE_WORK[fromStage];
}

export function canonicalLifecyclePreserved() {
  return {
    stages: LIFECYCLE_STAGES,
    handoverCanonicalStage: HANDOVER_IS_CANONICAL_STAGE,
    newLifecycleDomain: false,
  };
}
