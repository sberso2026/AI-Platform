# EOS 3 — Work Package UI Data Contract

`EOS_APPROVED_WORK_PACKAGE_UI_DATA_CONTRACT=PASS`  
`EOS_ENGINEERING_LANGUAGE_UI_CONTRACT=PASS`

Phase 1 prepares the domain/API for the approved cockpit. Full adaptive cockpit = later (`EOS-3-UX-4`).

## Engineer-facing labels

Use: Work Package, Engineering Design, Inputs, Dependencies, Decisions, Deliverables, Reviews, Changes.  
Do **not** expose: graph node, orchestration, context resolver, canonical relation, backend state machine.

## Header

`{stableId} {title}` — e.g. `WP-STR-004 Support Frame Modification`

## Context strip

- Project
- Asset/System
- Engineering Pattern (nullable until pattern engine)
- Current maturity
- Responsible discipline(s)
- User responsibility (owner / lead — not approval authority)
- Readiness (derived %)
- Status / risk

## Primary sections

Overview · Design · Inputs · Dependencies · Decisions · Deliverables · Reviews · Changes

## Cards

- Needs Attention (derived blockers)
- Next Recommended Action (single deterministic recommendation; no authority grant)
- Key Information
- Progress / Readiness (`DOMAIN1_PILOT_WEIGHTED_V1`)

## API

`GET /api/engineering/projects/{projectId}/work-packages?view=ui-contract&stableId=WP-STR-004`

Implemented by `buildWorkPackageUiContract()` — no UI-only duplicate state.
