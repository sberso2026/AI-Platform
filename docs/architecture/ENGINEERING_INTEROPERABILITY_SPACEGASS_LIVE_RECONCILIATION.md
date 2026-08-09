# Engineering Interoperability — SPACE GASS Live Integration Reconciliation (Phase 13D)

Status: **implemented (live provider + fail-closed)** · version **0.4.0-spacegass-live** · phase **13D** · status key **spacegass_live**

## Purpose

Reconcile what “live SPACE GASS integration” actually means against the official
vendor API, this workstation (RTBEA), and GitHub-hosted CI — without fabricating
live success.

## Actual mechanism (official)

| Fact | Detail |
| --- | --- |
| Product | SPACE GASS **14.5+** licensed install |
| Service | Local headless **SpaceGassApi.exe** HTTP service |
| Default base | `http://localhost:34560` |
| API prefix | `/api/v1` (OpenAPI `servers[0].url`) |
| Auth | **No per-request credentials**; licensing enforced server-side (`403` + license error codes) |
| Cloud | **Not a cloud SaaS execution plane** — API process is local/controlled-host |
| OpenAPI | https://api.spacegass.com/openapi.json |
| Session model | **One active job per API service instance** |
| Core calls | `POST /job/open` / `open-sample` → structure GETs → `POST /job/analysis/static/run-linear` → poll `GET /job/analysis/runs/{runId}` → **always `POST /job/close`** |
| SDKs | Vendor ships .NET / Python clients; **RTB production path uses native TypeScript `fetch`** (no Python SDK dependency) |

## Current probe (this environment)

Parent workstation + GitHub CI probes observed:

- No `SPACEGASS_*` environment variables set
- No SPACE GASS install located
- `http://localhost:34560` **timed out** — SpaceGassApi.exe **not running**
- Therefore live health = **`unavailable`**

**Do not fabricate live success.** Certification live federation/execution gates
**FAIL** (not skip) when the API is unavailable.

## Digital Twin V1 freeze (hard constraint)

| Constraint | Value |
| --- | --- |
| DT package | `packages/digital-twin/**` — **ZERO modifications** |
| Tag | `digital-twin-v1.0.0` @ `a94425ed009ca087c2f44c9d3757c0c82bd936b1` |
| Certified solver inside DT | CalculiX only |
| SPACE GASS inside DT | Reserved stub only |

## Environment modes

| Mode | Meaning |
| --- | --- |
| `local_engineering_workstation` | Engineer laptop/desktop with licensed SPACE GASS + SpaceGassApi.exe |
| `controlled_execution_host` | Dedicated internal host with license + API; candidate for controlled certification |
| `hosted_ci` | GitHub-hosted runners — **cannot** run SPACE GASS |
| `remote_provider` | Reserved remote provider mode (not certified in 13D) |

## Honesty flags (package defaults on unavailable host)

| Flag | Value | Rationale |
| --- | --- | --- |
| `spacegassLiveProviderImplemented` | true | HTTP client + health + federation/execution code present |
| `SPACEGASSLiveProviderReady` | **false** | Ready requires proven live session evidence in cert artifact |
| `SPACEGASSLiveModelFederationReady` | **false** | No live session federated |
| `SPACEGASSLiveResultFederationReady` | **false** | No live result federation proven |
| `spaceGassHostedExecutionCertified` | **false** | GitHub CI has no SPACE GASS |
| `spaceGassControlledExecutionCertified` | **false** | No controlled-host evidence exists now |
| `SPACEGASSSolverAdapterReady` | true | Retained from 13C (fail-closed adapter) |
| `silentSolverFallbackAllowed` | **false** | Never CalculiX/fixture when SPACE GASS requested |
| `ETABSAdapterImplemented` | false | Out of scope |
| `analysisModelGenerationImplemented` | false | Out of scope |
| `liveSourceModelMutationAllowed` | false | Read/federate/execute only |
| `IFCFederationReady` | true | Retained |
| `phase13EReady` | true | **Flag only** — do not start 13E |
| `releaseEligible` | **false** if live gates fail | Full PASS required |

## Provenance labels (must not be conflated)

| Label | Meaning |
| --- | --- |
| `LIVE MODEL` | Federated from a live SpaceGassApi job session |
| `FEDERATED EXPORT` | 13C export-fixture federation (not live) |
| `EXISTING RESULT` | Results present in source/live job without RTB execution |
| `RTB EXECUTED RESULT` | Produced by RTB-governed live `run_linear` execution |

Never label fixture/export content as `LIVE MODEL`.

## CI feasibility

| Capability | CI status |
| --- | --- |
| Live health probe attempt | Required (records `unavailable`) |
| Live federation gate | **FAIL** when unavailable |
| Live execution gate | **FAIL** when unavailable |
| 13A/13B/13C regression + IFC + DT intact | Runnable |
| Fail-closed / no silent fallback unit tests | Runnable |
| `spaceGassHostedExecutionCertified` | remains **false** |

## Architecture placement

- Live provider modules under
  `packages/engineering-model-interoperability/src/domain/spacegass/`
- Solver adapter prefers live HTTP when reachable; otherwise 13C env fail-closed path
- No second solver framework; consumes DT `EngineeringSolverAdapter` shapes only
- Prefer **no** `batch_88` unless additive schema is truly required (13D uses cert artifact for health evidence)

## Pins

| Pin | Value |
| --- | --- |
| Digital Twin V1 | `a94425ed009ca087c2f44c9d3757c0c82bd936b1` |
| Phase 13A | `5d238f24…` |
| Phase 13B | `1540f806ada0cf70179c3cfdffe4157f29620778` |
| Phase 13C | `a1c73721326927b507bb7c2f456d6188dd00e8b9` |
| Phase 13D | `0.4.0-spacegass-live` (this phase; not GA) |

## Explicit non-goals (13D)

- No fabricated live PASS
- No ETABS / other CSI production adapters
- No Phase 13E
- No analysis-model generation / source-model mutation
- No DT package modifications
- No silent CalculiX/fixture fallback when SPACE GASS requested
