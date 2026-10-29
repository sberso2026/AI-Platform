# EOS-D1D-EU-1 Eurocode Steel Standard Binding

Governed Eurocode structural-steel **standards context** for future EOS steel design. This phase is standard, part, National Annex, NDP, jurisdiction, provenance, and fail-closed selection. It does **not** implement EN 1993 member capacities, invent Nationally Determined Parameters, infer edition, or claim Eurocode conformance.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. `EU_STEEL_DESIGN_AVAILABLE = NO`. `EU_STEEL_PACK_CERTIFIED = NO`.

## Eurocode family architecture

Eurocodes are a **standard family**, not one monolithic code. The catalog registers EN 1990–EN 1999. Only **EN 1993 (steel)** is in D1D-EU implementation scope. EN 1990, EN 1991, EN 1997, and EN 1998 may be referenced as dependencies without implementing their rules.

This reuses EOS-EU-0 jurisdiction profiles and D1B `StructuralStandardContext`. A parallel EU standard framework is not created.

## EN 1993 part model

EN 1993 is not one indivisible rule set. Registered parts include EN 1993-1-1, 1-5, 1-8, 1-9, 1-10, and 1-12, each with independent status. Listing a part does not mean it is implemented.

## Version model

Each bind records standard identifier, generation family (first, second, or `UNKNOWN_PENDING_CONFIRMATION`), edition, publication date, amendment, corrigendum, supersession state, and effective date. Cross-edition mixing is forbidden. Edition is never inferred from model knowledge; if unconfirmed it is `UNKNOWN_PENDING_CONFIRMATION`, which cannot claim code conformance.

## National Annex model

A National Annex is first-class metadata: identity, country, part, edition, dates, status, parameter-set reference, source authority, validation state, and generation. Country is not a standard. France is not “one Eurocode”; it is a Eurocode base standard plus a country annex plus a project profile.

There is **no default EU National Annex**. If a rule requires nationally determined values and no compatible annex is bound, resolution fails closed (`NATIONAL_ANNEX_REQUIRED` / `CHECK_UNDETERMINED`).

Wrong-country and wrong-generation/edition annexes are rejected (`NATIONAL_ANNEX_MISMATCH` / `STANDARD_VERSION_CONFLICT`).

## NDP model

NDP records support parameter identity, part, rule, annex, country, value, units, applicability, authority, validation state, dates, and version. The governed catalog is empty in EU-1: **no values are populated or guessed**. Resolution:

1. rule does not require NDP → base rule context
2. rule requires NDP and no annex → fail closed
3. annex bound but required NDP absent or unvalued → fail closed
4. otherwise resolve the governed parameter

## Country / jurisdiction model

EOS-EU-0 pack profiles (`eu-eea`, `united-kingdom`, `other`, …) remain the jurisdiction layer. Country codes (DE, FR, NL, … and GB for UK Eurocode extensibility) live on the steel context and annex, not as a second jurisdiction framework. Eurocode use is not architecturally restricted to EU membership.

## Project standard context

A project may declare jurisdiction, generation, governing parts, annex set, and project-specific governed parameters. The workspace is not globally equal to one annex. Multi-country assets/packages in the same workspace are supported.

## Calculation context immutability

An issued calculation snapshots its resolved Eurocode context. Later project-default or catalog updates do not overwrite historical rules. Explicit calculation context overrides project defaults.

## Conflict detection

The resolver detects missing/unknown edition (for conformance claims), missing required annex, country/part/edition annex mismatch, missing required NDP, unsupported part, and generation/edition conflict.

## Multi-country support

Distinct national contexts may coexist in one tenant/workspace. Tenant/workspace isolation is preserved; profiles must not leak across tenants.

## UK extensibility

`united-kingdom` plus a UK National Annex can bind a Eurocode steel context without treating the UK as an EU member-state profile. UK numerical values are not implemented in EU-1.

## Second-generation Eurocode readiness

Generation is explicit. First- and second-generation rules cannot be mixed. Updating a catalog does not mutate issued historical calculations.

## AI boundary

AI may suggest a likely part, identify a missing annex, explain context, identify conflicts, and suggest missing NDP **metadata**. AI may not choose an annex, invent NDP or coefficients, infer edition, claim conformance, or approve design. LLM memory is not an engineering-rule authority.

## Copyright boundary

Runtime does not require copyrighted Eurocode or National Annex text. Standard PDFs, copied clauses, substantial tables, and figures must not be committed. Source-reference metadata (identifier, publisher, edition, part, validation state) is allowed without embedding content.

## EU-2 handoff

EU-2 may implement bounded tension only after resolving country, part, edition, National Annex, NDP dependencies, material/section inputs, rule authority, and conformance state through this binder. EU-1 does not implement tension equations. D1C remains the demand engine.

## Analysis and adjacent claims

AUST300 is not an EU default. European section catalogs are adapter-ready and unimplemented. EN 1993 is not assumed to be the source of every material/product property. Connections, foundations, general FEA, and SPACE GASS live certification are unchanged / not implied.
