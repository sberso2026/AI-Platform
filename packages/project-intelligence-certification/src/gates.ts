export const PROJECT_INTELLIGENCE_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, production build"],
  ["B", "hosted durable schema"],
  ["C", "RLS"],
  ["D", "transactional outbox"],
  ["E", "worker leasing and recovery"],
  ["F", "durable parsing"],
  ["G", "persistent chunks"],
  ["H", "real embedding provider"],
  ["I", "pgvector index"],
  ["J", "hybrid retrieval"],
  ["K", "retrieval evaluation thresholds"],
  ["L", "citations and abstention"],
  ["M", "revision supersession"],
  ["N", "retry and idempotency"],
  ["O", "multi-instance behavior"],
  ["P", "browser E2E"],
  ["Q", "performance baseline"],
  ["R", "build identity and GitHub evidence"],
] as const;

export type CertificationGateId = (typeof PROJECT_INTELLIGENCE_CERTIFICATION_GATES)[number][0];
