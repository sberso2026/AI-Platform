# Project Intelligence Equivalence Catalogue

**Phase:** 6C-1 foundation hardening  
**Rule:** Do not mark a capability equivalent until preserved behaviour and tests pass on the integrated platform.

| Capability ID | Capability name | Legacy routes | Legacy services | Legacy tables | Legacy tests | Expected user behavior | Expected outputs | Data owner | AI owner | Evidence requirements | Migration status | Target Phase | Equivalence status | Known deviations | Approval status |
|---------------|-----------------|---------------|-----------------|---------------|--------------|------------------------|------------------|------------|----------|----------------------|------------------|--------------|--------------------|------------------|-----------------|
| DOC-UPLOAD | Document upload and metadata | `/documents`, upload APIs | upload services | `documents` | upload/auth tests | Upload files into project scope | Document metadata rows | Core (meta) / PI (intel) | — | Upload E2E + RLS | in progress | 6C-2 | equivalent_with_improvement | Core SoT; PI processing bind | pending cert |
| DOC-PROCESS | Document processing | parser APIs | parser/OCR pipeline | processing events | parser tests | Processing completes with quality gates | Parsed pages/chunks | PI | — | Parser gates | in progress | 6C-2 | equivalent_with_improvement | Native text first; PDF adapters pending | pending cert |
| DOC-CHUNK | Chunking and embeddings | indexing workers | embedding batch | `document_chunks` | indexing tests | Chunks searchable | Embeddings present | PI | Platform metering | Indexing smoke | in progress | 6C-2 | equivalent_with_improvement | Deterministic local embed for cert | pending cert |
| AI-GROUND | Grounded query | Thor chat | retrieval + LLM | AI answers | thor tests | Grounded answers with citations | Answer + citations + confidence | PI | AI Director target | Citation integrity | in progress | 6C-2 | equivalent_with_improvement | Governed answer contract | pending cert |
| AI-CITE | Citations | chat UI | evidence pack | evidence tables | evidence tests | Citations resolve to sources | Citation list | PI | AI Director | Evidence integrity tests | in progress | 6C-2 | equivalent_with_improvement | Core document identity | pending cert |
| AI-ABSTAIN | Abstention | Thor guards | confidence gates | — | abstention tests | Abstain when insufficient | Abstain payload | PI | AI Director | Phase 6B/6C-2 proof | foundation+port | 6C-2 | equivalent_with_improvement | Platform + retrieval thresholds | pending cert |
| FINDINGS | Findings | findings UI | finding services | findings | findings tests | Review findings | Finding records | PI | optional AI | RLS + review | not started | 6C-3 | not_equivalent | — | pending |
| PATTERNS | Patterns | patterns UI | pattern services | patterns | pattern tests | View patterns | Pattern overlays | PI | optional AI | Overlay only | not started | 6C-3 | not_equivalent | Non-authoritative | pending |
| EVIDENCE-GAP | Missing evidence | review UI | gap detectors | evidence gaps | gap tests | See gaps | Gap list | PI | — | Review queue link | not started | 6C-3 | not_equivalent | — | pending |
| MTG-SESSION | Meetings | meetings routes | meeting session | `meeting_sessions` | meeting tests | Start/join sessions | Session records | PI | — | Stay in PI app | deferred | 6C-4 | not_equivalent | Not split in 6B/6C-1 | pending |
| MTG-TRANSCRIPT | Transcript | live meeting | realtime pipeline | transcripts | transcript tests | Live transcript | Transcript items | PI | — | Realtime proof | deferred | 6C-4 | not_equivalent | — | pending |
| MTG-MOM | Minutes | MoM export | MoM services | MoM tables | mom tests | Generate minutes | MoM draft | PI → Core on approve | — | Human review gate | deferred | 6C-4 | not_equivalent | — | pending |
| EXTRACT-DECISION | Decision extraction | AI extract | NLP | decisions (legacy) | extract tests | Propose decisions | Review queue items | Core after review | AI Director | No auto Core write | deferred | 6C-4 | not_equivalent | — | pending |
| EXTRACT-RISK | Risk extraction | AI extract | NLP | risks (legacy) | extract tests | Propose risks | Review queue | Core after review | AI Director | Human review | deferred | 6C-4 | not_equivalent | — | pending |
| EXTRACT-ACTION | Action extraction | AI extract | NLP | actions (legacy) | extract tests | Propose actions | Review queue | Core after review | AI Director | Human review | deferred | 6C-4 | not_equivalent | — | pending |
| REVIEW-QUEUE | Review queue | review UI | queue services | AI review tables | review tests | Approve/reject extracts | Queue transitions | PI | — | Audit trail | deferred | 6C-3 | not_equivalent | — | pending |
| REPORTS | Reports | reports UI | report configs | report configs | report tests | Configure reports | Report outputs | PI | optional AI | Config only | deferred | 6C-3 | not_equivalent | — | pending |
| LIVE-OPS | Live operations | ops health | workers | heartbeats | ops tests | Monitor workers | Health snapshots | PI | — | Health page | partial | 6C-1/ops | partial | Platform health only | pending |
| PROVIDER-BOTS | Provider bots | Zoom/Teams/Meet | bot APIs | — | bot tests | Meeting bots | Session linkage | PI | — | Credential vault | deferred | later | not_equivalent | External secrets | pending |

---

## Status legend

- `not_equivalent` — not proven on Platform  
- `partial` — foundation or subset only  
- `equivalent` — reserved for certified ports  
