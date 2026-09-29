# EOS-A1 Optimization Readiness Contract

Status: **IMPLEMENTED IN EOS-A5** (generic Optimization Core). Structural/discipline solvers remain **EOS-A6+**.

Evidence HEAD: recorded at A5 closeout on branch `cursor/era-7a-engineering-review-pilot-gate`.

Implementation: `docs/architecture/engineering-os/EOS_A5_IMPLEMENTATION.md`  
Persistence: `engineering_optimization_*` (`20260929220000_eos_a5_engineering_optimization_core`).

This contract was the A1 definition Optimization Intelligence consumes from the canonical model. A5 established the factual schema and service contracts below; it still does not implement discipline solvers.

Object names: `CANONICAL_DOMAIN_MODEL.md` §14.

---

## 1. What Optimization is (and is not)

**Is:** A governed study that searches or compares alternatives against objectives and constraints, producing results, trade-offs, and evidence for Decision and Value.

**Is not:** Decision Intelligence (Decision SELECTS). Not ERA. Not a third graph. Not a licence to bypass Review or human approval. Not implemented in A1–A4.

Existing execution host and IFC / SPACE GASS / ETABS adapters are **analysis** capabilities. Optimization may **call** them later via Analysis Run / Execution Job. They are not Optimization Study records.

---

## 2. Required inputs from the canonical model

| Input | Why Optimization needs it | Canonical source (now / future) |
| --- | --- | --- |
| Lifecycle stage | Feasible variables and freeze rules differ by phase | `engineering_projects.project_phase` |
| System context | Study scope is usually a System, not a discipline silo | `engineering_systems` (EOS-A3); TEXT labels remain legacy |
| Requirements | Objectives/constraints must trace to obligations | `engineering_requirements` (EOS-A4); ERA may flag gaps only |
| Assumptions | Uncertain inputs; sensitivity and invalidation | `engineering_assumptions` (EOS-A2); ERA `unsupported_assumption` is detection, not the register |
| Interfaces | Coupling constraints between systems/assets | `engineering_interfaces` (EOS-A3) |
| Constraints | Hard/soft limits (physics, code, contract, interface) | Optimization Constraint objects (future) bound to Requirements/Interfaces |
| Discipline models | Geometry, loads, datasheets, analytical models | Documents (typed) + `engineering_model_*` |
| Configurations | Which revision set is being optimized | `engineering_configuration_baselines` (EOS-A4); document revisions remain Document Version |
| Costs | Economic evaluation | Project Controls / cost inputs as **feeds**, not Optimization-owned cost ledgers |
| Schedule context | Time-feasible alternatives | Project Controls snapshots/timeline as **feeds** |
| Risk | Residual risk of alternatives | `engineering_risks` + future links |
| Evidence | Reproducibility of a run | ERA Evidence model composed, not forked |
| Decision context | Prior decisions that freeze variables | `engineering_decisions` |

Missing Value objects remain a **known gap (EOS-A9)**. A2–A4 canonical objects now exist; A5 consumes them and must not invent private copies. Optimization Constraint objects exist as `engineering_optimization_constraints`.

---

## 3. Output links (contract for EOS-A5)

```
Optimization Study
  → Alternatives
  → Analysis Runs
  → Optimization Results (incl. Pareto Set, Sensitivity Result, Economic Evaluation)
  → Review Package (ERA reviews the selected/shortlisted set)
  → Decision (engineering_decisions SELECTS an Alternative)
  → Configuration (approved alternative becomes / updates a Baseline)
  → Value (Projected → Approved → Committed → Realized / Verified)
```

Relation codes (from `DOMAIN_RELATIONSHIP_MODEL.md`):

- Study `CONTAINS` Runs; Run `SUPPORTED_BY` Analysis Result / Evidence.
- Decision `SELECTS` Alternative; Decision `BASED_ON` Assumption; Decision `AFFECTS` Configuration.
- Review Package `REVIEWS` Study artefacts.
- Value objects `SUPPORTED_BY` Evidence and `BASED_ON` the same Alternative.

---

## 4. Authority and review

- Optimization Result is **advisory** until a Decision is APPROVED.
- No autonomous design/safety approval (platform rule).
- Material studies that affect ISSUED or safety-critical configuration require a Review Package before Decision approval (maturity model: APPROVED/ISSUED expectations).
- Do not write Optimization findings into a new findings table; use ERA if governed review is required, PI Findings only if product detection applies.

---

## 5. Execution

Jobs: use the future-converged Kernel job kinds (ADR-D4). Do not add a fifth queue for Optimization in A5 without an ADR.

Adapters: reuse analysis adapters; Optimization should not embed SPACE GASS/ETABS licences as a parallel execution host.

Graph: results and alternatives are objects + thread edges on **Platform KG**, not a PI-only optimization graph.

---

## 6. Explicit non-goals

### EOS-A1 (historical)

A1 did not create Optimization tables, solvers, or UI.

### EOS-A5 (now established)

- Canonical Optimization Study / Objective / Constraint / Variable / Scenario / Alternative / Run / Result exist.
- Frozen Configuration Baseline + pinned configuration items + SHA-256 fingerprint are mandatory for executable runs.
- Kernel `background_jobs` is reused (`engineering.optimization.evaluate`). No fifth queue.
- No Structural/Process/Piping/Electrical/Mechanical solver loop.
- No autonomous recommendation or Decision selection.
- No Value Intelligence / ROI attribution.
- No Monte Carlo.
- No migration of legacy desktop solvers from the standalone Engineering OS folder (still EOS-A6+ candidates).
