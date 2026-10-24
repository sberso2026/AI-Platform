# Issue-report template

Copy one block per finding. Attach a screenshot of the **finished** page (after loading), plus the URL.

```text
ID: UAT-1-
Date (AEST):
Reporter name / role: engineer | PM | reviewer
URL:
Route / nav item:
Project (if any):
Browser / viewport:

Severity: BLOCKER | HIGH | MEDIUM | LOW
Area: auth | navigation | working-context | permissions | seats | commerce | performance | copy

Title (one line):

What I did:
What I expected:
What happened:

Can I continue the pilot without a code change? yes / no
Is this a cosmetic preference? yes / no  (if yes, severity must be LOW)

Evidence: screenshot / HAR / timestamp
```

## Severity rules

| Severity | Use when |
|---|---|
| **BLOCKER** | Cannot log in, wrong tenant, seat gate for a seated founder, data leak across tenants, or a dead core route (Command Centre, Projects, TQs, Engineering AI). Stops human UAT. |
| **HIGH** | Core workflow fails or is dangerously misleading after the page has finished loading (wrong install/seat state, admin directory never appears, owner-only action available to admin). Workaround exists or is painful. |
| **MEDIUM** | Operable but confusing (trial label on a licensed seat pool, internal “Canonical Auth” wording, leftover cert project names, slow hydration that shows 0/0 then corrects). |
| **LOW** | Copy, a11y, latency without functional failure, extra Health Check in Administration. |

Do **not** classify colour, spacing, or “I would word this differently” as BLOCKER or HIGH.

## Do not file as product defects

- Subscription **Trialing** while licence/seats are active (known SKU until 2026-09-14) — MEDIUM at most.
- Page loads of ~4–10 seconds — record under performance; BLOCKER only if the page never becomes usable.
- Preview-only host (not Production) — expected.
