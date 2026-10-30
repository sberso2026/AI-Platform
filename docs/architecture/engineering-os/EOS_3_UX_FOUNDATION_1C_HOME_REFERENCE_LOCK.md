# EOS-3-UX-FOUNDATION-1C — Home UI Architecture Lock

`HOME_UI_ARCHITECTURE_LOCKED=YES`  
`EOS_HOME_UI_ARCHITECTURE_LOCK_DOCUMENTED=YES`  
`EOS_HOME_MAJOR_GEOMETRY_LOCKED=YES`

## Status of UX-1B

- `UX_1B_IMPLEMENTATION_COMPLETE=YES`
- `UX_1B_VISUAL_ACCEPTANCE_ASSUMED=NO` — owner has not accepted visual conformity.

## Locked Home composition (desktop)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Top Header                                                           │
├──────────────┬─────────────────┬──────────────────────┬──────────────┤
│ Global Nav   │ Attention       │ Engineering Hub      │ Projects /   │
│              │                 │                      │ Activity     │
└──────────────┴─────────────────┴──────────────────────┴──────────────┘
```

Desktop reference viewport for acceptance: **1536 × 1024** (or closest deterministic equivalent).

## May change later without a UI architecture phase

- live data, counts, badges, signals, filters, context;
- empty-state copy refinements;
- performance internals.

## Must NOT change without an explicit UI phase

- major Home geometry / three-zone content layout;
- engineering branch labels and branch count (10);
- overall branch arrangement around the hub;
- light engineering workspace strategy (dark shell + light canvas);
- global Home navigation concept;
- hub role as the dominant central content region.

## Engineering Hub lock

- Central industrial image: `/eos/engineering-hub-plant.webp` (decorative only).
- Ten branch cards: real DOM links with icons + descriptions.
- Gold connector graphics: presentational only — **not** the Relationship Graph.
- Branch labels must never be embedded only inside a raster image map.

## Product owner

`EOS_PRODUCT_OWNER_VISUAL_ACCEPTANCE` remains externally owned.  
`READY_FOR_NEXT_PHASE=NO` until the owner supplies `APPROVED`.
