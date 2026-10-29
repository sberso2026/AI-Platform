# Inspection Intelligence — Architecture Discovery

**Phase:** 9A · **Module:** `inspection_intelligence` · **Version:** `0.1.0-discovery`  
**Classification:** Engineering OS Module (not an Operating System)  
**Product status:** Architecture lock only — `inspectionProductFeaturesImplemented = false`

## Hierarchy (immutable)

```
RTB AI Platform
  └── Engineering OS
        └── Inspection Intelligence
              └── Features (future)
```

## Personas

| Persona | Primary duties | Typical entitlements |
|---------|----------------|----------------------|
| Planner | Create plans/templates, schedule recurrence, assign work | `inspection.write`, `inspection.admin` |
| Inspector | Execute sessions, capture observations/measurements/evidence | `inspection.write` |
| Lead Inspector | Coordinate field crew, escalate defects | `inspection.write`, `inspection.review` |
| Reviewer | Technical review of submitted sessions | `inspection.review` |
| Approver | Formal acceptance / rejection | `inspection.approve` |
| Engineer | Interpret findings against Engineering Core context | `inspection.read`, `inspection.review` |
| Auditor | Read-only trail of sessions, evidence integrity, approvals | `inspection.read`, `inspection.report` |
| Client Representative | Limited visibility of approved reports | `inspection.read`, `inspection.report` |
| Administrator | Module configuration, template governance | `inspection.admin` |
| AI Assistant | Proposed classifications/summaries via Platform AI Runtime only | execute under human review gates |

## Lifecycle (generic)

`Draft → Planned → Scheduled → Assigned → Started → (Paused ↔ Resumed) → Completed → Submitted → Reviewed → Approved | Rejected → Verified → Closed`  
Also: `Cancelled`, `Archived`.

Recurrence: frequency, next due, overdue detection, inspection history, template/session revisions.

## Taxonomy (extensible classifications)

Visual, Dimensional, Mechanical, Electrical, Civil, Structural, NDT, Coating, Corrosion, Safety, Quality, Commissioning, Maintenance, Drone, Robot, AI Vision, SHM, Environmental, Pipeline, Pressure Equipment, Bridge, Building, Wind Turbine, Solar, Mining, Oil and Gas, plus **Custom Extensions**.

No discipline-specific product implementation in Phase 9A.

## Framework summary

Reusable engine for all future engineering inspection disciplines. Owns inspection-process records and derivatives only. References Engineering OS shared domain for projects, assets, locations, documents, people, companies, equipment, tags, packages, disciplines.

## Package placement

| Package | Path | Role |
|---------|------|------|
| Module | `packages/inspection-intelligence` | Framework contracts + discovery skeleton |
| Certification | `packages/inspection-intelligence-certification` | Architecture / boundary certification |
| Host | `apps/web` | Route composition only |
| Module host | `packages/engineering-os` | Registry + shared domain |

## Discovery marker

`data-testid="inspection-intelligence-discovery-ready"`

## Related documents

- `INSPECTION_INTELLIGENCE_GENERIC_FRAMEWORK.md`
- `INSPECTION_INTELLIGENCE_DATA_OWNERSHIP.md`
- `INSPECTION_INTELLIGENCE_MODULE_CONTRACT.md`
- `INSPECTION_INTELLIGENCE_PLATFORM_INTEGRATION.md`
- `INSPECTION_INTELLIGENCE_SCHEMA_PLAN.md`
- `INSPECTION_INTELLIGENCE_MEASUREMENT_FRAMEWORK.md`
- `INSPECTION_INTELLIGENCE_EVIDENCE_FRAMEWORK.md`
- `INSPECTION_INTELLIGENCE_SPATIAL_AND_TIME_MODEL.md`
- `INSPECTION_INTELLIGENCE_EXTENSION_POINTS.md`
