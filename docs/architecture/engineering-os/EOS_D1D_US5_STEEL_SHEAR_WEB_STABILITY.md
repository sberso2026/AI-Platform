# EOS-D1D-US-5 US Steel Shear, Web Stability & Panel Governance

Bounded AISC-profile **shear / web-stability** capability. Jurisdiction-neutral von Mises pure-shear yield (`Fy × Av / √3`) and elastic plate shear-buckling (`τcr = kv π² E / (12(1-ν²)(d/t)²)`) mechanics are reused from the common steel core. AISC-profile Vn, Aw/Av rules, h/tw limits, kv formulas, tension-field action, and φv / Ωv are **not** guessed and remain `VALIDATION_REQUIRED` / `FRAMEWORK_ONLY`.

`US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_DESIGN_AVAILABLE = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. AISC edition remains `UNKNOWN_PENDING_CONFIRMATION`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `US_SHEAR_ELASTIC_MAJOR_MECHANICS` — Fy × Av / √3
- `US_SHEAR_ELASTIC_MINOR_MECHANICS` — Fy × Av / √3
- `US_SHEAR_ELASTIC_BUCKLING_MECHANICS` — elastic plate Vcr with supplied kv

Registered, not implemented (fail closed / `CHECK_UNDETERMINED`):

- AISC section shear strength
- LRFD/ASD shear design/allowable strength
- web slenderness limits
- web stability / Cv
- tension-field action

US-6 combined action is out of scope. Connection shear, seismic shear, and detailed stiffener design are not implemented.

## Common shear mechanics

AU and EU shear were reviewed. Von Mises yield and elastic plate buckling live in `structural-steel/mechanics/shear` and are shared across LRFD and ASD. AU method IDs, AS 4100 φv, EN 1993 Vpl,Rd, χw, γM1, National Annex, and NDP values are not reused as AISC authority. Identical physical inputs produce the same Vy and Vcr in AU, EU, and US adapters.

## Major / minor shear

Axis is explicit (`SHEAR_MAJOR` / `SHEAR_MINOR` / `SHEAR` with `shearAxis`). Major-axis shear is never assumed.

## LRFD / ASD separation

Every US shear evaluation requires explicit LRFD or ASD. There is no default and no silent conversion. Common mechanics are shared. Code-profile methods bind to LRFD, ASD, or genuinely common `BOTH`. Factors cannot cross methods.

## Shear-area governance

Shear area must be an explicitly governed property. It is never silently taken as gross area, web area, or an arbitrary fraction. AISC-specific Aw/Av definitions remain `VALIDATION_REQUIRED`.

## Web geometry

Web depth and thickness are required only when elastic buckling or a future AISC web-stability method is requested. Missing geometry is not synthesized from a section designation.

## Web slenderness

A slenderness context records d/t (or h/tw geometry) when both dimensions exist. Numerical AISC limits are not invented. Flexural compactness classification does not automatically determine shear/web classification.

## Panel geometry

Panel length, stiffener spacing, and panel identity are recorded when supplied. Stiffened configurations require governed stiffener spacing. Geometry is not fabricated.

## Stiffener context

Stiffener state is explicit: `UNSTIFFENED`, `TRANSVERSE_STIFFENED`, `LONGITUDINALLY_STIFFENED`, `MULTI_STIFFENED`, or `OTHER_GOVERNED_CONFIGURATION`. It is never inferred from section family. Detailed stiffener design is not implemented.

## Elastic shear-buckling mechanics

Uniform plate formula with **supplied** kv. kv is never defaulted from aspect ratio. The result remains `ELASTIC_SHEAR_BUCKLING_REFERENCE`, not AISC web design strength.

## AISC shear-strength framework

A method registry records AISC-profile Vn / φvVn / Vn/Ωv methods with edition, design-method, shear-area, slenderness, panel, stiffener, factor, and amendment dependencies. Numerical implementation is withheld.

## AISC web-stability framework

Web-stability and slenderness methods are registered as `FRAMEWORK_ONLY` / `VALIDATION_REQUIRED`. Buckling-coefficient source is `VALIDATION_REQUIRED`.

## Post-buckling / tension-field boundary

A tension-field applicability contract exists. Action is not implemented. Eligibility is never guessed.

## Factor governance

φv and Ωv sources are `VALIDATION_REQUIRED`. Requesting them fails closed. Factors are isolated by design method.

## Local-amendment dependency

Unknown required or conflicting local amendments fail closed / `CHECK_UNDETERMINED`.

## Implemented mechanics methods

See Scope. Benchmarks:

- major/minor Vy 300 N/mm² × 5000 mm² / √3 = 866,025.4037844386 N
- elastic Vcr → 3,432,068 N

These do not establish AISC conformance.

## Framework-only code methods

See Scope. Code-profile evaluation returns `CHECK_UNDETERMINED`. Mechanics utilization is not labelled as an AISC check. Orchestrated design checks remain `CHECK_UNDETERMINED`.

## Benchmark state

`US_SHEAR_INDEPENDENT_BENCHMARKS = PARTIAL`. Common shear/buckling benchmarks do not validate Aw/Av rules, AISC Vn, slenderness limits, web-buckling rules, tension-field, LRFD/ASD factors, or AISC conformance.

## Conformance limitation

`IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. `STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Unknown AISC edition prevents a conformance claim. Check results are not engineering approval.

## Interaction handoff

Bending-shear and axial-shear interaction are not implemented. Evaluations set `interactionReviewRequired` for US-6. No reduction is invented.

## Connection / seismic boundary

Bolt shear, weld shear, bearing, tear-out, block shear, and seismic shear-member provisions are out of scope.

## Direct-contract profile

An international/direct-contract AISC profile may be used outside US geography. It is not building-code compliance.

## AI boundary

AI may identify missing shear inputs, a potentially slender web, missing panel/stiffener/factor context, and may explain mechanics. AI may not invent shear area, slenderness limits, kv, stiffener state, tension-field eligibility, factors, or AISC shear equations, originate design strength, claim conformance, or approve design. Optimizer-proposed sections must pass the same governed pipeline; undetermined shear/web is not accepted.

## US-6 dependency

US-6 (combined actions) must reuse this standard-binding, LRFD/ASD, and result/check architecture. It must not invent AISC interaction equations or treat undetermined shear/bending as pass.

Copyrighted AISC/ASCE/IBC standard text is not required at runtime and is not committed.
