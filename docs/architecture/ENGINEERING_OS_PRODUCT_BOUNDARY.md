# Engineering OS Product Boundary

Status: Locked (Phase 14A) · `EngineeringOSProductBoundaryLocked = true`

## Engineering OS OWNS

| Area | Ownership |
| --- | --- |
| Engineering product shell | OWNS |
| Module composition / registry host | OWNS |
| Shared engineering UX patterns | OWNS |
| Module discovery & lifecycle integration | OWNS (via Platform plugin/lifecycle) |
| Engineering-level navigation | OWNS |
| Cross-module context routing | OWNS (`EngineeringContext`) |
| Engineering capability aggregation | OWNS (aggregate view) |
| Engineering health aggregation | OWNS (aggregate view) |
| Shared Engineering SDKs | OWNS (Module / Domain / Workflow / Mobile SDK surfaces) |
| Shared canonical domains already assigned | ORCHESTRATES / hosts assignment |

## Engineering OS MUST_NEVER_OWN (module business logic)

| Module | Rule |
| --- | --- |
| Project Intelligence | MUST_NEVER_OWN document/meeting/findings business logic |
| Inspection Intelligence | MUST_NEVER_OWN inspection session/template domain authority |
| Asset Intelligence | MUST_NEVER_OWN reliability/fusion/timeseries domain authority |
| Project Controls | MUST_NEVER_OWN controls contributor intelligence authority |
| Digital Twin | MUST_NEVER_OWN twin identity/state/simulation authority |
| Engineering Model Interoperability | MUST_NEVER_OWN federation mapping/result reference authority |

## Platform remains owner of

Identity, Commerce, Platform Files, Platform Event Bus, Platform AI Runtime,
Knowledge Graph infrastructure, Plugin/module installation framework.

## Boundary statement

Engineering OS is the **composition and governance shell** for Engineering product
modules. It is not a seventh intelligence product and must not absorb certified
module internals.

## Phase E0 extension

Phase E0 locks Engineering OS as a vendor-neutral **Engineering Intelligence Layer**
above client tools (assistant-first Experience, optional enterprise connectors,
ESSENTIAL→ENTERPRISE profiles). See:

- `docs/architecture/adr/ADR_ENGINEERING_INTELLIGENCE_LAYER_E0.md`
- `docs/architecture/ENGINEERING_OS_PHASE_E0_PRODUCT_ARCHITECTURE.md`

E0 does **not** reopen this Phase 14A ownership lock or V1 module freezes.
