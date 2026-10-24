# EOS-A5 Implementation — Engineering Optimization Core

Status: **implemented** and applied to staging `rntonzigxwxcjlcsadip`.

Evidence branch: `cursor/era-7a-engineering-review-pilot-gate`  
HEAD at implementation: `0dd05bf124c19e1fbb8099f396a904ec86a2d020` (uncommitted A5 working tree)  
Migration: `supabase/migrations/20260929220000_eos_a5_engineering_optimization_core.sql`  
Staging ledger: `20260929220000` / `eos_a5_engineering_optimization_core`

EOS-A5 builds the generic Optimization **engine**. It does not implement Structural, Process, Piping, Mechanical, Electrical, Civil, Geotechnical, or multidisciplinary solvers. Those begin with EOS-A6.

Optimization answers: *what technically feasible alternatives provide better trade-offs?*  
Decision Intelligence answers: *which alternative was selected, by whom, and why?*

---

## Bounded-context ownership

Canonical owner: **Engineering Optimization**, implemented as a module inside Engineering OS:

`packages/engineering-os/src/optimization-intelligence/`

Not a new package. Not Platform Kernel. Not Discipline Intelligence. Not Engineering Review. Not Value Intelligence. Not Digital Twin (`optimizationImplemented` remains false on the Twin runtime).

Canonical tables are `engineering_optimization_*`. Project Intelligence is forbidden from direct writes (`FORBIDDEN_DIRECT_CORE_WRITES`).

---

## Part 1 reconnaissance (classification)

| Capability | Classification |
| --- | --- |
| Kernel `JobService` / `background_jobs` | **REUSE** — Optimization Run queues `engineering.optimization.evaluate` |
| `engineering_execution_jobs` / `engineering_execution_hosts` | **COMPOSE** — no second host |
| SPACE GASS / ETABS / IFC adapters | **REUSE later (EOS-A6)** — not invoked by A5 |
| Digital Twin `optimizationImplemented=false` | **NOT_EQUIVALENT** — Twin simulation optimization remains unavailable |
| PI / Asset “optimization” labels | **NOT_EQUIVALENT** |
| Decision alternatives | **COMPOSE** — optional map; remain distinct |
| Configuration baselines / items (A4) | **COMPOSE** — frozen baseline is executable input |
| Systems / Requirements / Assumptions / Interfaces (A2–A4) | **COMPOSE** — declared context + governed links |
| ERA review packages | **COMPOSE later** — no ERA schema change |

No second solver host. No second job queue. No third graph store.

---

## Study model

Table: `engineering_optimization_studies`.

Identity: `id`, `tenant_id`, `workspace_id`, `project_id`, `study_code` unique `(tenant_id, workspace_id, study_code)`, `title`, `description`.

Context: `lifecycle_stage` (`CONCEPT|PREFEASIBILITY|FEASIBILITY|FEED|DETAILED_DESIGN|CONSTRUCTION|COMMISSIONING|OPERATIONS|MODIFICATION`), `configuration_baseline_id`, `decision_id`.

Context declarations (prevent silent omission):

- `requirements_context`: `UNDECLARED|DECLARED|NONE_APPLICABLE`
- `assumptions_context`: `UNDECLARED|DECLARED|NONE_MATERIAL`
- `interfaces_context`: `UNDECLARED|DECLARED|NONE_APPLICABLE`

Status: `draft|defined|ready|running|evaluated|reviewed|closed|superseded|cancelled`.

READY/RUNNING require a **frozen** Configuration Baseline and a Decision (DB trigger + service preflight).

---

## System scope

Governed relation **SCOPED_TO** (added to `engineering_object_links` taxonomy).

`OPTIMIZATION_STUDY SCOPED_TO SYSTEM`

No optimization-specific System identity. READY requires at least one System scope.

---

## Baseline binding and configuration-item pinning

A READY/RUNNING study must reference a frozen `engineering_configuration_baselines` row in the same tenant/workspace.

At run creation:

1. Pin relevant `engineering_configuration_items` into `engineering_optimization_run_inputs` (code/title/state/revision snapshots).
2. Compute SHA-256 fingerprint of canonical JSON (sorted keys; items ordered by `object_type|object_id|configuration_item_id`; no timestamps).
3. Store `configuration_baseline_id` + `baseline_fingerprint` on the run.

Historical evaluation **must not** reread live Core rows. Changing a live source after the run does not change pinned inputs or the fingerprint.

---

## Objectives, constraints, variables, scenarios, alternatives

