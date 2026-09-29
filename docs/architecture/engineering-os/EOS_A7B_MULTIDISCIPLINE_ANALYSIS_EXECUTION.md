# EOS-A7B Multidisciplinary Analysis & Execution Foundation

Status: implemented as the canonical discipline-neutral analysis orchestration layer.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| Real solver execution | NOT IMPLEMENTED |
| Structural optimization | NOT IMPLEMENTED |
| Multidiscipline optimization | NOT IMPLEMENTED |
| LLM-as-solver | PROHIBITED |
| Autonomous engineering approval | NO |

## Purpose

EOS-A7B defines how Engineering OS represents, validates, plans, authorizes, executes, blocks, records, reviews, and traces engineering analyses across disciplines.

States must never collapse:

analysis requested → executable → executed → succeeded → result valid → reviewed → accepted → engineering decision approved

A blocked real tool with accurate governance is a valid system outcome. A fabricated result is not.

## Analysis Request

Canonical object: `engineering_analysis_requests` (`EngineeringAnalysisRequest`).

Identity: `id`, `tenant_id`, `workspace_id`, `project_id`.

Engineering context: discipline + capability + optional system/asset/interface.

Governed context: configuration baseline, requirements, assumptions, applicable standards, supporting documents.

Execution intent: requested external tool profile, requested outputs, requester.

States: `draft`, `validating`, `blocked`, `ready`, `queued`, `executing`, `succeeded`, `failed`, `cancelled`.

This object is **not** an Optimization Run. Optimization may create Analysis Requests. Engineers may create them independently.

## Capability resolution

Reuses the EOS-A7A discipline capability taxonomy (`LINEAR_STRUCTURAL_ANALYSIS`, `STRESS_ANALYSIS`, `PROCESS_SIMULATION`, `POWER_SYSTEM_ANALYSIS`, `FEA`, `DESIGN_CHECK`, …).

Capability is never inferred from a tool name. Orchestration keys off discipline + capability + External Tool Governance fields.

Resolution is explicit, not a generic “not ready” flag. Primary states include `EXECUTABLE` and `BLOCKED_*` reasons (discipline disabled, capability unavailable/not certified, no tool binding, tool not configured/unavailable/unlicensed, automation not permitted, adapter incompatible, workspace not authorized, baseline/requirements/assumptions/standards incomplete).

Tool selection policy: requested profile, else workspace default, else governed priority. Silent substitution is forbidden.

## Capability registry boundary

| Registry | Meaning | Owner |
| --- | --- | --- |
| Engineering Discipline Capability | Engineering semantic ability (`LINEAR_STRUCTURAL_ANALYSIS`, `FEA`, …) | EOS-A7A `DISCIPLINE_CAPABILITY_KEYS` + overlay JSON |
| External Tool Capability | What a **tool profile** can do (`LINEAR_STATIC_ANALYSIS`, `OPTIMIZATION_EXECUTION`) | External Tool Governance |
| Platform Capability | Product/seat/access (`engineering-os`, `settings.read`) | Platform Commerce |

They compose: a discipline capability may require a tool capability that is certified on an approved profile. They are not competing canonical registries.

`CERTIFICATION_ANALYSIS` is a TEST/DEV proving capability. It is hidden from production Analysis Workspace and does not certify any production discipline.

## Preconditions

Each governed precondition is `SATISFIED | NOT_SATISFIED | NOT_APPLICABLE | UNKNOWN`.

Unknown **safety-critical** preconditions fail closed (`NOT_SATISFIED`).

Examples: frozen baseline, identified requirements, declared assumptions, applicable standard, interface information, accepted upstream result, external tool ready, workspace allowed, execution host available.

## Execution Plan

When resolution is `EXECUTABLE` (or a named synthetic TEST adapter), EOS freezes an `engineering_analysis_execution_plans` row.

The plan captures request id, discipline, capability, baseline, requirements, assumptions, standards, interfaces, upstream dependencies, selected tool profile, adapter, execution host, inputs, requested channels, units, and execution policy.

After `frozen = true`, execution-critical fields cannot change (`execution_plan_immutable`). Context changes require a new plan or explicit supersede.

## Input Manifest

Discipline-neutral `AnalysisInputManifestV1`: schema version, request, context, baseline, requirements, assumptions, interfaces, standards, tool, adapter, execution environment, inputs, units, requested outputs, upstream dependencies, provenance.

Secrets are forbidden.

## Input fingerprint

`analysis_input_fingerprint` is SHA-256 of canonical JSON over execution-critical fields only (sorted ids, no display titles). Distinct from Optimization `run_input_fingerprint` unless a future composition explicitly reuses the same frozen inputs.

## Dependencies

No new graph engine. Analysis-to-analysis edges use `engineering_object_links` with existing verbs:

| Semantic | Governed verb |
| --- | --- |
| REQUIRES_RESULT_FROM | DEPENDS_ON |
| USES_RESULT_FROM | USED_BY |
| SUPERSEDES | SUPERSEDES |
| VALIDATES | VERIFIED_BY |

Downstream analysis must not execute against FAILED / STALE / SUPERSEDED / REJECTED upstream evidence unless explicitly permitted. Acceptable upstream states are REVIEWED or ACCEPTED per governance.

Synthetic fixture: Primary Crushing System — PROCESS mechanical duty → MECHANICAL loads → STRUCTURAL support frame → GEOTECHNICAL foundation. Representation only; no real solvers.

