# SPACE GASS Integration Runbook (Phase 13D)

Version: **0.4.0-spacegass-live** · Status: **spacegass_live**

## Prerequisites

1. Licensed **SPACE GASS 14.5+** installed on a Windows engineering workstation or controlled host
2. **SpaceGassApi.exe** running (local headless HTTP API)
3. Default listen URL: `http://localhost:34560`
4. OpenAPI reference: https://api.spacegass.com/openapi.json

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SPACEGASS_API_URL` | Base host (default `http://localhost:34560`). Client appends `/api/v1` if missing |
| `SPACEGASS_LIVE_JOB_PATH` | Absolute path to a `.sg` job for live open/federation/execution |
| `SPACEGASS_LIVE_SAMPLE` | Sample file name for `POST /job/open-sample` (alternative to job path) |
| `SPACEGASS_LIVE_ENVIRONMENT_MODE` | `local_engineering_workstation` \| `controlled_execution_host` \| `hosted_ci` \| `remote_provider` |
| `SPACEGASS_CONTROLLED_HOST` | Set `1` to mark controlled_execution_host mode |
| `SPACEGASS_VERSION` / `SPACEGASS_HOME` / `SPACEGASS_LICENSE_PRESENT` | Retained 13C env-attestation probes (not a substitute for live API) |

No license secrets are stored in the repository.

## Health probe sequence

1. `GET /api/v1/service/info` — reachability + version
2. `GET /api/v1/license/status` — license/session
3. `GET /api/v1/job/status` — model readiness (404/no job ⇒ degraded, not fabricated healthy)

Mapped statuses: `healthy` | `degraded` | `unavailable` | `license_unavailable` | `version_mismatch` | `unauthorized` | `unknown`.

## Live federation sequence

1. Probe health (fail closed if unavailable)
2. `POST /job/close` (best-effort; one job per service)
3. `POST /job/open` or `/job/open-sample`
4. `GET /job/structure/nodes|members|sections|materials`
5. Optional existing-result note if `analysis.hasStaticResults`
6. **Always** `POST /job/close`
7. Label provenance **`LIVE MODEL`** (never fixture/export)

## Live execution sequence (`linear_elastic_static`)

1. Project policy + method qualification checks
2. Health probe (fail closed)
3. Open job
4. `POST /job/analysis/static/run-linear`
5. Poll `GET /job/analysis/runs/{runId}` until terminal
6. Bounded result query (e.g. node-reactions)
7. Close job
8. Label **`RTB EXECUTED RESULT`** on success — never silent CalculiX/fixture fallback

## CI / GitHub-hosted runners

- SPACE GASS cannot run on standard GitHub-hosted CI
- Certification **must still attempt** the live probe
- Live federation/execution gates **FAIL** when unavailable (correct / required)
- `spaceGassHostedExecutionCertified` remains **false**
- Controlled-host certification requires separate evidence (`spaceGassControlledExecutionCertified`)

## Corrective actions when health=`unavailable`

1. Install SPACE GASS 14.5+ with valid license (CORE + API module as required by vendor)
2. Start SpaceGassApi.exe and confirm `GET http://localhost:34560/api/v1/service/info`
3. Confirm `GET /api/v1/license/status` reports licensed
4. Provide `SPACEGASS_LIVE_JOB_PATH` or `SPACEGASS_LIVE_SAMPLE`
5. Re-run `pnpm --filter @rtb/engineering-model-interoperability-certification certify:phase13d` with `CERTIFY_BROWSER=1`
6. For release eligibility, use a **controlled_execution_host** with recorded evidence — do not invent PASS on CI

## Honesty reminders

- Implementation present ≠ LiveReady
- FEDERATED EXPORT ≠ LIVE MODEL
- EXISTING RESULT ≠ RTB EXECUTED RESULT
- `silentSolverFallbackAllowed=false`
