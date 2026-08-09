# Security & Assurance Public Contracts — 0.3.0-isolation-assurance

Status: Advanced from `0.2.0-control-evidence` · **Not frozen 1.0.0**

## New / isolation contracts

- IsolationProbeReference
- IsolationProbeRun
- IsolationAssessment
- IsolationFindingReference
- IsolationAssuranceSnapshot

## Semantics

- isolation configured ≠ isolation verified
- probe pass ≠ external penetration test
- failed probe never becomes PASS via fallback
- assurance evidence ≠ enforcement
- framework mapping ≠ certification
- no universal numeric security score
