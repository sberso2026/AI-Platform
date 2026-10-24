# Role / access matrix

Canonical objects only: Auth identity, tenant membership, workspace membership, RBAC, Commerce seat.

| Cohort role | Tenant role slug | EOS seat | Typical writes | Typical reads | Must not |
|---|---|---|---|---|---|
| Founder / operator | admin | yes (protected) | admin + engineering writes | all LAUNCH-1 | become owner; invite from Production |
| PM / engineering manager | admin | yes | project metadata, review registers, reports | projects, risks, TQs, actions, documents, AI | owner screens (billing/credits); extra seats |
| Engineer | member | yes | risks, TQs, actions, assets, documents as permitted | same project-scoped registers, AI | user invite; seat assign; other tenants |
| Reviewer / senior engineer | viewer | yes (read APIs are seat-gated) | none (read-only engineering) | registers, documents, reports, AI if entitled | mutate records; invite; seat changes |

Invite selector maps: manager → `admin`, engineer → `member`, reviewer → `viewer`. Owner cannot be assigned through invite.

## Isolation expectations

| Check | Pass |
|---|---|
| Tenant | Only RTB Engineering Pilot LAUNCH-1 |
| Workspace | Default RTB Engineering workspace unless operator assigns another **this** tenant workspace |
| Project | Header project selector scopes lists; All Projects stays in-tenant |
| Fixture | WSB-1RC is not normal customer work |
| Seat | Unassigned member cannot use seated Engineering OS routes |
| Cross-tenant | Other-tenant URLs / IDs 401/403/404; no data in AI answers |

## Seat math for a 3-person cohort

Three cert-fixture seats were released 2026-09-03 (PM, engb, eng). Founder retained. LAUNCH-1 owner fixture still seated. Result: **2/5 assigned, 3 available**. Assign P-01, P-02, P-04 without exceeding 5. Optional P-03 needs a later founder-approved release of the owner-fixture seat. Never 6.
