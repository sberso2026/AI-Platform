# EOS-A13C Platform Consolidation, Connector Hardening & Binary Storage Preparation

FEATURE_FREEZE remains intact. A12C established `CORE_ENGINEERING_FEATURE_SET_COMPLETE = YES`. A13 is CONNECT. A13C is the final CONNECT consolidation phase. It does **not** add a new engineering product domain, RFI/TQ module, Change domain, Review engine, Lifecycle domain, DMS, graph store, Event Bus, Job platform, or vendor connector.

## Feature Freeze

A13C consolidates A13A/A13B connector architecture, hardens sync/security/large-file behavior, and prepares a safe binary/object-storage abstraction. Live certification of already-implemented adapters is allowed if credentials become available. New vendor product functionality is not.

Human AAL2 browser certification remains `NOT_COMPLETED`. No TOTP extraction, cookie injection, JWT copy, or MFA weakening was performed.

## A13A / A13B reconciliation

| Capability | A13A | A13B | Target owner | Action |
|---|---|---|---|---|
| Connection identity | `M365Connection` | `EngineeringExternalConnection` | Distinct vendor-specific records + core catalog | KEEP |
| Secrets | `credentialSecretId` | `credentialSecretId` | Platform Secrets | REUSE |
| Managed repository | `SHAREPOINT_LIBRARY` | `ENGINEERING_EDMS` / `ENGINEERING_APPLICATION` / `OTHER` | `ManagedEngineeringRepository` | REUSE |
| Project binding | repository.projectId + SharePointScope | `EngineeringExternalProjectBinding` | Core binding contract | MERGE |
| External identity | `sp:site:drive:item` | `vendor:account:project:type:id` | Core identity helpers | MERGE |
| Sync cursor | deltaToken per repository | cursor per connection | Vendor sync-state tables | KEEP |
| Retry / backoff | local `backoff()` | local `backoff()` | `connectors/core` backoff | MERGE |
| SSRF / hosts | Graph + SharePoint suffixes | Aconex/ACC/P6 suffixes | Core security + vendor allowlists | MERGE |
| JobService | `engineering.m365.sharepoint.sync` | `engineering.external.connector.sync` | JobService; mode in payload | REUSE |
| Event Bus | existing | existing | single Event Bus | REUSE |
| Composition | ingestFromConnector + registerFromConnector | same | A10A/A10B | REUSE |
| Certification vs health | ConnectorStatus | CONNECTOR_CERTIFICATION_MATRIX | Canonical matrix + operational status | MERGE |
| Admin UI | `/engineering/settings/integrations` | same route | Canonical integrations page | KEEP |

`CONNECTOR_CORE_RECON.newFramework = false`. No ConnectorCoreV2, IntegrationPlatform2, or ExternalConnector2.

## Canonical connector core

Shared internal services live under `packages/engineering-os/src/connectors/core`. They own connection catalog, capability certification, operational readiness, retry/backoff, SSRF/host controls, secret-on-row rejection, idempotency keys, out-of-order protection, poison/batch checkpoint, observability redaction, and read/write policy. Vendor adapters retain Graph/EDMS/BIM/Planning-specific mapping only.

Jobs remain:

- `engineering.m365.sharepoint.sync`
- `engineering.external.connector.sync`

Vendor identity stays in job payload/config. No second job system.

## Connection model

- `M365Connection` owns SharePoint Graph application OAuth.
- `EngineeringExternalConnection` owns non-Microsoft engineering connections (EDMS/BIM/Planning/tools).
- The records are distinct. SharePoint is not duplicated as `EngineeringExternalConnection` in A13C.
- Tokens never persist on connection, repository, binding, object, or sync rows. Only `credentialSecretId` is stored.

## Project binding

Common binding always includes tenant, workspace, EOS project, external connection, and external project/repository scope. SharePoint uses `ManagedEngineeringRepository.projectId` plus approved root. EDMS/BIM/Planning use `EngineeringExternalProjectBinding`. Rebinding an EOS project to a different external project requires admin confirmation, is audited, disables the previous active binding, and does **not** reassign historical object refs.

## External identity

Canonical identity is `connection_id : external_account : external_project : object_type : external_object_id`. Version/etag, fingerprint, `occurred_at`, and `recorded_at` remain on the object ref. Vendor path/name is descriptive only.

## Normalized external objects

Bounded catalog is unchanged: DOCUMENT, DRAWING, MODEL, TRANSMITTAL, RFI, TQ, FIELD_CHANGE, ISSUE, SCHEDULE_ACTIVITY, MILESTONE, ANALYSIS_FILE, VENDOR_DATA. Vendor extensions stay in adapter metadata.

## Domain composition pipeline

Adapter → normalized object → common composition (`registerFromConnector`, Work Events, Attention, Digital Thread). Vendor adapters do not independently invent Information Refs, Attention categories, or graph stores.

