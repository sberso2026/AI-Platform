# Inspection Intelligence — Phase 9B Mandatory Architectural Reservations

**Phase:** 9B · **Status:** LOCKED before vertical slice implementation  
**Amends:** Phase 9A generic framework (does not reopen PI v1.0)

These reservations are mandatory. The first vertical slice must inherit them.
Industry packs and future Asset Intelligence / Digital Twin / mobile work must
plug into these contracts — not fork the generic engine.

## 1. Inspection Target abstraction

Inspections bind to an **Inspection Target**, not directly to a project or asset row.

```
InspectionPlan / InspectionSession
  └── targets: InspectionTarget[]
        ├── kind: project | asset | location | equipment | custom | pack_extension
        ├── reference: AssetReference | LocationReference | …
        └── snapshot?: InspectionTargetSnapshot
```

Direct `project_id` / `asset_id` columns on sessions are allowed only as **denormalized
indexes derived from targets**, never as the sole coupling model.

## 2. AssetReference interfaces (no Asset Intelligence)

Define only:

| Interface | Purpose |
|-----------|---------|
| `AssetReferenceIdentity` | Canonical asset / equipment id + tenant/workspace |
| `AssetReferenceHierarchy` | Parent/child path refs (shared domain) |
| `AssetReferenceLocation` | Spatial / location refs |
| `AssetReferenceVersion` | Revision / register version pointer |
| `AssetReferenceSnapshot` | Point-in-time inspection snapshot of referenced identity |

**Do not implement** Asset Health, Risk, Condition scoring, or Asset Intelligence product.

## 3. Measurement Engine (reusable subsystem)

Separate from session UI:

- formulas / calculated values
- tolerances / acceptance criteria
- trends (reserved)
- calibration metadata
- future sensor integration adapters

Vertical slice may call the engine for evaluate/observe; must not embed ad-hoc
tolerance logic only in UI.

## 4. Immutable Evidence Framework

Evidence records are append-only:

- provenance (who/what/when/source)
- content hash
- version lineage
- chain-of-custody metadata
- Platform Files blob pointer

Mutations create new versions; never overwrite blobs or hashes in place.

## 5. AI Vision extension interfaces (reserved)

Interfaces only:

- `VisionObservation`
- `VisionFinding`
- confidence
- bounding boxes / regions

No computer vision implementation in 9B. Adapters must use Platform AI Runtime later.

## 6. Inspection Pack architecture

Industry capabilities (bridge, pipeline, coatings, NDT, mining, wind, solar, etc.)
ship as **Inspection Packs** that plug into the generic engine:

- pack id / version
- taxonomy extensions
- checklist item types
- measurement method packs
- evidence type extensions
- target kind extensions

Packs **must not** modify core engine tables’ meaning; they extend via registries.

## 7. Predictive Inspection interfaces (reserved)

Future hooks for Asset Intelligence, Digital Twin, condition monitoring:

- `PredictiveInspectionSignal`
- remaining life / next due suggestions (consume only)
- condition monitoring feed adapters

No predictive product in 9B.

## 8. Canonical event flow

```
Inspection events
  → Asset Timeline (refs only)
  → Digital Twin inputs (refs only)
  → Knowledge Graph contributions (Platform KG)
  → Executive Dashboard aggregates (read models / PI reporting consumers later)
```

II emits typed events; it does not own Twin, KG store, or Executive Dashboard.

## 9. Mobile / offline certification placeholders

Certification gates reserved (not executed as product in 9B):

- offline operation
- tablet layout
- touch targets
- camera access
- synchronization / conflict resolution

Placeholders ensure future mobile work does not require engine restructuring.

## Related contracts

TypeScript: `packages/inspection-intelligence/src/architecture/*`  
Docs: measurement, evidence, packs, event-flow, mobile placeholders (this phase).
