# EOS-A5E Final Optimization Pilot Readiness Certification

Final certification gate before EOS-A6 Structural Optimization Pilot.
Does **not** implement Structural Optimization, alternative-generation, Value Intelligence, or autonomous selection.

| Field | Value |
| --- | --- |
| START_HEAD | `8a1d2e0b80844265ffe419be663e200a05f9e0e2` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Target | STAGING / NON-PRODUCTION |
| Linked project | `rntonzigxwxcjlcsadip` (`RTB AI Platform Staging`) |
| Engineering OS implementation baseline | `8a1d2e0b80844265ffe419be663e200a05f9e0e2` |
| Verdict | FAIL |
| READY_FOR_EOS-A6 | NO |

## Part 0 — Safety baseline

`git rev-parse HEAD` at start: `8a1d2e0b80844265ffe419be663e200a05f9e0e2`.
Ancestor of that SHA: YES.
Worktree remained DIRTY with pre-existing ERA leftovers. Those files were not reset, cleaned, stashed, merged, rebased, discarded, or staged.

Class A this session: this certification record only.
Class B ERA leftovers remain unstaged and untouched.

Temporary AAL probe used password sign-in only, printed `aal` / `currentLevel` / `nextLevel`, and was deleted. No TOTP secret was read or stored.

## Part 1 — Staging identity

Linked Supabase project ref is exactly `rntonzigxwxcjlcsadip`.
Project name: RTB AI Platform Staging.
Environment: STAGING / NON-PRODUCTION.
Production EOS project `wcydlhqiqdwgoaqrlget` was not used.

## Part 2 — Certification identity (non-secret)

| Field | Value |
| --- | --- |
| CERT_USER | `cert-er-a1@rtb-cert.test` |
| CERT_USER_ID | `b1e487c7-2fbe-4031-a24e-fb474e1c141f` |
| CERT_TENANT | `cert-er-a` / `44809b8f-af76-4a50-9a72-f624fc6d72d6` |
| CERT_WORKSPACE | `cert-er-a1` / `a795a9e0-9d88-4b43-a96e-bb390a2c3f7b` (`Review WS A1`) |
| Tenant membership | active (`engineer`) |
| Workspace membership | present on Review WS A1 |
| Engineering OS product subscription | `active` |
| Product licence | `active`, `license_type=product`, no `application_key` |
| Product installation | `active` / `current_state=active` / `1.0.0` |
| Seat pool | `default`, 1/1 assigned |
| Seat assignment | `active` for the certification user |
| Optimization capability | `engineering_optimization` via Engineering OS product seat (not Project Intelligence) |

No cert-user commerce bypass. No hardcoded entitlement exception.

## Part 3 — AAL2

Password sign-in against staging anon API: PASS.
JWT `aal` claim: `aal1`.
`mfa.getAuthenticatorAssuranceLevel()`: `currentLevel=aal1`, `nextLevel=aal2`.
Verified TOTP factor exists (`factor_type=totp`, `status=verified`).
No TOTP secret is present in env; MFA challenge was not completed and was not faked.

**AAL2: FAIL.** Browser certification stopped per gate rule.

## Part 4 — Browser checklist (31)

Browser session certification was not started after AAL2 failure. `review-staging` was not launched. `.env.development.local` was not created.

