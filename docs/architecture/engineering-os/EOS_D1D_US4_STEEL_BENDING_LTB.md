# EOS-D1D-US-4 US Steel Bending, Local Buckling & Lateral-Torsional Stability

Bounded AISC-profile **bending / LTB** capability. Jurisdiction-neutral elastic first-yield (`Fy × S`) and uniform-moment elastic LTB (`Mcr`) mechanics are reused from the common steel core. AISC-profile flexural strength, compact/noncompact/slender limits, Lp/Lr, Cb, local-buckling reductions, and φb / Ωb are **not** guessed and remain `VALIDATION_REQUIRED` / `FRAMEWORK_ONLY`.

`US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_DESIGN_AVAILABLE = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. AISC edition remains `UNKNOWN_PENDING_CONFIRMATION`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `US_BENDING_ELASTIC_MAJOR_MECHANICS` — Fy × Sx
- `US_BENDING_ELASTIC_MINOR_MECHANICS` — Fy × Sy
- `US_BENDING_ELASTIC_LTB_MECHANICS` — uniform-moment elastic Mcr (no Cb)

Registered, not implemented (fail closed / `CHECK_UNDETERMINED`):

- AISC section flexural strength
- LRFD/ASD major- and minor-axis flexural design/allowable strength
- AISC LTB strength
- local buckling
- compact/noncompact/slender classification
- Lp/Lr transition parameters
- Cb

US-5 (shear) is out of scope. Combined action, torsion, seismic, and connection flexural design are not implemented.

## Common bending mechanics

AU and EU bending were reviewed. First-yield lives in `structural-steel/mechanics/bending` and is shared across LRFD and ASD. AU method IDs, AS 4100 φb / αm, EN 1993 Mc,Rd, χLT, γM1, National Annex, and NDP values are not reused as AISC authority. Identical physical inputs produce the same My in AU, EU, and US adapters. Elastic bending remains `ELASTIC_BENDING_REFERENCE`.

## Common elastic LTB mechanics

Uniform-moment elastic Mcr lives in `structural-steel/mechanics/ltb`. No moment-modification factor is applied. Identical physical inputs and assumptions produce the same Mcr in AU, EU, and US. Elastic LTB remains `ELASTIC_LTB_REFERENCE` and is not AISC Mn.

## Major / minor bending

Axis is explicit from the limit state (`BENDING_MAJOR` / `BENDING_MINOR`). Major-axis bending is never assumed. LTB mechanics are evaluated only when major-axis LTB context is requested and governed unbraced-length, restraint, E, G, Iminor, J, and Cw exist.

## LRFD / ASD separation

Every US bending evaluation requires explicit LRFD or ASD. There is no default and no silent conversion. Common mechanics are shared. Code-profile methods bind to LRFD, ASD, or genuinely common `BOTH`. Factors cannot cross methods.

## Classification / compactness architecture

US-3 element-classification interface is reused. Bending classification is granular by element, axis, and limit state. Compact / noncompact / slender states are represented but not populated. Limits are never guessed. Current state is `VALIDATION_REQUIRED`.

## Local buckling

Flange, web, and other-element local-buckling architecture exists. Width-thickness thresholds, strength reductions, and effective-width rules are not invented.

## Plastic / elastic behavior boundary

Implemented mechanics are elastic first-yield. Plastic modulus, if supplied, is not treated as AISC Mp. Plastic capacity is not assumed without governed classification.

## Unbraced-length governance

Unbraced length must be explicit or determined by a governed model. It is never silently assumed. Provenance is required; AI/LLM provenance is denied.

## Restraint governance

Lateral, torsional, and warping restraint are explicit where LTB is evaluated. Generic support labels (PINNED / FIXED / FREE) do not define LTB restraint.

## Moment-gradient / Cb governance

Moment-distribution context may be recorded. Cb is never guessed. `US_CB_FACTOR_SOURCE = VALIDATION_REQUIRED`. Requesting Cb fails closed / `CHECK_UNDETERMINED`.

## Load-application context

Load position relative to the shear centre is represented. Positions other than shear-centre/centroid fail closed rather than inventing a load-height factor.

## LTB transition-parameter boundary

Lp / Lr (or equivalent) may be represented as a model. Formulas and values are not invented (`Lp = null`, `Lr = null`, `guessed = false`).

## AISC flexural-strength framework

A method registry records AISC-profile Mn / φbMn / Mn/Ωb / LTB / local-buckling methods with edition, design-method, classification, unbraced-length, restraint, moment-gradient, factor, and amendment dependencies. Numerical implementation is withheld.

## Factor governance

φb and Ωb sources are `VALIDATION_REQUIRED`. Requesting them fails closed. Factors are isolated by design method.

## Implemented mechanics methods

See Scope. Benchmarks:

- major My 300 N/mm² × 1e6 mm³ / 1000 = 300,000 N.m
- minor My 300 × 2e5 / 1000 = 60,000 N.m
- elastic LTB Mcr → 168,757 N.m

These do not establish AISC conformance.

## Framework-only code methods

See Scope. Code-profile evaluation returns `CHECK_UNDETERMINED`. Mechanics utilization is not labelled as an AISC check. Orchestrated design checks remain `CHECK_UNDETERMINED`.

## Benchmark state

`US_BENDING_INDEPENDENT_BENCHMARKS = PARTIAL`. Common bending/LTB benchmarks do not validate classification, local buckling, Cb, Lp/Lr, AISC flexural equations, LRFD/ASD factors, or AISC conformance. LRFD and ASD remain separately unvalidated because neither code method is implemented.

## Conformance limitation

`IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. `STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Unknown AISC edition prevents a conformance claim. Check results are not engineering approval.

## Member / global stability boundary

Member LTB does not certify frame stability, story stability, or global P-delta adequacy. General FEA is not claimed. D1C remains the demand and deflection handoff engine; US-4 does not add a deflection solver. Serviceability orchestration belongs to a later US phase.

## Direct-contract profile

An international/direct-contract AISC profile may be used outside US geography. It is not building-code compliance.

## AI boundary

AI may identify missing bending inputs, possible LTB, missing unbraced length, restraint, classification, or Cb context, and may explain mechanics. AI may not invent classification, unbraced length, restraint, Cb, Lp/Lr, local-buckling reduction, factors, or AISC flexural equations, originate design strength, claim conformance, or approve design. Optimizer-proposed sections must pass the same governed pipeline; undetermined bending/LTB is not accepted.

## US-5 handoff

US-5 (shear) must reuse this standard-binding, LRFD/ASD, and result/check architecture. It must not invent AISC shear equations, Cv, or φv/Ωv.

Copyrighted AISC/ASCE/IBC standard text is not required at runtime and is not committed.
