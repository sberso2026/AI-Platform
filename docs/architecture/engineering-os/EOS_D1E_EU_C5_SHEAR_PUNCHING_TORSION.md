# EOS-D1E-EU-C5 — bounded Eurocode-profile RC shear / punching / torsion

Phase: EOS-D1E-EU-C5  
Parent: EOS-D1E-EU-C4 (PASS_WITH_LIMITATIONS)  
Mode: rule-authority audit + bounded numerical implementation + independent validation  
Verdict: BLOCKED

This phase audited the minimum governed rule set for the first Eurocode-profile shear, punching, and torsion capabilities. It did not implement numerical resistance methods. No EN 1992 coefficients, limits, or National Annex values were guessed.

## Bounded scope by family

### Shear

Intended smallest useful v1: ULS check of members **without** design shear reinforcement, consuming D1C shear demand (`N`).

Out of bounded v1: members with shear reinforcement, strut/compression limitation, axial-force modifiers.

State: **NONE_IMPLEMENTABLE**. Without-reinforcement method `BLOCKED`. With-reinforcement method `OUT_OF_SCOPE`.

### Punching

Intended smallest useful v1: interior-support concrete punching resistance **if** a governed control-perimeter rule exists.

Out of bounded v1: openings, edge/corner, eccentricity/moment transfer, punching reinforcement, maximum punching resistance.

State: **NONE_IMPLEMENTABLE**. Control perimeter `NOT_IMPLEMENTED`. Opening/edge/eccentricity `OUT_OF_SCOPE`.

### Torsion

Intended smallest useful v1: standalone torsional resistance using D1C torsion demand.

Out of bounded v1: torsion threshold, torsional reinforcement, equivalent thin-wall geometry, V+T / M+T / N+M+V+T interaction.

State: **NONE_IMPLEMENTABLE**. D1C torsion demand is `NOT_IMPLEMENTED`. Interaction `OUT_OF_SCOPE`. Ungoverned interaction was not used.

## Required rule IDs

Shear:

- `EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT` — BLOCKED_RULE_AUTHORITY
- `EU_C5_SHEAR_EFFECTIVE_GEOMETRY` — BLOCKED_RULE_AUTHORITY
- `EU_C1_PARTIAL_FACTOR_GAMMA_C` — SATISFIED_BY_EXISTING_RULE
- `EU_C1_CONCRETE_DESIGN_PROPERTIES` — SATISFIED_BY_EXISTING_RULE

Punching:

- `EU_C5_PUNCHING_CONTROL_PERIMETER` — BLOCKED_RULE_AUTHORITY
- `EU_C5_PUNCHING_CONCRETE_RESISTANCE` — BLOCKED_RULE_AUTHORITY
- `EU_C1_PARTIAL_FACTOR_GAMMA_C` — SATISFIED_BY_EXISTING_RULE

Torsion:

- `EU_C5_TORSION_RESISTANCE` — BLOCKED_RULE_AUTHORITY
- `EU_C5_TORSION_DEMAND` — BLOCKED_RULE_AUTHORITY (D1C not available)

Implementation-ready C5-specific rule IDs: none. Implemented method IDs: none.

## Authority state

C1B policy reused. Licensed standard files are not an implementation gate. Standard text is not required at runtime or in-repository. Copyrighted standard text was not reproduced. LLM-memory-only rules remain forbidden.

Allowed authority classes remain those of C1B. No C5 numerical rule reached IMPLEMENTATION_READY because the repository still has `NO_GOVERNED_COEFFICIENT_SOURCE_IN_REPOSITORY` for shear, punching, and torsion formulas.

## Source hierarchy and profile / generation

Primary evidence is D1E architecture, not a formula source:

- D1E-0 `CONCRETE_SHEAR_FRAMEWORK` / `CONCRETE_PUNCHING_SHEAR_FRAMEWORK` / `CONCRETE_TORSION_FRAMEWORK` = true, numerical flags = false
- EU adapter profiles `EU_RC_SHEAR_EN1992` and `EU_RC_PUNCHING_EN1992` (`methodScope` NOT_IMPLEMENTED)
- D1E-0 statement that punching does not assume critical perimeter, effective depth, column-face, or shear-stress rule
- D1C shear demand implemented; D1C torsion `{ status: "NOT_IMPLEMENTED" }`
- C1/C1C-R1 governed `gamma_c` and concrete design-property identities

Claimed generation/edition remain `UNKNOWN_PENDING_CONFIRMATION`. Cross-generation mixing: NO.

## NDP dependencies

EU shear profile records `gamma_c` and `gamma_s` as NDP-capable dependencies. Bounded shear v1 reuses existing `gamma_c`. Punching profile records `gamma_c`. Additional shear/punching/torsion NDPs were not invented. No default National Annex. No location-inferred annex. No guessed NDP values.

## Implemented methods

None. Fail-closed evaluators return `CHECK_UNDETERMINED` with `methodId = null` and `resistance = null`.

- Shear reuses D1C `shear.value` (`N`) then fails closed on missing resistance authority
- Punching does not treat beam shear as punching demand
- Torsion does not treat shear as torsion

## Blocked methods

All three families. Formula fingerprints on blocked records identify the fail-closed operation set, not a resistance equation. Parameter provenance records unbound values as unbound. Unprovenanced numerical constant count: 0.

## Demand reuse

- D1C shear demand reused: YES
- Parallel EU shear demand engine: NO
- D1C punching actions: NOT_APPLICABLE
- D1C torsion demand: NOT_AVAILABLE

## Combined-action boundaries

C2 uniaxial flexure, C3 N-M, and C4 N-Mx-My are reused and not reimplemented. Passing a future C5 check would not mean member conformance. Ungoverned combined-action interaction is forbidden.

## Independent benchmarks

Not implemented. External software comparison: NOT_AVAILABLE. Self-referential benchmarks: NO.

## Engineer-validation and conformance

Engineer validation: PENDING_HUMAN_ENGINEERING_REVIEW (0 methods).  
`EU_CONCRETE_STANDARD_CONFORMANCE_STATE` remains INTENDED_PROFILE.  
`EU_CONCRETE_PACK_CERTIFIED` remains NO.  
Numerical C5 validation does not equal standard conformance.

## Next-phase decision

Type: TARGETED_C5_EVIDENCE_RECOVERY  
Canonical next: EOS-D1E-EU-C5-EVIDENCE  

Recover independently governed first-generation EN 1992 shear / punching / torsion numerical-rule evidence without reproducing copyrighted standard text. Do not advance to EOS-D1E-EU-C6 while C5 families remain evidence-blocked.
