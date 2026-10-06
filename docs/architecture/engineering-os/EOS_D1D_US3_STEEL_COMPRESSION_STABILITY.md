# EOS-D1D-US-3 US Steel Compression, Buckling & Member Stability

Bounded AISC-profile **compression / member-stability** capability. Jurisdiction-neutral squash (`Fy × A`) and Euler (`π²EI/Le²`) mechanics are reused from the common steel core. AISC-profile compressive strength curves, local/slender-element classification, φc / Ωc, effective-length factors, direct-analysis parameters, and second-order analysis parameters are **not** guessed and remain `VALIDATION_REQUIRED` / `FRAMEWORK_ONLY`.

`US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_DESIGN_AVAILABLE = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AISC edition remains `UNKNOWN_PENDING_CONFIRMATION`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `US_COMPRESSION_SQUASH_YIELD_MECHANICS` — Fy × Ag
- `US_COMPRESSION_EULER_MAJOR_MECHANICS` — Euler Pcr about the major axis
- `US_COMPRESSION_EULER_MINOR_MECHANICS` — Euler Pcr about the minor axis

Registered, not implemented (fail closed / `CHECK_UNDETERMINED`):

- AISC nominal compressive strength Pn
- LRFD design strength φcPn (φc unpopulated)
- ASD allowable strength Pn/Ωc (Ωc unpopulated)
- compressive-strength curve
- code slenderness limits
- local/slender-element classification
- torsional buckling code method
- flexural-torsional buckling code method

US-4 (bending / LTB) is out of scope.

## Common compression mechanics

AU and EU compression were reviewed. Squash and Euler live in `structural-steel/mechanics` and are reused across LRFD and ASD. Physics is not duplicated by design method. AU method IDs, AS 4100 αb / φNc, EN 1993 buckling curves, χ, γM1, National Annex, and NDP values are not reused as AISC authority. Identical physical inputs produce the same Euler output in AU, EU, and US adapters. Euler remains `ELASTIC_BUCKLING_REFERENCE` and is not AISC member compressive strength.

## LRFD / ASD separation

Every US compression evaluation requires an explicit LRFD or ASD design method. There is no default and no silent LRFD↔ASD conversion. Common mechanics are shared. Code-profile methods bind to LRFD, ASD, or genuinely common `BOTH`. LRFD factors cannot be used in ASD and vice versa. Load-basis compatibility is enforced by the US-1 resolver.

## Stability-analysis method context

Governed methods are distinguished:

- `EFFECTIVE_LENGTH_BASED`
- `DIRECT_ANALYSIS_BASED`
- `OTHER_GOVERNED_METHOD`
- `UNKNOWN`

Methods must not mix silently (for example effective-length K from one method plus analysis assumptions from another). Context existence is not a numerical AISC implementation. `UNKNOWN` fails closed.

## Effective-length governance

Effective length must be explicitly supplied, derived by a validated governed method, or provided by a governed analysis workflow. `K = 1` is never assumed. Support labels such as PINNED / FIXED / FREE do not define K. Provenance is required; AI/LLM provenance is denied. Whether K/Le is required is determined by the stability-analysis method: `DIRECT_ANALYSIS_BASED` does not automatically require or invent K.

## Second-order analysis context

Architecture can represent `FIRST_ORDER`, `SECOND_ORDER`, `P_DELTA`, `P_SMALL_DELTA`, and `OTHER_GOVERNED_ANALYSIS`. These states are not fully implemented numerical methods. D1C remains a bounded demand engine and is not complete US global-stability analysis. General FEA is not claimed.

## Member vs frame stability

Member elastic buckling and member mechanics-reference strength do not certify frame stability, story stability, global P-delta adequacy, or system-level second-order effects.

## Multi-axis buckling

Major and minor axes are implemented as Euler mechanics where governed inputs exist. Torsional and flexural-torsional modes have framework records only. Requesting those modes as numerical checks fails closed.

## Slenderness

Engineering slenderness (`Le/r`) may be reported when radius of gyration is governed. AISC code slenderness limits are never guessed.

## Element classification boundary

The classification interface exists with states `CLASSIFIED`, `VALIDATION_REQUIRED`, `NOT_REQUIRED`, and `UNSUPPORTED`. Current state is `VALIDATION_REQUIRED`. Width-thickness limits, element classes, and local-buckling reductions are not invented.

## Torsional / flexural-torsional framework

Framework records exist. Code methods are **not** implemented (`US_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED = NO`, `US_FLEXURAL_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED = NO`).

## AISC code-profile compression framework

A method registry records AISC-profile Pn / φcPn / Pn/Ωc / strength-curve methods with edition, design-method, stability-method, factor, classification, and amendment dependencies. Numerical implementation is withheld because edition, curve parameters, classification, and factors remain unvalidated.

## Factor governance

φc and Ωc sources are `VALIDATION_REQUIRED`. Requesting them fails closed. Factors are isolated by design method.

## Implemented mechanics methods

See Scope. Benchmarks:

- squash 300 N/mm² × 5140 mm² = 1,542,000 N
- Euler E = 200000 MPa, Le = 8000 mm, Iyy = 1e8 mm4 → 3,084,251 N
- Euler Izz = 2e7 mm4 → 616,850 N

These do not establish AISC conformance.

## Framework-only code methods

See Scope. Code-profile evaluation returns `CHECK_UNDETERMINED`. Mechanics utilization is not labelled as an AISC check. Orchestrated design checks remain `CHECK_UNDETERMINED` until a governed AISC strength method exists.

## Benchmark state

`US_COMPRESSION_INDEPENDENT_BENCHMARKS = PARTIAL`. Euler/squash benchmarks do not validate the AISC compression curve, local-element reduction, LRFD/ASD factors, stability-analysis method, or AISC conformance. LRFD and ASD remain separately unvalidated because neither code method is implemented.

## Conformance limitation

`IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. `STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Unknown AISC edition prevents a conformance claim. Check results are not engineering approval.

## Direct-contract profile

An international/direct-contract AISC profile may be used outside US geography. It is not building-code compliance.

## AI boundary

AI may identify missing compression inputs, possible buckling modes, missing stability-analysis method, missing effective length, missing classification, or design-method mismatch, and may explain Euler mechanics. AI may not invent K, choose the stability method, invent classification or factors, originate AISC design strength, claim conformance, or approve design. Optimizer-proposed sections must pass the same governed pipeline; undetermined compression/stability is not accepted.

## US-4 dependency

US-4 (bending / LTB) is the next bounded steel capability. It must reuse this stability/effective-length architecture and must not invent AISC LTB equations, Cb, or φb/Ωb.

Copyrighted AISC/ASCE/IBC standard text is not required at runtime and is not committed.
