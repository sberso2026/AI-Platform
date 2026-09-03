# Seat inventory and release

Captured **2026-09-03 03:36 UTC** against tenant `8195e176-5f9f-449a-a1d3-2aedaf403989`.  
Pool `299fe9d8-d0d1-4414-acff-770b7afcaf74` (`commercial_seats.pool_name=default`, product Engineering OS).

## Before release

**5 assigned / 5 licensed / 0 available.** Founder seat present.

| Email | User id | Tenant role | Class | Action |
|---|---|---|---|---|
| silvestre.berso@rtbea.com.au | `d0dc00dc-80ec-4416-b9ed-e956cae2060f` | admin | founder | **retained** |
| eos.pilot.launch1.admin.1788193387962@rtbea.com.au | `86f21420-0e2c-493d-a44b-fa58630a0968` | owner | LAUNCH-1 owner fixture | **retained** (last-resort capacity) |
| eos.pilot.launch1.pm.1788193387962@rtbea.com.au | `38d4dc70-bdb2-48fa-8447-54ec527021df` | admin | cert/test | **released** |
| eos.pilot.launch1.engb.1788193387962@rtbea.com.au | `9cc6ffb1-6870-4a47-b1ce-162cdf2c4bfe` | member | cert/test | **released** |
| eos.pilot.launch1.eng.1788193387962@rtbea.com.au | `addb6a79-aa06-4d0d-bf24-080897d60b34` | member | cert/test | **released** |

## Canonical release performed

Operator path: founder session → POST `/api/platform/commerce/seats/remove` with `{ seatPoolId, userId }`.  
No Auth SQL. Memberships retained. Fixture Auth users were not deleted.

| Fixture user id | HTTP | Time (UTC) |
|---|---|---|
| `38d4dc70-bdb2-48fa-8447-54ec527021df` | 200 | 2026-09-03T03:36:44Z |
| `9cc6ffb1-6870-4a47-b1ce-162cdf2c4bfe` | 200 | 2026-09-03T03:36:45Z |
| `addb6a79-aa06-4d0d-bf24-080897d60b34` | 200 | 2026-09-03T03:36:46Z |

`commercial_outbox_events` recorded matching `seat.removed` rows at 2026-09-03T03:36:44–46Z. Do not purge.

## After release

**2 assigned / 5 licensed / 3 available.**

Seated:

- founder `d0dc00dc-80ec-4416-b9ed-e956cae2060f`
- LAUNCH-1 owner fixture `86f21420-0e2c-493d-a44b-fa58630a0968`

Three named humans (P-01, P-02, P-04) can be seated without exceeding licence. A fourth (optional P-03) requires releasing the owner-fixture seat **after** founder approval — do not do that in this freeze.

## Assign when a named human activates

Licences & Seats → Manage seats, or POST `/api/platform/commerce/seats/assign` `{ "seatPoolId": "299fe9d8-d0d1-4414-acff-770b7afcaf74", "userId": "<new user id>" }`. Confirm assigned_seats ≤ 5.
