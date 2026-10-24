# EOS-D1D-AU-5 Australian Steel Combined Actions

Bounded Australian-profile **combined-action / interaction** capability on the D1D-0 steel core and AU-1 through AU-4 engineering-rule model. Intended standard profile remains AS 4100. This phase does **not** certify AS 4100 interaction equations and does **not** invent them.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AU steel pack remains **not certified**. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. `AS4100_CONFORMANCE_VALIDATED = NO`.

## Scope

Implemented (framework only):

- governed `SteelCombinedActionContext` and `CombinedActionResult`
- interaction-required detection from D1C demand
- informational component utilization vector (axial, major bending, minor bending, shear)
- fail-closed same-combination and precondition checks
- `CHECK_UNDETERMINED` for every interaction type until a validated numerical rule exists

Explicitly unsupported / `VALIDATION_REQUIRED`:

- AS 4100 member interaction equations, exponents, and coefficients
- moment modifiers, effective lengths, and section classification invented for interaction
- universal `N/Nc + M/Mc` or `N/Nc + Mx/Mcx + My/Mcy` relationships
- linear biaxial interaction assumed as code
- shear-related bending reduction guessed from AU-4
- torsional combined actions
- connection interaction (bolts, welds, block shear, bearing, tear-out)
- plate-girder advanced interaction, post-buckling interaction, fatigue, seismic ductility, fire

D1C remains the demand source. AU-5 does not recalculate axial, bending, or shear demand. AU-1 through AU-4 capacities are reused by reference where supplied; they are not recomputed inside interaction methods.

## Interaction taxonomy

| Type | Detection | Numerical method |
| --- | --- | --- |
| `TENSION_BENDING` | tensile axial + major and/or minor moment | FRAMEWORK_ONLY |
| `TENSION_BIAXIAL_BENDING` | tensile axial + major and minor moment | FRAMEWORK_ONLY |
| `COMPRESSION_BENDING` | compressive axial + major and/or minor moment | FRAMEWORK_ONLY |
| `COMPRESSION_BIAXIAL_BENDING` | compressive axial + major and minor moment | FRAMEWORK_ONLY |
| `AXIAL_BIAXIAL_BENDING` | any axial + major and minor moment | FRAMEWORK_ONLY |
| `BIAXIAL_BENDING` | simultaneous major and minor moment | FRAMEWORK_ONLY |
| `BENDING_SHEAR` | moment + shear | FRAMEWORK_ONLY |
| `AXIAL_SHEAR` | axial + shear | FRAMEWORK_ONLY |

`IMPLEMENTED_INTERACTION_METHODS = []`  
`FRAMEWORK_ONLY_INTERACTION_TYPES` = all eight types above.

## Component utilizations

Independent D/C rows may be displayed from existing component demand and capacity. They are informational only (`informationalOnly = true`, `equalsInteractionCheck = false`). A component vector is **not** a combined-action pass/fail result.

## Interaction-required detection

Detection is deterministic from simultaneous D1C actions (plus explicit extra minor-axis moment where supplied). Detection does **not** determine adequacy. Missing a validated interaction rule yields `CHECK_UNDETERMINED` / `INTERACTION_RULE_VALIDATION_REQUIRED`.

## Load-combination consistency

Axial, moment, and shear from unrelated load combinations must not be mixed unless a governed envelope method exists (none is implemented). Cross-combination interaction fails closed. Same-combination demand is accepted.

## Rule authority

Every interaction method has `ruleId`, `authorityType`, `technicalBasisRef`, applicability, required inputs, method version, benchmark refs, validation state, and conformance state. Allowed authorities remain governed D1D classes. `LLM_MEMORY_ONLY`, unsourced web summaries, and unverified generated rules are rejected.

Standard profile and validation state remain separate. Edition is not inferred silently.

## Tension + bending

Governed interface for tension + uniaxial and tension + biaxial bending. Numerical combined-action result is not produced. `CHECK_UNDETERMINED`.

## Compression + bending

Governed interface for compression + uniaxial and compression + biaxial bending. Effective length, buckling axis, LTB/restraint, and moment-distribution context remain explicit on the member stability context. Missing stability does not invent lengths; the interaction check stays `CHECK_UNDETERMINED`.

## Biaxial bending

Major- and minor-axis moment interaction is detected. Linear `Mx/Mcx + My/Mcy` is **not** assumed.

## Bending + shear

AU-4 deferred this interaction. AU-5 provides the framework. No bending reduction is invented. `CHECK_UNDETERMINED`.

## Axial + shear

Architecture only. No universal axial/shear equation. Numerical check only when a governed rule exists (none in AU-5).

## CHECK_UNDETERMINED behavior

`CHECK_UNDETERMINED` is mandatory when the interaction rule is missing or unvalidated, classification is missing, stability context is incomplete for a future numerical rule, component capacity is unavailable, or a standard parameter is unknown. Fail-closed also covers incompatible combinations, unknown coefficients, unsupported combinations requested as certified, invalid units, and standard-profile mismatch.

`CHECK_SATISFIED` would still not mean `DESIGN_APPROVED`, `ISSUED`, `IFC`, or `ENGINEERING_APPROVED`.

## Implemented numerical rules

None. `AU_INTERACTION_INDEPENDENT_BENCHMARKS = NOT_APPLICABLE`.

## Framework-only rules

All eight interaction types in the AU interaction method registry. Binding state `FRAMEWORK_ONLY`. Conformance `INTENDED_PROFILE`. Implementation maturity of the **framework** is `IMPLEMENTED`; numerical AS-profile methods remain `FRAMEWORK_ONLY` / `VALIDATION_REQUIRED`.

## Benchmark status

Not applicable until a numerical interaction rule is implemented. Self-reference is prohibited. Independent hand calculation, recognized reference, human-reviewed calculation, or trusted software comparison will be required for any future numerical method.

## Conformance limitations

`AS4100_STANDARD_EDITION = UNKNOWN_PENDING_CONFIRMATION`  
`AS4100_AMENDMENT_STATE = UNKNOWN_PENDING_CONFIRMATION`  
`AS4100_CONFORMANCE_VALIDATED = NO`  
`AU_STEEL_PACK_CERTIFIED = NO`  
`IMPLEMENTATION_MATURITY = IMPLEMENTED` (framework)  
`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`  
Mechanics or convenient mathematics are not labelled AS 4100 interaction.

## AI boundary

AI may detect likely interaction requirements, explain component utilizations, identify missing rules or inputs, suggest candidate sections, and explain governing deterministic results.

AI may **not** invent an interaction equation, exponent, or coefficient; combine incompatible cases; invent section classification; claim AS conformance; change component results; or approve design.

## Human validation

`HUMAN_VALIDATED` / `PILOT` / `CERTIFIED` require engineer confirmation of the interaction equation, applicability, component capacities, stability assumptions, section classification, benchmarks, standard profile, and conformance. Automatic engineering approval is forbidden.

Optimizer candidates must be rechecked against all individually applicable deterministic checks and any validated combined-action checks. Undetermined interaction cannot be treated as pass.

Unfinished combined-action capability is not exposed automatically to Profile A (`AU_COMBINED_PILOT_EXPOSURE = NO`).

## AU-6 handoff

EOS-D1D-AU-6: serviceability criteria referencing D1C deflection plus design orchestration, still without claiming AS 4100 pack certification.
