# EOS 2.20 GA Security and Release Evidence

`CANONICAL_GATE_ORCHESTRATION_DETERMINISTIC=YES`

`AUTHORITATIVE_GATE_COMPLETION=PASS`

Command: `pnpm eos2:canonical-gates` (`scripts/eos2-19-canonical-gates.mjs`)

Authoritative result this gate: `PASS_WITH_KNOWN_MODERATE` (exit 0)

`RELEASE_TEST_SUITE_EXECUTED=YES`

`RELEASE_TEST_COUNT=220`

`RELEASE_LEDGER_STATUS=PASS`

`ARTIFACT_CONSISTENCY=PASS`

`SECRET_SCAN=PASS`

`DEPENDENCY_AUDIT=PASS_WITH_KNOWN_MODERATE` (`GHSA-w5hq-g745-h8pq` / exceljs→uuid; disposition `ACCEPTED_BOUNDED_RISK`)

`NEW_BLOCKING_SECURITY_ISSUE=NO`

`SECURITY_RELEASE_REGRESSION_GATE=PASS`

`GA_SECURITY_POSTURE=PASS` for the **controlled-pilot security model** (isolation, authority, kill switch). Security PASS does **not** override entitlement/onboarding/commercial NO-GO.

Evidence artifact: `EOS_2_19_CANONICAL_GATE_RESULT.json` regenerated during this phase.

`GA_ACTIVATION_PERFORMED=NO` — no Production mode/enrollment change.
