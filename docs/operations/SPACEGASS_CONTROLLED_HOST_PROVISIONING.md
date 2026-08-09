# SPACE GASS Controlled Host Provisioning (Phase 13D.1)

Status: **detect-only** · does **not** certify live SPACE GASS execution

## Supported installation expectations

- SPACE GASS **14.5+** licensed install on a Windows controlled host
- SpaceGassApi.exe local HTTP service
- Default API base: `http://localhost:34560/api/v1` (no auth headers)

## SpaceGassApi startup

1. Install SPACE GASS with API module per vendor guidance.
2. Start `SpaceGassApi.exe` on the engineering host.
3. Confirm the service listens on the configured port.

## API URL configuration

Environment variables (optional overrides):

- `SPACEGASS_API_URL` or `SPACEGASS_API` — host or full `/api/v1` base

Do **not** place license secrets in environment dumps or artifacts.

## Sample model configuration

- Prefer vendor sample job open for health checks when available.
- Federation/execution certification remains Phase 13D (separate).

## Health validation

```bash
pnpm --filter @rtb/engineering-execution-host test
# or probe via API
# POST /api/engineering/execution-hosts/providers
# { "tenantId":"…", "workspaceId":"…", "providerId":"spacegass", "operation":"probe" }
```

Probe may report `unavailable` — Phase 13D.1 still PASSes if detect-only path runs.

## Phase 13D certification command (later, when licensed host exists)

```bash
pnpm --filter @rtb/engineering-model-interoperability-certification certify:phase13d
```

Do **not** auto-run this from Phase 13D.1 PASS.

## Honesty

- `SPACEGASSLiveExecutionCertified=false`
- Host foundation readiness ≠ live solver certification
