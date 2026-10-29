# EOS 2.18 Production Supportability and Observability

`PRODUCTION_SUPPORTABILITY_VALIDATION=PASS`

`PRODUCTION_OBSERVABILITY_OPERATIONAL=YES`

`PRODUCTION_INCIDENT_RESPONSE_EXERCISE=PASS`

`PRODUCTION_EOS_2_KILL_SWITCH_READY=YES`

`PRODUCTION_USABILITY_ASSESSMENT_COMPLETE=YES`

`PILOT_USER_FEEDBACK_CAPTURED=YES`

`PRODUCTION_OPERATIONAL_AUDIT_VALIDATION=PASS`

## Support identification

| Question | Answer |
| --- | --- |
| Which deployment | `dpl_eXE8meiGGdYAvBQ6uKJMFRKbiMkC` on `https://eos-pilot.rtbea.com.au` |
| Which runtime | `031777b75403f6e3390c2aaff5cd909d4fe512e5` |
| Which rollout state | `controlled_pilot` on tenant `eos-controlled-pilot` |
| Which enrollment | Default Workspace `5c85d773-3b79-43b2-b138-c6251f566768`, enrolled 1, unapproved 0 |
| Which database | `wcydlhqiqdwgoaqrlget`, ledger 159, migration `20261029140000` present |
| Recent visible errors | favicon 404; authorized 403 denials for authority-bound actions; Ask AI insufficient-evidence abstention |
| Audit events | `eos2_*` workflow audits for validation project; latest rollout audit `eos2_rollout_mode_set` persistedMode `controlled_pilot` |
| Kill switch | Operator `eos2_18r_set_rollout_mode` path ready; full toggle not re-executed this phase because 2.18R proved the corrected cycle and current mode consistency was verified |
| Rollback deployment | Prior Production `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` / retained rollback target from 2.18R evidence; not executed |
| Defect class | OP-018-001/002 Resolved High; OP-018-003 Medium intermittent hydration; OP-018-004 Low favicon; OP-018-005 Medium legacy overview counters |

`ROLLBACK_TRIGGERED=NO`

`ROLLBACK_LEVEL=NONE`

`EOS_2_CONTROLLED_PILOT_REMAINS_ENABLED=YES`

## Observability

Support can diagnose:

- Application error: browser console / Vercel runtime responses
- Authentication failure: login redirects and 401 on unauthenticated mutating APIs
- Authorization denial: HTTP 403 `authority_denied` for accept/approve/release/AI-as-actor materiality
- API/server failure: HTTP status on pilot-workflow and engineering routes
- Database failure: management query / Supabase project health
- Rollout-state change: tenant settings + `engineering_delivery_audit` rollout actions
- Enrollment change: `eos2_workspace_enrollment` counts
- AI failure where instrumented: Ask response evidenceState / abstention path

Limits remain: some denials are visible in browser/network without a new audit row; that pre-existing behaviour is acceptable for controlled pilot with the audited persist path for successful workflow writes.

## Incident exercise

Unauthenticated `POST` accept_interface attempt returned safe denial (401), no data leakage, no state corruption. Observable via HTTP response. Support can classify as unauthorized access attempt without production data exposure.

## Usability assessment (concrete)

- Project/lifecycle context: validation panel clearly labels controlled Production validation and non-approval.
- Navigation: EOS 2 surfaces reachable; EOS 1 Projects/Assets/Risks coexist.
- Basis visibility: panel authoritative; overview counters misleading zeros (OP-018-005).
- Discipline switching: structural object visible; second discipline write not required for this gate.
- Revision visibility: panel shows current revisions; history preserved in DB.
- Interface state: draft/superseded and pending receivers understandable from panel.
- Change-impact: human materiality path clear; AI cannot finalize.
- Deliverable/freeze: potentially_stale and pending approval visible; freeze readiness not customer approval.
- Denial messages: 403 authority_denied intelligible.
- EOS 1 vs EOS 2: Pilot-0001 remains separate; no auto-migration.

## Pilot user feedback

Authorized pilot user performing this validation observed:

- Workflow friction: overview counters contradict panel/database (usability / Medium defect OP-018-005).
- Usability: validation panel is usable for controlled pilot operations once understood as authoritative.
- Enhancement: wire overview counters to EOS 2 canonical rows or hide them when panel is present.
- Training/documentation: engineers must be told panel > overview zeros; Ask AI may abstain until retrieval corpus includes EOS 2 pilot tables.
- Blocker: none for controlled pilot expansion readiness after persistence remediation.

Feedback classifications recorded; no invented positive feedback beyond observed usability of the remediated panel path.
