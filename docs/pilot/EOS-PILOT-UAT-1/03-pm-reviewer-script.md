# 30-minute PM / reviewer UAT script

**Role:** founder as tenant admin (not owner) reviewing whether the pilot is operable  
**Host:** https://eos-pilot.rtbea.com.au  
**Timebox:** 30 minutes.

Founder role on LAUNCH-1 is **admin**. Owner-only screens (Subscription & Billing, Growth Credits) must stay hidden. Do not try to become owner.

## 0–6 min — Access and isolation

| Step | Action | Pass if |
|---|---|---|
| P1 | Password sign-in (not SSO), then sign out, then sign in again | Same as engineer A1–A3 |
| P2 | Read header workspace / tenant cues | Only RTB Engineering / LAUNCH-1. No Worley, no Yahoo |
| P3 | Open Command Centre | Attention/work for this tenant only |

## 6–16 min — Products, seats, admin

Wait until **Loading…** disappears before judging numbers. First paint can show 0 / empty.

| Step | Action | Pass if |
|---|---|---|
| P4 | **Installed Products** (`/system/products`) | Engineering OS is **Installed**. Primary action is **Open**, not **Start Trial**. Seats **5 / 5**. `reference-os` is not offered |
| P5 | Click **Open** on Engineering OS | Lands in Command Centre / Engineering OS |
| P6 | **Licences & Seats** (`/system/licenses-seats`) | EOS pool 5 licensed / 5 used / 0 available after load. Do not assign another seat to the founder |
| P7 | **Users & Permissions** (`/platform/users-permissions`) then **Users** (`/users`) | Admin can open the surfaces. Directory should list tenant members once loaded. Do not invite anyone |
| P8 | Confirm **Subscription & Billing** and **Growth Credits** are **not** in the founder sidebar | Hidden for admin. If they appear, file HIGH (owner-only leak) |

Known limitation: subscription status may still read **Trialing** / trial edition until 2026-09-14. That is the current SKU state, not “not installed”. File as MEDIUM if it misleads reviewers; do not convert the plan.

## 16–24 min — Scope and permissions

| Step | Action | Pass if |
|---|---|---|
| P9 | Open Gold Coast project, then Projects list | You see this tenant’s projects only |
| P10 | Note **WSB-1RC Workspace B Isolation** if listed | Leftover cert name — MEDIUM at most. Do not delete it in this UAT |
| P11 | Walk Risks / TQs / Decisions / Reports | Understandable empty or populated states; no certification banners |
| P12 | Confirm you cannot (and should not) change owner, duplicate seats, or install extra products | Seat pool stays 5/5; founder still has exactly one EOS seat |

## 24–30 min — Reviewer close-out

| Step | Action | Pass if |
|---|---|---|
| P13 | Engineering AI once, project selected | Advisory only; human remains final |
| P14 | Fill [05-acceptance-checklist.md](./05-acceptance-checklist.md) | Yes/No with evidence URLs |
| P15 | File issues; sign out | No Production promotion requested |

## Out of scope

- Changing identity architecture or Commerce model
- Promoting Production
- PI / II feature expansion
- Inviting Yahoo/Worley identities
