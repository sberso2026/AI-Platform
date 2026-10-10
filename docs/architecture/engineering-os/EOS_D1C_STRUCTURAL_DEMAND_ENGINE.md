# EOS-D1C Structural Demand Engine

Bounded deterministic demand for Structural members. Demand only. Not steel/concrete/connection capacity, design-code resistance, general FEA, second-order, dynamic/seismic analysis, SPACE GASS, or optimization.

Package decision: contracts in `@rtb/types` `structural-demand.ts`; engine in `@rtb/engineering-os` `src/structural-demand/`. Reuses D1A objects (`LoadCase`, `LoadCombination`, `AnalysisResult`, `DesignCheck`, `CapacityResult`, `UtilizationResult`) and D1B `StructuralStandardContext`. No persistence migration.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Supported analytical scope

1D prismatic members, linear first-order statics, Euler-Bernoulli bending where deflection is computed.

| Boundary | Loads | Reactions | Shear | Moment | Deflection |
|---|---|---|---|---|---|
| SIMPLE_SIMPLE | full-span UDL, point force, applied couple on the span, full-span linearly varying | yes | yes | yes | UDL, point, couple (not linear varying) |
| FIXED_FREE | same families; couple deflection only when applied at the free end | yes | yes | yes | UDL and point (not linear varying) |

Axial demand: point/nodal force with `direction = AXIAL`. No buckling.

Linear superposition of the primitives above on one member and one boundary condition.

Legacy simply-supported UDL (`V = wL/2`, `M = wL²/8`) remains the `SYNTHETIC_SS_BEAM_UDL_STATICS` path and is computed by this engine.

## Unsupported scope

Returns `UNSUPPORTED_CASE` (fail closed, no fabricated numbers):

- other support conditions (including inferred supports)
- partial-span distributed loads
- surface/solid FEA loading
- GLOBAL/LOCAL_FRAME loads that are not already member-local resolved
- missing/unknown units
- second-order, nonlinear, dynamic, seismic engines
- general frame/matrix FEA
- analytical torsion (never calculated, and never reported as zero). An externally supplied member torsion may be validated and transported; the engine does not derive it from loads, eccentricity, stiffness, or a structural model.
- deflection without explicit `E` and `I` (result field `NOT_IMPLEMENTED`, not `0`)
- jurisdiction code factors invented by the generic engine

## Load taxonomy

Generic action categories: `DEAD`, `SUPERIMPOSED_DEAD`, `LIVE`, `EQUIPMENT`, `PIPING`, `WIND`, `SEISMIC`, `THERMAL`, `PRESSURE`, `IMPOSED_DEFORMATION`, `CONSTRUCTION`, `ACCIDENTAL`, `OTHER`.

No code-specific combination-factor semantics in the taxonomy.

## Load application

`POINT_FORCE`, `POINT_MOMENT`, `UNIFORM_DISTRIBUTED_LOAD`, `LINEARLY_VARYING_DISTRIBUTED_LOAD`, `NODAL_FORCE`, `NODAL_MOMENT`.

Coordinate systems: `GLOBAL`, `LOCAL_MEMBER`, `LOCAL_FRAME`. The engine does not silently transform GLOBAL/LOCAL_FRAME into member axes. Provide `LOCAL_MEMBER` or `memberLocalResolved = true`.

## Boundary conditions

Explicit only: `SIMPLE_SIMPLE`, `FIXED_FREE`. Cantilever is fixed at member start (`x = 0`) and free at `x = L`.

## Combination architecture

Generic evaluator: `sum(factor_i × load_case_i)` using already-bound factors (`HUMAN_ENTERED` or a future jurisdiction pack).

`provideLoadFactors` is the AU (AS/NZS 1170) / EU (EN 1990 + National Annex) / US (ASCE 7) adapter boundary. D1C packs are `FRAMEWORK_ONLY` and do not emit code factors.

## Sign convention

- Member `x` from start (`0`) to end (`L`)
- Transverse load positive downward
- Transverse reaction positive upward
- Shear positive left-face upward (`dV/dx = -w` for downward `w`)
- Moment positive sagging (compression in the top fiber)
- Deflection positive downward
- Applied couple positive clockwise
- Axial positive tension

## Units

Explicit on every magnitude. Canonical internal SI: `N`, `N.m`, `m`, `N/m`, `Pa`, `m4`. Accepted inputs include `kN`, `kN/m`, `kN.m`, `MPa`, `GPa`.

Numerical comparison uses `ENGINEERING_NUMERICAL_TOLERANCE` (relative `1e-8`, absolute force `1e-4 N`, moment `1e-4 N.m`). Equilibrium residuals are checked; results are not compared with exact float equality.

## Method registry

Stable IDs: `SS_BEAM_UDL`, `SS_BEAM_POINT_LOAD`, `SS_BEAM_APPLIED_MOMENT`, `SS_BEAM_LINEAR_VARYING`, `CANTILEVER_UDL`, `CANTILEVER_POINT_LOAD`, `CANTILEVER_APPLIED_MOMENT`, `CANTILEVER_LINEAR_VARYING`, `LINEAR_SUPERPOSITION`, `AXIAL_DIRECT`, `SYNTHETIC_SS_BEAM_UDL_STATICS`.

Maturity of implemented formulas: `IMPLEMENTED`. Unit tests do not promote methods to `CERTIFIED`.

## Benchmark sources

Independent closed-form checks (mechanics of materials beam tables / independently derived hand calculations), not only self-consistency of the implementation:

- SS UDL: `RA = RB = wL/2`, `Mmax = wL²/8`, `δmax = 5wL⁴/384EI`
- SS mid-span point: `RA = RB = P/2`, `Mmax = PL/4`, `δmax = PL³/48EI`
- Cantilever UDL: `RA = wL`, `Mfix = wL²/2` hogging, `δtip = wL⁴/8EI`
- Cantilever tip point: `RA = P`, `Mfix = PL`, `δtip = PL³/3EI`
- Force and moment equilibrium of the free-body diagram

## Provenance

Every demand result carries load cases, combination/factors, member, boundary, geometry, stiffness when used, tool/tool version/method, D1B jurisdiction/standard/edition/annex, timestamp, evidence. Human review is required. Approval is not automatic.

Governed demand requires a D1B `StructuralStandardContext` or an explicit `JURISDICTION_NEUTRAL_STATICS` bind. Pure statics must not fabricate a design-code bind.

## AI boundary

AI may help assemble candidate cases, explain results, and flag inconsistencies. AI must not originate governed load magnitudes without evidence, alter deterministic results, declare design adequacy, or silently select the standard. `llmOriginated = false`.

## D1D / D1E handoff

`toDemandHandoff` maps demand onto D1A `AnalysisResult` member actions, reactions, and deflections, with `futureCapacityResultRef = null` and `futureUtilizationResultRef = null`. Foundation reactions are exported for `FoundationInterface` without geotechnical bearing/settlement.

Cross-discipline loads carry `sourceDiscipline`, `sourceObjectId`, `revision`, `evidence`, and `status` for later D1K sources (mechanical, piping, electrical, process, civil).

## Global architecture

The demand engine is jurisdiction-neutral physics. Code factors belong in AU/EU/US packs. Not EU-only, not AU-only. EU high-water-mark inherited. Pilot capabilities unchanged; D1C is not enabled as a new pilot design-check product.
