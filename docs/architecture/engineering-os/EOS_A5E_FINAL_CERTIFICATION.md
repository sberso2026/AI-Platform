# EOS-A5E Final Certification — External Tool Governance

Revised certification object: the generic Engineering OS External Tool Governance framework.
Licensed SPACE GASS (and any other external engineering executable) is a **deferred external dependency**, not a certification failure of this governance framework.

Does **not** implement Structural Optimization, alternative-generation, Value Intelligence, or autonomous selection.
Does **not** fabricate executable path, installed version, licence status, automation permission, adapter compatibility, READY, or solver execution capability.

| Field | Value |
| --- | --- |
| Original A5E START_HEAD | `8a1d2e0b80844265ffe419be663e200a05f9e0e2` |
| Original A5E FAIL record | `8977b6a45bc5a98cbc00f55d1d15cd0005907e5a` |
| Amendment baseline | `a360fa40baf6a1db3901e1a3d04e91edf0ef8569` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Target | STAGING / NON-PRODUCTION |
| Linked project | `rntonzigxwxcjlcsadip` (`RTB AI Platform Staging`) |
| Certification object | Generic External Tool Governance (UI, RLS, registry reuse, fail-closed) |
| **Verdict** | **PASS_WITH_LIMITATIONS** |
| EXTERNAL_SOFTWARE_INSTALLATION | DEFERRED |
| SPACE_GASS_INSTALLATION | NOT_AVAILABLE_AT_THIS_STAGE |
| REAL_SOLVER_EXECUTION | NOT_CERTIFIED |
| READY_FOR_CONTROLLED_PILOT | NO, unless AAL2 and other pilot blockers are also resolved |
| READY_FOR_PRODUCTION | NO |
| READY_FOR_EOS-A6 | NO |

## Required status (this certification)

```
EXTERNAL_SOFTWARE_INSTALLATION: DEFERRED
SPACE_GASS_INSTALLATION: NOT_AVAILABLE_AT_THIS_STAGE
REAL_SOLVER_EXECUTION: NOT_CERTIFIED
READY_FOR_CONTROLLED_PILOT: NO, unless AAL2 and other pilot blockers are also resolved
READY_FOR_PRODUCTION: NO
```

## Scope

### In scope (certified this revision)

1. Generic External Tool Governance (categories, modes, platform vs workspace, secrets-as-references)
2. SPACE GASS remaining a catalog/profile overlay only, with honest NOT_CONFIGURED state
3. Fail-closed Optimization execution against non-READY / non-certified profiles
4. Settings UI source and entitlement mapping at `/engineering/settings/external-tools`
5. Live JWT RLS for platform profiles and workspace assignments
6. Registry reuse (EMI adapter identity, Secret Manager refs, Execution Host, JobService)
7. Generic test adapter restricted to tests/dev (`optimization.generic.test`)

### Out of scope / deferred (not treated as governance FAIL)

- Installing or configuring licensed SPACE GASS or any other external engineering software
- Authenticated AAL2 browser walkthrough of Settings / Optimization (AAL2 remains a separate blocker)
- Real SPACE GASS / JobService solver execution, result extraction, live unit conversion, numerical solver comparison
- EOS-A6 Structural Optimization
- Weakening RLS, entitlement, tenant, workspace, AAL2, or execution safety

## SPACE GASS overlay (required truth — not fabricated)

| Field | Required | Observed |
| --- | --- | --- |
| version | UNKNOWN | `installedVersion = null` (UI: UNKNOWN) |
| executable | NOT_CONFIGURED | `executablePath = null` |
| licence | UNAVAILABLE | `licenceStatus = UNAVAILABLE` |
| automation | REQUIRES_CONFIRMATION | `automationPermission = REQUIRES_CONFIRMATION` |
| adapter compatibility | NOT_CONFIGURED | `adapterCompatibilityStatus = NOT_CONFIGURED` |
| readiness | NOT_CONFIGURED | `readiness = NOT_CONFIGURED` |

Adapter identity reused: `spacegass_solver_adapter` / `0.3.0-spacegass`.
No capability is CERTIFIED. LINEAR_STATIC_ANALYSIS may be AVAILABLE and is still NOT_CERTIFIED.

Synthetic READY fixtures in unit tests exist only to prove the positive gate path. They are not SPACE GASS certification evidence.

## Fail-closed certification

| Case | Evidence | Result |
| --- | --- | --- |
| Non-stub solver execution blocked without a READY certified profile | `OptimizationRunService` requires `external_tool_profile_id` for non-stub adapters; A5C closeout SPACE GASS create fails closed | PASS |
| NOT_CONFIGURED profiles cannot execute | Overlay + full workspace assignment throws `tool_not_configured` | PASS |
| UNAVAILABLE licence blocks execution | Gate code `licence_not_available` even with assignment | PASS |
| REQUIRES_CONFIRMATION automation blocks execution | Gate code `automation_requires_confirmation` even with assignment | PASS |
| NOT_CONFIGURED adapter compatibility blocks execution | Gate code `adapter_not_configured` independently of workspace | PASS |
| Connected ≠ certified | Capability availability AVAILABLE with certification NOT_CERTIFIED throws `capability_not_certified` | PASS |
| Available ≠ certified | Catalog LINEAR_STATIC_ANALYSIS AVAILABLE / NOT_CERTIFIED; overlay has zero CERTIFIED capabilities | PASS |
| Workspace assignment cannot override platform readiness | Platform preconditions run before workspace checks; overlay still blocked with allowed assignment | PASS |
| Generic stub is tests/dev only | `optimization.generic.test` is the stub; SPACE GASS adapter id is not the stub | PASS |

