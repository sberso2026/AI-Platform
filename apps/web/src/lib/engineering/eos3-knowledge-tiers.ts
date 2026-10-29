/**
 * EOS 3.3 Knowledge Intelligence tier model.
 * STRUCTURED_CANONICAL_STATE > CONTROLLED_DOCUMENTS > INDEXED_ENTERPRISE_KNOWLEDGE > SECONDARY_REFERENCES > MODEL_INFERENCE
 */

export const EOS3_KNOWLEDGE_TIERS = [
  "TIER_1_CANONICAL_ENGINEERING_STATE",
  "TIER_2_CONTROLLED_PROJECT_DOCUMENTS",
  "TIER_3_ENTERPRISE_KNOWLEDGE",
  "TIER_4_EXTERNAL_REFERENCES",
  "TIER_5_MODEL_INFERENCE",
] as const;

export type Eos3KnowledgeTier = (typeof EOS3_KNOWLEDGE_TIERS)[number];

export type Eos3AuthorityClass =
  | "AUTHORITATIVE_STRUCTURED_STATE"
  | "CONTROLLED_DOCUMENT"
  | "ENTERPRISE_KNOWLEDGE"
  | "EXTERNAL_REFERENCE"
  | "MODEL_INFERENCE";

export const TIER_AUTHORITY: Record<Eos3KnowledgeTier, Eos3AuthorityClass> = {
  TIER_1_CANONICAL_ENGINEERING_STATE: "AUTHORITATIVE_STRUCTURED_STATE",
  TIER_2_CONTROLLED_PROJECT_DOCUMENTS: "CONTROLLED_DOCUMENT",
  TIER_3_ENTERPRISE_KNOWLEDGE: "ENTERPRISE_KNOWLEDGE",
  TIER_4_EXTERNAL_REFERENCES: "EXTERNAL_REFERENCE",
  TIER_5_MODEL_INFERENCE: "MODEL_INFERENCE",
};

export function knowledgeTierRank(tier: Eos3KnowledgeTier): number {
  return EOS3_KNOWLEDGE_TIERS.indexOf(tier);
}

export function authorityOutranks(a: Eos3AuthorityClass, b: Eos3AuthorityClass): boolean {
  const order: Eos3AuthorityClass[] = [
    "AUTHORITATIVE_STRUCTURED_STATE",
    "CONTROLLED_DOCUMENT",
    "ENTERPRISE_KNOWLEDGE",
    "EXTERNAL_REFERENCE",
    "MODEL_INFERENCE",
  ];
  return order.indexOf(a) < order.indexOf(b);
}

export const VECTOR_INDEX_IS_NOT_SYSTEM_OF_RECORD = true as const;

export function vectorIndexIsSystemOfRecord(): false {
  return false;
}
