/** Universal provenance foundation for EOS 3 records. */

export const EOS3_EVIDENCE_CLASSIFICATIONS = [
  "FACT",
  "INFERENCE",
  "ASSUMPTION",
  "RECOMMENDATION",
  "RESULT",
  "HUMAN_DECISION",
] as const;

export type Eos3EvidenceClassification = (typeof EOS3_EVIDENCE_CLASSIFICATIONS)[number];

export type Eos3Provenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  objectId: string | null;
  revisionId: string | null;
  generation: 2 | 3;
  version: string;
  source: string;
  actorId: string | null;
  authority: string | null;
  timestamp: string;
  method: string;
  toolOrModel: string | null;
  evidenceClassification: Eos3EvidenceClassification;
  qualificationState: string | null;
};

/** AI-generated content must not be silently labeled FACT. */
export function assertEvidenceClassification(
  classification: string,
  opts?: { aiGenerated?: boolean },
): Eos3EvidenceClassification {
  if (!EOS3_EVIDENCE_CLASSIFICATIONS.includes(classification as Eos3EvidenceClassification)) {
    throw new Error("invalid_evidence_classification");
  }
  if (opts?.aiGenerated && classification === "FACT") {
    throw new Error("ai_cannot_store_authoritative_fact");
  }
  return classification as Eos3EvidenceClassification;
}

export function buildEos3Provenance(
  partial: Omit<Eos3Provenance, "timestamp" | "generation" | "version"> & {
    timestamp?: string;
    generation?: 2 | 3;
    version?: string;
  },
): Eos3Provenance {
  return {
    ...partial,
    generation: partial.generation ?? 3,
    version: partial.version ?? "3.0.0",
    timestamp: partial.timestamp ?? new Date().toISOString(),
  };
}
