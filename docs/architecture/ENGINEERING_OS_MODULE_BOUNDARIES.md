# Engineering OS — Module Boundaries

**Phase:** 9A (updated from 8I.1)

## Project Intelligence (certified v1.0.0)

Owns:
- Document Intelligence
- Meeting Intelligence
- Findings Intelligence
- Reporting Intelligence (incl. Executive Intelligence Dashboard)
- Knowledge Intelligence / Unified Search
- Engineering Reasoning Assistant
- Project Intelligence intelligence derivatives and feature lifecycle records

Does **not** own canonical Engineering Core registers.

## Inspection Intelligence (Phase 9A discovery lock — `0.1.0-discovery`)

Owns (framework — product features not implemented yet):
- inspection plans, templates, checklist definitions
- inspection sessions, observations, measurements
- inspection evidence links, defects, recommendations
- inspection review, approvals, reporting derivatives

Does **not** own:
- canonical projects or assets
- separate identity, workspace, AI runtime, or commerce lifecycle
- a separate repository or application host

`inspectionProductFeaturesImplemented = false` in Phase 9A.

## Classification

| Module | Type | Package |
|--------|------|---------|
| Project Intelligence | Engineering OS module | `packages/project-intelligence` |
| Inspection Intelligence | Engineering OS module | `packages/inspection-intelligence` |
| Inspection certification | Certification only | `packages/inspection-intelligence-certification` |

Engineering Core remains authoritative for approved canonical register records.
