export { PostgresDocumentIndexAdapter } from "./documents/postgres-index-adapter";
export {
  ProjectIntelligenceDocumentRetrievalService,
  type RetrievalCandidateTrace,
  type RetrievalResult,
} from "./documents/retrieval-service";
export { excerptAroundQuery } from "./documents/lexical-overlap";
export { planEngineeringQuery, queryPlanToDiagnostic } from "./documents/query-plan";
export { classifyEvidenceRelevance, selectGenerationEvidence } from "./documents/evidence-relevance";
export { parseEngineeringStructure, assembleStructuralEvidence } from "@rtb/engineering-os";
export {
  tryCreateGovernedEmbeddingAdapter,
  UnavailableEmbeddingAdapter,
  GovernedEmbeddingAdapter,
} from "./documents/governed-embedding-adapter";
export { isAuthoritativeAnswerAllowed } from "./documents/ingestion-state-machine";
export { mapDocumentIngestionPresentation } from "./documents/presentation-state";
export { enqueueDocumentProcessing } from "./documents/durable-enqueue";
export { DocumentIntelligenceError } from "./documents/errors";
export type { DocumentProcessingStatus } from "./documents/types";
