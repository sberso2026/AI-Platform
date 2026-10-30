# EOS-3-UX-FOUNDATION-1B — Functional interaction contract

## Attention cards

| Card | Route |
| --- | --- |
| Needs Action | `/engineering/my?cat=needs-action` |
| Changed | `/engineering/changes` (+ project context) |
| Reviews Awaiting You | `/review?filter=assigned` |
| Decision Required | `/engineering/decisions` |
| Waiting on Others | `/engineering/my?cat=waiting-for-others` |
| At Risk | `/engineering/risks` |
| Completed Recently | `/engineering/my?cat=recently-completed` |

Dead target count must be **0**. Counts from canonical dashboard only.

## Engineering Hub branches (10)

Each branch → `/engineering/projects/{projectId}/{slug}` with project filter persistence.

1. Scope & Design Basis  
2. Engineering Design  
3. Work Packages  
4. Interfaces & Coordination  
5. Changes & Decisions  
6. Reviews & Approvals  
7. Deliverables & Records  
8. Assets & Systems  
9. Site & Handover  
10. Engineering Reference  

Keyboard accessible · focus visible · authorization via existing project workspace · context preserving.

## My Projects / Recent Activity

Project entries and activity rows open `/engineering/projects/{id}` and set active project filter.

## Search / Project selector

Header global search → `/engineering/search?q=…` (authorized content).  
Project selector updates session filter and downstream Home/My Work context.

## My Work

Category buttons set `?cat=` · search filters rows · Next Action opens register/item.  
No decorative images. Empty states use engineering language.

## Data integrity

`EOS_UI_SHADOW_ENGINEERING_STATE_CREATED=NO`  
`EOS_REFERENCE_UI_FAKE_DATA_COUNT=0`
