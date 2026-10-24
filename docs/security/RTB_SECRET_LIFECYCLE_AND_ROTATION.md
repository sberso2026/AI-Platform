# Secret Lifecycle, Rotation & Emergency Revocation (Phase 14D · S04)

Status: CLOSED · `SecretLifecycleGovernanceReady=true` · `SecretRotationProcedureReady=true` · `EmergencySecretRevocationReady=true`

## Secret classes (inventory — never values)

| Class | Store | Rotation owner |
| --- | --- | --- |
| Database credentials | Supabase / hosting | Ops |
| Hosting secrets | Hosting provider | Ops |
| GitHub/CI secrets | GitHub Actions secrets | Platform eng |
| AI provider credentials | Secret Management / env | AI Runtime owner |
| External API keys | Secret Management / env | Integration owner |
| Execution-host credentials | Host secret store | Execution Host owner |
| Solver/provider integration credentials | Client-owned / host | Client + host owner |
| Service identities | IdP / platform | Identity owner |

## Lifecycle

provision → store → use → rotate → revoke → replace → validate → retire

Platform Secret Management (`docs/architecture/SECRET_MANAGEMENT.md`) stores encrypted values or external refs; list APIs omit plaintext.

## Rotation procedure (operational)

1. Create new secret version / provider credential
2. Deploy config referencing new version
3. Validate health endpoints / dependent jobs
4. Revoke old version
5. Record rotation in `secret_access_logs` / change record (no secret values)
6. Confirm CI `secret-scan` still clean

Where provider rotation is manual (Supabase dashboard, GitHub UI, AI vendor console), document the steps in the change record — do not fabricate automation.

## Emergency revocation

1. Identify class + blast radius (no values in tickets)
2. Revoke at provider immediately
3. Invalidate sessions/tokens if identity-related
4. Deploy replacements
5. Validate services
6. Post-incident review (link IR runbook)

## Verification

- `secretExposureDetected=false` via certification secret scan
- No committed production credentials in repository
