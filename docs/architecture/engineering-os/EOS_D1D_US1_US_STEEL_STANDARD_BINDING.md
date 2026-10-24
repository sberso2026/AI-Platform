# EOS-D1D-US-1 US Steel Standard Binding

Governed US structural-steel **standards / code-adoption / design-profile** context for future EOS steel design. This phase is standard-family, edition, LRFD/ASD, unit-system, building-code adoption, local-amendment, ASCE dependency, optional seismic dependency, provenance, and fail-closed resolution. It does **not** implement AISC capacities, ASCE load combinations, AISC 341 equations, local amendment values, or US section data.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. `US_STEEL_DESIGN_AVAILABLE = NO`. `US_STEEL_PACK_CERTIFIED = NO`. `AISC_STANDARD_EDITION = UNKNOWN_PENDING_CONFIRMATION`.

## US standards ecosystem

US structural design is an **ecosystem**, not one monolithic standard. Registered identities:

- AISC 360 — in-scope steel specification architecture
- IBC-type building-code adoption context (not a steel specification)
- ASCE 7 — load-basis dependency (D1C remains the demand engine)
- AISC 341 — optional seismic steel dependency
- ASTM — material/product source boundary
- RCSC / AISC 358 — connection-standard dependencies, unimplemented

This reuses EOS-EU-0 jurisdiction profiles and D1B `StructuralStandardContext`. A parallel US standard framework is not created. AU, EU, and US remain three governance patterns on one global steel core.

## AISC family and editions

AISC 360 is registered without a silently selected edition. Version metadata includes publisher, family, identifier, edition, publication date, amendment/errata, supersession, and effective date. Cross-edition mixing is forbidden. Unconfirmed edition is `UNKNOWN_PENDING_CONFIRMATION` and cannot claim `CONFORMANCE_VALIDATED` or certification.

## LRFD / ASD and units

Design method is explicit `LRFD` or `ASD`. There is no default. Design method is not a unit system: US customary and SI are independent presentation contexts. Common mechanics remain dimensionally consistent; US-1 does not duplicate physics formulas.

Silent LRFD↔ASD conversion is forbidden. Future rules bind to LRFD, ASD, or genuinely common `BOTH` — never by silent transform.

## Building-code adoption vs steel specification

`BuildingCodeAdoptionContext` records jurisdiction, adopting authority, building-code family/edition, local amendment set, referenced standards, and source authority. Building code and AISC specification remain separate identities. Jurisdiction is not a standard: California is not “one AISC,” it is an adoption context plus referenced steel standard plus edition plus amendments plus project profile.

User location, IP, locale, and tenant address never select a code profile.

## Local / state amendments

Amendment records exist (identity, jurisdiction, authority, base code, edition compatibility, dates, authority, validation). The governed catalog is empty: **no values are guessed**. An amendment tied to the wrong base-code edition fails closed (`LOCAL_AMENDMENT_CONFLICT`).

## Direct-contract profile

Projects may bind AISC / ASCE / ASTM by contract without a local building-code adoption (industrial, mining, owner standards, international US-standard projects). This is required for global-first architecture. AISC use is not hard-coded to US geography; `other` jurisdiction profiles may resolve a US steel context.

## ASCE, seismic, and connections

ASCE 7 is a referenced load-standard dependency. Edition is explicit or unknown; it is never inferred from the AISC edition. US-1 does not create a load-combination engine. Load-basis / design-method compatibility is represented (strength vs allowable) without implementing factors.

Seismic (AISC 341-type) is optional and must be explicitly applicable. When it applies, edition is explicit. Connection-standard dependencies are modeled; bolt/weld/RCSC/AISC 358 design is not implemented.

## Material and section boundaries

AISC is not the universal material-property source. ASTM, manufacturer catalogs, project specifications, and approved databases are allowed future sources; US-1 does not populate strengths. AUST300 is not a US default. EU section catalogues are not a US default. A designation without a governed catalog/version does not create engineering properties.

## Resolution, precedence, and conflicts

Deterministic path: project → jurisdiction → adoption (or direct contract) → referenced standards → AISC profile → local amendments → project exceptions.

Fail-closed reasons include missing AISC edition (for conformance claims), missing design method, missing required adoption, missing load-standard context, local-amendment conflict, required seismic context, version conflict, unsupported profile, and unresolved source conflict.

Source precedence kinds are modeled (adopted code, referenced standard, amendment, contract, owner standard, approved exception). Actual order is configured per context; EOS does not invent a universal legal hierarchy. Unresolved conflict returns `STANDARD_CONTEXT_CONFLICT`.

Issued calculation context is immutable. Historical editions are not overwritten.

Project overrides require explicit source, authority, scope, conflict behavior, and human confirmation.

## AI, copyright, and tenancy

AI may identify missing edition/method/adoption/seismic context and explain resolution. AI may not choose edition or LRFD/ASD, invent amendments, factors, or seismic parameters, claim compliance, or approve design.

Runtime does not require copyrighted AISC/ASCE/IBC/ASTM/RCSC text. Source-reference metadata is allowed without body text.

Tenant/workspace isolation is preserved. Standard profiles must not leak across tenants. The workspace is not globally equal to one code profile.

## US-2 handoff

US-2 may implement bounded tension only after resolving steel standard, edition, design method, unit context, adoption where relevant, load-standard dependency, local amendment context, material/section inputs, rule authority, and conformance state through this binder. US-1 does not implement tension equations.
