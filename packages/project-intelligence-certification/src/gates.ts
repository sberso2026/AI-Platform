export const PROJECT_INTELLIGENCE_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, production build"],
  ["B", "hosted document-intelligence schema"],
  ["C", "real-JWT RLS matrix"],
  ["D", "Engineering Core document ownership"],
  ["E", "storage and source authorization"],
  ["F", "document ingestion and processing"],
  ["G", "chunking, tables and lineage"],
  ["H", "embeddings and hybrid retrieval"],
  ["I", "grounded answer and citations"],
  ["J", "abstention and conflicting evidence"],
  ["K", "revision comparison"],
  ["L", "findings and review boundary"],
  ["M", "background jobs, retries and idempotency"],
  ["N", "browser E2E"],
  ["O", "accessibility and responsive behavior"],
  ["P", "legacy capability equivalence"],
  ["Q", "reproducible build identity and GitHub evidence"],
] as const;

export type CertificationGateId = (typeof PROJECT_INTELLIGENCE_CERTIFICATION_GATES)[number][0];
