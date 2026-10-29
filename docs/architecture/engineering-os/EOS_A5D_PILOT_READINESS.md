# EOS-A5D Pilot Readiness

Certifies whether RTB Engineering OS is ready to attempt structural optimization safely.
Does **not** implement Structural Optimization, Value Intelligence, or autonomous decisions.

| Field | Value |
| --- | --- |
| START_HEAD | `0dd05bf124c19e1fbb8099f396a904ec86a2d020` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Staging project | `rntonzigxwxcjlcsadip` |
| Verdict | PASS_WITH_LIMITATIONS |
| READY_FOR_EOS-A6 | NO |

## Source baseline

See `EOS_A5D_SOURCE_BASELINE.md`.

Worktree at start was DIRTY. Class A files are Engineering OS A1–A5D. Class B ERA leftovers remain unstaged.

## Commerce entitlement architecture

A5C browser failure: `/engineering/optimization` redirected to `access-denied?reason=application_not_in_plan` because Optimization was mapped to `applicationKey: "project_intelligence"`.

Classification **before correction:** `LEGACY_PI_COUPLING`.

**Chosen model (smallest mapping, no new SKU):**

| Layer | Value |
| --- | --- |
| Product | `engineering-os` |
| Application SKU | none (product seat) |
| Logical capability | `engineering_optimization` |
| Page policy | `/engineering/optimization` → product `access` |
| API | `optimization.read` / `optimization.write` |
| Service | `optimization.list/get/create/update` |

Engineering OS A2–A4 registers used as Optimization context (decisions, assumptions, systems, interfaces, requirements, changes, impacts, configuration) were also remapped off Project Intelligence to the same product seat. PI-specific routes (`/engineering/apps/project-intelligence/**`, projects, assets, TQ, risks, issues) remain PI application-gated.

Fail-closed entitlement evaluation is unchanged. No cert-user bypass.

## Certification identity (staging, non-secret)

| Field | Value |
| --- | --- |
| CERT_USER | `cert-er-a1@rtb-cert.test` |
| CERT_TENANT | `cert-er-a` / `44809b8f-af76-4a50-9a72-f624fc6d72d6` |
| CERT_WORKSPACE | `cert-er-a1` / `a795a9e0-9d88-4b43-a96e-bb390a2c3f7b` (`Review WS A1`) |
| ENGINEERING_OS_ENTITLEMENT | active product subscription + active product licence |
| OPTIMIZATION_CAPABILITY | Engineering OS product seat (not PI) |
| SEAT_STATE | pool `default`, 1/1 assigned |
| APPLICATION_INSTALLATION_STATE | product installation `active` / `current_state=active` / `1.0.0` |

No PI application licence exists on this tenant. That is now correct for Optimization.

## AAL2

Not proven in this session. No TOTP secret is stored in env keys. AAL2 must use the product MFA enrollment/challenge flow. Do not fake `aal=aal2`.

## Browser checklist (31)

Not executed this session (MFA/AAL2 not completed; review-staging not started to avoid leftover `.env.development.local`).

Expected items remain:

1. login succeeds
2. MFA challenge works
3. resulting session is AAL2
4. Engineering OS product entitlement allows access
5. Optimization appears in navigation
6. correct tenant selected
7. correct workspace selected
8. `/engineering/optimization` loads
9. Study list loads
10. create Study works
11. lifecycle selection works
12. System scope selection works
13. frozen Configuration Baseline selection works
14. Decision context works
15. Requirements context works
16. Assumptions context works
17. Interfaces context works
18. Objective create/update works
19. Constraint create/update works
20. Design Variable create/update works
21. Scenario create/update works
22. Alternative create/update works
23. invalid preflight clearly blocks READY
24. valid preflight allows READY
25. queue Run works
26. Run status updates correctly
27. Results, feasibility and Pareto terminology render correctly
28. no "Best", "Winner", autonomous "Recommended", or "Approved by AI" wording
29. stale context state renders correctly if testable
30. unauthorized workspace is denied
31. user lacking Optimization entitlement remains denied

UI source check for item 28: PASS (workspace component).

## Analysis engine

Selected: **SPACE GASS** (single engine; ETABS not certified).

| Check | Result |
| --- | --- |
| Executable on this Windows host | NOT FOUND (no Program Files install, no PATH, no `SPACEGASS_*` env) |
| Version | unavailable |
| Adapter | existing `createSPACEGASSSolverAdapter` reused (`0.3.0-spacegass`) |
| Hosted execution certified flag | remains `false` |
| Licence automation | REQUIRES_HUMAN_CONFIRMATION |

## Execution deployment model

Intended valid architecture:

RTB Engineering OS → Kernel JobService (`engineering.optimization.evaluate`) → existing Execution Host → Windows Execution Host → locally installed licensed SPACE GASS → trusted ingestion.

**Classified this host:** `NOT_AVAILABLE` (no local solver). Do not claim hosted execution certification.

`LOCAL_WINDOWS_EXECUTION_HOST` remains the intended first-pilot model once a licensed executable is present.

## Certification model

Single-bay steel portal, pinned bases, span 8 m, eaves 4 m, columns 310UC97, rafter 360UB45, steel Grade 300, linear elastic static, rafter UDL 10 kN/m (total 80 kN). No lateral load.

Independent sanity: vertical reaction equilibrium and symmetry, 40 kN each support, relative tolerance 0.5%. Portal moments are statically indeterminate and are **not** independently claimed without solver extraction.

Units: geometry m, force kN, moment kN·m, displacement mm, mass t. No silent unit inference.

## Real engine execution

NOT_RUN. JobService + Execution Host + SPACE GASS adapter path is wired. Missing executable fail-closes with empty metrics. Generic test adapter is not used as structural evidence.

Provenance fields defined by the existing run/manifest/host path: run id, job id, execution_ref, fingerprints, adapter version. Solver version/output hash cannot be captured without a real spawn.

## Failure certification

Adapter/host fail-closed for missing executable, licence not attested, invalid units, unauthorized host, and empty/untrusted metrics. Failed runs must not be `succeeded`, FEASIBLE, Pareto-eligible, or carry fabricated metrics. Covered by A5C + A5D unit tests.

## Ownership lock

Existing execution-host ownership-lock tests PASS (6). Not weakened.

## Typecheck / regression (this session)

| Check | Result |
| --- | --- |
| `@rtb/engineering-os` typecheck | PASS (core-services Json, grounded-ask never, TQ accept) |
| Lint | NOT_RUN (no package ESLint config) |
| Engineering OS unit | PASS 414 |
| A2/A3/A4/A5/A5C unit | PASS |
| Commerce policy tests | PASS 23 |
| JobService / kernel | PASS 12 |
| SPACE GASS interop live-provider | PASS 7 |
| Execution-host ownership lock | PASS 6 |
| Engineering Review subset | PASS 14 |
| PI access/adapter/mapping subset | PASS 8 |
| Live JWT RLS | NOT_RUN this session (A5C previously PASS) |
| Secret scan of A5D sources | PASS (no secrets) |
| Temporary env files | none present |

## Remaining limitations (block EOS-A6)

1. Dirty ERA leftovers remain unstaged (class B).
2. Authenticated AAL2 browser checklist not completed.
3. SPACE GASS is not installed on this execution host; licence not human-confirmed.
4. Real solver execution, result extraction, and output provenance are NOT_RUN.
5. Adapter still does not claim hosted analysis certification (`spaceGassHostedExecutionCertified=false`).

## Out of scope (preserved)

No structural alternative generation, section/member/topology/cost optimization, Value Intelligence, autonomous decision/approval, second job queue, second solver host, or third graph store.
