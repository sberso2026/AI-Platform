# Inspection Intelligence — Inspection Pack Architecture

**Phase:** 9B · Packs plug into the generic engine; they do not fork it.

## Pack contract

| Field | Description |
|-------|-------------|
| `packId` | Stable id e.g. `bridge`, `pipeline`, `coatings`, `ndt`, `mining`, `wind` |
| `version` | Semver of the pack |
| `taxonomyExtensions` | Additional classification tags |
| `checklistItemTypes` | Extra item type ids |
| `measurementMethods` | Methods registered with Measurement Engine |
| `evidenceTypes` | Extra evidence MIME/kind codes |
| `targetKinds` | Extra Inspection Target kinds |
| `visionAdapters` | Reserved AI Vision adapter ids (unimplemented) |
| `predictiveAdapters` | Reserved predictive adapter ids |

## Rules

1. Core entities remain generic (`inspection_*`, `measurement`, evidence).
2. Packs register via `InspectionPackRegistry`; no core schema rename per industry.
3. Vertical slice ships with `packId = "generic"` only.
4. Future industry packs are additive packages or modules under Engineering OS —
   still not separate Operating Systems.
