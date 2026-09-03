/**
 * Browser-safe Engineering OS exports.
 * Client components must import from `@rtb/engineering-os/browser`.
 * Do not re-export the package barrel — it pulls Node-only tool invocation.
 */

export {
  E1_EXPERIENCE_ROUTES,
  E1_SURFACE_CAPABILITY_GATES,
  ENGINEERING_CONTEXT_STORAGE_KEY,
  createEmptyEngineeringContext,
  parseDeepLinkContext,
  type EngineeringExperienceContext,
} from "./phase-e1/contracts";

export {
  getDefaultIntelligenceCatalog,
  listUserFacingCatalogConcepts,
} from "./phase-e9/catalog";

export { contextualIntelligenceActions } from "./phase-e9/ask-bridge";

export type { DeploymentProfile, EngineeringUxDensity } from "./phase-e10/contracts";
export { resolveProfilePrimaryNav } from "./phase-e10/visibility";
export { resolveUxDensity } from "./phase-e10/nav-bridge";

export {
  createAdoptionEvent,
  EngineeringAdoptionEventBuffer,
  type EngineeringAdoptionEventType,
  type EngineeringFeedbackReason,
} from "./phase-e11/adoption";

export {
  ENGINEERING_DOCUMENT_TYPES,
  proposeDocumentMetadataFromFilename,
  type EngineeringDocumentTypeValue,
} from "./services/document-registration";
export {
  isTimestampRevisionArtifact,
  isValidEngineeringRevision,
  normalizeEngineeringRevision,
  inferStandardDocumentNumber,
  preferCompleteStandardNumber,
} from "./services/document-identity";

export {
  TECHNICAL_QUERY_CLASSIFICATIONS,
  TECHNICAL_QUERY_PRIORITIES,
  presentTechnicalQuery,
  describeTechnicalQueryNextAction,
  displayWorkflowStatus,
  displayPersonName,
  displayPriority,
  personDisplayLine,
  isRawUuid,
  isOverdue,
  type TechnicalQueryPresentation,
  type TechnicalQueryPerson,
  type TechnicalQueryNextAction,
} from "./services/technical-query-workflow";
