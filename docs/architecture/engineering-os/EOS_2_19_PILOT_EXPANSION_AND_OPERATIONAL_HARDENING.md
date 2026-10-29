# EOS 2.19 Pilot Expansion and Operational Hardening

## Decision

`PHASE=EOS-2.19-PILOT-EXPANSION-AND-OPERATIONAL-HARDENING`

`VERDICT=PASS_WITH_LIMITATIONS`

`EOS_2_18_BASELINE_VERIFIED=YES`

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-2.20-EOS-2.0-GENERAL-AVAILABILITY-GATE`

This is not General Availability. EOS 2.20 was not executed.

## Baseline verified before mutation

| Item | Value |
| --- | --- |
| Production runtime (pre-hardening) | `031777b75403f6e3390c2aaff5cd909d4fe512e5` |
| Production deployment | `dpl_eXE8meiGGdYAvBQ6uKJMFRKbiMkC` |
| Supabase | `wcydlhqiqdwgoaqrlget` |
| Migration ledger | `159` / max `20261029140000` |
| Mode | `controlled_pilot` |
| Enrolled workspaces | `1` |
| Approved workspace | `5c85d773-3b79-43b2-b138-c6251f566768` |
| Cross-workspace leak | `0` |

Qualification remains `QUALIFIED_BOUNDED`. Formulas and result semantics unchanged. D1 baseline not invalidated.

## Hardening delivered

1. **Hydration #418 (OP-018-003)** — Root cause identified: `useEngineeringCapabilities` seeded React state from `sessionStorage` during render, so SSR HTML and the first client paint diverged on Ask/nav chrome after a cached visit. Fix: SSR-safe initial state; cache applied only in `useEffect`.
2. **Legacy overview counters (OP-018-005)** — API marks `viewSource=unpersisted_scaffold` and returns `persistedBasisSetCount`. UI labels the overview as scaffold / not EOS 2 pilot persistence counts and points to the validation panel as authoritative.
3. **Ask AI retrieval** — Abstention root cause: Ask corpus is indexed documents / project intelligence; EOS 2 pilot-workflow tables are outside that corpus. Correct abstention preserved; UI limit notice added; grounding PASS.
4. **Canonical gates** — `pnpm eos2:canonical-gates` / `scripts/eos2-19-canonical-gates.mjs` with bounded timeouts, correct secret-scan path, and `PASS_WITH_KNOWN_MODERATE` policy for `GHSA-w5hq-g745-h8pq`.
5. **Live persistence hang** — Root cause: unbounded `pnpm --filter @rtb/engineering-review-persistence test` (full live RLS pack) waited without orchestration timeout when run as a background job. Canonical orchestration uses `test:unit` by default; optional live pack requires `EOS219_INCLUDE_LIVE_PERSISTENCE=1` with explicit timeout.
6. **Recovery / incident / observability / GA readiness / pilot guide** — documented in companion artifacts.

## Pilot expansion

`HUMAN_PILOT_EXPANSION_GO=NO`

`AI_PILOT_EXPANSION_AUTHORITY=NO`

`PILOT_EXPANSION_STATUS=NOT_EXPANDED_PENDING_HUMAN_COHORT_APPROVAL`

Candidate discovery on tenant `eos-controlled-pilot` found only the already-enrolled Default Workspace. No second eligible Production workspace was available for deliberate enrollment, and no explicit human cohort-expansion GO naming additional workspace IDs was present. Cohort remains `1`. Unapproved enrolled count `0`.

## Application runtime

Staging preview validated Ready: `dpl_FoK4LGBZMy1DwEhZCvnd4aA3QqDQ`.

Production hardening deployment (initial promote): `dpl_EVv4KvCjcFWchGfhvBeAHjgbXpX3` aliased to `https://eos-pilot.rtbea.com.au`. Authoritative source commit is recorded after docs/code commit and provenance redeploy in the operational hardening manifest.

`DATABASE_SCHEMA_CHANGED=NO` — no new migration in this phase.

## Limitations retained

- Favicon 404 (OP-018-004 Low)
- MDR naming remains UX limitation (surface usable)
- Known moderate `GHSA-w5hq-g745-h8pq` accepted bounded risk (exceljs→uuid transitive)
- PITR not enabled; logical backup/recoverability documented
- Internal tenant allow override remains INTERNAL_PILOT / controlled-pilot suitable, not GA commercial entitlement
- Authenticated interactive performance remains slower than unauthenticated edge timings; classified DEGRADED_NONBLOCKING pending formal SLO
- No multi-workspace expansion evidence because expansion was not authorized/available
