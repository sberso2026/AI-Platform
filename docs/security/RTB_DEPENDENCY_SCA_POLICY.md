# Dependency SCA Policy (Phase 14D · S02)

Status: CLOSED with evidence · `DependencyScaReady=true` · `DependencyScaCiEnforced=true`

## Tooling

- `pnpm audit --prod --json` via `packages/engineering-os-certification/scripts/run-dependency-sca.ts`
- Existing secret scanning preserved
- Not a continuous threat-intelligence platform

## Severity policy

| Severity | Release impact |
| --- | --- |
| critical | Fail unless explicit exception with expiry + justification |
| high | Fail unless explicit exception with expiry + justification |
| moderate/low | Report; do not fail by default |

`CriticalDependencyVulnerabilityUnresolved=false` requires zero **unexcepted** critical findings.

## Exceptions

File: `packages/engineering-os-certification/security/sca-exceptions.json`

Each exception must include: advisory id, package, severity, justification, review_by, approved_by.

## Evidence artifact

`packages/engineering-os-certification/artifacts/dependency-sca-report.json`