## Certification vs health

Certification states: `CONTRACT_ONLY`, `FIXTURE_CERTIFIED`, `LIVE_CERTIFIED_READ`, `LIVE_CERTIFIED_WRITE` (capability-specific).

Operational states: `NOT_CONFIGURED`, `AUTHENTICATION_REQUIRED`, `CONFIGURED`, `SYNCING`, `READY`, `DEGRADED`, `RATE_LIMITED`, `RESYNC_REQUIRED`, `UNAVAILABLE`, `BLOCKED`.

A connector may be `LIVE_CERTIFIED_READ` and currently `AUTHENTICATION_REQUIRED`, or operational `READY` and only `FIXTURE_CERTIFIED`. The integrations UI must not conflate them.

Default write policy remains `READ_ONLY`. Write requires capability, certification, configured policy, authorization, and human confirmation where engineering-impacting. Unsupported capability fails `CAPABILITY_NOT_CERTIFIED`. Read-only write fails `ARBITRARY_EXTERNAL_WRITE_PROHIBITED`.

## Current certification matrix

| Connector | Vendor | Contract | Fixture | Live read | Live write |
|---|---|---|---|---|---|
| SHAREPOINT_LIBRARY | SHAREPOINT | IMPLEMENTED | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| EDMS_RFI_DOCUMENT | ACONEX | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| BIM_DOCUMENT_SYSTEM | ACC | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| PLANNING_SCHEDULE | P6 | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |
| ENGINEERING_APPLICATION | SPACE_GASS | CONTRACT_ONLY | FIXTURE_CERTIFIED | NOT_TESTED | NOT_TESTED |

## Security consolidation

Shared core rejects caller-supplied tenant/workspace/AAL/host/token claims, blocks SSRF hosts, validates https allowlisted redirects, enforces content-size guards, and redacts secrets/raw content from observability. Vendor adapters wrap the core with Graph/SharePoint or Aconex/ACC/P6 suffixes.

Disabling a connection stops sync, blocks new operations, and preserves history. Narrowing repository scope stops future ingestion outside the new root; historical provenance is retained. Prefer disable/archive over destructive delete.

Cursor/checkpoint updates only after a successful processing boundary. Partial batch failure does not silently complete. Poison objects are bounded (three retries) and do not block the connector forever.

## Binary storage current state

Generated artifacts currently persist bytes in `engineering_generated_artifacts.content_base64` (`TEXT`). Write path: A11B generator produces OpenXML → service `saveArtifact`. Read/download: `get` / route download. Authorization is EOS tenant/workspace/project via service guard + RLS. Fixture sizes are typical Office OpenXML packages (kilobytes to low megabytes). SHA-256 of generated bytes remains authoritative. Regeneration supersedes the previous artifact row.

Base64 expansion is 4/3 (approximately +33%) versus raw bytes. No unsupported enterprise-scale estimate is claimed.

`OBJECT_STORAGE_BACKEND = CONTRACT_ONLY`. The Project Intelligence `engineering-documents` bucket is a **different domain** and is not reused as the generated-artifact store. `PUBLIC_BUCKET_REQUIRED = NO`.

`ARTIFACT_BINARY_STORAGE_RISK` remains **HIGH**.

## Target ArtifactBinaryStore architecture

Artifact metadata stays in Postgres. Bytes pass through `ArtifactBinaryStore`: `put`, `openRead`, `head`, `exists`, `generateAuthorizedDownload`. Implementations:

- `LEGACY_RELATIONAL` — `LegacyRelationalArtifactBinaryStore` compatibility adapter
- `OBJECT_STORAGE` — port + in-memory fixture only in A13C
- `EXTERNAL_MANAGED` — SharePoint-backed templates and external engineering files remain at source

Storage kind is explicit. Never infer from a null `content_base64`.

Object keys are server-authoritative: `eos/artifacts/{tenant}/{workspace}/{project}/{artifact}/v{n}`. User filenames are not used as keys. Download remains EOS-authorized. Signed access, if used later, is short-lived, object-scoped, server-generated, not stored permanently, and not cross-project.

## Migration algorithm

1. Identify legacy artifact (`storage_kind = LEGACY_RELATIONAL`).
2. Decode legacy binary through the compatibility adapter.
3. Confirm SHA-256 and size.
4. Write object under a new storage version key (`migration_state = IN_PROGRESS`).
5. Verify stored object size/hash.
6. Switch metadata pointer only after verification (`OBJECT_STORAGE`, `VERIFIED`).
7. Retain legacy `content_base64` temporarily.
8. Serve subsequent reads through the abstraction.
9. Purge is **out of scope** for A13C.