| # | Check | Result |
| --- | --- | --- |
| 1 | login succeeds | PASS (password sign-in) |
| 2 | MFA challenge succeeds | NOT_TESTED |
| 3 | session is AAL2 | FAIL |
| 4 | Engineering OS entitlement resolves ALLOW | NOT_TESTED |
| 5 | `engineering_optimization` capability resolves ALLOW | NOT_TESTED |
| 6 | Optimization visible in Engineering OS navigation | NOT_TESTED |
| 7 | correct tenant context | NOT_TESTED |
| 8 | correct workspace context | NOT_TESTED |
| 9 | `/engineering/optimization` loads | NOT_TESTED |
| 10 | Study list loads | NOT_TESTED |
| 11 | create Study | NOT_TESTED |
| 12 | set lifecycle stage | NOT_TESTED |
| 13 | select System scope | NOT_TESTED |
| 14 | select frozen Configuration Baseline | NOT_TESTED |
| 15 | select Decision context | NOT_TESTED |
| 16 | declare/link Requirements | NOT_TESTED |
| 17 | declare/link Assumptions | NOT_TESTED |
| 18 | declare/link Interfaces | NOT_TESTED |
| 19 | create Objective | NOT_TESTED |
| 20 | create Constraint | NOT_TESTED |
| 21 | create Design Variable | NOT_TESTED |
| 22 | create Scenario | NOT_TESTED |
| 23 | create Alternative | NOT_TESTED |
| 24 | invalid Study preflight blocks READY | NOT_TESTED |
| 25 | valid Study preflight allows READY | NOT_TESTED |
| 26 | queue generic certification Run | NOT_TESTED |
| 27 | Run status renders | NOT_TESTED |
| 28 | Results render | NOT_TESTED |
| 29 | feasibility and Pareto language are correct | NOT_TESTED |
| 30 | unauthorized workspace access denied | NOT_TESTED |
| 31 | unentitled Engineering OS user denied Optimization | NOT_TESTED |

Source-only language check for item 29 (not a browser PASS): Optimization workspace uses Pareto-optimal / non-dominated / feasible / infeasible / evaluation-incomplete. Decision Intelligence remains selection authority. No “Best Alternative”, “Winning Design”, “AI Recommended Design”, “Approved by AI”, or “Optimal Approved Solution”.

**Browser checklist: 1/31 PASS, 1 FAIL, 29 NOT_TESTED.**

## Part 5 — Language / human authority

UI source check PASS (`optimization-workspace.tsx` + EOS-A5D unit test).
Decision Intelligence remains authoritative for selection.
No autonomous engineering selection introduced in A5E.

## Part 6 — SPACE GASS host model

| Field | Observation |
| --- | --- |
| Host type | Intended `LOCAL_WINDOWS_EXECUTION_HOST`; this workstation classified `NOT_AVAILABLE` |
| Operating system | Windows 10/11 (`win32` 10.0.26200) |
| SPACE GASS executable path | none (no Program Files install, no PATH, no `SPACEGASS_EXECUTABLE` / `SPACEGASS_EXE` / `SPACEGASS_HOME`) |
| SPACE GASS version | unavailable |
| Adapter-supported version | minimum `12.0`; adapter `0.3.0-spacegass` |
| Licence availability | not configured (`SPACEGASS_LICENSE_PRESENT` unset; no secrets stored) |
| Licence automation | **NOT_AVAILABLE** |
| Working directory | adapter uses a process temp dir (`eos-a5d-sg-*` under OS temp) |
| Timeout | Execution Host authorization `120000` ms; adapter spawn probe capped at `15000` ms |
| Output directory | same temp artifact dir; no certified analysis artifacts produced |
| Hosted execution certified | `spaceGassHostedExecutionCertified=false`; `SPACEGASSLiveExecutionCertified=false` |
| Spawn gate | `SPACEGASS_ALLOW_SPAWN` unset; spawn not enabled |

No licence secrets were stored. Real automated run was not started.

## Part 7 — Execution model (unchanged)

Optimization Run → Kernel JobService (`engineering.optimization.evaluate`) → existing Execution Host (`controlled_engineering_execution_host` `0.1.0-execution-host`) → existing SPACE GASS adapter → real SPACE GASS executable → adapter parser → trusted ingestion.

No second queue, second solver host, or browser-to-SPACE-GASS path was added.
Generic `optimization.generic.test` adapter remains tests/dev only and is not structural evidence.

## Part 8 — Certification structural model

Bounded EOS-A5D model only. Not optimized. No alternative sections generated.

Single-bay steel portal frame, linear elastic static, pinned bases.

- Span 8.0 m, eaves height 4.0 m, flat rafter
- Columns 310UC97, rafter 360UB45
- Grade 300 structural steel (E = 200 GPa, ν = 0.3, ρ = 7850 kg/m³)
- Roof UDL 10 kN/m, no lateral load
- Nodes N1–N4; members C1, R1, C2

