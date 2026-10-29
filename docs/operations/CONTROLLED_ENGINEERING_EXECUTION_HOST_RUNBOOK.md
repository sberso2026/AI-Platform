# Controlled Engineering Execution Host Runbook (Phase 13D.1)

Status: **foundation** · version **0.1.0-execution-host** · phase **13D.1**

## Purpose

Operate provider-neutral Controlled Engineering Execution Hosts that can later run
licensed external engineering software (SPACE GASS, future ETABS, etc.) without
owning solver qualification, Digital Twin, or commercial license secrets.

## Host provisioning

1. Provision a Windows engineering workstation, dedicated Windows VM, controlled
   remote host, or optional self-hosted CI runner.
2. Register the host via `POST /api/engineering/execution-hosts` with
   `tenantId`, `workspaceId`, and `hostClass`.
3. Confirm heartbeat/health updates succeed (`EngineeringExecutionHostHealth`).
4. Declare installed providers (identity/version/license-state only — no keys).

## Windows setup

- Prefer Windows x64 for commercial desktop solvers.
- Isolate job workspaces under a dedicated root directory.
- Restrict outbound network except local provider APIs where required.
- Do not store license keys in git, logs, or Platform DB columns.

## Self-hosted runner (optional)

- A host may also be a GitHub self-hosted runner.
- GitHub Actions is **not** required as the execution transport.
- Certification may consume signed host evidence independently of CI.

## Provider installation

- Install vendor software outside RTB (vendor installer).
- Record `installationStatus`, `providerVersion`, and bounded `licenseStatus`.
- Revoke a provider without revoking the host when needed.

## Provider health

- Use `EngineeringProviderHostProbe` implementations (SPACE GASS detect-only today).
- Host health and provider health are independent.
- `host available ≠ solver available ≠ licensed ≠ qualified`.

## License handling

Allowed states only: `available | unavailable | expired | invalid | unknown`.
Commercial license material remains vendor-managed.

## Job execution

- Jobs require authorization metadata (tool/method/provider/application refs).
- Missing authorization → `rejected`.
- Unavailable provider → `provider_unavailable` (no CalculiX fallback).
- `silentSolverFallbackAllowed=false` always.

## Workspace cleanup

- Unique job directory, no cross-job access.
- Cleanup after artifact extraction to Platform Files refs.

## Upgrades / revocation

- Version pin mismatches fail closed.
- Revoked hosts must not accept new/queued jobs.
- Historical jobs remain traceable.

## Incident response

1. Mark host `draining` or `revoked`.
2. Capture `requestId` / `correlationId` / `jobId` / `hostId` (no model payloads).
3. Re-probe provider health; do not fabricate live execution certification.

## Honesty locks

- `SPACEGASSLiveExecutionCertified=false` in this phase
- `ETABSAdapterImplemented=false`
- `phase13DReCertificationReady=true` is a flag only — do not auto-start Phase 13D
