# EOS engineering standards reference and intellectual-property policy

Path: docs/architecture/engineering-os/EOS_ENGINEERING_STANDARDS_REFERENCE_AND_IP_POLICY.md

This document is the current global Engineering OS policy for referencing an engineering standard, independently implementing a method based on that standard, and avoiding redistribution of copyrighted standards content. It applies to every EOS discipline. It is not limited to EN 1992 or to C7.

It does not implement a calculation, change a formula, change a database schema, change an API, or complete a human review. Historical review records remain historical.

## 1. Purpose

EOS implements engineering calculations as RTB methods. Those methods may be based on an external standard. Storing or redistributing the copyrighted standards document is a separate act from implementing the engineering method.

LICENSED_STANDARD_DOCUMENT_IN_REPOSITORY_REQUIRED: NO

AUTHORITATIVE_ENGINEERING_BASIS_REQUIRED: YES

ENGINEERING_METHOD_TRACEABILITY_REQUIRED: YES

INDEPENDENT_VALIDATION_REQUIRED: YES

COPYRIGHTED_STANDARD_REPRODUCTION_REQUIRED: NO

## 2. Policy principles

EOS may implement an independently authored calculation when the engineering basis is authoritative and traceable, even when the complete copyrighted standard is not stored in the repository.

The following interpretations are forbidden:

AI_MEMORY_IS_AUTHORITATIVE: NO

RANDOM_WEB_SOURCE_IS_AUTHORITATIVE: NO

UNTRACEABLE_FORMULA_ALLOWED: NO

UNVERIFIED_ENGINEERING_METHOD_ALLOWED: NO

SELF_REFERENCE_COUNTS_AS_INDEPENDENT_VALIDATION: NO

A defensible engineering basis is still required before a deterministic numerical method is bound.

## 3. Standards reference policy

EOS may identify an engineering basis with these references:

STANDARD_FAMILY

STANDARD_IDENTIFIER

STANDARD_EDITION

STANDARD_GENERATION

AMENDMENT

CORRIGENDUM

CLAUSE_REFERENCE

ANNEX_REFERENCE

METHOD_REFERENCE

JURISDICTION_PROFILE

Citation identifies the basis. Citation does not distribute the underlying standard.

STANDARD_REFERENCE_ALLOWED: YES

## 4. Independent implementation policy

An engineering method is an RTB specification and an RTB implementation. It is based on the cited standard. It is written by RTB. It is not a copy of the standards publication and it is not a copy of another party's software.

INDEPENDENT_IMPLEMENTATION_ALLOWED: YES

METHOD_MUST_BE_EXPRESSED_AS_RTB_ENGINEERING_SPECIFICATION: YES

The RTB specification defines method purpose, inputs, units, variables, coefficients, intermediate states, outputs, applicability, limitations, failure conditions, jurisdiction and profile hooks, source traceability, and validation requirements.

## 5. Copyright and intellectual-property boundary

This section is a product-governance boundary. It is not a legal opinion.

EOS may store a standard identifier, family, edition, amendment or corrigendum identifier, clause or annex reference, method identifier, an independently authored mathematical specification, independently authored variable definitions, independently authored implementation notes, independently authored algorithms, test cases, validation evidence, applicability limits, and jurisdiction or profile metadata.

EOS does not, by default, store or distribute complete standards PDFs, substantial verbatim standards text, large copied tables, copied diagrams, copied commentary, substantial copied clause collections, or content intended to substitute for purchasing or accessing the standard, unless RTB has an explicit lawful right to do so.

FULL_STANDARD_REPRODUCTION_DEFAULT: NO

SUBSTANTIAL_VERBATIM_REPRODUCTION_DEFAULT: NO

## 6. Source hierarchy

Tier 1, engineering authority, identifies the method, the standard family, the edition or generation where it can be established, the clause, annex, or method location, and the applicability and provenance. Examples are a published standard identification, official standards-body metadata, an official regulator or government technical publication, official Eurocodes or JRC technical documentation, a recognized engineering-institution publication, and an authoritative publicly available technical specification.

Tier 2, method reconstruction and interpretation, establishes mathematical relationships, variable meanings, assumptions, and an independently authored implementation specification. Examples are official technical guidance, recognized textbooks, peer-reviewed publications, official worked examples, standards-body explanatory material, and reputable engineering-institution guidance.

Tier 3, independent validation evidence, verifies the EOS implementation. Examples are official worked examples, published worked examples, independent hand calculations, independent software comparison, laboratory or reference results, third-party engineering calculations, and peer-reviewed benchmark results.

