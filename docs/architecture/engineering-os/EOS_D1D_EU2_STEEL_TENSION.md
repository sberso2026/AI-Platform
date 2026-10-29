# EOS-D1D-EU-2 Eurocode Steel Tension

Bounded Eurocode-profile **tension** capability. Jurisdiction-neutral mechanics (`force = stress × area`) are reused from the common steel core. Eurocode-profile design resistance, partial factors, and National Annex / NDP values are **not** guessed and remain `VALIDATION_REQUIRED`.

`EU_STEEL_PACK_CERTIFIED = NO`. `EU_STEEL_DESIGN_AVAILABLE = NO`. `EU_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `EU_TENSION_GROSS_YIELD_MECHANICS` — fy × Ag
- `EU_TENSION_NET_FRACTURE_MECHANICS` — fu × An

Not implemented (registered, fail closed):

- `EU_TENSION_GROSS_YIELD_CODE_PROFILE` — requires governed partial-factor NDP
- `EU_TENSION_NET_FRACTURE_CODE_PROFILE` — requires governed partial-factor NDP and a net-area reduction rule

EU-3 (compression / buckling curves) is out of scope.

## Eurocode context

Every EU tension evaluation reuses EU-1 binding: jurisdiction profile, Eurocode family, **EN 1993-1-1**, edition/amendment (or `UNKNOWN_PENDING_CONFIRMATION`), National Annex identity where D1B requires it, and optional NDP set. Edition is never inferred. Unknown edition is allowed only with non-conforming `INTENDED_PROFILE`.

## National Annex and NDP

Mechanics methods do **not** require NDPs. Code-profile methods **do**. Missing required NDP or annex for a code-profile rule fails closed (`NATIONAL_ANNEX_REQUIRED` / `NDP_REQUIRED` / `CHECK_UNDETERMINED`). There is no default EU annex. Annex is not inferred from user location, locale, IP, or tenant address. Wrong-country and wrong-edition annexes are rejected.

## Engineering-rule authority

Governed authority only. `LLM_MEMORY_ONLY`, unsourced web summaries, and unverified generated rules are rejected.

## Common mechanics reuse

AU tension was reviewed. Stress×area conversion is jurisdiction-neutral and lives in `structural-steel/mechanics`. AU method IDs, AS 4100 metadata, and AUST300 defaults are not copied into the EU adapter. The same physical inputs produce the same mechanics output in AU and EU adapters; code-profile labels remain adapter-specific.

## Validation and conformance

Numerical validation of mechanics: `BENCHMARKED` against independent hand calculations (not self-referential). Engineering validation: **required**. Standard conformance: `INTENDED_PROFILE`. A benchmark is not EN 1993 conformance.

## Material and section provenance

Yield, ultimate, gross area, and net area must be governed properties with units and provenance. Missing inputs fail closed. Net area is never silently set equal to gross area. EN 1993 is not assumed to be the material-property source. AUST300 is not an EU default. A European catalog is optional; explicit properties are acceptable.

## Fail-closed

Missing demand, material, geometry, required area, standard context, required annex/NDP for code-profile rules, annex mismatch, generation conflict, unsupported part, unknown code parameter, invalid units, or a request to treat the method as certified fails closed.

## AI boundary

AI may identify missing inputs or annex/NDP metadata and explain deterministic results. AI may not choose an annex, invent NDP or partial factor, originate capacity, claim EN 1993 conformance, or approve design.

## AU / EU / US

AU inventory, validation matrix, and member orchestration are unchanged. US adapter remains unimplemented. Eurocode-specific rules remain in the EU adapter.

## EU-3 dependency

Compression / member buckling requires annex-selected parameters that EU-2 does not invent. EU-3 must reuse this tension bind, demand handoff, and fail-closed NDP pattern.
