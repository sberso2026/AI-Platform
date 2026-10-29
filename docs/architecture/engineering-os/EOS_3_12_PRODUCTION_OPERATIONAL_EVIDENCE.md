# EOS 3.12 Production Operational Evidence

Measured against Production `wcydlhqiqdwgoaqrlget` for authorized pilot workspace `5c85d773-3b79-43b2-b138-c6251f566768` after EOS 3.11R activation.

## Counts (actual)

| Metric | Value |
|--------|-------|
| `EOS_3_PILOT_OPERATION_COUNT` | `6` |
| `EOS_3_PILOT_READ_OPERATION_COUNT` | `0` |
| `EOS_3_PILOT_WRITE_OPERATION_COUNT` | `3` |
| `EOS_3_PILOT_WORKFLOW_TRANSITION_COUNT` | `0` |
| `EOS_3_PILOT_EVENT_COUNT` | `0` |
| `EOS_3_PILOT_AI_TASK_COUNT` | `0` |
| `EOS_3_PILOT_AUTHORIZATION_DENIAL_COUNT` | `0` |
| `EOS_3_PILOT_SECURITY_DENIAL_COUNT` | `0` |

### Count basis

- **Writes (3):** `eos3_objects` = 2; `eos3_object_revisions` = 1 (smoke project `eos3-pilot-smoke-001`).
- **Operations (6):** those writes + `eos3_dev_entitlements` active eos-3 grant (1) + `eos3_dev_enrollment` PILOT (1) + `eos3_foundation_audit` smoke row (1).
- **Reads:** no Production application read telemetry store available for this window → observed `0` (not fabricated).
- **Auth/security denials:** no denial rows recorded in Production pilot audit tables for this window → observed `0`. Evaluator still denies non-PILOT Production access in regression (not counted as Production traffic).

## Table probes

| Table / probe | Count |
|---------------|-------|
| `eos3_objects` (pilot ws) | 2 |
| `eos3_objects` (all Production) | 2 |
| `eos3_object_revisions` (pilot ws) | 1 |
| `eos3_object_relationships` | 0 |
| `eos3_workflow_instances` | 0 |
| `eos3_governed_events` | 0 |
| `eos3_ai_orchestration_plans` | 0 |
| `eos3_connectors` | 0 |
| `eos3_migration_jobs` | 0 |
| `eos3_decision_cases` | 0 |
| `eos3_knowledge_sources` | 0 |
| `eos3_operational_assets` | 0 |
| `eos3_dev_enrollment` state=PILOT | 1 |
| `eos3_dev_entitlements` active eos-3 (all) | 1 |
| Foreign workspace leak (`ce113edd…` / smoke project) | 0 |

## Foundation audit continuity

One Production foundation audit row:

- action: `eos3_11r_pilot_smoke`
- authority_role: `software_release_authority`
- detail: `{ project_id: eos3-pilot-smoke-001, live_llm: DISABLED_NOT_VALIDATED, real_connectors: DISABLED }`
- created_at: `2026-10-29T14:32:04Z`

Audit chain for activation (GO → migration → entitlement → enrollment → smoke) is documented in EOS 3.11R evidence; no additional Production usage audits yet.

## Incidents / errors

| Metric | Value |
|--------|-------|
| SEV1 | 0 |
| SEV2 | 0 |
| SEV3 | 0 |
| Application errors (observed) | 0 |
| Workflow failures | 0 |
| Event failures | 0 |
| AI task failures | 0 |

`EOS_3_PILOT_INCIDENT_REVIEW_COMPLETE=YES`

`EOS_3_PILOT_ERROR_REVIEW=PASS`

## Reliability snapshot

| Metric | Value |
|--------|-------|
| Successful operations (observed) | 6 |
| Failed operations (observed) | 0 |
| Threshold breaches | 0 |

`EOS_3_PILOT_EVIDENCE_SUFFICIENCY=INSUFFICIENT` for GA conclusions.
