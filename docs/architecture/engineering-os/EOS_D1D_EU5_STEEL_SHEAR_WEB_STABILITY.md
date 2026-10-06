# EOS-D1D-EU-5 Eurocode Steel Shear and Web Stability

Bounded Eurocode-profile **shear / web-stability** capability. Jurisdiction-neutral von Mises pure-shear yield (`Vy = fy × Av / √3`) and elastic plate shear buckling (`τcr = kv π² E / [12(1−ν²)(d/t)²]`) mechanics are reused from the common steel core. Eurocode shear area rules, Vpl,Rd / web-buckling resistance, slenderness limits, plate-buckling coefficients, tension-field action, partial factors, and National Annex / NDP values are **not** guessed and remain `FRAMEWORK_ONLY` / `VALIDATION_REQUIRED`.

`EU_STEEL_PACK_CERTIFIED = NO`. `EU_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `EU_SHEAR_ELASTIC_MAJOR_MECHANICS` — fy × Av / √3 for major-axis shear
- `EU_SHEAR_ELASTIC_MINOR_MECHANICS` — fy × Av / √3 for minor-axis shear
- `EU_SHEAR_ELASTIC_BUCKLING_MECHANICS` — elastic plate shear-buckling force with a supplied kv

Not implemented (registered, fail closed / `CHECK_UNDETERMINED`):

- `EU_SECTION_SHEAR_CAPACITY_CODE_PROFILE` — requires governed Av rule, partial-factor NDP, and confirmed edition
- `EU_WEB_STABILITY_CODE_PROFILE` — EN 1993-1-5 part dependency; reduction, stiffener, and panel rules unvalidated
- `EU_WEB_SLENDERNESS_CODE_PROFILE`
- `EU_TENSION_FIELD_CODE_PROFILE` — tension-field / post-buckling is not numerically executed

Von Mises yield and elastic plate buckling are **not** EN 1993 section shear or web resistance.

Bending-shear interaction, axial-shear interaction, connection shear, and torsional member design are out of scope (EU-6 and later).

## Common shear mechanics reuse

AU shear was reviewed. Von Mises conversion and elastic plate buckling live in `structural-steel/mechanics/shear`. Shear-area, stiffener, axis, and web-slenderness governance (no silent assumption) also live there. AU method IDs, AS 4100 metadata, and AUST300 defaults are not copied into the EU adapter. Identical governed physical inputs produce identical mechanics-reference outputs in AU and EU adapters.

## Shear axes

Axis is taken from the limit state (`SHEAR_MAJOR` / `SHEAR_MINOR`) or an explicit `MAJOR_SHEAR` / `MINOR_SHEAR` context. A single shear orientation is not assumed.

## Shear-area governance

Av must be an explicit governed property. Gross area, web area, or an arbitrary fraction of area is never substituted. AI-inferred provenance is rejected.

## Section shear framework

Eurocode-profile section shear resistance is registered. Numerical code-profile implementation is not executed because shear-area rules, classification/slenderness dependencies, and partial factors remain unvalidated.

## Web slenderness

Web slenderness context records clear web depth, thickness, ratio, stiffener state, and `VALIDATION_REQUIRED` for limits. Width/thickness limits and epsilon mapping are not guessed.

## Panel geometry

Panel length, stiffener spacing, and boundary metadata are represented when supplied. Transverse, longitudinal, and multi-stiffened configurations require explicit spacing when buckling context is requested. Geometry is not synthesized from section designation.

## Stiffeners

Stiffener state is explicit: `UNSTIFFENED`, `TRANSVERSE_STIFFENED`, `LONGITUDINALLY_STIFFENED`, `MULTI_STIFFENED`, or `OTHER_GOVERNED_CONFIGURATION`. Unknown state fails closed. Stiffener condition is not inferred from section type.

## Elastic shear-buckling mechanics

The implemented buckling reference uses a supplied kv. kv is never inferred from panel aspect ratio. The result is an `ENGINEERING_MECHANICS_REFERENCE`, not `EN1993_WEB_RESISTANCE`.

## Eurocode web-stability framework

Web/shear-buckling code-profile methods bind EN 1993-1-5 as a governed part dependency. EN 1993-1-1 is not assumed to contain all plate/web-stability rules. Catalogs of coefficients and reduction rules are empty.

## Standard-part dependencies

`EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL` records member-shear mechanics against EN 1993-1-1 and web/plate-stability framework against EN 1993-1-5. The applicable part is taken from method metadata, not guessed at runtime.

## Annex / NDP and partial factors

Code-profile methods require a governed partial-factor NDP. Missing required Annex/NDP fails closed. There is no default EU annex. Annex is not inferred from user location. Wrong-country and wrong-edition annexes are rejected. Second-generation methods are not mixed with first-generation methods.

## Tension-field boundary

Tension-field / post-buckling action is registered as `NOT_IMPLEMENTED` / `FRAMEWORK_ONLY`. It is not numerically executed.

## Implemented mechanics methods

Numerical validation: `BENCHMARKED` against independent hand calculations. A common elastic shear/buckling benchmark validates physics only. It does not validate Eurocode shear resistance, web slenderness rules, plate-buckling rules, partial factors, or National Annex parameters.

## Framework-only code methods

Vpl,Rd, web buckling resistance, slenderness limits, kv selection rules, and γM remain unvalidated. Requesting them as certified fails closed. A code-profile method without the required governed rule evaluates as `CHECK_UNDETERMINED`.

## Conformance limitation

`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. Human review is required before `HUMAN_VALIDATED`, `PILOT`, `CONFORMANCE_VALIDATED`, or `CERTIFIED`. Runtime does not require copyrighted standard text.

## Interaction handoff

High shear may flag `INTERACTION_REVIEW_REQUIRED`. Bending-shear reduction is not invented. Combined actions belong to EU-6.

## AI boundary

AI may identify missing shear, stiffener, or panel inputs, identify a potentially slender web, identify missing Annex/NDP, explain mechanics results, and suggest candidate sections.

AI may not invent shear area, slenderness limits, buckling coefficients, stiffener state, partial factors, or NDPs, originate code capacity, claim EN 1993 conformance, or approve design.

Optimizer-proposed sections require deterministic shear/web-stability recheck. Undetermined shear is not accepted as pass.

## EU-6 dependency

Axial + bending, biaxial, and bending + shear interaction remain unimplemented. EU-6 must reuse this shear bind, demand handoff, part-dependency model, and fail-closed NDP pattern.
