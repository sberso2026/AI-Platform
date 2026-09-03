# 30-minute engineer UAT script

**Role:** seated engineer / founder using Engineering OS  
**Host:** https://eos-pilot.rtbea.com.au  
**Timebox:** 30 minutes. Stop when the timer ends; file issues rather than exploring PI/II.

Use [04-issue-report-template.md](./04-issue-report-template.md) for anything that fails. Cosmetic taste is LOW, not BLOCKER.

## 0–5 min — Authentication

| Step | Action | Pass if |
|---|---|---|
| A1 | Open `/login`, sign in with password **Sign In** (not SSO) | Command Centre loads; no seat-gate banner |
| A2 | **Sign out** | Login page shown |
| A3 | Sign in again | Command Centre loads again |
| A4 | Open `/forgot-password` and confirm the form exists | Email field + **Send reset link**. Do not submit if you are already in |
| A5 | Confirm tenant/workspace | Header shows RTB Engineering. No Yahoo/Worley tenant |

## 5–12 min — Navigation

Walk the left nav. Each item must open a real page (not a dead button).

| Nav item | Expected route |
|---|---|
| Command Centre | `/engineering` |
| Projects | `/engineering/projects` |
| Assets | `/engineering/assets` |
| Risks | `/engineering/risks` |
| Technical Queries | `/engineering/technical-queries` |
| Decisions | `/engineering/decisions` |
| Reports | `/engineering/reports` |
| Engineering AI | `/engineering/ai` |
| Administration (section) | expands; Health Check may appear — note it, do not run certification tools |
| Installed Products | `/system/products` (under System Administration) |
| Licences & Seats | `/system/licenses-seats` |

Pass if every listed route opens and is understandable. Wait for loading to finish before judging empty/zero states.

## 12–22 min — Working context

Preferred project: **RTB-PILOT-1788193387962 — RTB Gold Coast Structural Inspection Pilot**.

You may also open **UAT-347102 — Controlled Pilot UAT Project** if it appears (created during readiness). Ignore **WSB-1RC / Workspace B Isolation** except to note it as a leftover cert name (MEDIUM, not a workflow).

| Step | Action | Pass if |
|---|---|---|
| C1 | Open **Projects**. Click the Gold Coast project | Project workspace opens (may take several seconds) |
| C2 | Use header **Project** selector: pick the Gold Coast project, then **All Projects** | Registers/lists follow the selection; no crash |
| C3 | From the project, use nav: Assets, Risks, TQs, Decisions | Pages stay in Engineering OS; empty states are plain language |
| C4 | Optional: **New Project** — Project Code + Project Name, Create | New project opens, or a clear error. Do not create more than one |
| C5 | Empty states | “No open risks” / similar is OK. “Seat not assigned”, “Start Trial”, or certification jargon is not |

## 22–28 min — Engineering AI and reports

| Step | Action | Pass if |
|---|---|---|
| D1 | Open **Engineering AI** with a project selected | Page loads; you can type or see a working prompt surface |
| D2 | Ask one project-grounded question (e.g. “What needs attention on this project?”) | Answer or a clear empty/insufficient-evidence state. Do not treat AI as authority |
| D3 | Open **Reports** | Page loads; not a dead end |

## 28–30 min — Record

1. Note page feel: Fast / Acceptable / Slow / Blocking for Command Centre, Projects, Assets, TQs, Engineering AI.
2. File issues with severity. Do not invent Commerce or identity “fixes”.
3. Sign out.

## Out of scope

- Inspection Intelligence / Digital Twin / Model Interoperability deep dives
- Starting trials, changing licences, assigning extra seats
- Inviting new users
- Production
