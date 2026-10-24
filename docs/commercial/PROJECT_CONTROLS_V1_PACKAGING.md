# Project Controls V1.0 — Commercial Packaging

- Product: RTB AI Platform → Engineering OS → **Project Controls**
- Commercial name: Project Controls
- Version: **1.0.0** (`project-controls-v1.0.0`)
- Product key: `engineering-os`
- Application key: `project_controls`
- Route: `/engineering/apps/project-controls`

## What is sold

Project Controls is the engineering intelligence layer **about** projects. It does not own project identity — that stays in the Engineering Shared Project Domain.

Included in V1.0:

- Progress, schedule, change, cost and productivity descriptive intelligence
- Advisory forecast, decision support, scenario, risk/opportunity, assurance, explainability and organizational learning intelligence
- Project Context Engine composition (twelve active contributors)
- Project profile, immutable snapshots and append-only timeline
- Governed human review workflow with segregation of duties

## Entitlement model

Seat-based within Engineering OS, workspace-scoped.

| Entitlement | Grants |
| --- | --- |
| `project_controls.read` | Read published intelligence states |
| `project_controls.assess` | Run an assessment (draft state) |
| `project_controls.submit` | Submit for review |
| `project_controls.review` | Review a submission |
| `project_controls.approve` | Approve a reviewed assessment |
| `project_controls.publish` | Publish an approved state |
| `project_controls.admin` | Manage module configuration |

## Explicit commercial exclusions

The following are **not sold, not licensed and not delivered** as part of Project Controls V1.0:

| Excluded | Why |
| --- | --- |
| Native CPM / critical path | Schedule intelligence is descriptive only. |
| Resource leveling | Out of scope for V1.0. |
| Schedule execution | Intelligence never executes schedule changes. |
| Earned value (EV/CPI/SPI) | Progress is not earned value. |
| Financial posting | Project Controls posts nothing. |
| Budget / accounting ledger | Owned by external finance domain. |
| Autonomous project management | Humans own project decisions. |
| Automatic contract instruction | Contractual authority stays outside PC. |
| Project identity mastering | Owned by Shared Project Domain. |

If a customer requires CPM, EV or financial posting, that is a post-V1.0 conversation, not a configuration flag.
