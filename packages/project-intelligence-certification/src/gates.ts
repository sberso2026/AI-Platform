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

/** Phase 6C-2 Production Provider Closure gates (A–R). */
export const PROJECT_INTELLIGENCE_PROVIDER_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, build"],
  ["B", "provider configuration and registry"],
  ["C", "real embedding provider"],
  ["D", "embedding dimension and persistence"],
  ["E", "advanced parser"],
  ["F", "OCR execution"],
  ["G", "semantic retrieval thresholds"],
  ["H", "citation and faithfulness metrics"],
  ["I", "abstention metrics"],
  ["J", "conflict and revision metrics"],
  ["K", "table and numeric accuracy"],
  ["L", "provider failure recovery"],
  ["M", "multi-worker behavior"],
  ["N", "Postgres query plans"],
  ["O", "security and privacy"],
  ["P", "cost and quotas"],
  ["Q", "browser E2E"],
  ["R", "build identity and GitHub evidence"],
] as const;

export type ProviderCertificationGateId = (typeof PROJECT_INTELLIGENCE_PROVIDER_CERTIFICATION_GATES)[number][0];

/** Phase 6C-3B Meeting Intelligence foundation gates (A–S). */
export const PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, production build"],
  ["B", "hosted Batch 38 schema"],
  ["C", "real-JWT RLS"],
  ["D", "feature entitlement and access guard"],
  ["E", "meeting lifecycle state machine"],
  ["F", "manual meeting service"],
  ["G", "participant service"],
  ["H", "privacy and consent"],
  ["I", "transcript durability and ordering"],
  ["J", "transcript revisions"],
  ["K", "events and audit"],
  ["L", "exact HTTP contracts"],
  ["M", "browser E2E"],
  ["N", "accessibility and responsive"],
  ["O", "provider unavailable contracts"],
  ["P", "legacy stub isolation"],
  ["Q", "build identity"],
  ["R", "GitHub hosted certification verification"],
  ["S", "Phase 6C-2 Document Intelligence baseline unchanged"],
] as const;

export type MeetingFoundationCertificationGateId =
  (typeof PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES)[number][0];

/** Phase 6C-3C Meeting Intelligence processing gates (A–W). */
export const PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, production build"],
  ["B", "hosted schema extensions (Batch 38+39)"],
  ["C", "real-JWT RLS"],
  ["D", "realtime transcript durability"],
  ["E", "sequence and reconnect recovery"],
  ["F", "processing jobs and transactional outbox"],
  ["G", "worker lease, retry and dead-letter"],
  ["H", "transcript normalization"],
  ["I", "Document Intelligence grounding and citations"],
  ["J", "minutes generation"],
  ["K", "minutes versioning"],
  ["L", "proposal extraction"],
  ["M", "human review"],
  ["N", "approved Engineering Core writes"],
  ["O", "privacy, consent and retention"],
  ["P", "provider unavailable contracts"],
  ["Q", "exact HTTP contracts"],
  ["R", "browser E2E"],
  ["S", "accessibility and responsive"],
  ["T", "legacy equivalence"],
  ["U", "build identity and GitHub evidence"],
  ["V", "Phase 6C-2 Document Intelligence baseline unchanged"],
  ["W", "Phase 6C-3B Meeting Foundation baseline preserved"],
] as const;

export type MeetingProcessingCertificationGateId =
  (typeof PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES)[number][0];