Failed verification does not switch the pointer. Migration is restartable (new version key). Rollback restores `storage_kind = LEGACY_RELATIONAL` while legacy bytes remain. A13C does not execute production migration and does not dual-write permanently. New writes stay legacy unless an approved object-storage backend is later certified.

Staging size defaults (production configuration still required): generated / on-demand / returned 25 MiB; templates 10 MiB.

## Connector content and templates

Connector retrieval remains METADATA_ONLY by default. ON_DEMAND_CONTENT / INDEX_APPROVED_TYPES use bounded processing and do not persist external binaries solely because they were inspected. A11D Office inspection remains transient (`persisted: false`).

Template sources remain: EXTERNAL_MANAGED_REFERENCE (SharePoint), packaged EOS defaults, and future OBJECT_STORAGE. Company template binaries are not stored as Postgres base64. Direct company-template upload stays deferred until Hosted ClamAV and approved object storage exist.

## Malware boundaries

`HOSTED_CLAMAV = UNAVAILABLE`.

- METADATA_ONLY: no binary malware scan (bytes are not ingested)
- ON_DEMAND_EXTERNAL_READ: content safety policy required; production ingest fail-closed
- EOS USER UPLOAD: fail closed if malware scanning required and unavailable
- EOS GENERATED OUTBOUND: trusted generated-artifact boundary
- FUTURE TEMPLATE UPLOAD: blocked for production until malware control

## Retention

Documented, not automated in A13C:

- generated draft: retain until superseded + rollback window
- returned artifact: retain as engineer lineage
- superseded artifact: retain for provenance
- Review evidence: retain with Review package
- published artifact: retain publication evidence; external system owns source
- template versions: retain metadata; binaries stay packaged or externally managed

Object-store delete is not a routine engineer action. No destructive cleanup in A13C.

## Remaining direct `content_base64` access

Isolated to:

- generator encoding of newly created OpenXML
- `LegacyRelationalArtifactBinaryStore` compatibility
- A11D transient inspect decode of the artifact row
- tool-orchestration returned-upload compatibility
- historical tests

Download and publish-to-managed-repository now use `openBinary`. `NEW_CONTENT_BASE64_USAGE = NO`. `A13C_BINARY_DUPLICATION = NO`.

## Dependency / TSC / performance

A13C introduces no new runtime dependencies. Pre-existing high advisories remain separately recorded. Historical web TSC debt is not refactored here; A13C introduced type errors must be 0.

Bounded fixture benchmarks cover connector identity keys for 100 objects, idempotent replay, out-of-order rejection, Attention-preserving composition (existing A12B/A13B tests), artifact metadata retrieval, legacy binary download, and 64 KiB memory object-store download. No enterprise-scale claims.

## A14 readiness input register

| Item | Class | Notes |
|---|---|---|
| Human AAL2 browser certification | P0 BEFORE CONTROLLED PILOT | MFA tab only; not completed in A13C |
| Hosted ClamAV | P0 if pilot accepts user/template uploads; else P1 | UNAVAILABLE; metadata-only connector flows do not ingest bytes |
| Artifact object-storage implementation/migration | P0 if generated artifacts must leave Postgres; else P1 | OBJECT_STORAGE_BACKEND = CONTRACT_ONLY; risk HIGH |
| Live SharePoint certification | P0 for PROFILE B; not required for PROFILE A | LIVE_SHAREPOINT = NOT_TESTED |
| Live EDMS / BIM / Planning | P0 only if that connector is in the chosen pilot | currently NOT_TESTED |
| Calculation-definition certification | P0 if pilot uses calculations | EXAMPLE_ONLY |
| Solver certification | P0 if pilot depends on solver | A7C DEFERRED_EXTERNAL_DEPENDENCY |
| Backup/recovery validation | P1 BEFORE PRODUCTION | not executed in A13C |
| Security/performance gates | P1 | historical web TSC debt remains; A13C introduced errors must be 0 |
| Pre-existing dependency advisories | P1 / P2 | unchanged; do not treat as A13C regressions |
| PDF export | P2 POST-V1 | DEFERRED |
| Direct company template upload | P1 | blocked until malware + object storage |

P0 is profile-dependent. Do not call every deferred feature a pilot blocker.


- **PROFILE A**: no external connectors; EOS defaults; generated artifacts only
- **PROFILE B**: SharePoint-connected pilot
- **PROFILE C**: EDMS-connected pilot

Pilot blockers depend on the selected profile. Aconex/ACC/P6 live certification is not required unless that profile uses them.

Migration `20261001200000_eos_a13c_platform_consolidation_binary_storage.sql` checksum `f2320fc2936d0f392d8a01a7554013f2d512a0ea78bff51d55eea62efe3e4193` applied to staging `rntonzigxwxcjlcsadip`. Additive storage metadata only. `content_base64` was not dropped.