A source may serve more than one role only where that reuse does not compromise independence. An internal EOS result is not its own independent reference.

## 7. Exact edition policy

The retired gate is LICENSED_EXACT_NORMATIVE_TEXT_REQUIRED_BEFORE_IMPLEMENTATION.

The current rule is EXACT_ENGINEERING_BASIS_SHOULD_BE_ESTABLISHED_WHERE_MATERIAL.

EXACT_EDITION_POLICY_CANONICALIZED: YES

Where a standard edition materially changes equations, coefficients, scope, safety factors, applicability, or results:

EDITION_BINDING_REQUIRED: YES

If that edition cannot yet be established, the method status is REFERENCE_ONLY_OR_UNBOUND, unless the method is independently established and explicitly governed as edition-neutral.

EOS must not claim exact-edition compliance while edition information is unresolved.

## 8. Jurisdiction and profile architecture

EOS stays jurisdiction-agnostic. The architecture is:

ENGINEERING_METHOD, then BASE_METHOD, then STANDARD_GENERATION, then STANDARD_EDITION, then REGIONAL_PROFILE, then NATIONAL_ANNEX, then PROJECT_PROFILE.

Examples of profiles that may be bound explicitly include an EU base profile, a UK National Annex, an Australian project profile, a German National Annex, a French National Annex, and a project-specific governed profile. None of those profiles is the universal default.

JURISDICTION_PROFILE_ARCHITECTURE_PRESERVED: YES

NATIONAL_ANNEX_HARD_CODED_GLOBALLY: NO

## 9. Method-specification requirements

Each bound numerical method has an independently authored RTB specification. The specification names purpose, inputs, units, variables, coefficients, intermediate states, outputs, applicability, limitations, failure conditions, jurisdiction and profile hooks, source traceability, and validation requirements.

The specification does not copy lengthy explanatory text from a standard.

## 10. Deterministic calculation requirements

The calculation path is structured engineering inputs, then a governed RTB method specification, then a deterministic calculation engine, then traceable intermediate results, then an engineering result, then independent validation evidence, then a human engineering decision where one is required.

DETERMINISTIC_ENGINE_REQUIRED_FOR_BOUND_NUMERICAL_METHOD: YES

AI may assist with explanation, navigation, evidence preparation, or method discovery. AI must not silently invent the governing calculation.

AI_GENERATED_RESULT_COUNTS_AS_VALIDATION: NO

## 11. Validation requirements

Every material numerical method has validation evidence appropriate to its risk. Acceptable classes include an analytical benchmark, an independent calculation, a published worked example, an official worked example, a third-party reference result, a validated experimental result, reproducibility evidence, and a qualified engineering review.

A method does not need every class. The required set is explicit and risk-based.

EOS_RESULT_USED_AS_OWN_REFERENCE: NO

## 12. Conformance-language restrictions

These statements remain distinct:

METHOD_BASED_ON_STANDARD is not CERTIFIED_TO_STANDARD.

METHOD_REFERENCE is not REGULATORY_APPROVAL.

IMPLEMENTATION_VALIDATED is not PROJECT_COMPLIANCE.

ENGINEERING_CALCULATION is not ENGINEER_APPROVAL.

REFERENCE_PROFILE is not a VALIDATED_NATIONAL_ANNEX.

Referencing a standard does not establish full code compliance.

## 13. AI authority restrictions

AI memory is not an engineering authority. An untraceable web page is not an engineering authority. An AI-generated number is not validation evidence. A qualified human review remains a separate act from calculation and from this policy.

## 14. Historical evidence treatment

A later policy does not rewrite an earlier review result, an earlier blocker record, a frozen fingerprint, or a human-review evidence file. Those records stay as an account of what was true when they were made. This policy governs future interpretation.

HISTORICAL_EVIDENCE_REWRITTEN: NO

## 15. User and organization standards access

An organization or an engineer may keep access to a standard outside EOS. EOS does not need to redistribute that standard.

Future architecture may name USER_SUPPLIED_REFERENCE, ORGANIZATION_GOVERNED_REFERENCE, and EXTERNAL_STANDARD_LIBRARY_REFERENCE. This phase does not implement those integrations. Those references must not copy the copyrighted document into RTB-controlled product content.

## 16. C7 long-term application

The historical C7 long-term human review remains attached to fingerprint 9b2c325cdad7b78d with outcome REVIEW_INCOMPLETE. This policy does not complete that review and does not implement calculated creep or shrinkage.

The earlier blocker concept EXACT_NORMATIVE_SOURCE_REQUIRED must not be read, for future work, as LICENSED_STANDARD_DOCUMENT_MUST_BE_STORED_IN_REPOSITORY.