| Table | Role |
| --- | --- |
| `engineering_optimization_objectives` | `MINIMIZE|MAXIMIZE|TARGET` (TARGET = minimize `|value-target|`). Weights exist but **never** auto-scalarize. |
| `engineering_optimization_constraints` | Structured operators only (`<= >= = < >`). `HARD|SOFT`. No SQL/code. Optional `source_object_type/id` + **CONSTRAINED_BY**. |
| `engineering_optimization_design_variables` | `CONTINUOUS|INTEGER|DISCRETE|CATEGORICAL|BOOLEAN` with validated bounds/`allowed_values`. |
| `engineering_optimization_scenarios` | Deterministic conditions only. No Monte Carlo. |
| `engineering_optimization_alternatives` | Stable technical candidates. Optional `decision_alternative_id`. |
| `engineering_optimization_alternative_values` | Structured variable values. |

No autonomous AI option generation.

---

## Runs, execution, results

`engineering_optimization_runs` inherit study tenant/workspace/project via trigger.

Status: `queued|running|succeeded|failed|cancelled`.

Execution port: Kernel `JobService.create({ jobType: "engineering.optimization.evaluate" })`. If no handler is registered, the run remains queued for **trusted result ingestion**. A5 does not invent a parallel runtime.

Normalized results: `engineering_optimization_result_metrics` (`source_kind` = `MANUAL|EXECUTION_HOST|ADAPTER`). Constraint rows: `engineering_optimization_constraint_evaluations`.

Succeeded runs, pinned inputs, metrics, and evaluations are immutable (DB triggers). Correction requires a new run.

There is no `recommended_alternative_id`, `approved_alternative_id`, or `selected_optimization_alternative_id`.

---

## Feasibility and Pareto

FEASIBLE iff every applicable **HARD** constraint passes. Soft failures do not convert infeasible into feasible.

Pareto: deterministic dominance on feasible runs. MINIMIZE raw; MAXIMIZE negated; TARGET `|value-target|`. Computed on demand; not persisted as “best”.

UI language: Pareto-optimal / Non-dominated / Dominated / Feasible / Infeasible.

---

## Preflight

`preflightStudy` refuses READY unless:

- workspace/project present
- ≥1 System SCOPED_TO
- frozen baseline in-scope
- decision in-scope
- requirements/assumptions/interfaces declared or explicit NONE_*
- ≥1 valid objective
- valid constraints/variables
- ≥1 non-withdrawn alternative

No silent auto-correction.

---

## Staleness

Derived `CURRENT|STALE` when the project’s current frozen baseline differs from the study baseline. Historical run evidence is not mutated. Stale means the study may no longer represent current context.

---

## Decision, Review, Value boundaries

- Decision `SUPPORTED_BY` Optimization evidence is allowed via existing taxonomy. Decision remains selection/rationale/authority/approval owner.
- ERA is unchanged. No optimization findings table. Pareto-optimal ≠ reviewed/approved.
- CAPEX/OPEX/ENERGY metrics are Optimization metrics. No ROI, realized savings, or Value Intelligence tables.

---

## RLS / ownership

Workspace fail-closed via `engineering_core_workspace_member`. Child rows copy study/run scope on insert/update. Cross-workspace baseline/decision attach is rejected by trigger. Cross-workspace SCOPED_TO fails `engineering_core_link_endpoint_allowed`.

---

## APIs and UI

- API: `/api/engineering/optimization`
- UI: `/engineering/optimization`

Audit: existing `engineering_timeline_events` + `engineering_activity_events`. No second audit subsystem.

---

## Tests

- Unit: invariants, fingerprint, feasibility, Pareto, preflight, staleness
- Integration: study/run services with frozen baseline pinning/immutability
- Live JWT: `packages/engineering-review-persistence/src/live-a5-optimization-rls.test.ts`
- EOS-A5C closeout: JobService handler, Run Input Manifest, `run_input_fingerprint`, declared-context enforcement, Pareto completeness — see `EOS_A5_CLOSEOUT.md`

---

## Known limitations

A5 originally shipped without a registered `engineering.optimization.evaluate` handler and with DECLARED-context as an enum-only flag. **EOS-A5C** registers the generic handler, freezes a Run Input Manifest, and requires actual Requirement/Assumption/Interface links when DECLARED. Remaining A5/A5C limitations:

- Certification stub (`optimization.generic.test`) is not a structural solver. SPACE GASS / ETABS production loops remain EOS-A6.
- Manual result ingestion remains explicit (`source_kind=MANUAL`) and is not a validated solver result.
- No Monte Carlo / uncertainty. No alternative generator. No Value Intelligence.
- Engineering Review composition is by object links only; no ERA schema change.
- Lifecycle Intelligence bounded context is not implemented; A5 stores study-level stage context only.
