# EOS-TQ-UX-1R — Live founder workflow

**Host:** https://eos-pilot.rtbea.com.au  
Founder-authenticated Preview. Equivalent to TQ-006: sealant suitability at pipe sleeper isolation joint.

## Record

- Controlled number: **TQ-009**
- Project: Controlled Pilot UAT Project
- Initiator: silvestre.berso (Administrator) — human-readable, not a UUID
- Action By: RTB Pilot Launch Admin (Owner) — from workspace directory
- Due: 14 Sept 2026
- Status after close: Closed

A second UI-created record **TQ-010** was used for founder form / confirmation / detail / response / review / closeout screenshots.

## Live API path (TQ-009)

1. Open Technical Queries — GET 200.
2. Create with Query, Due Date, Suggested Solution, Project, Action By, reference document — POST **201**.
3. Controlled number assigned (`TQ-009`). Status **Awaiting Response**. Next action names Action By.
4. Register row present. Assignee `view=mine` contains the TQ.
5. Detail preserves original query; query locked.
6. Technical response submitted with basis and follow-up actions.
7. Clarification requested, then response re-submitted.
8. Response accepted.
9. Follow-up action created and linked.
10. Closeout completed and TQ closed.
11. Print A4 view loaded (see `print-validation.md`).

All mutation statuses for this path were 200 after create 201.

## Pass flags

| Flag | Result |
| --- | --- |
| TQ_LIVE_CREATE_PASS | true |
| TQ_LIVE_ASSIGN_PASS | true |
| TQ_LIVE_SUBMIT_PASS | true |
| TQ_LIVE_MY_ACTIONS_PASS | true (assignee queue via API) |
| TQ_LIVE_RESPONSE_PASS | true |
| TQ_LIVE_REVIEW_PASS | true |
| TQ_LIVE_CLOSEOUT_PASS | true |
| TQ_LIVE_PRINT_PASS | true |

## Latencies (Preview)

- Register GET: 1531 ms
- Detail GET: 1586 ms
- Create POST: 1730 ms

Not blocking. Workflow remained usable.

## Screenshot note

Founder **My Actions** screenshot is empty because the founder is Initiator, not Action By. Assignee My Actions was verified on the live API (`mineContains=true`).
