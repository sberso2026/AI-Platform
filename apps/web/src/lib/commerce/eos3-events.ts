/** Canonical EOS 3 event envelope foundation. No broad workflows yet. */

export type Eos3EventEnvelope = {
  eventType: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  objectId: string | null;
  revisionId: string | null;
  actorId: string | null;
  authority: string | null;
  timestamp: string;
  correlationId: string | null;
  causationId: string | null;
  provenanceRef: string | null;
  generation: 3;
  version: string;
  auditLink: string | null;
};

export function createEos3EventEnvelope(
  input: Omit<Eos3EventEnvelope, "timestamp" | "generation" | "version"> & {
    timestamp?: string;
    version?: string;
  },
): Eos3EventEnvelope {
  if (!input.tenantId || !input.workspaceId || !input.eventType) {
    throw new Error("event_envelope_incomplete");
  }
  // Events cannot omit workspace/tenant — authorization/RLS boundary.
  return {
    ...input,
    generation: 3,
    version: input.version ?? "3.0.0",
    timestamp: input.timestamp ?? new Date().toISOString(),
  };
}

export function eventBypassesAuthorization(_envelope: Eos3EventEnvelope): false {
  return false;
}