The future prerequisite is AUTHORITATIVE_ENGINEERING_METHOD_BASIS_REQUIRED.

OLD_BLOCKER_CONCEPT: EXACT_NORMATIVE_SOURCE_REQUIRED

NEW_BLOCKER_CONCEPT: AUTHORITATIVE_ENGINEERING_METHOD_BASIS_REQUIRED

C7_BLOCKER_POLICY_RECLASSIFIED: YES

C7_CALCULATED_MODE_IMPLEMENTED: NO

A future calculated creep and shrinkage implementation may proceed when EOS has identified the standard family, an appropriate edition or generation binding, the method or annex identification, an independently authored mathematical specification, a complete required-input model, applicability and limitations, an independent benchmark, and human engineering review. That future work does not require the copyrighted EN 1992 document to be embedded in the repository. It still requires a defensible engineering basis. This phase does not supply that basis and does not authorize the runtime.

## 17. Global applicability

This policy applies to structural, civil, geotechnical, mechanical, piping, process, electrical, instrumentation and control, and cross-discipline EOS methods. A discipline-specific rule may be stricter for a particular coefficient or edition. It may not reintroduce a requirement to store a licensed standards document in the repository merely to reference a standard or to implement an independently authored method.

## 18. Policy-occurrence audit

The repository was searched for wording that a licensed standard, licensed normative text, an in-repository standard document, or an exact normative text is a prerequisite for implementation, and for the existing statements that already reject that prerequisite.

REPOSITORY_POLICY_OCCURRENCES_SCANNED: 58

POLICY_OCCURRENCES_REWRITTEN: 3

HISTORICAL_OCCURRENCES_PRESERVED: 15

KEEP_UNCHANGED: 40

Rewritten current governance documents, by adding a pointer to this policy:

docs/architecture/engineering-os/EOS_D1E_EU_C1_RULE_AUTHORITY_POLICY.md

docs/architecture/engineering-os/EOS_D1B_STRUCTURAL_STANDARD_BINDING.md

docs/architecture/engineering-os/EOS_A7A_MULTIDISCIPLINE_FOUNDATION.md

Historical records left unchanged:

docs/architecture/engineering-os/EOS_D1E_EU_C1A_RULE_EVIDENCE.md

docs/architecture/engineering-os/EOS_D1_C10_C8_COVER_HUMAN_REVIEW_EVIDENCE.md

docs/architecture/engineering-os/EOS_D1_C10_C7_CRACK_WIDTH_HUMAN_REVIEW_EVIDENCE.md

docs/architecture/engineering-os/EOS_D1_C10_C8_SPACING_HUMAN_REVIEW_EVIDENCE.md

docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md

docs/architecture/engineering-os/EOS_D1E_EU_C7_R1_SERVICEABILITY_RULE_PROFILE_FOUNDATION.md

docs/architecture/engineering-os/EOS_D1E_EU_C6_R1_SECOND_ORDER_RULE_PROFILE_RECOVERY.md

docs/architecture/engineering-os/EOS_D1E_EU_C5_T3R_GOVERNED_TORSION_PROFILE_RULE_RECOVERY.md

docs/architecture/engineering-os/EOS_D1E_EU_C1_MATERIAL_RULES.md

docs/architecture/engineering-os/EOS_D1E0_CONCRETE_DESIGN_FOUNDATION.md

docs/architecture/engineering-os/EOS_D1D0_COMMON_STEEL_DESIGN_FRAMEWORK.md

docs/architecture/engineering-os/EOS_D1D_EU3_STEEL_COMPRESSION_STABILITY.md

docs/architecture/engineering-os/EOS_D1D_EU4_STEEL_BENDING_LTB.md

docs/architecture/engineering-os/EOS_D1D_EU5_STEEL_SHEAR_WEB_STABILITY.md

docs/architecture/engineering-os/EOS_D1D_EU6_STEEL_COMBINED_ACTIONS.md

The remaining scanned occurrences already state that a licensed document is not an implementation gate, that copyrighted text must not be embedded, or that full standard coverage is not claimed. Those runtime constants, tests, and closeout sentences stay as they are. The steel authority token LICENSED_STANDARD names an allowed external authority class. It does not require the document to be stored in this repository.

FROZEN_RUNTIME_BASELINE_CHANGED: NO

The historical frozen Structural implementation baseline remains ef416f1f4ec92e1e97e97096ae625f8d61ca6265. The human-review evidence commit remains 9280467dd83e7079e70d5305e36b4a93a9226a63. This governance document does not change that runtime baseline.
