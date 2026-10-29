# EOS 2.20 GA Security and Release Evidence (gate rerun)

`CANONICAL_GATE_ORCHESTRATION_DETERMINISTIC=YES`

`AUTHORITATIVE_GATE_COMPLETION=PASS`

Command: `pnpm eos2:canonical-gates` (`scripts/eos2-19-canonical-gates.mjs`)

Authoritative result this gate: `PASS_WITH_KNOWN_MODERATE` (exit 0)

`RELEASE_TEST_SUITE_EXECUTED=YES`

`RELEASE_TEST_COUNT=220`

`RELEASE_LEDGER_STATUS=PASS`

`ARTIFACT_CONSISTENCY=PASS`

`CANONICAL_SECURITY_CHECK=PASS`

`GA_SECURITY_CHECK=PASS`

`TENANT_ISOLATION_REGRESSION=PASS`

`EOS_1_COEXISTENCE_REGRESSION=PASS`

`EOS_2_ROLLOUT_GATE_REGRESSION=PASS`

`EOS_2_ENROLLMENT_REGRESSION=PASS`

`EOS_2_ROUTE_GATE_REGRESSION=PASS`

`EOS_2_API_GATE_REGRESSION=PASS`

`EOS_2_KILL_SWITCH_REGRESSION=PASS`

`PILOT_RBAC_REGRESSION=PASS`

Discipline / lifecycle / interface / change / baseline / deliverable / storage isolation: `PASS`

Authority boundaries (source ownership, receiver acceptance, materiality, engineering review, freeze, deliverable approval, release, IFC, AI): `PASS`

`BASELINE_IMMUTABILITY=PASS`

`AUDIT_INTEGRITY=PASS`

`SECRET_SCAN=PASS`

`DEPENDENCY_AUDIT=PASS_WITH_KNOWN_MODERATE` (`GHSA-w5hq-g745-h8pq` / exceljs→uuid; disposition `ACCEPTED_BOUNDED_RISK`)

`NEW_BLOCKING_SECURITY_ISSUE=NO`

`RELEASE_GOVERNANCE=PASS`

`SECURITY_RELEASE_REGRESSION_GATE=PASS`

`GA_SECURITY_POSTURE=PASS`

`GA_ENTITLEMENT_EVALUATOR=PASS` (unit matrix re-executed this gate)

Evidence artifact: `EOS_2_19_CANONICAL_GATE_RESULT.json` regenerated during this phase.

`GA_ACTIVATION_PERFORMED=NO` — no Production mode/enrollment change during this gate.
