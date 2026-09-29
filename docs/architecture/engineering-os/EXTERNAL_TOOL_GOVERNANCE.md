# External Tool Governance

Canonical Engineering OS configuration for **all** external software used by EOS.

Settings route: `/engineering/settings/external-tools`

This is **not** a second Platform Intelligence tool registry, not a second EMI solver-capability catalog, and not a new secrets vault, job queue, or execution host.

## Reuse map

| Concern | Classification | Owner |
| --- | --- | --- |
| AI/agent tools | REUSE | `ai_tools` / ToolRegistryService (`platform_tool_key` optional bind) |
| Platform OS capabilities / commerce | REUSE | `capabilities` + `settings.read` / `settings.write` |
| SPACE GASS / ETABS method maturity | REUSE | EMI `spacegass-capability-registry` / `etabs-capability-registry` |
| Secrets | REUSE | Platform Secret Manager — store `credential_secret_id` references only |
| Execution Host | REUSE | `controlled_engineering_execution_host` via `execution_host_id` |
| JobService | REUSE | `engineering.optimization.evaluate` |
| Connectors (M365, SharePoint, SAP) | EXTEND / COMPOSE | Engineering OS E4 connector ids |
| IFC / model files | COMPOSE | EMI adapters |
| Audit | COMPOSE | `engineering_activity_events` |
| Feature flags | REUSE | existing `engineering_os_enabled` |
| Primavera class ownership | MISSING as live connector | do not invent PC schedule ownership |

## Canonical objects (smallest persistence)

Two tables:

1. `engineering_external_tool_profiles` — **platform / admin**
2. `engineering_external_tool_assignments` — **workspace / project authorization**

Capabilities, last validation, compatible versions, and integration modes are JSON on the profile. That avoids a duplicate capability registry.

## Categories

`ANALYSIS_SIMULATION`, `CAD_BIM`, `PROJECT_CONTROLS`, `DOCUMENT_INFORMATION`, `ERP_COMMERCIAL`, `DATA_ANALYTICS`, `ASSET_OPERATIONS`, `FIELD_INSPECTION`, `COLLABORATION`, `DATA_SOURCE`, `OTHER`

Business logic keys off **category + integration mode**, not vendor name.

## Integration modes

| Mode | Typical tools | Required platform fields |
| --- | --- | --- |
| `EXECUTION_ADAPTER` | SPACE GASS, ETABS, STAAD, ANSYS | host, executable, version, licence, adapter |
| `API_CONNECTOR` | Microsoft 365, SharePoint, SAP, Xero | connector, endpoint, secret reference, scopes |
| `MODEL_FILE_INTEROP` | IFC, Revit, Tekla | adapter, format versions, mapping rules |
| `DATA_CONNECTOR` | historian, SCADA, GIS | connector/adapter, not executable path |

A profile may declare multiple modes.

## Platform vs workspace

**Platform / admin** owns: approved tool, installation, execution host, executable path, installed version, adapter, licence state, automation permission, certified capabilities, validation.

**Workspace / project** owns: whether the approved profile may be used, permitted capabilities, design standard, unit system, analysis profile.

Workspaces **must not** set executable path, licence, machine installation, or credentials.

## Licence and automation

Licence: `UNKNOWN | AVAILABLE | UNAVAILABLE | EXPIRED | NOT_REQUIRED`

Automation: `UNKNOWN | PERMITTED | NOT_PERMITTED | REQUIRES_CONFIRMATION`

Automation is **never** inferred from executable presence or a successful launch. `PERMITTED` requires `automation_confirmed_by`, `automation_confirmed_at`, and `automation_basis` (organizational/vendor authorization evidence — not legal advice).

Licence keys, passwords, API keys, tokens, TOTP, and service-account secrets are forbidden on these rows. Use secret references.

## Adapter compatibility

Machine-readable `compatible_tool_versions` and `not_certified_tool_versions`. If the installed version is outside the certified set, compatibility is `INCOMPATIBLE` and readiness is `BLOCKED`. No silent continue.

## Capabilities and certification

“Tool connected” is not “every capability certified.”

Each capability has availability and certification (`NOT_CONFIGURED | AVAILABLE | CERTIFIED | NOT_CERTIFIED | UNSUPPORTED | BLOCKED`).

SPACE GASS example keys: `MODEL_CREATE`, `MODEL_IMPORT`, `LINEAR_STATIC_ANALYSIS`, `BUCKLING_ANALYSIS`, `DYNAMIC_ANALYSIS`, `RESULT_EXTRACTION`, `DESIGN_CHECK`, `OPTIMIZATION_EXECUTION`.

## Readiness (derived, fail-closed)

`NOT_CONFIGURED | CONFIGURED | VALIDATING | READY | DEGRADED | UNAVAILABLE | BLOCKED`

For execution tools, `READY` requires enabled, host, validated executable, identified version, certified adapter compatibility, licence available (or not required), automation permitted with provenance, required capabilities certified, and last validation PASS.

Optimization **must not** treat `BLOCKED` or `UNAVAILABLE` (or anything other than `READY`) as executable.

## Validation actions

Execution: Detect Installation, Validate Executable, Detect Version, Check Licence, Adapter Compatibility, Test Host, Test Execution, Parser, Units.

API: Test Connection, Authentication, Permissions, Read, Write, Webhook.

Generic tests are not applied across modes.

## Optimization integration

Non-stub solver runs require:

- `external_tool_profile_id`
- profile enabled
- workspace assignment allowed
- `OPTIMIZATION_EXECUTION` permitted and certified
- readiness `READY`
- execution host present
- adapter compatibility certified
- licence available
- automation permitted

The generic certification stub remains tests/dev only and does **not** satisfy real structural solver readiness.

## Execution provenance (manifest 1.1 additive)

`manifest_schema_version` remains `1`. Optional `execution.external_tool` records profile id, tool version, adapter, host, capability, and validation reference. Existing v1 manifests without that block remain valid.

## SPACE GASS example (current truth)

Licensed SPACE GASS installation is **deferred**. Absence of the executable is not a governance-framework failure.

| Field | Value |
| --- | --- |
| Adapter | existing `spacegass_solver_adapter` `0.3.0-spacegass` |
| Intended host | LOCAL_WINDOWS_EXECUTION_HOST |
| Installed version | UNKNOWN |
| Executable | NOT_CONFIGURED |
| Licence | UNAVAILABLE |
| Automation | REQUIRES_CONFIRMATION |
| Adapter compatibility | NOT_CONFIGURED |
| Capability certification | none CERTIFIED |
| Readiness | NOT_CONFIGURED |

EXTERNAL_SOFTWARE_INSTALLATION: DEFERRED.
SPACE_GASS_INSTALLATION: NOT_AVAILABLE_AT_THIS_STAGE.
REAL_SOLVER_EXECUTION: NOT_CERTIFIED.

This amendment does **not** certify SPACE GASS and does **not** fabricate READY.

EOS-A7A Discipline Intelligence binds STRUCTURAL `LINEAR_STRUCTURAL_ANALYSIS` to the SPACE GASS External Tool Profile. While SPACE GASS remains NOT_CONFIGURED, that discipline capability is BLOCKED. Document/interface review remains AVAILABLE. Discipline records must not store executable path, licence, or version.
