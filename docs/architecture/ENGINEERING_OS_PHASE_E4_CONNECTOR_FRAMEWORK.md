# Engineering OS Phase E4 — Enterprise Connector Framework

**Status:** Complete (contracts + reference adapters + E2/E3 integration)  
**Baselines:** E0 `a9650d3` · E1 `2752e1a`/`296a06e` · E2 `20a2c2f` · E3 `e011f6d`  
**Roadmap note:** Earlier E0 roadmap labelled E4 as “Explore & native search”. This phase **redefines E4 as Enterprise Connector Framework**. Explore/search deepening remains available via E1/E2 surfaces.

## Goal

Vendor-neutral, **read-first** connector framework so Engineering OS can sit above client digital systems without depending on any specific ERP, EAM, DMS, AI assistant, or data lake.

**ESSENTIAL** continues to operate fully with **zero external connectors**.

## Core rule

```
External system record  ≠  Engineering OS record
```

Connectors expose authorised external engineering context.  
They do **not** transfer source-system ownership into Engineering OS.

## Architecture

```text
External Systems
      ↓
Connector Adapters
      ↓
Normalized External Records
      ↓
E3 Identity + Context
      ↓
E2 Retrieval
      ↓
Engineering Intelligence
```

## Ownership

E4 owns: connector contracts, lifecycle, auth abstraction, capability discovery, read/search/fetch interfaces, sync state, mapping handoff, provenance, health/status, error handling.

E4 does **not** own: SAP/EAM records, M365/SharePoint docs, email, Fabric lakes, KG, Memory, PI/II/AI engines, Tool Registry, workflow engine.

## Connector contract

`EngineeringConnector` — status, capabilities, auth mode, `configurationRef` / `credentialSecretId` (refs only), health, maturity.

**Status:** NOT_CONFIGURED · CONFIGURED · CONNECTING · READY · DEGRADED · ERROR · DISABLED  

**Health:** HEALTHY · DEGRADED · UNAVAILABLE · AUTH_ERROR · RATE_LIMITED · STALE · UNKNOWN  

**Maturity (must distinguish):**
| Level | Meaning |
|-------|---------|
| `contract_only` | Interface declared; no certified live path |
| `adapter_implemented` | Reference/fixture adapter runnable |
| `live_connection_certified` | Production connectivity certified (none in E4) |

## Capability taxonomy

SEARCH, FETCH, LIST, INCREMENTAL_SYNC, WEBHOOK, IDENTITY_LOOKUP, DOCUMENT_CONTENT, DOCUMENT_METADATA, EMAIL, COLLABORATION, ASSET_MASTER, MAINTENANCE_HISTORY, WORK_ORDER_READ, DATA_QUERY, FILE_IMPORT  

Capabilities are advertised **only** when the adapter implements them.

## Auth model

OAuth2 · service account · API key · token · client credentials · managed identity · file/manual import · NONE  

Secrets via **Platform Secret Manager** only (`credentialSecretId` / `configurationRef`). No plaintext in domain rows. Tenant-scoped isolation.

## Permission model

Engineering OS must not widen source-system permissions.  
Evidence carries `permissionsApplied: true | false | "unknown"`.  
**UNKNOWN is never treated as secure** — excluded from grounded evidence.

Access model labels: `source_delegated` · `service_account_scoped` · `admin_restricted` · `unknown`.

## Sync / live-query

Optional incremental sync with cursor + freshness.  
Live-query connectors need not sync.  
Dedup key: `sourceSystem + externalId`.  
No whole-source resync per Ask. No cross-tenant sync state.

## E3 identity flow

```
EngineeringExternalRecord
  → ExternalIdentityMapping (MATCHED | PROBABLE_MATCH | UNRESOLVED | CONFLICTING)
  → EngineeringContextResolver / E2 evidence
```

Unresolved / conflicting → external evidence/reference only.  
**No silent canonical object creation.**

## E2 retrieval flow

1. Native Engineering OS retrieval  
2. E3 context enrichment (Ask path)  
3. Select eligible connectors (intent + capability + health)  
4. Query with timeout/concurrency bounds  
5. Normalize + sanitise  
6. Apply identity mappings  
7. Merge/rank evidence  
8. Grounded answer  

Connector failure → continue with native sources; surface limitation; **never fabricate**.

## Read-first / controlled write

E4 permits search/fetch/list/sync/query/metadata/history.  

`EngineeringExternalWriteProposal` exists as **DISABLED_IN_E4** contract only (policy + human approval path for future).

## Reference adapters (E4)

| Adapter | Maturity | Notes |
|---------|----------|-------|
| NativeMock | adapter_implemented | Deterministic fixtures |
| File Import (CSV) | adapter_implemented | Zero-IT / small company |
| Generic REST | adapter_implemented | Mock-backed; SSRF URL safety |
| Microsoft 365 / SharePoint | adapter_implemented (fixture) | Live Graph **not** certified |
| Microsoft Fabric | contract_only (+ optional fixture) | No hard dependency |
| SAP EAM/PM | adapter_implemented (fixture) | No client SAP required |

## Profiles

| Profile | Mode |
|---------|------|
| ESSENTIAL | Native EOS only (connectors disabled) + optional file import |
| ENTERPRISE | Same contracts; install/configure connectors when entitled |

## Admin experience

Registry admin views: Connected · Needs attention · Disconnected · Disabled.  
Not in primary engineer navigation (Platform / admin surfaces).  
`/platform/integrations` shows connector framework status.

## Failure model

SAP/Fabric/M365 unavailable → Ask still searches native records.  
Timeouts default ~800ms per connector; max ~3 connectors per query.

## Future Copilot federation

Native Ask remains primary. Microsoft Copilot is **not required**.  
Corporate Copilot may later call Engineering OS APIs — contracts only in E4.

## Security

Tenant isolation · credential ref isolation · unauthorized/unknown-permission exclusion · cross-tenant ID isolation · SSRF blocks for Generic REST · payload sanitisation · revoked records excluded.

## Packages

- `packages/engineering-os/src/phase-e4/`
- Retrieval: `EngineeringRetrievalService` optional third probe `{ enabled, registry }`
- Evidence provenance additive: `connector_external`

## Known limitations

- No live-certified M365/Fabric/SAP connections in E4  
- Generic REST does not perform live HTTP in reference path  
- Connector registry is in-process (not yet durable DB)  
- Admin UI is minimal / platform integrations surface  
- Autonomous external writes disabled  

## E5 readiness

Connector framework + E3 identity handoff ready for deeper Explore/Intelligence federation. **Do not start E5 automatically.**
