/**
 * Phase 8G — Assert Knowledge Intelligence never owns parallel business records.
 */
export function assertNoKnowledgePrivateInfrastructure(flags: {
  implementsPrivateAudit: boolean;
  implementsPrivateNotification: boolean;
  implementsPrivateAiRuntime: boolean;
  implementsPrivateEmbeddingClient: boolean;
  storesDuplicateBusinessRecords: boolean;
}): void {
  if (flags.implementsPrivateAudit) {
    throw new Error("Knowledge Intelligence must use shared audit");
  }
  if (flags.implementsPrivateNotification) {
    throw new Error("Knowledge Intelligence must use shared notification");
  }
  if (flags.implementsPrivateAiRuntime) {
    throw new Error("Knowledge Intelligence must use Platform AI Runtime only");
  }
  if (flags.implementsPrivateEmbeddingClient) {
    throw new Error("Knowledge Intelligence must reuse governed embeddings");
  }
  if (flags.storesDuplicateBusinessRecords) {
    throw new Error("Knowledge graph must store refs/relationships only");
  }
}
