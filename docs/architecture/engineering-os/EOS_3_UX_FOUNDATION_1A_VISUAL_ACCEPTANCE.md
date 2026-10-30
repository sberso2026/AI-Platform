# EOS-3-UX-FOUNDATION-1A — Manual visual acceptance

Controlled pilot: `https://eos-pilot.rtbea.com.au`  
Role: `pilot_engineer` · Project: `PILOT-001` · Work Package: `WP-STR-004`  
Screenshot directory: `docs/architecture/engineering-os/visual-acceptance/ux-foundation-1a/`

## Summary

| Field | Result |
| --- | --- |
| `EOS_VISUAL_ACCEPTANCE_EXECUTED` | YES |
| `EOS_VISUAL_ACCEPTANCE_SCREENSHOT_COUNT` | 16 |
| `EOS_VISUAL_ACCEPTANCE_ARTIFACTS_PERSISTED` | YES |
| `EOS_VISUAL_ACCEPTANCE_MATRIX` | PASS |
| `EOS_VISUAL_BLOCKING_DEVIATION_COUNT` | 0 |
| `EOS_MANUAL_VISUAL_ACCEPTANCE_RECORD` | PASS |
| `PILOT_001_VISUAL_WORKSPACE_ACCEPTANCE` | PASS |

## Page records

| # | Page | Expected | Observed | Result | Screenshot | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Home | Engineering Home (Needs Action / Changed / projects) — not Command Centre | Approved Home; no Workbench launcher required | PASS | `01-home.webp` | Default `/engineering` |
| 2 | Projects | Project list / entry to PILOT-001 | Projects list with PILOT-001 | PASS | `02-projects.webp` | |
| 3 | My Work | Operational categories; no decorative imagery | Needs Action table; category tabs; no photos | PASS | `03-my-work.webp` | |
| 4 | Project workspace | Overview + approved project nav | Overview, Guided Engineering, WP, Engineering hub | PASS | `04-project-workspace.webp` | WP-STR-004 visible |
| 5 | Work Packages | Primary WP list entry | WP list + create; WP-STR-004 | PASS | `05-work-packages.webp` | |
| 6 | WP-STR-004 cockpit | Header context + Overview…Changes tabs | Full cockpit with attention, decisions, readiness | PASS | `06-wp-cockpit.webp` | Inline on `/work-packages` |
| 7 | Engineering Design | Primary engineering design surface | Capability view under project nav | PASS | `07-engineering-design.webp` | |
| 8 | Scope & Design Basis | Requirements / basis / standards | Approved section | PASS | `08-scope-design-basis.webp` | |
| 9 | Interfaces & Coordination | Interfaces / deps / coordination | Approved section | PASS | `09-interfaces-coordination.webp` | |
| 10 | Changes & Decisions | Changes + decisions together | Approved section | PASS | `10-changes-decisions.webp` | |
| 11 | Reviews & Approvals | Reviews / IDC / approvals | Approved section | PASS | `11-reviews-approvals.webp` | |
| 12 | Deliverables & Records | Drawings / calcs / records | Approved section | PASS | `12-deliverables-records.webp` | Not under Governance |
| 13 | Assets & Systems | Plant / Area / System / Asset | Domain 2 UI; no Ontology label | PASS | `13-assets-systems.webp` | |
| 14 | Site & Handover | Nav present; sparse OK | Approved nav + sparse content | PASS | `14-site-handover.webp` | |
| 15 | Engineering Reference | Standards / prior engineering | Approved section | PASS | `15-engineering-reference.webp` | |
| 16 | Administration | System functions hub | Administration hub with settings/governance/health/integrations | PASS | `16-administration.webp` | Captured after nav cutover deploy |

## Route acceptance (deployed)

| Check | Result |
| --- | --- |
| Login → approved Home | PASS |
| Home → Projects | PASS |
| Project → Work Packages | PASS |
| Work Package detail (cockpit) | PASS |
| Project → Engineering Design | PASS |
| Project → Assets & Systems | PASS |
| Engineering Workbench secondary gate | NO (not required) |

## Blocking deviations

None. Legacy Command Centre is not the default; Workbench is not a required launcher; Work Packages, Engineering Design, Assets & Systems, Site & Handover, and approved engineer-language navigation are present.

## Limitations (non-blocking)

- Soft client navigation on Edge sometimes retains prior page content until hard refresh (F5); routes are correct after reload.
- Project nav Information/Execution groups may require scrolling the project sidebar; items are present.
- Compact pilot banners remain two stacked rows; progressive Details disclosure is in place.
