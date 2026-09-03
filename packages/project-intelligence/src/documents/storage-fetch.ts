const DOCUMENT_BUCKET = "engineering-documents";

export function isAuthorizedDocumentObjectPath(
  objectPath: string,
  tenantId: string,
  workspaceId: string,
  documentId?: string,
): boolean {
  if (!objectPath || objectPath.includes("..") || objectPath.startsWith("/")) return false;
  const prefix = documentId
    ? `${tenantId}/${workspaceId}/${documentId}/`
    : `${tenantId}/${workspaceId}/`;
  return objectPath.startsWith(prefix);
}

export function documentStorageBucket(): string {
  return DOCUMENT_BUCKET;
}
