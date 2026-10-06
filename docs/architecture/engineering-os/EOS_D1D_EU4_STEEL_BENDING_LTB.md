# EOS-D1D-EU-4 Eurocode Steel Bending and Lateral-Torsional Stability

Bounded Eurocode-profile **bending / LTB** capability. Jurisdiction-neutral first-yield (`My = fy × Z`) and uniform-moment elastic LTB (`Mcr = √[(π²EI/L²)(GJ + π²EIw/L²)]`) mechanics are reused from the common steel core. Eurocode section classification, Mc,Rd / Mb,Rd, LTB curves, moment factors, reduction/imperfection factors, partial factors, and National Annex / NDP values are **not** guessed and remain `FRAMEWORK_ONLY` / `VALIDATION_REQUIRED`.

`EU_STEEL_PACK_CERTIFIED = NO`. `EU_STEEL_DESIGN_AVAILABLE = NO`. `EU_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `EU_BENDING_ELASTIC_MAJOR_MECHANICS` — fy × Zyy
- `EU_BENDING_ELASTIC_MINOR_MECHANICS` — fy × Zzz
- `EU_BENDING_ELASTIC_LTB_MECHANICS` — uniform-moment elastic critical LTB moment (major-axis members only)

Not implemented (registered, fail closed / `CHECK_UNDETERMINED`):

- `EU_SECTION_BENDING_CAPACITY_CODE_PROFILE` — requires classification, elastic/plastic/effective mapping, and partial-factor NDP
- `EU_MEMBER_BENDING_LTB_CODE_PROFILE` — requires LTB curve, reduction, moment factor, partial-factor NDP, and confirmed edition
- `EU_LTB_CURVE_SELECTION_CODE_PROFILE`
- `EU_BENDING_SECTION_CLASSIFICATION_CODE_PROFILE`

Elastic first-yield and elastic LTB are **not** EN 1993 section or member bending resistance.

Shear, combined actions, and torsional member design are out of scope (EU-5 / EU-6).

## Common bending mechanics reuse

AU bending was reviewed. First-yield conversion lives in `structural-steel/mechanics/bending`. Uniform-moment elastic LTB lives in `structural-steel/mechanics/ltb`. Unbraced-length and LTB-restraint governance (no silent assumption) also live there. AU method IDs, AS 4100 metadata, and AUST300 defaults are not copied into the EU adapter. Identical governed physical inputs produce identical mechanics-reference outputs in AU and EU adapters.

## Major / minor axes

Axis is taken from the limit state (`BENDING_MAJOR` / `BENDING_MINOR`). Major-axis bending is not assumed. Minor-axis evaluation does not apply the elastic LTB reference.

## Section bending framework

Eurocode-profile section resistance is registered as class-dependent (`ELASTIC` / `PLASTIC` / `EFFECTIVE`) but unvalidated. Plastic or effective-section resistance is not implemented from an unvalidated classification.

## Section-classification boundary

The EU classification interface from EU-3 is reused. Possible states: `CLASSIFIED`, `VALIDATION_REQUIRED`, `NOT_REQUIRED`, `UNSUPPORTED`. Current state is `VALIDATION_REQUIRED`. Class limits, width/thickness limits, and epsilon are not guessed.

## Unbraced-length governance

When LTB context is requested, unbraced length must be explicit, deterministically derived from governed restraint information, or obtained from governed analysis metadata, with provenance. AI and optimizer inference is rejected.

## Restraint context

Lateral, torsional, and warping restraint must be explicit when LTB is evaluated. A generic support label is not treated as LTB restraint.

## Moment distribution

Moment-distribution context is represented. No Eurocode moment factor is assigned silently.

## Load application

Where a load-application position is supplied, only governed shear-centre / centroid positions are accepted. Load position is not inferred from member type.

## Common elastic LTB mechanics

The implemented LTB reference is uniform-moment elastic critical moment for a doubly-symmetric prismatic member. It is an `ENGINEERING_MECHANICS_REFERENCE`, not `EN1993_MEMBER_BENDING_RESISTANCE`.

## Eurocode LTB framework

Buckling-curve/rule selection, imperfection/reduction parameters, classification, moment distribution, restraint, unbraced length, National Annex/NDP, part, and edition metadata are representable. Catalogs are empty.

## Annex / NDP and partial factors

Code-profile methods require a governed partial-factor NDP. Missing required Annex/NDP fails closed. There is no default EU annex. Annex is not inferred from user location. Wrong-country and wrong-edition annexes are rejected. Second-generation methods are not mixed with first-generation methods.

## Implemented mechanics methods

Numerical validation: `BENCHMARKED` against independent hand calculations. A common elastic bending/LTB benchmark validates physics only. It does not validate classification, Eurocode LTB curves, partial factors, or National Annex parameters.

## Framework-only code methods

Mc,Rd, Mb,Rd, LTB curves, and γM remain unvalidated. Requesting them as certified fails closed. A code-profile method without the required governed rule evaluates as `CHECK_UNDETERMINED`.

## Conformance limitation

`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. Human review is required before `HUMAN_VALIDATED`, `PILOT`, `CONFORMANCE_VALIDATED`, or `CERTIFIED`. Runtime does not require copyrighted standard text.

## Frame-stability limitation

Member LTB is not global frame stability. General second-order / global stability and general FEA are outside this bounded scope.

## AI boundary

AI may identify missing bending or restraint inputs, suggest a likely governing axis, identify missing Annex/NDP, explain mechanics results, and suggest candidate sections.

AI may not invent classification, choose unbraced length, invent restraint, choose an LTB curve, invent a moment/reduction/partial factor or NDP, originate code capacity, claim EN 1993 conformance, or approve design.

Optimizer-proposed sections require deterministic bending/LTB recheck. Undetermined bending/LTB is not accepted as pass.

D1C deflection is consumed as a handoff. No second deflection engine is created. Serviceability orchestration remains a later EU phase.

## EU-5 handoff

Shear capacity requires web geometry, shear area, and Eurocode shear rules that EU-4 does not invent. EU-5 must reuse this bending bind, demand handoff, classification framework, and fail-closed NDP pattern.
