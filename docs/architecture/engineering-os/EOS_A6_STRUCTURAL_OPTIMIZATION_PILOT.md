# EOS-A6 Structural Optimization Pilot

Status: **PASS_WITH_LIMITATIONS** (technical development). Not production. Not commercial-solver certified.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| Solver | SPACE GASS trial / discovered Windows installs |
| Production ready | NO |
| Controlled pilot | NO (AAL2 not proven; automation not permitted; live API unavailable) |
| LLM as solver | PROHIBITED |
| Autonomous approval | NO |

## Pilot scope

One bounded single-bay steel portal frame on the canonical Engineering Optimization Study.

- System: Structural Pilot Frame
- Discipline: STRUCTURAL
- Capability: `STRUCTURAL_OPTIMIZATION_PILOT`
- Lifecycle used as synthetic pilot context: FEED
- Span 8.0 m, eaves 4.0 m, pinned bases
- Linear elastic static
- Roof beam UDL 10 kN/m, source `PILOT_DEFINED`, self-weight **OFF**
- Expected vertical load 80 kN ± 0.5% relative

No topology optimization. No AI-generated layout, loads, or section properties. Geometry, supports, material, and loads stay frozen.

## SPACE GASS trial details (machine discovery)

Do not treat this table as API or production evidence.

| Install | Path | File version | Trial labelled | API executable | Documented API |
| --- | --- | --- | --- | --- | --- |
| 14.2 Trial | `C:\Program Files\SPACE GASS 14.2 (Trial)\SGCore.exe` | 14.25.3785 | YES | NO | none |
| 14.5 | `C:\Program Files\SPACE GASS 14.5\SGCore.exe` | 14.50.165 | NO (uninstaller is not labelled Trial) | `SpaceGassAPI.exe` 14.50.165 | `http://localhost:34560` / `/api/v1` |

Live HTTP probe of `http://localhost:34560/api/v1` timed out. No SPACE GASS process was running. `SPACE_GASS_API_STATUS = UNAVAILABLE`.

The API executable was **not** started. Technical ability to launch it is not vendor permission.

| Governance field | Recorded value |
| --- | --- |
| Licence type (14.2) | TRIAL |
| Licence type (14.5) | UNKNOWN |
| Trial expiry | UNKNOWN (not discoverable without licence reverse-engineering) |
| Licence status | UNAVAILABLE (unknown trial expiry fail-closes) |
| Automation permission | REQUIRES_CONFIRMATION |
| Adapter | `spacegass_solver_adapter` `0.3.0-spacegass` |
| Adapter compatibility (14.2) | catalog range includes 14.2 |
| Adapter compatibility (14.5) | NOT_CERTIFIED (14.5 is not in the certified catalog list) |
| External tool readiness | not READY |
| Development-evaluation readiness | NOT_READY_FOR_DEVELOPMENT_EVALUATION |
| Production use permitted | NO |

## Tool readiness

`READY_FOR_DEVELOPMENT_EVALUATION` requires enabled tool, reachable execution host, validated executable, identified version, available API/automation mechanism, certified adapter compatibility, active trial, permitted automation, certified analysis capability, and passing validation.

Those gates are not all true. SPACE GASS is therefore **not** development-evaluation ready and **not** production ready.

## Standards

AS 4100 is configured as a Discipline Intelligence reference for STRUCTURAL. That is not design-code certification.

- DESIGN_CODE_COMPLIANCE: NOT_ASSESSED
- STRUCTURAL_DESIGN_CHECK: NOT_CERTIFIED

No fake AS 4100 utilization check is implemented.

## Loads

- source: PILOT_DEFINED
- type: UDL
- magnitude: 10 kN/m
- loaded member: beam
- direction: downward; SPACE GASS sign convention to be verified at live extraction
- self-weight: OFF

## Design variables and candidates

Section selections only. Names are verified Aust300 library `<Name>` values, not colloquial compact names.

| Role | Baseline | Engineer-authorized candidates |
| --- | --- | --- |
| Columns | 310 UC 96.8 (colloquial 310UC97) | 200 UC 59.5, 250 UC 72.9, 310 UC 96.8 |
| Beams | 360 UB 44.7 (colloquial 360UB45) | 310 UB 40.4, 360 UB 44.7, 360 UB 50.7 |

9 combinatorial alternatives. Mass uses the library Name nominal kg/m × member length. Unverified names → `EVALUATION_INCOMPLETE`.

## Objectives and constraints

Objectives: minimize `steel_mass_kg`; minimize `peak_vertical_displacement_mm`.

Hard constraints: peak vertical displacement ≤ 32 mm (`PILOT_DEFINED`, not an assertion that a standard requires L/250); reaction residual ≤ 0.5%.

Feasibility language: **Pilot constraints satisfied** / **Pilot constraints not satisfied**. Not “Feasible Structural Design”, “Compliant Design”, “Safe Design”, or “Approved Design”.

## Execution architecture

Engineering OS → Optimization → Kernel JobService `engineering.optimization.evaluate` → Controlled Execution Host → SPACE GASS adapter/API → real SPACE GASS.

This path is implemented and fail-closed. `optimization.generic.test` is not structural evidence. Live SPACE GASS analysis was **not run** because API is unavailable and automation requires confirmation.

## Baseline certification

Independent equilibrium check: 10 kN/m × 8 m = 80 kN, self-weight OFF, 0.5% relative tolerance. Optimization must stop if equilibrium fails.

Displacements, member forces, units, and utilization from a real solver are NOT_RUN.

## Pareto, Review, Decision

Pareto uses succeeded runs with complete metrics and evaluated hard constraints only. Screening feasibility is not design feasibility.

No automatic winner. Human selection required.

Review may reference the Study/Run evidence. Review does not auto-approve. No structural-specific finding table.

Optimization alternatives remain distinct from Decision alternatives. Mapping is a governed reference only.

## Security

Existing External Tool RLS remains. Workspace assignment cannot override licence type, expiry, production-use flag, executable, or API availability. Trial production requests are blocked.

## Reproducibility

Identical alternative inputs produce identical model hashes. Live solver numerical reproducibility is NOT_RUN.

## Failure cases

Expired trial, unknown trial expiry, missing API, automation not permitted, adapter incompatibility, missing host, invalid section, missing results, equilibrium failure, and related cases fail closed with no fabricated metric and no Pareto eligibility.

## Production limitation

A SPACE GASS trial may support technical development and integration certification only within actual trial permissions. It does not convert into production certified, design compliant, or engineering approved.

TECHNICAL_INTEGRATION_CERTIFIED: NO (live solver path not executed).
READY_FOR_CONTROLLED_PILOT: NO.
READY_FOR_PRODUCTION: NO.