Platform execution preconditions (`assertPlatformExecutionPreconditions`) are evaluated **before** workspace assignment so a workspace cannot override platform readiness, licence, automation, adapter compatibility, or capability certification.

## UI (source)

Route: `/engineering/settings/external-tools` (+ `[id]` detail).
Layout uses Engineering OS page policy. APIs map to `settings.read` / `settings.write` with Engineering OS product seat.

Source behaviour:

- List banner states EXTERNAL_SOFTWARE_INSTALLATION: DEFERRED and SPACE GASS overlay truth
- Version column shows UNKNOWN when unset
- Host / executable show NOT_CONFIGURED when unset
- Detail page shows licence, automation, adapter compatibility, and capability availability vs certification separately
- READY is not claimed

Authenticated AAL2 browser walkthrough: **NOT_TESTED** (AAL2 not proven in this session; password JWT is aal1). This is a remaining pilot blocker, not a governance-framework failure.

## RLS / authorization

Live JWT against staging (password JWT; not AAL2). `live-a5e-external-tools-rls.test.ts` **PASS** (1/1):

- admin may configure platform profiles
- execute user cannot patch executable/licence
- same-tenant other workspace denied assignment visibility
- different tenant denied
- anonymous denied
- execute user cannot mint workspace assignments

RLS, entitlement, tenant, workspace, AAL2, and execution safety controls were not weakened.

## Registry reuse

| Concern | Classification | Evidence |
| --- | --- | --- |
| EMI SPACE GASS adapter | REUSE | catalog `spacegass_solver_adapter` `0.3.0-spacegass` |
| Platform Intelligence tools | REUSE / optional bind | `platform_tool_key` remains null on overlay; no second tool registry |
| Secret Manager | REUSE | `credential_secret_id` references only; forbidden secret material rejected |
| Execution Host | REUSE | `execution_host_id`; no second host |
| JobService | REUSE | `engineering.optimization.evaluate`; no second queue |
| Audit | COMPOSE | `engineering_activity_events` |

## Generic test adapter

`optimization.generic.test` remains tests/dev only. It is not SPACE GASS, not structural evidence, and does not satisfy READY.

## Tests run this revision

| Check | Result |
| --- | --- |
| `@rtb/engineering-os` typecheck | PASS |
| Engineering OS unit | PASS 432/432 |
| External Tool Governance unit | PASS 18/18 |
| A2 (`eos-a2-migration`) | PASS 5 |
| A2C (`eos-a2c-migration`) | PASS 3 |
| A3 (`eos-a3-migration`) | PASS 3 |
| A4 (`eos-a4-migration`) | PASS 3 |
| A5 (`eos-a5-migration`) | PASS 3 |
| A5C (`eos-a5c-migration` + closeout) | PASS 14 |
| A5D (`eos-a5d-pilot-readiness`) | PASS 6 |
| Commerce External Tools entitlement mapping | PASS |
| Live JWT RLS (external tool profiles/assignments) | PASS 1/1 |
| Secret scan (A5E docs + external-tools sources) | PASS (no JWT/private-key/assigned-key literals) |

## Historical limitations (not this certification object)

These remain true and are **limitations**, not a FAIL of External Tool Governance:

1. AAL2 cannot be proven without completing the real MFA challenge. Password JWT is `aal1`.
2. Original 31-item Optimization browser checklist is not complete.
3. Unentitled-user Optimization denial was not live-tested in browser.
4. SPACE GASS is not installed; licence automation is UNAVAILABLE / REQUIRES_CONFIRMATION.
5. Real JobService → Execution Host → adapter → SPACE GASS execution did not run and is **NOT_CERTIFIED**.
6. Result extraction, live unit conversion, numerical solver comparison, and live provenance hashes are missing.
7. Adapter hosted-analysis certification remains false (`spaceGassHostedExecutionCertified=false`).
8. Pre-existing dirty ERA leftovers remain unstaged (untouched).

## Safety baseline

Worktree remained DIRTY with pre-existing ERA leftovers. Those files were not reset, cleaned, stashed, merged, rebased, discarded, or staged.

Class A this revision: External Tool Governance fail-closed gate, tests, Settings UI deferred banner, certification plan, and this report.
Class B ERA leftovers remain unstaged and untouched.

Production EOS project `wcydlhqiqdwgoaqrlget` was not used.

No cert-user commerce bypass. No hardcoded entitlement exception. `requireMfa` / AAL2 were not weakened.

## Remaining blockers (EOS-A6 and controlled pilot not authorized)

1. AAL2 session for cert-er-a1.
2. Authenticated browser certification of Settings and Optimization surfaces.
3. Licensed SPACE GASS (or equivalent) installation, version identification, licence AVAILABLE, automation PERMITTED with provenance, adapter compatibility CERTIFIED, then derived READY — only after real evidence.
4. Real solver execution, trusted result extraction, live units, numerical comparison, execution provenance hashes.
5. Unentitled-user live denial of Optimization (browser).

Until those are independently evidenced, READY_FOR_CONTROLLED_PILOT remains **NO** and READY_FOR_PRODUCTION remains **NO**.

## Out of scope (preserved)

No structural alternative generation, section/member/topology/cost optimization, Value Intelligence, autonomous decision/approval, second job queue, second solver host, or third graph store.
No fabricated SPACE GASS install, licence, automation, READY, or solver capability.
