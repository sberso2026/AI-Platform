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

/** Phase 6C-3D Microsoft Teams provider certification gates (A–X). */
export const PROJECT_INTELLIGENCE_TEAMS_PROVIDER_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, production build"],
  ["B", "hosted provider schema"],
  ["C", "provider connection RLS"],
  ["D", "Graph authentication"],
  ["E", "permission and consent validation"],
  ["F", "Teams URL validation"],
  ["G", "meeting discovery and mapping"],
  ["H", "webhook validation"],
  ["I", "notification deduplication"],
  ["J", "subscription lifecycle"],
  ["K", "participant mapping"],
  ["L", "transcript capability and classification"],
  ["M", "transcript ingestion into PI"],
  ["N", "existing processing pipeline preserved"],
  ["O", "human review and Core boundary preserved"],
  ["P", "provider failure recovery"],
  ["Q", "security and secret exposure"],
  ["R", "browser E2E"],
  ["S", "accessibility and responsive"],
  ["T", "legacy equivalence"],
  ["U", "build identity and GitHub evidence"],
  ["V", "manual provider remains certified"],
  ["W", "Document Intelligence baseline unchanged"],
  ["X", "Meeting processing baseline preserved"],
] as const;

export type TeamsProviderCertificationGateId =
  (typeof PROJECT_INTELLIGENCE_TEAMS_PROVIDER_CERTIFICATION_GATES)[number][0];

/** Phase 6C-3E Live Microsoft Entra Teams provider certification gates (A–Z). */
export const PROJECT_INTELLIGENCE_TEAMS_LIVE_PROVIDER_CERTIFICATION_GATES = [
  ["A", "repository preflight"],
  ["B", "environment validation"],
  ["C", "hosted schema and RLS"],
  ["D", "provider configuration fail-closed behavior"],
  ["E", "live Entra token acquisition"],
  ["F", "least-privilege permission validation"],
  ["G", "Teams provider connection"],
  ["H", "Teams URL validation"],
  ["I", "live meeting discovery/session mapping"],
  ["J", "webhook validationToken handshake"],
  ["K", "webhook clientState validation"],
  ["L", "webhook replay protection"],
  ["M", "subscription create"],
  ["N", "subscription renew-due detection"],
  ["O", "subscription renewal"],
  ["P", "subscription revoke"],
  ["Q", "participant metadata mapping"],
  ["R", "meeting end detection"],
  ["S", "post-meeting transcript availability/retrieval"],
  ["T", "transcript persistence/order"],
  ["U", "processing enqueue"],
  ["V", "minutes/proposals/review regression"],
  ["W", "UI unsupported capability enforcement"],
  ["X", "browser E2E"],
  ["Y", "secret exposure scan"],
  ["Z", "release evidence and artifact commit match"],
] as const;

export type TeamsLiveProviderCertificationGateId =
  (typeof PROJECT_INTELLIGENCE_TEAMS_LIVE_PROVIDER_CERTIFICATION_GATES)[number][0];
