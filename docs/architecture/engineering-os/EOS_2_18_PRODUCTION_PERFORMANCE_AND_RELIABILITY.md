# EOS 2.18 Production Performance and Reliability

No formal service-level objective is defined for these routes. These figures are not an SLO claim.

`PRODUCTION_PERFORMANCE_MEASUREMENTS_CAPTURED=YES`

`PRODUCTION_PERFORMANCE_STATUS=DEGRADED_NONBLOCKING`

`PRODUCTION_RELIABILITY_VALIDATION=PASS`

`PRODUCTION_WRITE_RETRY_DUPLICATE_PROTECTION=PASS`

## Measurements (post-remediation Production)

| Surface | Method | Result | Time |
| --- | --- | --- | --- |
| Login (unauthenticated redirect/page) | `curl` to protected/login routes | HTTP 200 / redirect to login | ~0.29–0.56 s |
| Pilot project landing / workbench | Authenticated Edge navigation | Rendered | ~3–5 s subjective page settle |
| Engineering Basis page | Authenticated Edge navigation + panel load | Panel showed basis rev 4 | ~3–5 s |
| Discipline / structural surface | Authenticated navigation / panel | Structural rev 3 | ~3–5 s |
| Interface surface | Panel + DB | Interface rev 2 draft | ~3–5 s |
| Change-impact surface | Panel + DB | `pilot-validation-change` | ~3–5 s |
| Deliverable / freeze surface | Panel + design-freeze path | Deliverable potentially_stale; freeze pending | ~3–5 s |
| Representative write | `revise_basis` via pilot-workflow | HTTP 200, rev 3→4 | ~3.7 s |
| Representative GET after write | pilot-workflow / panel reload | Matched DB | ~5 s |
| Representative AI request | Ask Engineering AI | Abstention `INSUFFICIENT` (correct) | ~5 s class |

Unauthenticated route timings remain fast. Authenticated interactive surfaces remain slower than a snappy expectation and are classified degraded but nonblocking: all measured actions completed successfully without data loss.

## Reliability exercise

| Action | Result |
| --- | --- |
| Navigation across EOS 2 and EOS 1 routes | Stable |
| Refresh / reload of Engineering Basis | Panel retained basis rev 4 matching DB |
| Create/read/revise | Basis revise 3→4 persisted; discipline/interface/change/deliverable/freeze state retained |
| Interface state | Superseded rev 1 + current draft rev 2; receivers pending |
| Change state | Case and materiality retained |
| Logout | Completed; session cleared to `/login` |
| Repeated reads | DB second read after logout still basis_rev 4, disc_rev 3, iface 2 draft, deliverable potentially_stale, freeze pending |
| Request-key retry | No duplicate basis revision |
| Rollout-state divergence | None observed (DB = audit = UI) |
| Permission drift | Authority denials remained consistent |
| Race / lost writes | None observed on the exercised paths |

Reliability passes for controlled pilot use with the documented performance and UX limitations.