## Part 9 — Independent model sanity

Total applied vertical load = 10 kN/m × 8.0 m = **80 kN**.
Symmetric gravity, pinned bases, no lateral load:

- expected left vertical reaction ≈ **40 kN**
- expected right vertical reaction ≈ **40 kN**
- expected horizontal reactions ≈ **0**
- relative tolerance **0.5%**

Independent order-of-magnitude displacement (simply-supported beam bound, not a portal solution): using published-order Ixx for 360UB45 (~1.21×10⁻⁴ m⁴) and E = 200 GPa, midspan δ ≈ 5wL⁴/384EI ≈ **22 mm**. A pinned-base portal is stiffer at the eaves, so eaves/midspan displacement should remain millimetres, not metres or microns.

Qualitative member behaviour:

- each column carries about 40 kN axial compression from gravity, plus frame moments
- rafter end shears about 40 kN
- rafter/column moments are statically indeterminate and are **not** independently claimed

These calculations detect unit, sign, mapping, and parser mistakes. They do not replace SPACE GASS.

## Part 10 — Real solver run

**NOT_RUN.** Missing executable and licence automation. Gate required STOP before automated spawn.

| ID | Value |
| --- | --- |
| optimization_run_id | NONE |
| job_id | NONE |
| execution_ref | NONE |

The existing adapter still returns `hosted_analysis_not_certified` even after a successful `--version` probe. Hosted analysis certification remains false. That is recorded as a remaining limitation, not as a new algorithm.

## Part 11 — Result extraction

**NOT_RUN.** No trusted SPACE GASS metrics were ingested.

| Output | Result |
| --- | --- |
| support reactions | NONE |
| nodal displacement | NONE |
| member axial | NONE |
| member shear | NONE |
| member bending moment | NONE |
| utilization | not claimed |

Fail-closed unit test: SPACE GASS execute without runtime returns non-success and empty metrics.

## Part 12 — Unit certification

Canonical SI mapping is explicit. No silent inference in the certification model.

| Quantity | Unit |
| --- | --- |
| length / geometry | m |
| force | kN |
| moment | kN.m |
| displacement | mm |
| mass | t |
| stress | not used in this model |

Adapter input mapping requires `unitSystem` and `unitCode` (`spacegass_units_required`). Pareto/feasibility treats unit mismatch as `evaluation-incomplete`, never feasible or Pareto-eligible.
Live solver unit conversion was not exercised.

## Part 13 — Numerical sanity

Independent equilibrium of the golden load case PASS in unit tests (40 + 40 = 80 kN).
Solver-to-independent comparison **NOT_RUN**. Parser is not certified from live output.

## Part 14 — Execution provenance

Provenance fields exist on the Optimization run/manifest/host path:

- Optimization Run ID
- immutable Run Input Manifest
- `run_input_fingerprint`
- `baseline_fingerprint`
- configuration baseline
- JobService job ID / `execution_ref`
- adapter / tool provenance
- `source_kind` (`ADAPTER` or `EXECUTION_HOST`; not `MANUAL`)

Live values for this certification:

| Field | Value |
| --- | --- |
| RUN_INPUT_FINGERPRINT | NONE |
| BASELINE_FINGERPRINT | NONE |
| INPUT_MODEL_HASH | NONE |
| OUTPUT_ARTIFACT_HASH | NONE |
| SPACE GASS version | unavailable |
| output artifact hash | NONE |
| execution timestamp | NONE |

**EXECUTION_PROVENANCE: FAIL** (schema/tests exist; live trusted run did not occur).

## Part 15 — Failure certification

Automated fail-closed evidence (no fabricated metrics, no FEASIBLE/Pareto on failure, failure reason preserved):

