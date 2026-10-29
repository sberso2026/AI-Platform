# Engineering OS V1 Navigation Model

Status: Phase 14A · `EngineeringOSNavigationAssessed = true`

## Coherent workspace assessment

| Surface | Path | Status |
| --- | --- | --- |
| Home / Overview | `/engineering` | present |
| Modules launcher | `/engineering/modules` | present (status mismatches) |
| Projects | `/engineering/projects` | present |
| Assets | `/engineering/assets` | present |
| Project Intelligence | `/engineering/apps/project-intelligence` | present |
| Inspection Intelligence | `/engineering/apps/inspection-intelligence` | present |
| Asset Intelligence | `/engineering/apps/asset-intelligence` | present (not in launcher list) |
| Project Controls | `/engineering/apps/project-controls` | present |
| Digital Twin | `/engineering/apps/digital-twin` | present |
| Engineering Models / Interop | `/engineering/apps/model-interoperability` | present |
| Execution Hosts | `/engineering/apps/execution-hosts` | present |
| AI Workspace | `/engineering/ai` | present |
| Search | `/engineering/search` | present |
| Reports | `/engineering/reports` | present |
| Settings / admin | `/engineering/settings` | present |

## Principle

Avoid exposing dozens of internal Platform services as product navigation.
Navigation should surface **OS + entitled modules**, not infrastructure dumps.

## Home / command surface (assessment only)

Desired aggregation: projects, asset context, recent inspections, PI, PC status,
AI context, twins, engineering model status, recent activity, module health, AI entry.

Gaps: OS home does not yet fully aggregate all V1 module health cards; do not
build a giant opaque project-health score. Architecture-only in 14A.
