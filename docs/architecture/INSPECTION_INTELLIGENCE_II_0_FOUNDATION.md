# Inspection Intelligence II-0 — Next-Gen Foundation

**Phase:** II-0  
**Baseline:** `6738e25272a35e979b051621414a753be93529aa`  
**Branch:** `cursor/inspection-intelligence-next-gen`  
**Historical V1 GA:** `inspection-intelligence-v1.0.0` → `d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09`

II-0 creates the next-generation development foundation **over** the certified V1 engine. It does not rebuild Inspection Intelligence V1, create new inspection truth models, implement operational surfaces, or assign a next GA version.

## Historical / current release identity

Per `ADR_APPLICATION_RELEASE_IDENTITY`:

| Identity | Value | Mutability |
|---|---|---|
| `historicalCertification.version` | `1.0.0` | Immutable |
| `historicalCertification.tag` | `inspection-intelligence-v1.0.0` | Do not move, delete, or recreate |
| `historicalCertification.certifiedCommit` | `d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09` | Immutable |
| Current declared version | `1.0.0` | Unreleased next-gen; no new GA assigned |
| Current declared tag | `inspection-intelligence-v1.0.0` | Last GA until a later semver is justified |
| `INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS` | `unreleased` | Advances only after ADR-justified promotion |
| `INSPECTION_INTELLIGENCE_NEXT_GA_VERSION` | `null` | Must not be invented in II-0 |

Historical Phase 9A–9K certification remains immutable evidence. Next-gen certification identifiers live under `packages/inspection-intelligence-certification/src/ii0/` and **do not rename** historical phases.

## Canonical ownership freeze

Engineering OS / Platform owns: project, asset, location, company, user, document, core action, core risk, core decision, files, audit, identity, commerce, knowledge graph/store.

Inspection Intelligence owns: inspection plans/templates, sessions, observations, measurements, inspection evidence, inspection defects, inspection recommendations, corrective-action process state, condition assessments, verification / close-out, inspection reporting preparation/snapshots where already canonical.

**Coupling boundary:** `InspectionTarget`. Do not duplicate projects, assets, documents, users, risks, actions, decisions, PI findings, or knowledge records.

## Architecture guardrails

Machine-testable invariants in `packages/inspection-intelligence/src/next-gen/ownership.ts`:

- `implementsOwnAiStack=false`
- no duplicate agent runtime, knowledge graph, integration stack, workflow engine, identity, commerce, or engineering truth model
- `directProviderAccessFromInspectionIntelligence=false`
- autonomous inspection approval / condition certification / remediation approval = `false`
- `externalWritesEnabled=false`
- `SCHEMA_CHANGED=false`

AI remains advisory unless separately certified. II-0 does not implement Inspection Command Centre, AI Inspection Engineer, or hosted persistence.

## Platform reuse lock

Inspection Intelligence reuses Platform Core, Kernel, Intelligence, Engineering OS, auth/identity, RBAC/RLS, audit, event bus, workflow, Knowledge Graph, governed memory, AI Director, Prompt/Model/Tool registries, connector context, files, notifications, telemetry, and Platform Commerce. No second infrastructure stack.

## V1 engine preservation

Canonical `inspection_*` tables and V1 domain/state-machine primitives remain the source of truth. II-0 creates no replacement models for planning, sessions, observations, measurements, evidence, defects, recommendations, corrective actions, assessments, verification, close-out, mobile/offline, or condition rating.

## Commerce reconciliation

**Before:** marketplace/catalog listed `slug=inspection-intelligence` as if it were a standalone product (Start Trial / plan-not-found risk).

**After (presentation only; no new plans, no schema change):**

- Catalog filters Engineering OS application slugs (`project-intelligence`, `inspection-intelligence`)
- II is an Engineering OS application (`applicationKey=inspection_intelligence`)
- Entitlement: Engineering OS `application_access`
- Open/Manage when entitled; Install only when semantically valid
- No standalone II plans; no Business OS entitlement
- Install defaults to Engineering OS product id `c1000000-0000-4000-8000-000000000001`

`II_STANDALONE_LICENSING_CREATED=false`  
`II_BUSINESS_OS_ENTITLEMENT_REQUIRED=false`

The historical catalog row may remain in seed data. Presentation must not treat it as a standalone licensed product.

## Next-gen product surface contract (defined, not implemented)

| Surface | Canonical basis |
|---|---|
| Inspection Command Centre | Compose existing sessions/condition/defects; PI Command Centre pattern only |
| Inspection Planning | `inspection_plans` / `inspection_templates` |
| Inspection Execution | `inspection_sessions` / `inspection_assignments` |
| Observations / Findings | Existing inspection observations/defects — **not** PI findings |
| Defect Intelligence | `inspection_defects` |
| Condition Assessment | `inspection_condition_ratings` |
| Evidence / Photos | `inspection_evidence` via Platform Files |
| Remediation | Inspection corrective-action workflow; link Core actions when enterprise tracking is required |
| Inspection History | `inspection_sessions` / `inspection_events` |
| Inspection Reporting | Existing reporting preparation/snapshots |
| AI Inspection Engineer | Advisory Platform AI Director; no private AI stack |

## PI v1.1.0 pattern reuse (patterns only, not PI truth)

Reusable: Engineering OS application lifecycle, deterministic-first intelligence, UNKNOWN preservation, provenance/evidence, Command Centre composition, governed AI assistant execution, connector-context boundary, reporting snapshot architecture, dual historical/current release identity, UAT/security/certification structure.

Forbidden: importing PI project-domain truth or PI findings.

## Schema

`SCHEMA_CHANGED=false`. No II-0 migration. If a schema gap appears later, document the exact reason before creating one.

## Next phase

`II_1_READY=true`. II-1 is hosted persistence wiring of the existing `inspection_*` tables. Do not implement Command Centre or AI Inspection Engineer in II-1 unless that phase explicitly authorizes them.
