# EOS-D1D-EU-3 Eurocode Steel Compression and Member Stability

Bounded Eurocode-profile **compression / member-stability** capability. Jurisdiction-neutral squash (`fy × A`) and Euler (`Pcr = π²EI / Le²`) mechanics are reused from the common steel core. Eurocode buckling curves, section classification limits, reduction/imperfection factors, partial factors, and National Annex / NDP values are **not** guessed and remain `FRAMEWORK_ONLY` / `VALIDATION_REQUIRED`.

`EU_STEEL_PACK_CERTIFIED = NO`. `EU_STEEL_DESIGN_AVAILABLE = NO`. `EU_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `EU_COMPRESSION_SQUASH_YIELD_MECHANICS` — fy × Ag
- `EU_COMPRESSION_EULER_MAJOR_MECHANICS` — Euler load about the major axis
- `EU_COMPRESSION_EULER_MINOR_MECHANICS` — Euler load about the minor axis

Not implemented (registered, fail closed / `CHECK_UNDETERMINED`):

- `EU_COMPRESSION_MEMBER_CAPACITY_CODE_PROFILE` — requires classification, buckling curve, reduction factor, partial-factor NDP, and confirmed edition
- `EU_BUCKLING_CURVE_SELECTION_CODE_PROFILE`
- `EU_SECTION_CLASSIFICATION_CODE_PROFILE`
- `EU_TORSIONAL_BUCKLING_CODE_PROFILE` — architecture only
- `EU_FLEXURAL_TORSIONAL_BUCKLING_CODE_PROFILE` — architecture only

Euler elastic buckling is **not** EN 1993 member compression resistance.

## Common Euler mechanics reuse

AU compression was reviewed. Squash force and Euler `π²EI/Le²` conversion live in `structural-steel/mechanics`. Effective-length governance (no silent `PINNED` / `FIXED` / `FRAME` inference) lives in `structural-steel/mechanics/effective-length`. AU method IDs, AS 4100 metadata, and AUST300 defaults are not copied into the EU adapter. Identical governed physical inputs produce identical mechanics-reference outputs in AU and EU adapters; jurisdiction-specific code capacity remains independent.

## Compression context

Every EU compression evaluation binds jurisdiction profile, Eurocode family, **EN 1993-1-1**, edition/amendment (or `UNKNOWN_PENDING_CONFIRMATION`), National Annex identity where applicable, NDP set where applicable, project and calculation standard context, and method version. Edition is never inferred. Unknown edition cannot become `CONFORMANCE_VALIDATED` or `CERTIFIED`.

Demand is consumed from D1C. Axial demand is not recomputed.

## Effective-length governance

Effective length must be explicitly supplied, derived by a validated deterministic rule, or obtained from a governed analysis result, with provenance. Labels such as `PINNED` / `FIXED` / `FRAME` do not silently imply a length. AI and optimizer inference of effective length is rejected.

## Multi-axis stability

`MAJOR_AXIS` and `MINOR_AXIS` are implemented as mechanics references. `TORSIONAL` and `FLEXURAL_TORSIONAL` are representable in the axis catalog but are not numerically implemented. All evaluated valid modes are preserved. Governing selection among comparable **mechanics** modes is deterministic (lowest reference load). Mechanics reference and Eurocode-profile capacity are not compared as equivalent authority.

Member buckling is not global frame stability. General second-order / global stability and general FEA are outside this bounded scope.

## Eurocode profile boundary

Section classification, code slenderness, buckling-curve selection, imperfection/reduction parameters, and design partial factors have governed interfaces. Catalogs are empty. Missing required National Annex / NDP for a code-profile method fails closed. There is no default EU annex. Annex is not inferred from user location. Wrong-country and wrong-edition annexes are rejected. Second-generation Eurocode methods are not silently mixed with first-generation methods.

AUST300 is not an EU default. A European section catalog is optional; explicit governed properties are valid.

## Implemented mechanics methods

Numerical validation of mechanics: `BENCHMARKED` against independent hand calculations (not self-referential). A common Euler benchmark validates common mechanics only. It does not validate Eurocode buckling curves, reduction rules, partial factors, or National Annex parameters.

## Framework-only code methods

Eurocode member compression resistance, classification limits, buckling-curve coefficients, and γM1 remain unvalidated. Requesting them as certified fails closed. A code-profile method without the required governed rule evaluates as `CHECK_UNDETERMINED`.

## Utilization and check state

Mechanics-reference utilization is not labelled as a Eurocode design check. Design-check orchestration for EU compression returns `CHECK_UNDETERMINED` while code-profile capacity remains unavailable. `CHECK_SATISFIED` is not engineering approval.

## AI boundary

AI may identify missing stability inputs, suggest potential buckling modes, explain Euler mechanics, identify missing Annex/NDP, suggest candidate sections, and explain deterministic outputs.

AI may not choose effective length, choose a buckling curve, invent imperfection/reduction/classification/NDP/partial-factor values, originate code capacity, claim EN 1993 conformance, or approve design.

Optimizer-proposed sections require deterministic compression/stability recheck. Undetermined stability is not accepted as pass.

## Conformance limitation

`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. Human review is required before any method may become `HUMAN_VALIDATED`, `PILOT`, `CONFORMANCE_VALIDATED`, or `CERTIFIED`. Runtime does not require copyrighted standard text.

## EU-4 dependency

Bending / lateral-torsional buckling requires annex-selected parameters and classification that EU-3 does not invent. EU-4 must reuse this compression bind, effective-length governance, demand handoff, and fail-closed NDP pattern.
