# EOS-A5C Closeout — Optimization Execution & Reproducibility

Status: closeout of EOS-A5 `PASS_WITH_LIMITATIONS` generic Optimization Engine gaps.

Staging project: `rntonzigxwxcjlcsadip`  
Migration: `supabase/migrations/20260929230000_eos_a5c_optimization_run_manifest.sql`  
Job type: `engineering.optimization.evaluate` (Kernel `JobService` / `background_jobs`)

EOS-A5C certifies the generic Optimization **execution substrate**. It does not implement Structural Optimization, Value Intelligence, autonomous Decision selection, a second job queue, or a second execution host.

---

## Generic execution path

```
Optimization Study READY
  → Run created (queued)
  → Run Input Manifest frozen (schema v1)
  → run_input_fingerprint = SHA-256(canonical manifest)
  → baseline_fingerprint remains SHA-256(pinned configuration items)
  → Kernel JobService.create(engineering.optimization.evaluate)
  → registered handler handleOptimizationEvaluate
  → OptimizationExecutionPort
       ├─ certification stub (optimization.generic.test) — tests/dev only
       └─ ExecutionHostDelegatingAdapter → createAndAuthorizeExecutionJob
  → trusted ingest (source_kind ADAPTER | EXECUTION_HOST)
  → constraint evaluation → feasibility
  → Pareto eligibility (complete feasible only)
```

Handler registration: `registerOptimizationEvaluateHandler(kernel.jobs, supabase)` inside `createEngineeringOS`.

No `CREATE TABLE` for jobs or execution hosts. Retry uses existing `job_attempts` / `retry_count`.

---

## Execution port

`OptimizationExecutionRequest` / `OptimizationExecutionResult` in `execution-port.ts`.

Vendor-specific SPACE GASS / ETABS fields are not on the generic contract. Production structural loops are out of scope.

Certification stub returns deterministic metrics derived from `runId|alternativeId|metricKey`. It is **not** a structural solver.

Non-stub adapters call existing `createAndAuthorizeExecutionJob`. Hosted SPACE GASS remains uncertified; A5C fail-closes (`provider_unavailable` / `license_unavailable` / `solver_not_invoked`) and does not fabricate metrics.

---

## Run Input Manifest (schema version 1)

Table: `engineering_optimization_run_manifests` (one immutable row per Run).

Forward compatibility: A5C readers accept only `manifest_schema_version = 1`. Additive v1 fields change the fingerprint. A future v2 requires an explicit version bump and validator. Runtime timestamps are not part of the hashed body.

The manifest is execution-time evidence, not a second canonical Requirements/Assumptions/Interfaces store.

### baseline_fingerprint vs run_input_fingerprint

| Fingerprint | Answers | Hash input |
| --- | --- | --- |
| `baseline_fingerprint` | What frozen configuration was evaluated? | Canonical pinned configuration items (A5) |
| `run_input_fingerprint` | What complete Optimization problem definition was evaluated? | Entire Run Input Manifest v1 (A5C) |

Both are retained. A5C does not replace baseline_fingerprint.

Canonicalization: SHA-256 of `stableStringify` (sorted object keys, arrays in deterministic id order). Key-order changes do not change the hash. Display titles are excluded from Requirement/Assumption/Interface context projections.

---

## Context snapshots and DECLARED enforcement

At READY, the study stores `context_fingerprint` over:

- baseline id
- decision id/status
- system scope (`SCOPED_TO`)
- Requirement projection: id, requirement_code, statement, acceptance_criteria, verification_method, verification_status
- material Assumption projection: id, statement, confidence, validation_status, materiality (`medium|high|critical`)
- Interface projection: id, interface_code, interface_type, status, criticality

`requirements_context=DECLARED` requires ≥1 in-scope Requirement linked `CONSTRAINED_BY`.  
`assumptions_context=DECLARED` requires ≥1 in-scope **material** Assumption linked `BASED_ON`.  
`interfaces_context=DECLARED` requires ≥1 in-scope Interface linked `CONSTRAINED_BY`.

Empty DECLARED context fails preflight.

### Relation semantics

- Study `CONSTRAINED_BY` Requirement
- Study `BASED_ON` Assumption (default). `CONSTRAINED_BY` Assumption is reserved for formal constraint sources on `optimization_constraint` rows.
- Study `CONSTRAINED_BY` Interface

Governed taxonomy only. No free-text relationships.

---

## Staleness

Derived state, not a mutation of historical Runs.

A study is `STALE` when the current frozen baseline id differs, or when the live context fingerprint differs from the READY `context_fingerprint`. Display-only titles/names do not participate.

Historical `engineering_optimization_run_manifests` rows remain frozen.

---

## Pareto eligibility and unit integrity

A succeeded run is Pareto-eligible only when:

1. Alternative is FEASIBLE (all HARD constraints passed)
2. Every active Objective has exactly one metric
3. Metric unit matches Objective unit (no silent kg vs t conversion; no conversion framework in A5C)
4. TARGET objectives have `target_value`
5. No duplicate conflicting objective metrics

Otherwise status is `evaluation-incomplete`. Infeasible runs are `infeasible`. Only complete feasible alternatives participate in dominance.

Constraint evaluation fail-closes on unit mismatch (`passed=false`).

---

## Trusted result ingestion

| Path | Allowed source_kind |
| --- | --- |
| Public `/api/engineering/optimization` `ingest_results` | `MANUAL` only |
| JobService handler | `ADAPTER` or `EXECUTION_HOST` |

Browser/public clients cannot claim solver provenance.

---

## Failure handling and retry/idempotency

Handler fail-closes: invalid manifest, adapter/host unavailable, license, timeout, malformed result, cancellation. Failed runs do not receive fabricated metrics and are excluded from Pareto.

JobService retries the **same** job id / same immutable Run (`maxRetries: 1`). Strategy A: retry does not mutate the frozen manifest or `run_input_fingerprint`. Succeeded handler invocations are idempotent (return existing success). New attempt rows go to existing `job_attempts`. Duplicate successful metrics are not created as a second Run.

---

## RLS

`engineering_optimization_run_manifests` inherits run/study workspace ownership (`engineering_core_workspace_member`). Copy-run-scope trigger prevents cross-workspace persistence. Manifest UPDATE/DELETE is denied for authenticated users (service_role may DELETE for operational cleanup only).

---

## Browser validation

`/engineering/optimization` — Optimization Workspace. Context linking, preflight, READY, queue run, fingerprints, feasibility, Pareto terminology (`pareto-optimal` / `dominated` / `infeasible` / `evaluation-incomplete`). No autonomous approval language.

---

## Remaining limitations (do not authorize EOS-A6 structural execution until accepted)

1. Certification stub is not Structural Optimization.
2. SPACE GASS hosted execution remains uncertified (`spaceGassHostedExecutionCertified: false`).
3. ETABS production optimization loop is not implemented.
4. No governed unit-conversion service; mismatched units are incomplete/infeasible, not converted.
5. Lifecycle Intelligence bounded context still not implemented.

---

## Tests

- `eos-a5c-migration.test.ts`
- `eos-a5c-closeout.test.ts` (fingerprint matrix A–I, Pareto completeness, generic JobService E2E, fail-closed host, DECLARED links)
- `optimization-intelligence.test.ts` (A5 regression + trusted ingest + historical pin)
- Live JWT: `live-a5c-optimization-rls.test.ts`
