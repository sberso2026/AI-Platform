/**
 * Client-safe Inspection Intelligence exports.
 * Does not pull hosted persistence or Node crypto into the browser bundle.
 */
export { PLAN_UPDATE_STATUSES } from "./domain/plan-statuses";
export {
  nextInspectionSessionStates,
  requiredActionForSessionState,
  type InspectionSessionState,
} from "./domain/state-machine";
export { nextDefectStates, type DefectLifecycleState, type DefectSeverity } from "./domain/defects";
export {
  nextCorrectiveActionStates,
  type CorrectiveActionStatus,
} from "./domain/corrective-actions";
export type { RecommendationAction } from "./domain/recommendations";
export { II_DETERMINISTIC_INDICATORS } from "./domain/deterministic-intelligence";
export { II_HISTORY_INDICATORS } from "./domain/inspection-history";
export {
  II_GOVERNED_REPORT_TYPES,
  II_PDF_EXPORT_AVAILABLE,
  nextReportAuthorityStates,
  type ReportAuthorityState,
} from "./domain/governed-reporting";
export {
  COMMAND_CENTRE_CARD_IDS,
  composeInspectionCommandCentre,
  COMMAND_CENTRE_STORES_CANONICAL_COPY,
  COMMAND_CENTRE_USES_AI_METRICS,
  type InspectionCommandCentreView,
} from "./command-centre";