| Case | Evidence | Status |
| --- | --- | --- |
| A missing executable | adapter `solver_unavailable`; A5D host-adapter test | PASS |
| B unavailable licence | `probeSpaceGassLicense` / `license_unavailable`; A5C SPACE GASS run fails closed | PASS |
| C invalid input | mapping throws before spawn; invalid manifest fails the handler | PASS (unit; no live invalid `.txt`) |
| D wrong units | `spacegass_units_required`; Pareto `unit_mismatch` → `evaluation-incomplete` | PASS |
| E solver non-zero exit | adapter spawnSync fail-closed path | PASS (code; not live-spawned) |
| F timeout | host/adapter map `timeout`; live-provider abort | PASS (code; analysis timeout not live) |
| G output missing | `untrusted_or_empty_spacegass_metrics` | PASS |
| H malformed result | empty/untrusted metrics refused; ingest only on `succeeded` | PASS |
| I parser failure | no trusted `mappedSummary.metrics` → empty metrics refused | PASS |
| J unauthorized execution host | `createAndAuthorizeExecutionJob` reject; A5C unauthorized adapter test | PASS |
| K foreign-workspace input | job handler `workspace_ownership_mismatch`; live JWT A5/A5C | PASS |

## Part 16 — Security / live JWT RLS

Live JWT against staging (password JWT; not AAL2). 37/37 PASS:

- A2C Decision Intelligence
- A3 Systems & Interfaces
- A4 Requirements / Change / Impact / Configuration
- A5 Optimization studies/runs/results
- A5C Optimization run manifests
- ERA-3 Review RLS
- ERA-6 Core RLS

Observed matrix:

- same workspace authorized: ALLOW
- same tenant other workspace: DENY
- different tenant: DENY
- anonymous: DENY
- foreign-workspace manifest: DENY (A5C)
- foreign-workspace execution input / results: DENY (A5 + job workspace check)

Unentitled Engineering OS user denied Optimization: **NOT_TESTED** in browser. Commerce policy maps Optimization to Engineering OS product seat with `seatRequired`; no live unentitled user session was executed.

## Part 17 — Regression

| Check | Result |
| --- | --- |
| `@rtb/engineering-os` typecheck | PASS |
| Engineering OS unit | PASS 414/414 |
| A2 regression (`eos-a2-migration`) | PASS 5 |
| A2C (`eos-a2c-migration`) | PASS 3 |
| A3 (`eos-a3-migration`) | PASS 3 |
| A4 (`eos-a4-migration`) | PASS 3 |
| A5 (`eos-a5-migration`) | PASS 3 |
| A5C (`eos-a5c-migration` + closeout) | PASS 14 |
| A5D (`eos-a5d-pilot-readiness`) | PASS 6 |
| Engineering Review relevant | PASS 39 unit + 37 live JWT |
| PI access/adapter/mapping | PASS 8 |
| Commerce policy/enforcement | PASS 31 |
| Kernel JobService | PASS 12 |
| Execution Host ownership lock | PASS 6 |
| SPACE GASS adapter / interop | PASS 21 (live-provider 7) |
| Live JWT RLS | PASS 37 |
| Secret scan | PASS (review scanner + A5E doc has no JWT/private-key/assigned-key literals) |
| ETABS | NOT_RUN (no shared interoperability change in A5E) |

## Part 18 — Source control

No product/architecture source change in A5E.
ERA leftovers were not staged.
Only this certification document is an A5E source addition.

## Remaining blockers (EOS-A6 not authorized)

1. AAL2 cannot be proven without completing the real MFA challenge in an authenticated browser session.
2. 31-item browser checklist is not complete (1 PASS, 1 FAIL, 29 NOT_TESTED).
3. Unentitled-user Optimization denial was not live-tested.
4. SPACE GASS is not installed on this execution host; licence automation is NOT_AVAILABLE.
5. Real JobService → Execution Host → adapter → SPACE GASS execution did not run.
6. Result extraction, live unit conversion, numerical solver comparison, and live provenance hashes are missing.
7. Adapter hosted-analysis certification remains false (`spaceGassHostedExecutionCertified=false`).
8. Pre-existing dirty ERA leftovers remain unstaged (untouched).

## Out of scope (preserved)

No structural alternative generation, section/member/topology/cost optimization, Value Intelligence, autonomous decision/approval, second job queue, second solver host, or third graph store.
