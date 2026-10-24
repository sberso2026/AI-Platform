# EOS-D1E-EU-C1 Eurocode Concrete Rule-Authority Policy

C1B policy correction. Licensed standard files are not a software implementation gate. Formal standard conformance remains stricter than reference implementation.

`EU_CONCRETE_PRODUCT_CLAIM_LEVEL` remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Conformance remains `INTENDED_PROFILE`. Pack remains uncertified.

## Copyright / reproduction boundary

EOS must not commit or reproduce full EN standards, substantial clause text, copied tables or figures, commentary, or protected explanatory text.

EOS may store governed engineering representations: rule identifiers, structured equation logic, parameter identifiers, independently governed parameter values, units, applicability, standard-profile metadata, dependency metadata, validation fixtures, and provenance references.

A PDF/file licence is not a numerical implementation prerequisite. Runtime and the repository must not require the copyrighted standard document.

Commercial/IP review of standard-content licensing is separate from engineering validation.

## Standard-document independence

Exact profile identity (family, part, generation, edition, amendment) remains an engineering requirement and can be bound by human/configured identity without ingesting the standard. Identity is not inferred from model memory. Family `EN 1992` and part `EN_1992_1_1` are already identified as the intended profile.

## Rule-authority model

Allowed: `AUTHORITATIVE_STANDARD_DERIVED`, `VALIDATED_ENGINEERING_REFERENCE`, `HUMAN_AUTHORED_VALIDATED_RULE`, `ESTABLISHED_ENGINEERING_MECHANICS`, `CERTIFIED_EXTERNAL_TOOL_REFERENCE`, `OTHER_GOVERNED_ENGINEERING_SOURCE`.

Forbidden: `LLM_MEMORY_ONLY`, `UNSOURCED_WEB_RULE`, `BLOG_OR_FORUM_ONLY`, `GENERATED_UNVALIDATED_RULE`.

Initial numerical implementation does **not** require `AUTHORITATIVE_STANDARD_DERIVED`. Bounded implementation may proceed under `VALIDATED_ENGINEERING_REFERENCE` or `HUMAN_AUTHORED_VALIDATED_RULE` or `ESTABLISHED_ENGINEERING_MECHANICS` when triangulation and validation requirements are met.

## Multi-source validation

A rule implemented without standard-derived authority needs at least: one governed engineering rule source, plus one independent corroborating source or independently derived benchmark, plus deterministic test evidence. Syndicated duplicates do not count as independent. Secondary sources still require validation.

## Formula fingerprints and parameter provenance

Equations are stored as executable/structured operations and hashed to a deterministic fingerprint. No unexplained magic numbers. Every parameter records id, value or value-mode, units, authority, source, applicability, version, and validation status. Calculation-input material properties are not pack constants.

## Reference / numerical / engineer / conformance validation

- **REFERENCE_IMPLEMENTED**: governed source, traceable formula/parameters, explicit applicability, deterministic implementation, no unsupported claim. Does not require a licensed standard file.
- **NUMERICALLY_VALIDATED**: independent golden cases, boundary tests, unit tests, invalid-input tests, cross-check source.
- **ENGINEER_VALIDATED**: explicit human engineering review. Required before promotion above reference.
- **CONFORMANCE_VALIDATED**: formal verification against exact standard profile, part, edition/generation, amendments, National Annex/NDP where applicable, and the engineering validation matrix. C1B does not claim this.

Engineering-reference implementation is not standard conformance. Numerical validation is not standard conformance. Authoritative profile validation remains required for conformance.

## National Annex / NDP

No default National Annex. Location must not infer an annex. A rule proven independent of national choice may proceed without an annex. A confirmed NDP-dependent rule without annex evidence stays unresolved for that rule only. NDP vs base-standard classification is evidence-based; placeholder `ndpCapable` flags are not legal status.

## AI authority

The model may locate candidate rule concepts. It must not originate accepted numerical values. Model-suggested parameters require external validation. AI cannot approve, claim conformance, choose annexes, or supply NDPs.

## C1 inventory after C1B

Implementable now (bounded subset): concrete characteristic properties, reinforcement characteristic properties, and ULS flexural concrete-tension omission (fail-closed; not an invented coefficient).

Still blocked pending governed coefficient/formula sources (not pending a PDF): design-property conversion, partial factors, compression response, strain limits, reinforcement response/strain states, stress-block/section model.

C1 may resume that bounded subset. Formal EN 1992 conformance remains unclaimed.
