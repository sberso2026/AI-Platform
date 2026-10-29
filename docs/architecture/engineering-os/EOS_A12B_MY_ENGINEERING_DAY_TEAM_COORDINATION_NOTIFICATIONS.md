# EOS-A12B My Engineering Day, Team Coordination & Notifications

A12B answers: across authorized projects, what requires my attention, and can EOS take me into that engineering work?

The primary product remains **actionable engineering work**. This is not an inbox, activity feed, Power BI dashboard, project-management dashboard, or employee-performance system.

## Product purpose

`/engineering/work` stays the canonical Unified Engineering Workbench. My Engineering Day is a section of that surface. It aggregates Attention Items across authorized projects and deep-links into the existing A11/A12A work, review, impact, RFI, decision, and interface flows.

## Attention model

`Engineering Attention Item` is a **derived projection**. Canonical domain objects remain authoritative:

- Work Plan
- Information Requirement
- Pre-Issue Review
- Impact Assessment
- Change / RFI / TQ
- Decision
- Interface
- material `EngineeringWorkEvent`

Attention does not invent engineering state. When a requirement is accepted, waiting items disappear because the source status changed — not because a notification was deleted.

Architecture choice: **derived dynamically**, with persisted **acknowledgement / snooze / FYI preference** only. Fingerprints identify presentation state. No duplicated Attention fact table.

## Source-of-truth boundary

Example: Attention says geotechnical information is missing. Authority remains `EngineeringInformationRequirement`. Acknowledgement hides presentation; it does not accept the information.

## My Engineering Day

Sections, in order:

1. Do Now
2. Reviews
3. Decisions
4. Recently Ready
5. Waiting on Others
6. FYI
7. Continue Work (A12A / A11A, current project view)

Filters: All Projects, current project, category. Avoids chart-first density.

## Multi-project behavior

Authorized projects are loaded from canonical project membership. Current Workbench selector is **view only**. Attention item `projectId` comes from the source object. Clicking a Project A item while viewing Project B opens Project A context explicitly and does not rewrite Work Plan / artifact / review ownership.

Unauthorized projects are absent from items, counts, and metadata.

## Categories

- **DO_NOW** — the engineer can act now (ready work, RFI response, impact confirmation, returned artifact, received information).
- **REVIEW_REQUIRED** — unresolved Pre-Issue conditions. Not design approval.
- **DECISION_REQUIRED** — option study or governed decision outstanding. No automatic winner.
- **WAITING_ON_OTHERS** — provider discipline/role, blocked work, needed-by if canonical.
- **RECENTLY_READY** — blocker accepted and Work Plan READY/READY_WITH_CONDITIONS.
- **FYI** — material issued drawings / accepted handover / recorded decisions. Bounded and collapsed.

## Discipline coordination

Waiting items show provider → consumer without naming individuals unless canonical ownership is a person. Interface Intelligence is reused: provider may wait for consumer confirmation; consumer may need to review changed input.

## Action routing

Actions reuse A11/A12A contracts and deep-link to `/engineering/work/plans/<id>` (plus `#review` / `#impact` where relevant), not empty module homes.

## Notification materiality and deduplication

Only material or canonical state transitions produce attention. Multiple low-level file/metadata events for one source collapse to one fingerprint. Replaying the same source state is idempotent.

## Resolution and acknowledgement

Source resolution re-evaluates the projection. Historical work events remain. Acknowledgement / snooze never mutates engineering state. Snooze is presentation-only.

## Recipient logic

Server resolves the viewer from the authenticated commerce context. Caller-submitted `userId`, `recipientId`, `authorizedProjectIds`, tenant, workspace, or AAL are rejected. Recipients are not inferred from activity telemetry.

## Role behavior

Where a role is supplied (`DESIGN_ENGINEER`, `PROJECT_ENGINEER`, `DISCIPLINE_LEAD`, `REVIEWER`, `CONSTRUCTION_ENGINEER`, `COMMISSIONING_ENGINEER`), items are filtered. Where role metadata is absent, authorized work is shown without fabricating a role.

## In-app notification

Kernel `NotificationService` is reused for IN_APP delivery. Payload stores fingerprint + project + link, not a second copy of domain context. EMAIL and TEAMS remain **DEFERRED / CONTRACT_ONLY**. No Teams or Outlook connector is claimed.

## AI boundary

Ask EOS can summarize `askEosSummary` from the derived day. AI cannot invent Attention Items, urgency, due dates, responsibility, decisions, or approvals.

## Privacy / no surveillance

Prohibited: hours worked, time in Excel/EOS, click counts, documents-opened counts, email/Teams volume, employee ranking, response-speed scoring, productivity score.

## Security / RLS

`engineering_attention_acknowledgements` and `engineering_attention_preferences` are tenant + workspace + `user_id = auth.uid()` isolated. Live JWT tests cover own read, other workspace deny, cross-tenant deny, anonymous deny, and forged-recipient insert deny.

AAL2 is unchanged. Viewing attention uses normal `work.list`. Ack/preferences use `work.write` for the authenticated user. Template governance remains AAL2 admin.

## Template regression

A12A template resolver, precedence, SME default, fail-closed unavailable official templates, conflict, calculation-shell vs definition, and provenance are unchanged. Company template binary upload remains **DEFERRED**.

## Browser HITL

A12B requires a freshly started application process on current HEAD. Authenticated HITL, multi-project HITL, and lifecycle HITL must be attempted honestly and not fabricated.

## Limitations

- Authenticated browser HITL depends on a current Next process and staging AAL2
- Company template binary upload deferred
- Artifact `content_base64` HIGH risk unchanged
- Hosted ClamAV unavailable (fail-closed preserved)
- Semantic AI review unavailable
- PDF export deferred
- Calculation definitions EXAMPLE_ONLY
- Real connectors and solvers not implemented
- External notification channels deferred

## A12C handoff

Harden complete engineer journeys from Concept through Handover on this workbench so the same governed context survives lifecycle transitions without returning to module-first navigation.
