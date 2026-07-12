# Project Intelligence Source Freeze

**Phase:** 6B  
**Purpose:** Establish a clean, tagged standalone baseline before any capability porting into the AI Platform monorepo.

---

## Freeze identity

| Field | Value |
|-------|--------|
| Repository | https://github.com/sberso2026/rtb-project-intelligence.git |
| Branch | `master` |
| Baseline SHA | `ab1f44276715888123d9f669464987e6f7c39b6c` |
| Annotated tag | `project-intelligence-integration-baseline-1` |
| Tag object | `b2b432b56ec18e2ece5bfe10be1c009566c04dca` |
| Working tree at freeze | **Clean** (0 porcelain entries after freeze commit) |
| Prior HEAD | `465d1e094f8e9a15a8271b39038f2aebfb8ef06b` |

Freeze commit message: *Source freeze: platform shell, AI governance, meetings and document intelligence WIP.*

---

## Classification of pre-freeze dirty tree

Before freeze, the working tree had ~668 paths (~135 modified, ~533 untracked).

| Class | Disposition |
|-------|-------------|
| Intentional product WIP (platform shell, AI governance, meetings live, findings, indexing workers, Jun 2026 migrations, tests) | **Committed** into baseline |
| Evidence / generated JSON under `docs/evidence` and staging results | **Committed** as operational evidence accompanying WIP |
| Accidental secrets (`.env`, `.env.local`) | **Not committed**; remain local only |
| Build caches (`*.tsbuildinfo`, `.next/`) | Ignored / not treated as source |

No uncommitted working directory was copied into the AI Platform monorepo.

---

## Verification at freeze

| Check | Result |
|-------|--------|
| `git status` | Clean on `master` tracking `origin/master` |
| Tests | **342** `*.test.ts` files present in tree (standalone corpus; Vitest target historically ~335 cases). Full re-run blocked locally by `pnpm install` / ignored build scripts (`ERR_PNPM_IGNORED_BUILDS`); corpus preserved for Phase 6C+ equivalence. |
| Typecheck | Not re-executed successfully in freeze window for the same install reason; baseline includes prior green readiness work from `465d1e0` lineage. |
| Production build | Not re-executed in freeze window; do not infer failure — treat as **deferred local verification** with tag immutable. |
| Capability inventory revision | Phase 6A matrix remains authoritative until Phase 6C capability port updates |

---

## Migration checksums (SHA-256 prefix, last 20)

| Migration | Checksum (16 hex) |
|-----------|-------------------|
| `20260510100000_documents_ensure_project_id.sql` | `7F09ABC8C675F7F7` |
| `20260511103000_match_document_chunks_chunk_index_metadata.sql` | `5DDC903F77A06A2B` |
| `20260511174500_document_chunks_chunk_metadata.sql` | `C7DCCA362EEB630B` |
| `20260512120000_documents_processing_quality.sql` | `C82F23292B78941D` |
| `20260513130000_document_pages_and_intelligence.sql` | `DF539C300D7F4F75` |
| `20260514120000_engineering_production_closure.sql` | `B0BBFE319142310A` |
| `20260515103000_engineering_readiness_runs.sql` | `52FE3C6BF1822601` |
| `20260516120000_document_indexing_jobs.sql` | `C6F4676D7C44AA84` |
| `20260517120000_document_indexing_worker_heartbeats.sql` | `647A668DEB831592` |
| `20260517130000_document_indexing_job_lease_extend.sql` | `A71889310FDC9902` |
| `20260518130000_engineering_concepts.sql` | `15F1D45C47EF4398` |
| `20260519120000_ai_feedback_layer3.sql` | `D05C0D92C3D763FE` |
| `20260530120000_document_ocr_pipeline.sql` | `86BC6481E6EF2916` |
| `20260530123000_document_ocr_reprocess_claim.sql` | `FAC5BFA84FB5937C` |
| `20260530140000_platform_health_snapshots.sql` | `FE7D47515EF5E970` |
| `20260608160000_postgrest_reload_schema.sql` | `30BB4B59D3E61016` |
| `20260610120000_rtb_intelligence_platform.sql` | `589CCA7FC72B87F4` |
| `20260611120000_engineering_finding_evidence_workflow.sql` | `01454A2FF57BF4DF` |
| `20260611130000_engineering_finding_evidence_audit.sql` | `960D73B3450A8ED7` |
| `20260612120000_document_indexing_queue_claim_fix.sql` | `CD5D66E145D0AF81` |

---

## Environment variable inventory (names only)

From `.env.example` (values never recorded):

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, Zoom/Teams/Meet bot URLs and tokens, Graph webhook/map variables, `OPENAI_API_KEY`, Whisper/embedding models, document parse/OCR URLs, MoM export, Resend, Thor TTS/voice flags, realtime pipeline, upload/vision/voice rate limits, retrieval/AI governance feature flags, founder bootstrap flags.

Local-only files present but excluded from freeze: `.env.local`, `.env.production-readiness`.

---

## Known WIP exclusions

- Standalone authentication and isolated shell are **not** ported into AI Platform; Platform shell + commerce entitlement replace them.
- Direct ungoverned OpenAI invocation is **not** accepted in new Phase 6B platform code.
- Register data migration is **excluded** from Phase 6B.

---

## Rule for monorepo ports

Copy only from tag `project-intelligence-integration-baseline-1` (`ab1f442…`). Never copy a dirty working tree.
