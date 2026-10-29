# EOS 3.1 Compatibility Test Matrix

`EOS_2_EOS_3_COMPATIBILITY_TEST_MATRIX=PASS`

Deterministic coverage in `apps/web/src/__tests__/eos3-foundation.test.ts` plus EOS 2 GA regression via canonical gates / EOS 2 entitlement hold invariants.

| # | Scenario | Expected | Result |
| --- | --- | --- | --- |
| 1 | EOS 2 project + EOS 2 runtime | Legacy metadata ⇒ `eos2_compatible`; EOS 2 API context | PASS |
| 2 | EOS 2 project + shared services after EOS 3 foundation | Coexistence contract; silent reinterpretation forbidden | PASS |
| 3 | EOS 3 development project + EOS 3 development runtime | Generation 3 + `3.0.0-development` | PASS |
| 4 | EOS 2 entitlement without EOS 3 entitlement | `eos2EntitlementAutoEnablesEos3=false`; access deny | PASS |
| 5 | EOS 3 entitlement without enrollment | `not_enrolled` | PASS |
| 6 | EOS 3 entitlement + development enrollment | `active_development` (non-Production) | PASS |
| 7 | EOS 2 API consumer | Default unresolved generation ⇒ EOS 2 | PASS |
| 8 | EOS 3 version-aware API consumer | Explicit generation 3 ⇒ EOS 3 context | PASS |
| 9 | EOS 2 audit/provenance | Unchanged EOS 2 GA path (no mutation of frozen evidence) | PASS |
| 10 | EOS 3 provenance | Generation/version + evidence classification | PASS |
| 11 | EOS 2 workflow | Evolve-existing; foundation does not replace engine | PASS |
| 12 | EOS 3 foundation workflow context | Compatibility helper true; no new engine | PASS |

Additional guards: Production deny; AI FACT rejection; event authority boundary; retrieval precedence; migration not executed.