## Staleness

Material fingerprint drift is explainable: `STALE_BASELINE_CHANGED`, `STALE_REQUIREMENT_CHANGED`, `STALE_ASSUMPTION_CHANGED`, `STALE_INTERFACE_CHANGED`, `STALE_STANDARD_CHANGED`, `STALE_UPSTREAM_RESULT_CHANGED`, `STALE_TOOL_VERSION_CHANGED`, `STALE_ADAPTER_VERSION_CHANGED`. Display-only metadata does not stale a result.

## External Tool Governance

Reused. Orchestration does not hard-code SPACE GASS, ETABS, CAESAR II, HYSYS, ETAP, or PLAXIS. A Tool Binding resolves discipline + capability + workspace/project to an approved External Tool Profile.

## JobService and Execution Host

Reused Kernel `background_jobs`. Job type `engineering.analysis.execute`. No second queue.

Generic `AnalysisExecutionPort` carries request, accept/reject, status, result, error, provenance. Vendor fields stay behind adapters.

Real solvers are not dispatched unless the profile is READY and automation is PERMITTED. The default port rejects non-synthetic adapters without fabricating metrics.

Retries: JobService semantics. Transient infrastructure (`TOOL_TIMEOUT`, `QUEUE_FAILED`) may retry once. Deterministic engineering/tool failures do not auto-retry.

## SPACE GASS current state

Canonical live install: SPACE GASS 14.2 Trial 14.25.3785.

- API_AVAILABLE: NO
- AUTOMATION_PERMISSION: REQUIRES_CONFIRMATION
- REAL_SOLVER_EXECUTION: NOT_CERTIFIED
- PRODUCTION_USE_PERMITTED: NO

SPACE GASS 14.5 Viewer is UNINSTALLED / EXECUTION_INELIGIBLE / HISTORICAL_AUDIT_ONLY.

A STRUCTURAL / LINEAR_STRUCTURAL_ANALYSIS request against the current profile may be created and preflighted. Execution is **BLOCKED**, typically `BLOCKED_AUTOMATION_NOT_PERMITTED` and/or `BLOCKED_TOOL_NOT_READY` / `BLOCKED_TOOL_NOT_CONFIGURED`. No JobService solver job. No fabricated result.

## Synthetic TEST adapter

`SYNTHETIC_CERTIFICATION_ANALYSIS_ADAPTER` exists for TEST/DEV architectural proving only. It is not a `REAL_ENGINEERING_TOOL`. It must not certify a production discipline capability. Production UI hides `CERTIFICATION_ANALYSIS`.

## Normalized result

`engineering_analysis_results`:

- `execution_succeeded` ≠ `result_valid` ≠ human `acceptance_state`
- normalized metrics (scalar, array, curve, table, artifact)
- warnings, limitations, artifacts, provenance (tool, adapter, host, hashes, timestamps, source kind)
- review/acceptance/stale

Post-execution validation is generic (required channel, finite scalar). Discipline-specific checks (equilibrium, load cases) belong in capability validators, not generic core.

Acceptance is human-governed (`UNREVIEWED | UNDER_REVIEW | ACCEPTED | REJECTED | SUPERSEDED`) with actor, timestamp, rationale. AI agents cannot self-accept or self-certify tools.

## Review / Decision / Change / Optimization composition

Engineering Review remains the Review bounded context. Analysis Request/Result are cited via governed `REVIEWS` links. ERA Findings are unchanged. No `structural_analysis_findings`.

Decisions use existing `SUPPORTED_BY`. Changes may `AFFECTS` a result and stale it. A technical difference is not automatically a confirmed Impact.

Optimization may request analyses through this foundation (`USED_BY` from optimization run → analysis request). EOS-A5 Optimization Core is not rewritten.

## Digital Thread

Analysis objects are Core rows plus `engineering_object_links`. Future relations: System HAS_ANALYSIS, request USES_REQUIREMENT / USES_ASSUMPTION / USES_STANDARD / USES_TOOL, result EVIDENCE_FOR Review, result SUPPORTS Decision. No new graph store.

## Security / RLS

Fail-closed workspace membership. Tenant isolation. `execute` creates/queues. `admin` certifies tools (existing External Tool / Discipline overlay policies). Anonymous denied. Foreign workspace/tenant/tool/baseline denied.

## UI

`/engineering/analysis` — Analysis Requests, Blocked, Ready, Executing, Results, Stale.

Blocked UI states the specific reason and does not imply application failure. Tool configuration remains Settings → External Tools & Integrations and Settings → Disciplines.

Permissions map to existing commerce actions:

| Authority | Policy |
| --- | --- |
| CREATE / PLAN / EXECUTE / REVIEW / ACCEPT | `analysis.write` (engineering execute) |
| CERTIFY_TOOL_CAPABILITY | existing admin / discipline-intelligence write |

## AI boundary

AI may identify context, retrieve requirements/assumptions/interfaces/standards, draft requests, explain results, and prepare review. AI must not invent solver results, loads, or section data; must not self-certify tools; must not self-accept results; must not approve design.

## Limitations

- Real SPACE GASS / HYSYS / CAESAR II / ETAP / PLAXIS execution is out of scope.
- No GUI automation.
- No structural or multidiscipline optimization in A7B.
- Synthetic adapter proves architecture only.
- Result comparison is metadata compatibility, not engineering equivalence.
