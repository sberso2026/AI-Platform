# EOS-3-UX-FOUNDATION-1C — Home Functional Contract

`EOS_HOME_REFERENCE_IS_FUNCTIONAL_UI_SPECIFICATION=YES`

## Attention (7)

| Card | Destination |
| --- | --- |
| Needs Action | `/engineering/my?cat=needs-action` |
| Changed | `/engineering/changes` (+ project context) |
| Reviews Awaiting You | `/review?filter=assigned` |
| Decision Required | `/engineering/decisions` (+ project context) |
| Waiting on Others | `/engineering/my?cat=waiting-for-others` |
| At Risk | `/engineering/risks` (+ project context) |
| Completed Recently | `/engineering/my?cat=recently-completed` |

`EOS_HOME_ATTENTION_DEAD_TARGET_COUNT=0`

## Engineering Hub (10)

Each branch opens `/engineering/projects/{projectId}/{slug}` with project context persisted.

| Branch | Slug |
| --- | --- |
| Scope & Design Basis | scope-design-basis |
| Engineering Design | engineering-design |
| Work Packages | work-packages |
| Interfaces & Coordination | interfaces |
| Changes & Decisions | changes-decisions |
| Reviews & Approvals | reviews |
| Deliverables & Records | deliverables |
| Assets & Systems | assets |
| Site & Handover | handover |
| Engineering Reference | engineering-reference |

`EOS_HOME_HUB_DEAD_ROUTE_COUNT=0`  
`EOS_HOME_HUB_IT_TERMINOLOGY_COUNT=0`

## Right column

- **My Projects** — canonical projects; click opens project workspace.
- **Recent Activity** — canonical recent documents/records only; empty state if none. No fabricated events.

## Search / project selector / nav

- Global search remains authorization-aware.
- Project selector updates Home hub / summaries context.
- Stable global nav: Home, Projects, My Work, Reviews, Changes, Documents, AI, Administration.

## Data

`EOS_HOME_FAKE_DATA_COUNT=0` — counts and lists from dashboard API / deterministic zeros / engineering empty states.
