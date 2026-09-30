import type { WorkEventType, WorkMateriality } from "./types";

export const MATERIAL_EVENT_TYPES: readonly WorkEventType[] = [
  "SOURCE_PUBLISHED",
  "DOCUMENT_REVIEW_COMPLETED",
  "CALCULATION_PUBLISHED",
  "ANALYSIS_EXECUTED",
  "DRAWING_ISSUED",
  "INTERFACE_INFORMATION_CHANGED",
  "RFI_CLOSED",
  "DECISION_RECORDED",
  "ACTION_COMPLETED",
  "DELIVERABLE_ISSUED",
  "CONFIGURATION_CHANGED",
  "MEETING_ACTION_CONFIRMED",
  "MEETING_DECISION_CONFIRMED",
  "HANDOVER_PUBLISHED",
  "HANDOVER_ACCEPTED",
];

export const ROUTINE_EVENT_TYPES: readonly WorkEventType[] = [
  "SOURCE_CREATED",
  "SOURCE_REVISED",
  "DOCUMENT_REVIEW_REQUESTED",
  "RFI_CREATED",
  "RFI_RESPONDED",
  "ACTION_CREATED",
  "DELIVERABLE_UPDATED",
  "INFORMATION_RECEIVED",
];

export function classifyWorkMateriality(eventType: WorkEventType): WorkMateriality {
  if (MATERIAL_EVENT_TYPES.includes(eventType)) return "MATERIAL";
  if (ROUTINE_EVENT_TYPES.includes(eventType)) return "ROUTINE";
  return "INFORMATIONAL";
}

export const SOURCE_EVENT_NORMALIZATION: Record<string, WorkEventType> = {
  FILE_CREATED: "SOURCE_CREATED",
  FILE_REVISED: "SOURCE_REVISED",
  FILE_PUBLISHED: "SOURCE_PUBLISHED",
  CONTROLLED_METADATA_CHANGED: "SOURCE_REVISED",
  FILE_MOVED: "SOURCE_REVISED",
  EXCEL_REVISION_SAVED: "SOURCE_REVISED",
  EXCEL_CALCULATION_PUBLISHED: "CALCULATION_PUBLISHED",
  WORD_REVISION_SAVED: "SOURCE_REVISED",
  WORD_PUBLISHED: "SOURCE_PUBLISHED",
  PDF_REVISION_RECEIVED: "SOURCE_REVISED",
  PDF_REVIEW_MARKUP_PUBLISHED: "DOCUMENT_REVIEW_REQUESTED",
  PDF_REVIEW_COMPLETED: "DOCUMENT_REVIEW_COMPLETED",
  PDF_ISSUED: "DRAWING_ISSUED",
  CAD_DRAWING_REVISED: "SOURCE_REVISED",
  CAD_DRAWING_ISSUED: "DRAWING_ISSUED",
  CAD_MODEL_REVISED: "SOURCE_REVISED",
  CAD_PUBLISHED: "SOURCE_PUBLISHED",
  ANALYSIS_JOB_COMPLETED: "ANALYSIS_EXECUTED",
  ANALYSIS_RESULT_IMPORTED: "SOURCE_PUBLISHED",
  REVIEW_COMPLETED: "DOCUMENT_REVIEW_COMPLETED",
  REVIEW_REQUESTED: "DOCUMENT_REVIEW_REQUESTED",
  RFI_CREATED: "RFI_CREATED",
  RFI_RESPONDED: "RFI_RESPONDED",
  RFI_CLOSED: "RFI_CLOSED",
  CORRESPONDENCE_ISSUED: "SOURCE_PUBLISHED",
  DECISION_RECORDED: "DECISION_RECORDED",
  ACTION_CREATED: "ACTION_CREATED",
  ACTION_COMPLETED: "ACTION_COMPLETED",
  INTERFACE_INFORMATION_CHANGED: "INTERFACE_INFORMATION_CHANGED",
  DELIVERABLE_UPDATED: "DELIVERABLE_UPDATED",
  DELIVERABLE_ISSUED: "DELIVERABLE_ISSUED",
  CONFIGURATION_CHANGED: "CONFIGURATION_CHANGED",
  MEETING_ACTION_CONFIRMED: "MEETING_ACTION_CONFIRMED",
  MEETING_DECISION_CONFIRMED: "MEETING_DECISION_CONFIRMED",
};

export const WORKFLOW_CONTRACTS = {
  excel: {
    mayEmitOnSaveRevision: "SOURCE_REVISED",
    mayEmitOnControlledPublication: "CALCULATION_PUBLISHED",
    mustNotCapture: ["cell edits", "formula keystrokes", "time in Excel"],
  },
  word: {
    mayEmitOnRevision: "SOURCE_REVISED",
    mayEmitOnReview: "DOCUMENT_REVIEW_REQUESTED",
    mayEmitOnPublication: "SOURCE_PUBLISHED",
    remainsAuthoringTool: true,
  },
  acrobat: {
    viewingAloneIsNotMaterial: true,
    mayEmit: ["SOURCE_REVISED", "DOCUMENT_REVIEW_REQUESTED", "DOCUMENT_REVIEW_COMPLETED", "DRAWING_ISSUED"],
  },
  cad: {
    pluginImplemented: false,
    mayEmit: ["SOURCE_REVISED", "DRAWING_ISSUED", "SOURCE_PUBLISHED"],
    mustNotCaptureEditingCommands: true,
  },
  analysis: {
    governedToolExecution: "ANALYSIS_EXECUTED",
    managedImport: "SOURCE_PUBLISHED",
    realSolverImplemented: false,
  },
  sharepoint: {
    connectorImplemented: false,
    sourceEvents: ["FILE_CREATED", "FILE_REVISED", "FILE_MOVED", "CONTROLLED_METADATA_CHANGED", "FILE_PUBLISHED"],
  },
  teams: {
    connectorImplemented: false,
    mustNotIngestAllConversations: true,
    allowed: ["approved project channel events", "confirmed meeting actions", "confirmed meeting decisions", "explicitly linked messages"],
    aiCandidatesRequireHumanConfirmation: true,
  },
  outlook: {
    connectorImplemented: false,
    mustNotScrapeAllEmail: true,
    allowed: ["project mailbox", "explicit Add to EOS", "project-tagged correspondence", "approved connector rules"],
    personalEmailOutsideScope: true,
  },
  edmsRfi: {
    connectorImplemented: false,
    vendors: ["Aconex", "OmTrak", "other EDMS/RFI"],
    sourceEvents: ["RFI_CREATED", "RFI_RESPONDED", "RFI_CLOSED", "CORRESPONDENCE_ISSUED"],
  },
  aiTools: {
    independentChatGptOrCopilotMonitored: false,
    allowed: ["EOS-mediated AI interaction", "explicit user-published project output"],
  },
} as const;
