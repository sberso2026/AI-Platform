# Project Controls — boundary map (discovery)

Status: explainability_intelligence · Module version: `0.12.0-explainability-intelligence` · Phase: 11L

Three relations, and nothing in between: Project Controls **owns** a concern,
**consumes** it through a public contract, or is **forbidden** from it. The
relation for every concern is fixed in
`packages/project-controls/src/architecture/ownership-lock.ts` and can be
queried with `listConcernsByRelation()`.

```mermaid
flowchart TB
  subgraph EOS["Engineering OS"]
    CORE["Engineering Core<br/>canonical project identity<br/>canonical WBS · Risk · Issue · Action registers"]
    SHARED["Shared Asset Domain<br/>engineering_os_shared_domain<br/>canonical asset identity + lifecycle"]
  end

  subgraph MODULES["Intelligence modules"]
    PI["Project Intelligence<br/>knowledge ABOUT projects"]
    AI["Asset Intelligence v1.0.0 FROZEN<br/>intelligence ABOUT assets"]
    II["Inspection Intelligence v1.0.0<br/>inspection records + findings"]
  end

  subgraph PLATFORM["Platform"]
    COMMERCE["Commerce<br/>entitlements · seats · licensing"]
    FINANCE["External / future Finance domain<br/>ledgers · billing · financial posting"]
    CONTRACTS["Reserved contractual change authority<br/>engineering_core · future commercial/contracts · Business OS · external"]
  end

  subgraph EXTERNAL["External / future"]
    TWIN["Digital Twin"]
    SHM["SHM"]
    CMMS["CMMS work orders"]
  end

  PC["Project Controls 0.12.0-explainability-intelligence<br/>progress + schedule + change + cost + productivity + forecast + decision support + scenario + risk/opportunity + assurance + explainability intelligence ABOUT projects<br/>composition layer · contingency · earned value reserved"]

  CORE -->|consumes projectId, WBS nodes| PC
  PI -->|consumes knowledge derivatives| PC
  AI -->|consumes public contracts only| PC
  II -->|consumes public contracts only| PC
  COMMERCE -->|consumes entitlement decisions| PC
  SHARED -->|consumes assetId references| PC

  PC -.->|FORBIDDEN: mint project identity| CORE
  PC -.->|FORBIDDEN: auto-mutate canonical_risk_register| CORE
  PC -.->|FORBIDDEN: mutate asset_lifecycle_canonical| SHARED
  PC -.->|FORBIDDEN: own or duplicate| AI
  PC -.->|FORBIDDEN: own inspection records| II
  PC -.->|FORBIDDEN: financial ledgers, billing, posting| FINANCE
  PC -.->|FORBIDDEN: approve or execute contractual change| CONTRACTS
  PC -.->|FORBIDDEN| TWIN
  PC -.->|FORBIDDEN| SHM
  PC -.->|FORBIDDEN| CMMS

  classDef frozen fill:#eef,stroke:#446,stroke-width:2px;
  classDef pc fill:#efe,stroke:#484,stroke-width:2px;
  class AI,II frozen;
  class PC pc;
```

Solid arrows are permitted consumption, pointing from the owner into Project
Controls. Dotted arrows are prohibitions.

## Owns

Concerns where Project Controls is the owner.

| Concern key | Description | Status |
| --- | --- | --- |
| `progress_controls_intelligence` | Advisory progress indications from evidence | Implemented 11B |
| `schedule_controls_intelligence` | Advisory schedule posture from declared milestones and baselines | Implemented 11C |
| `change_controls_intelligence` | Advisory change assessment: classification, status context, impact contexts | Implemented 11D |
| `project_snapshot_and_timeline` | Immutable identifier-only snapshots and an append-only project timeline | Implemented 11D |
| `cost_controls_intelligence` | Planned, committed and incurred cost positions and their variance | Implemented 11E |
| `contingency_controls_intelligence` | Contingency pools and drawdown history | Reserved |

Change ownership is ownership of *intelligence about change*, not authority over
change. See `PROJECT_CONTROLS_CHANGE_AUTHORITY_BOUNDARY.md`.

`earned_value` is reserved to Project Controls by domain but carries the
`forbidden` relation in Phase 11A: no other module may claim it, and Project
Controls may not implement it yet.

## Consumes

Concerns Project Controls reads through a public contract and never owns.

| Concern key | Owner |
| --- | --- |
| `project_identity_canonical` | `engineering_os_shared_project_domain` (11A: `engineering_core`) |
| `project_hierarchy_wbs_canonical` | `engineering_os_shared_project_domain` (11A: `engineering_core`) |
| `project_knowledge` | `project_intelligence` |
| `project_documents` | `project_intelligence` |
| `meeting_intelligence` | `project_intelligence` |
| `asset_identity_canonical` | `engineering_os_shared_domain` |
| `asset_intelligence` | `asset_intelligence` (frozen V1) |
| `inspection_intelligence` | `inspection_intelligence` |
| `entitlements_seats_licensing` | `platform_commerce_finance` |

Phase 11B re-spelled the two project rows to
`engineering_os_shared_project_domain`, matching the granularity of the asset
identity owner. The relation is unchanged — Project Controls still only consumes.
See `PROJECT_CONTROLS_OWNERSHIP_MATRIX.md` and
`ENGINEERING_SHARED_PROJECT_DOMAIN.md`.

Consumption rules:

1. Public contracts only. No reach-through into another module's repositories,
   private schema or internal types.
2. Read-only. Consumption never writes back into the owner's canonical state.
3. Reference by identifier. Project Controls stores `projectId` and `assetId`
   references, never copies of the canonical records.

## Forbidden

Concerns Project Controls must not implement, own or mutate.

| Concern key | Owner | Why forbidden |
| --- | --- | --- |
| `earned_value` | `project_controls` | Reserved; requires trustworthy cost + schedule + progress first |
| `asset_lifecycle_canonical` | `engineering_os_shared_domain` | Canonical lifecycle transitions belong to the shared domain |
| `canonical_risk_register` | `engineering_core` | Auto-creation or auto-mutation of Core Risk is never permitted |
| `financial_ledgers_billing` | `external_finance_or_future_finance_domain` | Money movement is a finance system of record. Respelled in 11D away from `platform_commerce_finance`, which owns entitlement only |
| `contractual_change_authority` | `reserved_not_project_controls` | Approving, pricing or executing a contractual change is never a Project Controls act |
| `digital_twin` | `external_future` | Out of scope |
| `structural_health_monitoring` | `external_future` | Out of scope |
| `cmms_work_orders` | `none_in_project_controls` | No work order execution in Project Controls |

Additionally forbidden through Phase 11E, regardless of eventual ownership:
earned value calculation, Critical Path Method scheduling, float computation,
forecasting, cost engines, budget ledgers, financial posting, contingency
drawdown, schedule execution, change execution, contractual change approval,
work packaging UI and any Project Controls product page.
