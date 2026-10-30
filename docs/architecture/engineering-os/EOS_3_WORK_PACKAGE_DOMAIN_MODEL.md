# EOS 3 — Work Package Domain Model

Phase: `EOS-3-DOMAIN-1-WORK-PACKAGE-EXECUTION-MODEL`  
Architecture status: `FROZEN_FOR_IMPLEMENTATION_VALIDATION`

## Hierarchy

```
PROJECT (commercial / organizational container)
  → WORK_PACKAGE (engineering execution boundary)
    → AFFECTED_ASSET_OR_SYSTEM (what the work affects)
      → ENGINEERING_OBJECTS (requirements, calculations, decisions, …)
```

`EOS_WORK_PACKAGE_FIRST_CLASS_OBJECT=YES`  
`EOS_PROJECT_MODEL_PRESERVED=YES`  
Do **not** assume `PROJECT = ONE STAGE`.

## Canonical identity

Stable IDs such as `WP-STR-004`. Structural fields include:

| Field | Source |
| --- | --- |
| stable ID | SYSTEM_MANAGED (discipline-prefixed allocator) or explicit |
| workspace / project | DERIVED from create context |
| title | HUMAN (required) |
| description / objective | HUMAN optional |
| work type / pattern ref | DERIVED / placeholder (pattern engine later) |
| status / active | DEFAULTED |
| maturity | DEFAULTED `Initiation`; independent of project lifecycle |
| owner | DEFAULTED from actor when available |
| disciplines | DERIVED / HUMAN (initiating, lead, participating, reviewing) |
| affected assets | DERIVED when reliable, else HUMAN hint |
| dates / priority / risk | DEFAULTED |
| provenance / revision | SYSTEM_MANAGED |

`EOS_WORK_PACKAGE_MINIMUM_INPUT_PRINCIPLE=PASS`  
`WORK_PACKAGE_REQUIRED_HUMAN_INPUTS<=3`

## Multi-discipline & owner separation

- Initiating / lead / participating / reviewing disciplines are distinct fields.
- Owner (person) ≠ discipline.
- Ownership does **not** grant engineering approval authority.

`EOS_WORK_PACKAGE_MULTI_DISCIPLINE_MODEL=PASS`  
`EOS_SINGLE_DISCIPLINE_WORK_PACKAGE_ASSUMPTION=NO`  
`EOS_WORK_PACKAGE_OWNER_DISCIPLINE_SEPARATION=PASS`  
`EOS_WORK_PACKAGE_OWNER_AUTO_APPROVAL_AUTHORITY=NO`

## Association semantics

Associations reference **existing** canonical objects. No Work-Package-specific copies.

| Role | Meaning |
| --- | --- |
| `PRIMARY_EXECUTION_CONTEXT` | Object is primarily executed in this Work Package |
| `RELATED_WORK_PACKAGE` | Shared / relevant without exclusive ownership |
| `AFFECTED_WORK_PACKAGE` | Change/impact touches this Work Package |

Confirmation states: `PROPOSED` | `CONFIRMED` | `SUPERSEDED` | `STALE`.  
Proposed objects remain visible; never auto-approved.

`EOS_WORK_PACKAGE_ASSOCIATION_SEMANTICS_DOCUMENTED=YES`  
`EOS_DUPLICATE_ENGINEERING_OBJECT_MODEL_CREATED=NO`

## Dependencies, readiness, blockers, next action

- Dependency foundation: `REQUIRES` | `DEPENDS_ON` | `AFFECTS` (+ status, provenance).
- Readiness: derived weighted pilot rule (`DOMAIN1_PILOT_WEIGHTED_V1`); not a manual percent.
- Blockers: derived from associations / canonical state (vendor input, assumptions, interfaces, decisions, reviews).
- Next action: single deterministic recommendation; does not grant authority.

## Schema

Migration: `supabase/migrations/20261030140000_eos_3_domain_1_work_packages.sql`  
Tables: `eos3_work_packages`, `eos3_work_package_associations`, `eos3_work_package_dependencies`  
RLS: tenant + `engineering_core_workspace_member(workspace_id)`.

Pilot runtime also uses the in-process service for tests and controlled pilot UI (same shapes).

## Code

- `apps/web/src/lib/engineering/eos3-work-package-service.ts`
- `apps/web/src/app/api/engineering/projects/[projectId]/work-packages/route.ts`
