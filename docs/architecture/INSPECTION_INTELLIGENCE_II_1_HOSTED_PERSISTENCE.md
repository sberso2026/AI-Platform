# Inspection Intelligence II-1 — Hosted Persistence

**Phase:** II-1  
**Baseline:** `63fe0f820a62adca3411376cc8b09ea701dbe244`  
**Branch:** `cursor/inspection-intelligence-next-gen`

II-1 wires the certified V1 domain engine to existing `inspection_*` tables. It does not redesign the domain, implement Command Centre, or build AI Inspection Engineer.

## Schema status

`SCHEMA_CHANGED=false` for the inspection truth model: no new tables or columns.

Batches 43–45 shipped **SELECT-only RLS** while persistence was in-memory. That blocked user-JWT hosted writes. II-1 adds a **policy-only** migration (`20260830220000_batch_ii1_inspection_hosted_write_rls.sql`) that clones the existing tenant + workspace membership predicate for INSERT/UPDATE. Classification: V1 hosted-wiring implementation defect, not a missing durable representation.

Close-out remains session state + corrective actions + verifications (no dedicated close-out table), matching V1.

## Hosted adapter

```
web/API
  -> withEngineeringApi (Engineering OS application_access)
  -> requireInspectionIntelligenceAccess
  -> HostedInspectionRepository
  -> ctx.supabase (user JWT, RLS honored)
  -> existing inspection_* tables
```

No second database client, ORM, auth, tenant override, or shadow store. The in-memory `DurableInspectionRepository` / vertical slice remain historical unit/cert fixtures.

## Domain-to-table mapping

| Primitive | Table |
|---|---|
| plans / templates | `inspection_plans`, `inspection_templates`, `inspection_template_versions` |
| InspectionTarget | `inspection_targets` (json; coupling only) |
| sessions | `inspection_sessions` |
| observations | `inspection_observations` |
| measurements | `inspection_measurements` |
| evidence metadata | `inspection_evidence.file_id` → Platform Files |
| defects | `inspection_defects` |
| recommendations | `inspection_recommendations` |
| corrective actions | `inspection_corrective_actions` |
| assessments | `inspection_assessments` |
| verification | `inspection_verifications` |
| close-out | session status `closed` + `inspection_reporting_outputs` snapshot |
| condition ratings | `inspection_condition_ratings` |
| provenance | `inspection_events` + Platform `audit_events` |

## API

Canonical: `GET/POST /api/engineering/inspection-intelligence/hosted`  
Intent operations (`create_plan`, `start_session`, `record_observation`, …).  
Historical `.../slice` POST remains the in-memory 9B fixture.

## Auth / RLS

Authenticated Engineering OS context only. Tenant from membership, not caller body. Cross-tenant / cross-workspace rows are not visible. Project scope is enforced via InspectionTarget when `projectId` is supplied. Foreign ids return `not_found`.

## Human authority

`AUTONOMOUS_* = false`. Approvals, condition certification, and close-out require human `inspection.approve`. Missing measurements stay `unknown`.

## Next phase

`II_2_READY=true`. II-2 is Inspection Command Centre composition over these hosted records.
