export function isOlderThanKnown(incomingOccurredAt: string, knownOccurredAt: string): boolean {
  return Date.parse(incomingOccurredAt) < Date.parse(knownOccurredAt);
}

export function canonicalExternalIdentity(input: {
  connectionId: string;
  externalAccountId: string;
  externalProjectId: string;
  objectType: string;
  objectId: string;
}): string {
  return `${input.connectionId}:${input.externalAccountId}:${input.externalProjectId}:${input.objectType}:${input.objectId}`;
}

export function operationIdempotencyKey(input: {
  connectionId: string;
  objectType: string;
  objectId: string;
  fingerprint: string;
  operation: string;
}): string {
  return `${input.connectionId}:${input.objectType}:${input.objectId}:${input.fingerprint}:${input.operation}`;
}

export function canonicalProjectBinding(input: {
  tenantId: string;
  workspaceId: string;
  eosProjectId: string;
  connectionId: string;
  externalProjectId: string;
}) {
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    eosProjectId: input.eosProjectId,
    connectionId: input.connectionId,
    externalProjectId: input.externalProjectId,
  };
}
